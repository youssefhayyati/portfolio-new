<script setup lang="ts">
import { batSvg } from '~/utils/emblem'
import gsap from 'gsap'

/**
 * The colony, on cue. Each release bursts a few dozen bats out of one point,
 * fanned around a heading, and lets them leave the screen on curved paths —
 * x and y are eased differently, which is all a curve needs. A handful pass
 * right in front of the lens, large and out of focus, which is what makes it
 * feel like being in the swarm instead of watching a diagram of one.
 *
 * Plain DOM: at most ~35 elements for two seconds, each animating nothing but
 * its transform, then removed. Wing beat is a CSS squash on the inner SVG so
 * it never competes with the flight tween for the same property.
 */
const { last } = useSwarm()
const layer = ref<HTMLElement | null>(null)

const SVG = batSvg('aria-hidden="true"')

const rand = gsap.utils.random

watch(last, (r) => {
  const el = layer.value
  if (!r || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const W = window.innerWidth
  const H = window.innerHeight
  const count = W < 768 ? 16 : 34
  const heading = r.dir ?? -Math.PI / 2
  const spread = r.spread ?? 1.4
  const reach = Math.hypot(W, H)

  for (let i = 0; i < count; i++) {
    const bat = document.createElement('div')
    bat.className = 'swarm-bat'
    bat.innerHTML = SVG
    const near = i < 3
    const size = near ? rand(180, 320) : rand(18, 70)
    bat.style.width = `${size}px`
    bat.style.setProperty('--flap', `${rand(0.1, 0.2).toFixed(3)}s`)
    if (near) bat.classList.add('swarm-bat-near')
    el.appendChild(bat)

    const a = heading + rand(-spread / 2, spread / 2)
    const dist = reach * rand(0.75, 1.25)
    const sx = r.x + rand(-50, 50)
    const sy = r.y + rand(-30, 30)
    const ex = sx + Math.cos(a) * dist
    const ey = sy + Math.sin(a) * dist
    // Leans into the turn, but only partly: fully rotated bats stop reading
    // as bats and start reading as arrows.
    const lean = ((a + Math.PI / 2) * 180) / Math.PI * 0.35
    const d = near ? rand(0.9, 1.3) : rand(1.3, 2.4)
    const delay = rand(0, near ? 0.4 : 0.55)

    gsap.set(bat, { x: sx, y: sy, xPercent: -50, yPercent: -50, scale: 0.15, rotation: lean })
    gsap
      .timeline({ delay, onComplete: () => bat.remove() })
      .to(bat, { x: ex, duration: d, ease: 'power1.in' }, 0)
      .to(bat, { y: ey, duration: d, ease: rand(0, 1) > 0.5 ? 'power2.in' : 'sine.in' }, 0)
      .to(bat, { scale: 1, duration: d * 0.35, ease: 'power2.out' }, 0)
      .to(bat, { rotation: lean + rand(-25, 25), duration: d, ease: 'sine.inOut' }, 0)
  }
})
</script>

<template>
  <div ref="layer" class="pointer-events-none fixed inset-0 z-87 overflow-hidden" aria-hidden="true" />
</template>

<style scoped>
:deep(.swarm-bat) {
  position: absolute;
  left: 0;
  top: 0;
  color: #06080b;
  will-change: transform;
}

:deep(.swarm-bat svg) {
  display: block;
  width: 100%;
  height: auto;
  fill: currentColor;
  stroke: rgb(221 228 234 / 0.3);
  stroke-width: 3;
  animation: flap var(--flap, 0.15s) ease-in-out infinite alternate;
}

/* Right in front of the lens: big, soft, and gone in a blink. */
:deep(.swarm-bat-near) {
  filter: blur(3px);
  color: #020305;
}

@keyframes flap {
  from {
    transform: scale(1, 1);
  }
  to {
    transform: scale(0.34, 1.12);
  }
}
</style>
