<script setup lang="ts">
import gsap from 'gsap'

/**
 * Where the Joker gets the screen. Every pull of useChaos() — the wild card,
 * or typing "joker" anywhere — laughs across the viewport for a couple of
 * seconds and then cleans up after itself completely. Nothing it touches is
 * permanent, which is the only way a gag like this stays fun on the fifth go.
 */
const { bursts, unleash } = useChaos()
const layer = ref<HTMLElement | null>(null)
const flash = ref<HTMLElement | null>(null)

const COLORS = ['#9b5de5', '#4cc97a', '#e0263a', '#f1ece2']
const WORDS = ['HA', 'HA', 'HA', 'HAHA', 'HA!', 'HA HA', 'hehe']

function laugh() {
  const el = layer.value
  if (!el) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const count = reduced ? 5 : window.innerWidth < 768 ? 14 : 28
  const nodes: HTMLElement[] = []

  for (let i = 0; i < count; i++) {
    const s = document.createElement('span')
    s.textContent = WORDS[(Math.random() * WORDS.length) | 0]!
    s.className = 'chaos-word'
    s.style.left = `${4 + Math.random() * 88}%`
    s.style.top = `${6 + Math.random() * 84}%`
    s.style.fontSize = `${1.4 + Math.random() * 4.2}rem`
    s.style.color = COLORS[(Math.random() * COLORS.length) | 0]!
    nodes.push(s)
  }

  // One line that is not a laugh, dead centre, so the joke has a punchline.
  const line = document.createElement('span')
  line.textContent = 'Why so serious?'
  line.className = 'chaos-word chaos-line'
  nodes.push(line)

  el.append(...nodes)

  const tl = gsap.timeline({ onComplete: () => nodes.forEach((n) => n.remove()) })
  if (reduced) {
    tl.fromTo(nodes, { opacity: 0 }, { opacity: 1, duration: 0.3 }).to(nodes, { opacity: 0, duration: 0.4, delay: 1.2 })
    return
  }

  tl.fromTo(
    nodes.slice(0, -1),
    { scale: 0, opacity: 0, rotation: () => gsap.utils.random(-60, 60) },
    {
      scale: 1,
      opacity: 1,
      rotation: () => gsap.utils.random(-18, 18),
      duration: 0.45,
      ease: 'back.out(3)',
      stagger: { each: 0.035, from: 'random' },
    },
  )
    .fromTo(
      line,
      { scale: 2.4, opacity: 0, rotation: -12 },
      { scale: 1, opacity: 1, rotation: -4, duration: 0.5, ease: 'expo.out' },
      0.35,
    )
    .fromTo(flash.value, { opacity: 0 }, { opacity: 1, duration: 0.12, yoyo: true, repeat: 3, ease: 'none' }, 0)
    .to(nodes, {
      opacity: 0,
      y: () => gsap.utils.random(-80, -20),
      duration: 0.6,
      ease: 'power2.in',
      stagger: { each: 0.015, from: 'random' },
      delay: 1.1,
    })

  // The room shakes a little. On the wrapper, never on the smoothed content,
  // which ScrollSmoother rewrites every frame.
  const wrapper = document.getElementById('smooth-wrapper')
  if (wrapper) {
    gsap.fromTo(
      wrapper,
      { x: 0 },
      {
        x: () => gsap.utils.random(-6, 6),
        y: () => gsap.utils.random(-4, 4),
        duration: 0.05,
        repeat: 7,
        yoyo: true,
        ease: 'none',
        onComplete: () => gsap.set(wrapper, { clearProps: 'transform' }),
      },
    )
  }
}

watch(bursts, laugh)

// Type the name and he answers.
let typed = ''
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (e.metaKey || e.ctrlKey || e.altKey || t?.closest('input, textarea, [contenteditable]')) return
  if (e.key.length !== 1) return
  typed = (typed + e.key.toLowerCase()).slice(-5)
  if (typed === 'joker') {
    typed = ''
    unleash()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div ref="layer" class="pointer-events-none fixed inset-0 z-90 overflow-hidden" aria-hidden="true">
    <div
      ref="flash"
      class="absolute inset-0 opacity-0"
      style="background: radial-gradient(circle at 30% 30%, rgb(155 93 229 / 0.28), transparent 55%), radial-gradient(circle at 75% 70%, rgb(76 201 122 / 0.22), transparent 55%)"
    />
  </div>
</template>

<style scoped>
:deep(.chaos-word) {
  position: absolute;
  font-family: var(--font-scrawl);
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 2px 0 rgb(0 0 0 / 0.5);
  transform: translate(-50%, -50%);
}

:deep(.chaos-line) {
  left: 50%;
  top: 50%;
  font-size: clamp(2.6rem, 9vw, 8rem);
  color: #4cc97a;
  -webkit-text-stroke: 1px #1b0b2a;
}
</style>
