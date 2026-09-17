import {
  BufferAttribute,
  CanvasTexture,
  ClampToEdgeWrapping,
  CustomBlending,
  DataTexture,
  DataUtils,
  DoubleSide,
  GLSL3,
  HalfFloatType,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix3,
  Mesh,
  OneFactor,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PlaneGeometry,
  RedFormat,
  RepeatWrapping,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Texture,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { CowlFit } from '~/composables/useCowlFit'

/**
 * The cowl, assembled.
 *
 * The old version was a 2D canvas of near-black squares spiralling in, with the
 * real plate cross-faded on at the very end. Black on a night sky, the storm
 * was invisible; what was left was a speckle over his face and then a pop. Two
 * things fix that, and they only work together.
 *
 *  1. The plate BUILDS. Every pixel of the cowl has an arrival time — a front
 *     that starts at his chest and climbs the gorget, the jaw, the brow and
 *     finally the horns, with a noisy, crumbling edge. Behind the front the
 *     leather is there; right on it the material is white-hot and cools back
 *     to leather over a short band. So the mask is visibly being made, in
 *     place, rather than faded in.
 *
 *  2. The grains land ON that front. A grain's landing time is read from the
 *     same arrival field the plate uses, so every streak that finishes its
 *     flight finishes exactly where the edge is flaring. That coupling is the
 *     whole effect: the storm is the thing building the cowl, not a second
 *     animation happening near it.
 *
 * All of it is a pure function of the transformation's p, so taking the cowl
 * off is the same film backwards: the horns go first, the edge flares as it
 * retreats, and the grains are thrown off it.
 *
 * At rest the DOM plate in Hero.vue is what shows — it carries the tuned CSS
 * grading and is what the tuner edits. This layer reproduces that grading in
 * the shader so the two are interchangeable, and hands over to the DOM plate
 * once the front has finished and cooled (see domOpacity).
 */

/* ── Look ─────────────────────────────────────────────────────────────────
   The judgement calls, in one place. "Field units" are the arrival field's:
   0 is the first pixel of the cowl to form, 1 the last. */

/** How long a grain is in the air, in field units. */
const FLIGHT = 0.24
/** How long after the last pixel forms before the DOM plate may take over. */
const COOL = 0.12
/** How far behind the front the fresh material still has a sheen. */
const SHEEN = 0.09
/** Width of the white-hot line right on the front, in field units. */
const CORE = 0.016
/** Width of the glow just AHEAD of the front, where grains are landing. */
const RIM = 0.02
/** Falloff of the soft light either side of the front. */
const HALO = 0.035
/** Amplitude of the fine noise that crumbles the edge, in field units. */
const CRUMBLE = 0.035

/**
 * Where on p the front is done and the DOM plate takes over. From HANDOFF the
 * DOM plate fades in under this one (invisible — they match); from SWAP this
 * one fades out over it. At p = 1 nothing is drawn here at all.
 */
const HANDOFF = 0.94
const SWAP = 0.97

/** How far out a grain starts, as a fraction of the cowl's on-screen width. */
const REACH = 0.85
/** How far round a grain winds on its way in, in radians. */
const SPIN = 2.2
/** Share of grains that catch the light. The rest are black sand. */
const GLINTS = 0.3
/** Extra drop on the start point, so the storm is pulled up out of the body. */
const RISE = 0.35
/** Turbulence on the path, as a fraction of the cowl's width. */
const WOBBLE = 0.035
/** Length of a streak, as a slice of its own flight. */
const TRAIL = 0.07
/** Longest a streak may get, in CSS px. */
const MAX_TRAIL = 46

/** Room around the plate for the contact shadow to spill into, in plate uv. */
const MARGIN = 0.16

const FIELD = 256
const SHADOW = 256
const HEM = 512

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Seeded, so a resize rebuilds the same storm instead of reshuffling it. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash2(x: number, y: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, y: number, octaves: number) {
  let sum = 0
  let norm = 0
  let amp = 0.5
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x, y)
    norm += amp
    x = x * 2.03 + 17.1
    y = y * 2.03 + 5.3
    amp *= 0.5
  }
  return sum / norm
}

/** Blur sizes snap to this many texels, so a window being dragged wider
 *  re-bakes a handful of times rather than on every event. */
const snap = (sigma: number) => Math.round(sigma * 2) / 2

/** Three box passes ≈ one gaussian of this sigma. */
const boxRadius = (sigma: number) => Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2)

/** In-place separable box blur, zero outside the buffer, like a CSS blur. */
function blur(buf: Float32Array, w: number, h: number, sigma: number, rowFrom = 0) {
  const r = boxRadius(sigma)
  if (r < 1) return
  const tmp = new Float32Array(Math.max(w, h))
  const inv = 1 / (2 * r + 1)
  for (let pass = 0; pass < 3; pass++) {
    for (let y = rowFrom; y < h; y++) {
      const row = y * w
      let acc = 0
      for (let x = -r; x <= r; x++) if (x >= 0 && x < w) acc += buf[row + x]!
      for (let x = 0; x < w; x++) {
        tmp[x] = acc * inv
        const add = x + r + 1
        const sub = x - r
        if (add < w) acc += buf[row + add]!
        if (sub >= 0) acc -= buf[row + sub]!
      }
      buf.set(tmp.subarray(0, w), row)
    }
    const top = Math.max(0, rowFrom - r)
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let y = top - r; y <= top + r; y++) if (y >= 0 && y < h) acc += buf[y * w + x]!
      for (let y = top; y < h; y++) {
        tmp[y] = acc * inv
        const add = y + r + 1
        const sub = y - r
        if (add < h) acc += buf[add * w + x]!
        if (sub >= 0) acc -= buf[sub * w + x]!
      }
      for (let y = top; y < h; y++) buf[y * w + x] = tmp[y]!
    }
  }
}

/** A canvas kept on the CPU, for reading pixels back. */
function cpuCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d', { willReadFrequently: true })!] as const
}

/** The CSS filter chain on the cowl — grayscale, brightness, contrast — as one
 *  function, so the shader and the baked hem grade identically. */
function grade(r: number, g: number, b: number, bright: number, contrast: number) {
  let l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  l = Math.min(1, l * bright)
  return clamp01((l - 0.5) * contrast + 0.5)
}

const GRADE_GLSL = /* glsl */ `
  float grade(vec3 c) {
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    l = min(1.0, l * uBright);
    return clamp((l - 0.5) * uContrast + 0.5, 0.0, 1.0);
  }
`

const CLIP_GLSL = /* glsl */ `
  vec4 toClip(vec2 px) {
    return vec4(px.x / uCanvas.x * 2.0 - 1.0, 1.0 - px.y / uCanvas.y * 2.0, 0.0, 1.0);
  }
`

const plateVert = /* glsl */ `
  uniform mat3 uM;
  uniform float uBox;
  uniform vec2 uCanvas;
  out vec2 vUv;
  ${CLIP_GLSL}
  void main() {
    // The geometry is a unit plane; stretch it over the plate plus margin.
    vUv = mix(vec2(-${MARGIN.toFixed(3)}), vec2(${(1 + MARGIN).toFixed(3)}), position.xy + 0.5);
    gl_Position = toClip((uM * vec3(vUv * uBox, 1.0)).xy);
  }
`

const plateFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uHem;
  uniform sampler2D uField;
  uniform sampler2D uShadow;
  uniform sampler2D uNoise;
  uniform float uFront;
  uniform float uNoiseScale;
  uniform float uBright;
  uniform float uContrast;
  uniform float uShade;
  uniform float uShadeFrom;
  uniform float uAngle;
  uniform float uHemFrom;
  uniform float uContact;
  uniform vec2 uShadowOff;
  uniform float uPlate;
  uniform float uShadowMix;
  uniform float uLod;
  in vec2 vUv;
  out highp vec4 fragColor;

  ${GRADE_GLSL}

  float arrival(vec2 uv) {
    return texture(uField, clamp(uv, 0.0, 1.0)).r;
  }

  void main() {
    vec2 uv = vUv;
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);

    // Where the front is relative to this pixel: >0 built, <0 still to come.
    // Two readings of it: the material's edge is gritty, but the light it
    // gives off follows the smooth contour — grit in the glow is what made the
    // edge read as frost rather than heat.
    float smoothD = uFront - arrival(uv);
    float grain = texture(uNoise, uv * uNoiseScale).r - 0.5;
    float d = uFront - clamp(arrival(uv) + grain * ${CRUMBLE.toFixed(3)}, 0.0, 1.0);
    float aa = max(fwidth(d), 1e-4);
    float built = smoothstep(-aa, aa, d);

    // The shadow it throws on him, built from the material that has arrived.
    vec2 su = uv - uShadowOff;
    float sBuilt = smoothstep(-0.02, 0.1, uFront - arrival(su));
    vec2 st = (su + ${MARGIN.toFixed(3)}) / ${(1 + 2 * MARGIN).toFixed(3)};
    float shadow = texture(uShadow, st).r * sBuilt * uContact * uShadowMix;

    // The plate, graded the way the DOM one is, with the pre-graded blurred hem
    // laid over its bottom band.
    vec4 s = texture(uMap, uv, uLod) * inside;
    float sl = s.a > 0.003 ? grade(s.rgb / s.a) : 0.0;
    vec4 h = texture(uHem, uv) * inside;
    float hm = clamp((uv.y - uHemFrom) / max(1e-4, 1.0 - uHemFrom), 0.0, 1.0);
    vec4 hemL = h * hm;
    vec4 plate = (hemL + vec4(vec3(sl) * s.a, s.a) * (1.0 - hemL.a)) * built;

    // The key light, a black ramp multiplied over the cowl.
    vec2 dir = vec2(sin(uAngle), -cos(uAngle));
    float span = abs(sin(uAngle)) + abs(cos(uAngle));
    float t = dot(uv - 0.5, dir) / span + 0.5;
    float shade = uShade * clamp((t - uShadeFrom) / max(1e-4, 1.0 - uShadeFrom), 0.0, 1.0) * s.a * built;

    vec3 rgb = plate.rgb * (1.0 - shade);
    float alpha = 1.0 - (1.0 - plate.a) * (1.0 - shade);

    // Everything that glows dies away once the last pixel has formed, so the
    // handover to the DOM plate is between two identical, unlit images.
    float live = 1.0 - smoothstep(1.0, ${(1 + COOL).toFixed(3)}, uFront);

    // Heat: a white-hot line right on the front, and a faint sheen behind it
    // that cools back to leather. Lifted toward white inside the plate's alpha.
    float behind = max(smoothD, 0.0);
    float core = 1.0 - smoothstep(0.0, ${CORE.toFixed(3)}, behind);
    float sheen = 1.0 - smoothstep(0.0, ${SHEEN.toFixed(3)}, behind);
    float heat = clamp(core * core * 0.95 + sheen * sheen * 0.16, 0.0, 1.0) * live;
    rgb = mix(rgb, vec3(plate.a), heat * built);

    // The rim: light spilling just ahead of the front, over his face, where
    // the grains are coming down. Only on the cowl's silhouette.
    float ahead = max(-smoothD, 0.0);
    float rim = (1.0 - smoothstep(0.0, ${RIM.toFixed(3)}, ahead));
    rim = rim * rim * (1.0 - built) * s.a * 0.7 * live;
    rgb = rgb * (1.0 - rim) + vec3(rim);
    alpha = alpha * (1.0 - rim) + rim;

    // The halo: a soft band of light either side of the line, allowed a
    // little past the silhouette (the blurred one the shadow is cut from) so
    // it reads as light given off rather than a stroke drawn round the edge.
    float soft = texture(uShadow, (uv + ${MARGIN.toFixed(3)}) / ${(1 + 2 * MARGIN).toFixed(3)}).r;
    float halo = exp(-abs(smoothD) / ${HALO.toFixed(3)}) * soft * 0.16 * live;
    rgb = rgb * (1.0 - halo) + vec3(halo);
    alpha = alpha * (1.0 - halo) + halo;

    vec4 top = vec4(rgb, alpha) * uPlate;
    fragColor = top + vec4(0.0, 0.0, 0.0, shadow) * (1.0 - top.a);
  }
`

const grainVert = /* glsl */ `
  uniform mat3 uM;
  uniform float uBox;
  uniform float uScreen;
  uniform vec2 uCanvas;
  uniform float uDpr;
  uniform float uFront;
  uniform float uDir;
  uniform float uTime;
  in vec2 aUv;
  in float aT;
  in vec4 aSeed;
  out vec2 vLocal;
  out float vLen;
  out float vHalf;
  out float vAlpha;
  out float vGlint;
  out float vSoft;

  const float TAU = 6.2831853;
  ${CLIP_GLSL}

  vec2 pathAt(float q, vec2 target) {
    float u = 1.0 - q;
    // Decelerating: fast out in the storm, soft onto the surface.
    float e = pow(u, 1.7);
    // One storm, all winding the same way, but not in lockstep.
    float ang = aSeed.y * TAU + ${SPIN.toFixed(3)} * mix(0.5, 1.3, aSeed.w) * pow(u, 1.25);
    // Most of it close to the head; a few from well out.
    float r = ${REACH.toFixed(3)} * uScreen * mix(0.08, 1.0, pow(aSeed.z, 2.6)) * e;
    vec2 off = vec2(cos(ang), sin(ang)) * r;
    off.y += ${RISE.toFixed(3)} * uScreen * e * mix(0.4, 1.0, aSeed.x);
    float w = ${WOBBLE.toFixed(3)} * uScreen * u;
    off += w * vec2(
      sin(aSeed.z * 61.0 + u * 7.0 + uTime * 1.9),
      sin(aSeed.w * 47.0 + u * 6.0 - uTime * 1.4)
    );
    return target + off;
  }

  void main() {
    float flight = ${FLIGHT.toFixed(3)} * mix(0.55, 1.0, aSeed.x);
    float q = (uFront - (aT - flight)) / flight;
    if (q <= 0.0 || q >= 1.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }

    vec2 target = (uM * vec3(aUv * uBox, 1.0)).xy;
    vec2 head = pathAt(q, target);
    // The tail trails the direction of travel, which flips when the cowl is
    // coming off: then the grains are leaving the surface.
    vec2 tail = pathAt(clamp(q - uDir * ${TRAIL.toFixed(3)}, 0.0, 1.0), target);
    vec2 axis = head - tail;
    float len = length(axis);
    vec2 ax = len > 1e-3 ? axis / len : vec2(1.0, 0.0);
    if (len > ${MAX_TRAIL.toFixed(1)}) {
      len = ${MAX_TRAIL.toFixed(1)};
      tail = head - ax * len;
    }

    bool bokeh = aSeed.w > 0.975;
    float width = bokeh
      ? mix(5.0, 12.0, aSeed.z)
      : mix(0.7, 2.2, pow(aSeed.w / 0.975, 3.0));
    // Below a device pixel a grain gets fainter rather than thinner, or it
    // would shimmer in and out of the pixel grid.
    float minW = 1.0 / uDpr;
    float cover = 1.0;
    if (width < minW) {
      cover = width / minW;
      width = minW;
    }
    float hw = width * 0.5 + 1.0 / uDpr;
    float along = mix(-hw, len + hw, position.x);
    float across = position.y * hw;
    vec2 p = tail + ax * along + vec2(-ax.y, ax.x) * across;

    vLocal = vec2(along, across);
    vLen = len;
    vHalf = width * 0.5;
    vSoft = bokeh ? 1.0 : 0.0;

    // In from nothing, gone into the surface as it lands. A long streak is the
    // same grain smeared, so it gets dimmer the longer it is.
    float life = smoothstep(0.0, 0.45, q) * (1.0 - smoothstep(0.86, 1.0, q));
    float smear = clamp(width * 3.0 / (len + width * 3.0), 0.3, 1.0);

    // Two kinds of grain. Black sand, which only shows where it crosses him or
    // the type — a dark swarm closing over his face — and glints, the few that
    // catch the lamp as they tumble, which is what draws the storm on the
    // night behind him. Glints brighten on the way in, so impact is a flare.
    float pick = fract((aSeed.x + aSeed.y * 1.7) * 43.758);
    float glint = pick < ${GLINTS.toFixed(3)} ? 1.0 : 0.0;
    float tumble = 0.5 + 0.5 * sin(aSeed.z * 97.0 + q * 34.0 + uTime * 7.0);
    float flash = mix(0.25 + 0.75 * tumble * tumble, 1.0, smoothstep(0.6, 0.9, q));
    vGlint = glint;
    vAlpha = life * cover * smear * (bokeh
      ? 0.12
      : glint > 0.5 ? flash * mix(0.55, 1.0, aSeed.z) : mix(0.55, 0.9, aSeed.z));

    gl_Position = toClip(p);
  }
`

const grainFrag = /* glsl */ `
  uniform float uDpr;
  uniform vec3 uInk;
  uniform vec3 uGlint;
  in vec2 vLocal;
  in float vLen;
  in float vHalf;
  in float vAlpha;
  in float vGlint;
  in float vSoft;
  out highp vec4 fragColor;

  void main() {
    float along = clamp(vLocal.x, 0.0, vLen);
    float dist = length(vec2(vLocal.x - along, vLocal.y));
    float cov = vSoft > 0.5
      ? 1.0 - smoothstep(vHalf * 0.1, vHalf, dist)
      : clamp((vHalf - dist) * uDpr + 0.5, 0.0, 1.0);
    // Hot at the head, fading down the tail.
    float head = vLen > 0.5 ? along / vLen : 1.0;
    float a = vAlpha * cov * mix(0.1, 1.0, head * head);
    if (a < 0.002) discard;
    fragColor = vec4(mix(uInk, uGlint, vGlint) * a, a);
  }
`

export interface CowlAssembly {
  /** Re-reads the layout and the fit. Call after anything moves the plate. */
  build(): void
  /** Draws the transformation at p. Cheap to call more than once a frame. */
  draw(p: number): void
  /** The DOM plate's opacity at p. It takes over once the front is done, or
   *  carries the whole transformation as a plain fade if there is no GPU. */
  domOpacity(p: number): number
  setTheme(dark: boolean): void
  dispose(): void
}

export function createCowlAssembly(
  canvas: HTMLCanvasElement,
  /** The element carrying the fit transform; the plate fills it. */
  cowlBox: HTMLElement,
  img: HTMLImageElement,
  fit: () => CowlFit,
): CowlAssembly {
  const fade = (p: number) => smoothstep(0.35, 0.95, p)
  const created = (() => {
    try {
      return new WebGLRenderer({
        canvas,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
      })
    } catch {
      return null
    }
  })()
  if (!created) {
    return { build() {}, draw() {}, domOpacity: fade, setTheme() {}, dispose() {} }
  }
  const renderer: WebGLRenderer = created
  renderer.setClearColor(0x000000, 0)

  /**
   * Whether the storm is what's showing. It stays off until everything is
   * baked, compiled and uploaded, and only comes on while the cowl is at rest,
   * so a slow device plays the plain fade rather than jumping into the middle
   * of a build.
   */
  let live = false
  let warm: 'cold' | 'warming' | 'ready' = 'cold'
  let lost = false
  let disposed = false
  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    live = false
  }
  canvas.addEventListener('webglcontextlost', onLost)

  const small = window.matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
  const GRAINS = small ? 26000 : 64000
  const TEX = small ? 1024 : 1600
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2)

  const scene = new Scene()
  const camera = new OrthographicCamera()
  const matrix = new Matrix3()
  const canvasSize = new Vector2(0, 0)

  const blending = {
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: CustomBlending,
    blendSrc: OneFactor,
    blendDst: OneMinusSrcAlphaFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneMinusSrcAlphaFactor,
    premultipliedAlpha: true,
    // Both quads are wound however the fit and the flight leave them.
    side: DoubleSide,
  } as const

  // Fine noise for the crumbling edge. Tiles; bilinear, so it reads as grit
  // rather than as pixels.
  const noiseData = new Uint8Array(128 * 128)
  {
    const rand = mulberry32(7)
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = (rand() * 255) | 0
  }
  const noiseTex = new DataTexture(noiseData, 128, 128, RedFormat, UnsignedByteType)
  noiseTex.wrapS = noiseTex.wrapT = RepeatWrapping
  noiseTex.magFilter = noiseTex.minFilter = LinearFilter
  noiseTex.needsUpdate = true

  // The arrival field lives twice: as floats for the grains to read on the
  // CPU, and as half floats for the plate to read on the GPU.
  const fieldData = new Float32Array(FIELD * FIELD)
  const fieldHalf = new Uint16Array(FIELD * FIELD)
  const shadowData = new Uint8Array(SHADOW * SHADOW)
  const hemData = new Uint8Array(HEM * HEM * 4)
  const fieldTex = new DataTexture(fieldHalf, FIELD, FIELD, RedFormat, HalfFloatType)
  const shadowTex = new DataTexture(shadowData, SHADOW, SHADOW, RedFormat, UnsignedByteType)
  const hemTex = new DataTexture(hemData, HEM, HEM, RGBAFormat, UnsignedByteType)
  for (const t of [fieldTex, shadowTex, hemTex] as Texture[]) {
    t.magFilter = t.minFilter = LinearFilter
    t.wrapS = t.wrapT = ClampToEdgeWrapping
  }

  let mapTex: Texture | null = null
  let bitmap: ImageBitmap | null = null

  const plateMat = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: plateVert,
    fragmentShader: plateFrag,
    ...blending,
    uniforms: {
      uM: { value: matrix },
      uBox: { value: 1 },
      uCanvas: { value: canvasSize },
      uMap: { value: null },
      uHem: { value: hemTex },
      uField: { value: fieldTex },
      uShadow: { value: shadowTex },
      uNoise: { value: noiseTex },
      uFront: { value: 0 },
      uNoiseScale: { value: 2 },
      uBright: { value: 1 },
      uContrast: { value: 1 },
      uShade: { value: 0 },
      uShadeFrom: { value: 0 },
      uAngle: { value: 0 },
      uHemFrom: { value: 1 },
      uContact: { value: 0 },
      uShadowOff: { value: new Vector2() },
      uPlate: { value: 1 },
      uShadowMix: { value: 1 },
      uLod: { value: 0.5 },
    },
  })
  const plate = new Mesh(new PlaneGeometry(1, 1), plateMat)
  plate.frustumCulled = false
  scene.add(plate)

  const grainMat = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: grainVert,
    fragmentShader: grainFrag,
    ...blending,
    uniforms: {
      uM: { value: matrix },
      uBox: { value: 1 },
      uScreen: { value: 1 },
      uCanvas: { value: canvasSize },
      uDpr: { value: dpr },
      uFront: { value: 0 },
      uDir: { value: 1 },
      uTime: { value: 0 },
      uInk: { value: new Vector3() },
      uGlint: { value: new Vector3() },
    },
  })
  let grains: Mesh | null = null

  let last = -1
  let current = -1
  let dir = 1
  let blank = true
  let box = 0

  function setTheme(dark: boolean) {
    // At night the glints carry the storm and the sand is a shadow; by day
    // the sand is what reads, and the glints only lift it a little.
    const u = grainMat.uniforms
    if (dark) {
      u.uInk!.value.set(0.015, 0.017, 0.02)
      u.uGlint!.value.set(1, 1, 1)
    } else {
      u.uInk!.value.set(0.05, 0.055, 0.06)
      u.uGlint!.value.set(0.3, 0.31, 0.33)
    }
    last = -1
  }

  /* ── Baked inputs ─────────────────────────────────────────────────────── */

  // The plate at HEM², read back once. Every CPU-side input is cut from this,
  // so the 2000px PNG is scaled once, off the main thread, and never again.
  let source: HTMLCanvasElement | null = null
  let sourceData: Uint8ClampedArray | null = null
  const alpha = new Uint8Array(FIELD * FIELD)
  let fieldKey = ''
  let shadowKey = ''
  let hemKey = ''
  let grainsKey = ''

  /**
   * The plate as a bitmap at a given size. Made from the file rather than the
   * <img>: a Blob is decoded and scaled off the main thread, where an element
   * is scaled on it — 65ms of stall for the full-size plate.
   */
  let blob: Promise<Blob | null> | null = null
  async function plateBitmap(size: number, premultiplyAlpha: PremultiplyAlpha) {
    blob ??= fetch(img.currentSrc || img.src)
      .then((r) => (r.ok ? r.blob() : null))
      .catch(() => null)
    const opts: ImageBitmapOptions = { resizeWidth: size, resizeHeight: size, resizeQuality: 'high', premultiplyAlpha }
    const file = await blob
    return (
      (file && (await createImageBitmap(file, opts).catch(() => null))) ??
      (await createImageBitmap(img, opts).catch(() => null))
    )
  }

  async function readSource() {
    const bmp = await plateBitmap(HEM, 'default')
    const [c, g] = cpuCanvas(HEM, HEM)
    g.drawImage(bmp ?? img, 0, 0, HEM, HEM)
    bmp?.close()
    source = c
    const data = g.getImageData(0, 0, HEM, HEM).data
    sourceData = data
    // Alpha at FIELD², boxed down 2x2 from the source.
    const row = HEM * 4
    for (let y = 0; y < FIELD; y++) {
      for (let x = 0; x < FIELD; x++) {
        const i = (y * 2 * HEM + x * 2) * 4 + 3
        alpha[y * FIELD + x] = (data[i]! + data[i + 4]! + data[i + row]! + data[i + row + 4]!) >> 2
      }
    }
  }

  /** The plate itself, premultiplied, with mips. */
  async function plateTexture(): Promise<Texture> {
    const bmp = await plateBitmap(TEX, 'premultiply')
    let tex: Texture
    if (bmp) {
      // A bitmap carries its own premultiplication; the unpack flags are
      // ignored for it.
      bitmap = bmp
      tex = new Texture(bmp)
    } else {
      const c = document.createElement('canvas')
      c.width = c.height = TEX
      c.getContext('2d')!.drawImage(img, 0, 0, TEX, TEX)
      tex = new CanvasTexture(c)
      tex.premultiplyAlpha = true
    }
    tex.flipY = false
    tex.generateMipmaps = true
    tex.minFilter = LinearMipmapLinearFilter
    tex.magFilter = LinearFilter
    tex.needsUpdate = true
    return tex
  }

  /**
   * When each pixel of the cowl forms, 0-1. A circle growing out of his chest,
   * in page space so it climbs straight up the screen whatever the fit's tilt,
   * warped by noise so the edge comes in as tendrils, and eased so the torso
   * fills fast and the head — the part anyone is watching — gets the time.
   */
  function buildField(rotate: number) {
    const key = rotate.toFixed(2)
    if (key === fieldKey) return
    fieldKey = key

    const rad = (rotate * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const px = new Float32Array(FIELD * FIELD)
    const py = new Float32Array(FIELD * FIELD)
    let minY = Infinity
    let maxY = -Infinity
    let sumX = 0
    let count = 0
    for (let y = 0; y < FIELD; y++) {
      for (let x = 0; x < FIELD; x++) {
        const i = y * FIELD + x
        const lx = (x + 0.5) / FIELD - 0.5
        const ly = (y + 0.5) / FIELD - 0.5
        px[i] = cos * lx - sin * ly
        py[i] = sin * lx + cos * ly
        if (alpha[i]! > 128) {
          minY = Math.min(minY, py[i]!)
          maxY = Math.max(maxY, py[i]!)
          sumX += px[i]!
          count++
        }
      }
    }
    if (!count) return
    const ox = sumX / count
    const oy = maxY + (maxY - minY) * 0.45

    let dMin = Infinity
    let dMax = -Infinity
    for (let i = 0; i < fieldData.length; i++) {
      fieldData[i] = Math.hypot(px[i]! - ox, py[i]! - oy)
      if (alpha[i]! > 128) {
        dMin = Math.min(dMin, fieldData[i]!)
        dMax = Math.max(dMax, fieldData[i]!)
      }
    }

    // The warp is smooth enough to work out at half size and sample back up.
    const WARP = FIELD / 2 + 1
    const warp = new Float32Array(WARP * WARP)
    for (let y = 0; y < WARP; y++) {
      for (let x = 0; x < WARP; x++) {
        const u = (x * 2) / FIELD
        const v = (y * 2) / FIELD
        warp[y * WARP + x] =
          (fbm(u * 4.5 + 3.1, v * 4.5 + 7.7, 4) - 0.5) * 0.3 + (fbm(u * 15, v * 15, 2) - 0.5) * 0.08
      }
    }

    let tMin = Infinity
    let tMax = -Infinity
    for (let y = 0; y < FIELD; y++) {
      const wy = y >> 1
      const fy = (y & 1) * 0.5
      for (let x = 0; x < FIELD; x++) {
        const i = y * FIELD + x
        const wx = x >> 1
        const fx = (x & 1) * 0.5
        const w00 = warp[wy * WARP + wx]!
        const w10 = warp[wy * WARP + wx + 1]!
        const w01 = warp[(wy + 1) * WARP + wx]!
        const w11 = warp[(wy + 1) * WARP + wx + 1]!
        const w = w00 + (w10 - w00) * fx + (w01 - w00) * fy + (w00 - w10 - w01 + w11) * fx * fy
        const t = Math.max(0, (fieldData[i]! - dMin) / (dMax - dMin))
        fieldData[i] = t ** 1.7 + w
        if (alpha[i]! > 128) {
          tMin = Math.min(tMin, fieldData[i]!)
          tMax = Math.max(tMax, fieldData[i]!)
        }
      }
    }
    for (let i = 0; i < fieldData.length; i++) {
      fieldData[i] = clamp01((fieldData[i]! - tMin) / (tMax - tMin))
      fieldHalf[i] = DataUtils.toHalfFloat(fieldData[i]!)
    }
    fieldTex.needsUpdate = true
  }

  /** The contact shadow: the silhouette, blurred by contactBlur in CSS px. */
  function buildShadow(boxPx: number, contactBlur: number) {
    if (!source) return
    const sigma = snap((contactBlur / boxPx) * (SHADOW / (1 + 2 * MARGIN)))
    const key = String(sigma)
    if (key === shadowKey) return
    shadowKey = key

    const inner = SHADOW / (1 + 2 * MARGIN)
    const off = MARGIN * inner
    const [, g] = cpuCanvas(SHADOW, SHADOW)
    g.drawImage(source, off, off, inner, inner)
    const data = g.getImageData(0, 0, SHADOW, SHADOW).data
    const a = new Float32Array(SHADOW * SHADOW)
    for (let i = 0; i < a.length; i++) a[i] = data[i * 4 + 3]! / 255
    blur(a, SHADOW, SHADOW, sigma)
    for (let i = 0; i < a.length; i++) shadowData[i] = Math.round(clamp01(a[i]!) * 255)
    shadowTex.needsUpdate = true
  }

  /** The hem: the plate graded, then blurred, premultiplied — the same order
   *  the CSS filter chain runs in. Only the rows the hem band can reach. */
  function buildHem(boxPx: number, f: CowlFit) {
    if (!sourceData) return
    const sigma = snap(((f.soften + f.hemBlur) / boxPx) * HEM)
    const key = [sigma, f.brighten, f.contrast, f.hemFrom].join()
    if (key === hemKey) return
    hemKey = key

    // Above the band the shader never shows the hem, so those rows stay as
    // they are; the margin is what the blur can carry down into it.
    const data = sourceData
    const from = Math.max(0, Math.floor((f.hemFrom / 100) * HEM - 3 * sigma))
    const lum = new Float32Array(HEM * HEM)
    const a = new Float32Array(HEM * HEM)
    for (let i = from * HEM; i < lum.length; i++) {
      a[i] = data[i * 4 + 3]! / 255
      lum[i] = grade(data[i * 4]!, data[i * 4 + 1]!, data[i * 4 + 2]!, f.brighten, f.contrast) * a[i]!
    }
    blur(lum, HEM, HEM, sigma, from)
    blur(a, HEM, HEM, sigma, from)
    for (let i = from * HEM; i < lum.length; i++) {
      const l = Math.round(clamp01(lum[i]!) * 255)
      hemData[i * 4] = hemData[i * 4 + 1] = hemData[i * 4 + 2] = l
      hemData[i * 4 + 3] = Math.round(clamp01(a[i]!) * 255)
    }
    hemTex.needsUpdate = true
  }

  /** Every grain is a pixel of the plate, landing when the front reaches it. */
  function buildGrains() {
    if (!sourceData) return
    grainsKey = fieldKey
    const data = sourceData
    let opaque = 0
    for (let i = 3; i < data.length; i += 4) if (data[i]! > 140) opaque++
    const keep = Math.min(1, GRAINS / Math.max(1, opaque))
    const rand = mulberry32(1337)

    const uv = new Float32Array(opaque * 2)
    const at = new Float32Array(opaque)
    const seed = new Float32Array(opaque * 4)
    let n = 0
    for (let y = 0; y < HEM; y++) {
      for (let x = 0; x < HEM; x++) {
        if (data[(y * HEM + x) * 4 + 3]! <= 140 || rand() >= keep) continue
        const u = (x + rand()) / HEM
        const v = (y + rand()) / HEM
        uv[n * 2] = u
        uv[n * 2 + 1] = v
        at[n] = sampleField(u, v)
        for (let k = 0; k < 4; k++) seed[n * 4 + k] = rand()
        n++
      }
    }

    const geo = new InstancedBufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0]), 3))
    geo.setIndex([0, 1, 2, 2, 1, 3])
    geo.setAttribute('aUv', new InstancedBufferAttribute(uv.subarray(0, n * 2), 2))
    geo.setAttribute('aT', new InstancedBufferAttribute(at.subarray(0, n), 1))
    geo.setAttribute('aSeed', new InstancedBufferAttribute(seed.subarray(0, n * 4), 4))
    geo.instanceCount = n

    if (grains) {
      scene.remove(grains)
      grains.geometry.dispose()
    }
    grains = new Mesh(geo, grainMat)
    grains.frustumCulled = false
    grains.renderOrder = 1
    scene.add(grains)
  }

  function sampleField(u: number, v: number) {
    const x = Math.min(FIELD - 1.001, Math.max(0, u * FIELD - 0.5))
    const y = Math.min(FIELD - 1.001, Math.max(0, v * FIELD - 0.5))
    const xi = x | 0
    const yi = y | 0
    const fx = x - xi
    const fy = y - yi
    const i = yi * FIELD + xi
    const a = fieldData[i]!
    const b = fieldData[i + 1]!
    const c = fieldData[i + FIELD]!
    const d = fieldData[i + FIELD + 1]!
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
  }

  /** Re-bakes whatever the current fit and size have made stale. */
  function bake(f: CowlFit) {
    buildField(f.rotate)
    buildShadow(box, f.contactBlur)
    buildHem(box, f)
    if (grainsKey !== fieldKey) buildGrains()
  }

  /* ── Layout ───────────────────────────────────────────────────────────── */

  /** Reads the plate's place on the page. Cheap; false until there is one. */
  function layout() {
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    if (!W || !H || !img.naturalWidth) return false

    // Only when it changed: resizing the buffer reallocates and clears it.
    if (W !== canvasSize.x || H !== canvasSize.y) {
      renderer.setPixelRatio(dpr)
      renderer.setSize(W, H, false)
      canvasSize.set(W, H)
      blank = true
    }

    // The plate's box, and the transform the fit puts on it, as one matrix
    // from plate-box pixels to canvas pixels.
    const cs = getComputedStyle(cowlBox)
    const [ox = 0, oy = 0] = cs.transformOrigin.split(' ').map(parseFloat)
    const m = new DOMMatrix()
      .translate(cowlBox.offsetLeft + ox - canvas.offsetLeft, cowlBox.offsetTop + oy - canvas.offsetTop)
      .multiply(new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform))
      .translate(-ox, -oy)
    matrix.set(m.a, m.c, m.e, m.b, m.d, m.f, 0, 0, 1)
    box = cowlBox.offsetWidth
    const screen = box * Math.hypot(m.a, m.b)

    const f = fit()
    const pu = plateMat.uniforms
    pu.uBox!.value = box
    // Grit at roughly 2.5 screen px a cell, whatever the plate's size.
    pu.uNoiseScale!.value = (screen * dpr) / (128 * 2.5)
    pu.uBright!.value = f.brighten
    pu.uContrast!.value = f.contrast
    pu.uShade!.value = f.shade
    pu.uShadeFrom!.value = f.shadeFrom / 100
    pu.uAngle!.value = ((90 - f.rotate) * Math.PI) / 180
    pu.uHemFrom!.value = f.hemFrom / 100
    pu.uContact!.value = f.contact
    pu.uShadowOff!.value.set((f.contactBlur * 0.55) / box, (f.contactBlur * 0.7) / box)
    grainMat.uniforms.uBox!.value = box
    grainMat.uniforms.uScreen!.value = screen
    return true
  }

  const nextFrame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))

  /**
   * Everything the first frame of the storm would otherwise do at once —
   * decode, bake, compile, upload — spread across frames long before it is
   * needed. All in one go it was a 170ms stall during the signal, and another
   * 80ms on the first frame of the build.
   */
  async function warmUp() {
    warm = 'warming'
    try {
      await img.decode().catch(() => {})
      await readSource()
      const steps = [
        () => buildField(fit().rotate),
        () => buildShadow(box, fit().contactBlur),
        () => buildHem(box, fit()),
        buildGrains,
      ]
      for (const step of steps) {
        await nextFrame()
        if (disposed) return
        step()
      }
      mapTex = await plateTexture()
      if (disposed) return
      plateMat.uniforms.uMap!.value = mapTex
      await renderer.compileAsync(scene, camera)
      await nextFrame()
      if (disposed) return
      renderer.initTexture(mapTex)
      await nextFrame()
      if (disposed) return
      // One invisible frame, with the front far below the cowl: it draws
      // nothing, but binds every texture and uploads every buffer.
      plateMat.uniforms.uFront!.value = -10
      grainMat.uniforms.uFront!.value = -10
      renderer.render(scene, camera)
      renderer.clear()
      blank = true
      warm = 'ready'
      build()
    } catch (err) {
      console.error('[cowl] assembly failed to warm up; falling back to a fade', err)
      lost = true
    }
  }

  function build() {
    if (lost || disposed || !layout()) return
    if (warm === 'cold') void warmUp()
    if (warm !== 'ready') return
    bake(fit())
    last = -1
    if (current >= 0) draw(current)
  }

  function draw(p: number) {
    current = p
    if (lost) return
    const rest = p <= 0.0005 || p >= 0.9995
    if (!live) {
      if (warm !== 'ready' || !rest) return
      live = true
    }
    if (p === last) return
    if (last >= 0) dir = p > last ? 1 : -1
    last = p

    if (rest) {
      if (!blank) {
        renderer.clear()
        blank = true
      }
      return
    }

    const front = p >= HANDOFF ? 1 + COOL : -FLIGHT + (p / HANDOFF) * (1 + COOL + FLIGHT)
    const pu = plateMat.uniforms
    pu.uFront!.value = front
    pu.uShadowMix!.value = 1 - smoothstep(HANDOFF, SWAP, p)
    pu.uPlate!.value = 1 - smoothstep(SWAP, 1, p)
    const gu = grainMat.uniforms
    gu.uFront!.value = front
    gu.uDir!.value = dir
    gu.uTime!.value = performance.now() / 1000

    renderer.render(scene, camera)
    blank = false
  }

  function dispose() {
    disposed = true
    live = false
    canvas.removeEventListener('webglcontextlost', onLost)
    grains?.geometry.dispose()
    plate.geometry.dispose()
    plateMat.dispose()
    grainMat.dispose()
    for (const t of [noiseTex, fieldTex, shadowTex, hemTex, mapTex]) t?.dispose()
    bitmap?.close()
    renderer.dispose()
    // Give the context back now rather than whenever the GC gets to it; a few
    // client-side navigations would otherwise pile them up.
    renderer.forceContextLoss()
  }

  setTheme(true)

  return {
    build,
    draw,
    domOpacity: (p) => (live && !lost ? smoothstep(HANDOFF, SWAP, p) : fade(p)),
    setTheme,
    dispose,
  }
}
