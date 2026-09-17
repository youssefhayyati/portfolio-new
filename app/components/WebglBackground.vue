<script setup lang="ts">
import * as THREE from 'three'
import gsap from 'gsap'
import { batsScene, type SceneContext, type SceneInstance } from '~/webgl'

const canvas = ref<HTMLCanvasElement | null>(null)
const colorMode = useColorMode()
const { motion, bind, unbind, step } = usePageMotion()

/** Local now that the dev picker is gone — nothing outside this component
 *  needs to read it, and it only ever goes false on reduced-motion or a
 *  render failure. */
const enabled = ref(true)

let renderer: THREE.WebGLRenderer | null = null
let instance: SceneInstance | null = null
let ctx: SceneContext | null = null
let start = 0
let lastTick = 0
let hidden = false

const isDark = () => colorMode.value === 'dark'

function sizeFor(scene: SceneInstance | null): SceneContext {
  const width = window.innerWidth
  const height = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, scene?.maxDpr ?? 1.5)
  return { renderer: renderer!, width, height, dpr, dark: isDark() }
}

function applySize() {
  if (!renderer) return
  ctx = sizeFor(instance)
  renderer.setPixelRatio(ctx.dpr)
  renderer.setSize(ctx.width, ctx.height, false)
  instance?.resize(ctx)
}

function mountScene() {
  if (!renderer) return
  instance?.dispose()
  instance = null

  ctx = sizeFor(null)

  try {
    instance = batsScene.create(ctx)
  } catch (err) {
    console.error('[webgl] bats scene failed to start', err)
    enabled.value = false
    return
  }

  applySize()
  start = performance.now() / 1000
  lastTick = start
}

function frame() {
  if (!renderer || !instance || !ctx || hidden || !enabled.value) return

  const now = performance.now() / 1000
  const dt = Math.min(now - lastTick, 1 / 20)
  lastTick = now

  step(dt)

  try {
    instance.render({ ...ctx, motion, time: now - start, dt })
  } catch (err) {
    console.error('[webgl] render failed, stopping', err)
    enabled.value = false
    return
  }
}

function onVisibility() {
  hidden = document.hidden
  // Skip the accumulated gap so the sim doesn't explode on return.
  if (!hidden) lastTick = performance.now() / 1000
}

let resizeTimer: ReturnType<typeof setTimeout> | undefined
function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(applySize, 120)
}

/** Drives the CSS rules that let the canvas show through the sections. */
function syncVeil(on: boolean) {
  if (on) document.documentElement.dataset.webgl = 'on'
  else delete document.documentElement.dataset.webgl
}

onMounted(() => {
  // Respect a stated preference for less motion — this is a large, constantly
  // moving element and there is no tasteful "reduced" version of it.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    enabled.value = false
    return
  }

  if (!canvas.value) return

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
    })
  } catch (err) {
    console.error('[webgl] no context available', err)
    enabled.value = false
    return
  }

  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

  bind()
  syncVeil(true)
  mountScene()

  gsap.ticker.add(frame)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
})

watch(
  () => colorMode.value,
  () => instance?.setTheme(isDark()),
)

watch(enabled, (on) => {
  syncVeil(on)
  if (on) lastTick = performance.now() / 1000
})

onBeforeUnmount(() => {
  gsap.ticker.remove(frame)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  syncVeil(false)
  unbind()
  instance?.dispose()
  renderer?.dispose()
  renderer = null
  instance = null
})
</script>

<template>
  <canvas
    ref="canvas"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 block transition-opacity duration-700"
    :class="enabled ? 'opacity-100' : 'opacity-0'"
  />
</template>
