import * as THREE from 'three'
import type { FrameState, SceneContext, SceneFactory, SceneInstance } from '../types'
import { paletteFor } from '../types'
import { BAT_HALF } from '~/utils/emblem'

/**
 * A colony crossing the night behind the page.
 *
 * Two decisions carry this scene, and both are about restraint:
 *
 *  1. The bats are flat silhouettes. No glow, no additive blending, no rim
 *     light. A bat at distance is a hole in the sky, not a light source — the
 *     moment one glows it stops reading as an animal and starts reading as a
 *     logo. They are legible purely because they sit a few values off the
 *     background, the way real bats read against a dark sky.
 *
 *  2. The silhouette is the *same* path as components/BatMark.vue, drawn once
 *     to a canvas and used as an alpha mask. So the mark in the nav, the
 *     favicon, and the thirty shapes drifting behind the page are literally one
 *     shape. Anything else and the page would be wearing two different bats.
 *
 * Wing beat is a horizontal squash rather than articulated geometry. At these
 * sizes a bat's wings are two or three pixels of travel, and squashing the
 * whole sprite is indistinguishable from the real thing while costing one
 * multiply per instance.
 */

const COUNT = 26

/* The silhouette comes from utils/emblem — the same one the nav, the favicon
   and every other bat on the site wear. */

/* The path's own bounding box inside its 240x100 viewBox — used to crop the
   canvas tight to the shape so no texture budget is spent on empty margin. */
const BOX = { x: 5, y: 2, w: 230, h: 78 }

const TEX_W = 256
const TEX_H = 88

/** Renders the emblem to an offscreen canvas once, as a white-on-transparent mask. */
function batTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H

  const g = canvas.getContext('2d')!
  const s = TEX_W / BOX.w

  // Map the path's bounding box onto the canvas origin.
  g.setTransform(s, 0, 0, s, -BOX.x * s, -BOX.y * s)
  g.fillStyle = '#fff'

  const right = new Path2D(BAT_HALF)
  g.fill(right)

  const left = new Path2D()
  left.addPath(new Path2D(BAT_HALF), new DOMMatrix([-1, 0, 0, 1, 240, 0]))
  g.fill(left)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  // Mipmaps matter here: the far bats are drawn a few pixels wide and alias
  // into sparkling confetti without them.
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

const vert = /* glsl */ `
  attribute float aAlpha;

  varying vec2 vUv;
  varying float vAlpha;

  void main() {
    vUv = uv;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`

const frag = /* glsl */ `
  precision mediump float;

  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vAlpha;

  void main() {
    float mask = texture2D(uMap, vUv).a;
    // Cheaper than blending a transparent fragment, and keeps the wing edges
    // from smearing over each other where two bats overlap.
    if (mask < 0.02) discard;
    gl_FragColor = vec4(uColor, mask * vAlpha * uOpacity);
  }
`

interface Bat {
  x: number
  y: number
  z: number
  /** Horizontal cruise, in world units per second. Sign is travel direction. */
  vx: number
  scale: number
  flapPhase: number
  flapSpeed: number
  bobPhase: number
  bobAmp: number
  /** Scatter offset from the cursor, eased back to zero. */
  ox: number
  oy: number
}

function create(ctx: SceneContext): SceneInstance {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, ctx.width / ctx.height, 0.1, 100)
  camera.position.z = 7

  const pal = paletteFor(ctx.dark)
  const map = batTexture()

  // Plane matches the texture's aspect so the silhouette is never stretched.
  const geo = new THREE.PlaneGeometry(1, TEX_H / TEX_W)

  const alphas = new Float32Array(COUNT)
  geo.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(alphas, 1))

  const uniforms = {
    uMap: { value: map },
    uColor: { value: new THREE.Vector3(...silhouetteFor(ctx.dark)) },
    uOpacity: { value: opacityFor(ctx.dark) },
  }

  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    // Normal blending, never additive. Additive is what turns a silhouette
    // into a glow, which is the one thing this scene must not do.
    blending: THREE.NormalBlending,
  })

  const mesh = new THREE.InstancedMesh(geo, mat, COUNT)
  mesh.frustumCulled = false
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  scene.add(mesh)

  /** Visible world size at the z-plane the bats fly in. */
  const view = () => {
    const vFov = (camera.fov * Math.PI) / 180
    const h = 2 * Math.tan(vFov / 2) * camera.position.z
    return { w: h * camera.aspect, h }
  }

  const bats: Bat[] = Array.from({ length: COUNT }, () => {
    // Depth drives size, speed and opacity together — the three cues that have
    // to agree for a flat sprite to sit at a believable distance.
    const depth = Math.pow(Math.random(), 0.75)
    const dir = Math.random() < 0.5 ? -1 : 1
    return {
      x: 0,
      y: 0,
      z: -depth * 3.5,
      vx: dir * (0.75 - depth * 0.5) * (0.7 + Math.random() * 0.6),
      scale: 0.95 - depth * 0.62,
      flapPhase: Math.random() * Math.PI * 2,
      // Small bats beat faster, exactly like the real thing.
      flapSpeed: 6.5 + (1 - depth) * 3.5 + Math.random() * 2.5,
      bobPhase: Math.random() * Math.PI * 2,
      bobAmp: 0.1 + Math.random() * 0.22,
      ox: 0,
      oy: 0,
    }
  })

  // Spread them across the field on the first frame.
  {
    const { w, h } = view()
    bats.forEach((b, i) => {
      b.x = (Math.random() - 0.5) * w * 1.3
      b.y = (Math.random() - 0.5) * h * 0.92
      alphas[i] = 0.30 + (1 + b.z / 3.5) * 0.42
    })
    geo.attributes.aAlpha.needsUpdate = true
  }

  const dummy = new THREE.Object3D()

  return {
    maxDpr: 1.75,

    render(state: FrameState) {
      const { motion, dt, time } = state
      const { w, h } = view()

      // Scroll hurries the colony along; the flock reacts to the page moving.
      const urgency = 1 + Math.abs(motion.scrollVel) * 3.2
      const halfW = w * 0.5
      const margin = 1.2

      // Cursor in world space, so bats can break formation around it.
      const px = (motion.px * w) / 2
      const py = (motion.py * h) / 2

      for (let i = 0; i < COUNT; i++) {
        const b = bats[i]!

        b.x += b.vx * dt * urgency

        // Wrap: exit one side, re-enter the other at a fresh height.
        if (b.vx > 0 && b.x > halfW + margin) {
          b.x = -halfW - margin
          b.y = (Math.random() - 0.5) * h * 0.92
        } else if (b.vx < 0 && b.x < -halfW - margin) {
          b.x = halfW + margin
          b.y = (Math.random() - 0.5) * h * 0.92
        }

        // Scatter away from the pointer — near ones shy harder than far ones.
        if (!motion.idle) {
          const dx = b.x + b.ox - px
          const dy = b.y + b.oy - py
          const d2 = dx * dx + dy * dy
          const R = 2.4
          if (d2 < R * R) {
            const d = Math.max(Math.sqrt(d2), 0.001)
            const push = (1 - d / R) * 1.9 * b.scale
            b.ox += (dx / d) * push * dt * 7
            b.oy += (dy / d) * push * dt * 7
          }
        }

        // Ease the scatter back out so the flock re-forms behind the cursor.
        const settle = 1 - Math.exp(-1.7 * dt)
        b.ox -= b.ox * settle
        b.oy -= b.oy * settle

        const bob = Math.sin(time * 1.6 + b.bobPhase) * b.bobAmp

        // The wing beat. 0.42..1.0 of full span — a bat never folds to nothing.
        const beat = Math.sin(time * b.flapSpeed + b.flapPhase)
        const flap = 0.42 + 0.58 * (0.5 + 0.5 * beat)

        dummy.position.set(b.x + b.ox, b.y + b.oy + bob, b.z)
        // Bank into the climb, and face the direction of travel.
        dummy.rotation.set(0, 0, beat * 0.07 + (b.oy * 0.05))
        dummy.scale.set(b.scale * flap * Math.sign(b.vx), b.scale, 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }

      mesh.instanceMatrix.needsUpdate = true
      state.renderer.render(scene, camera)
    },

    resize(next: SceneContext) {
      camera.aspect = next.width / next.height
      camera.updateProjectionMatrix()
    },

    setTheme(dark: boolean) {
      uniforms.uColor.value.set(...silhouetteFor(dark))
      uniforms.uOpacity.value = opacityFor(dark)
    },

    dispose() {
      geo.dispose()
      mat.dispose()
      map.dispose()
      mesh.dispose()
    },
  }
}

/**
 * The silhouette colour. On the dark theme the bats sit a few values *above*
 * the page so they read as shapes against the sky; on the light theme they go
 * well below it. Either way it is one flat tone — a silhouette with a gradient
 * in it is just a glow wearing a costume.
 */
function silhouetteFor(dark: boolean): [number, number, number] {
  const p = paletteFor(dark)
  return dark ? [0.13, 0.16, 0.21] : [p.core[0], p.core[1], p.core[2]]
}

/**
 * Equal *presence*, not equal alpha. A dark shape on a pale field carries far
 * more contrast than a slightly-lifted one on near-black, so at a shared
 * opacity the light theme's colony shouted while the dark theme's whispered.
 * Holding the two at matching weight is what keeps this a background.
 */
function opacityFor(dark: boolean): number {
  return dark ? 1 : 0.5
}

export const batsScene: SceneFactory = {
  id: 'bats',
  label: 'Bats',
  blurb: 'A colony crossing the night, scattering around the cursor',
  create,
}
