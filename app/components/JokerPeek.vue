<script setup lang="ts">
import gsap from 'gsap'

/**
 * Leave the page alone for a while and the Joker notices. His card leans in
 * from the corner with a line; click it and he gets the screen, touch
 * anything else and he slinks back out.
 *
 * Rationed hard, because a gag that repeats turns into a nag: only after a
 * real idle stretch, never over the loader, the open menu or detective mode,
 * and no more than three times a visit.
 */
const IDLE_MS = 20000
const MAX_VISITS = 3
const LINES = [
  'Still there? Why so serious?',
  "Knock knock. It's the wild card.",
  "Looking for a Batman? I hear he's hiring out.",
  'All work and no chaos… go on, click me.',
]

const { active: detective } = useDetective()
const root = ref<HTMLElement | null>(null)
const line = ref(LINES[0]!)
const visible = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined
let visits = 0
let shownAt = 0
let lastArm = 0

function arm() {
  clearTimeout(timer)
  if (visits >= MAX_VISITS) return
  timer = setTimeout(show, IDLE_MS)
}

function show() {
  // The loader and the open menu both lock the page's overflow.
  const locked = document.documentElement.style.overflow === 'hidden'
  if (locked || detective.value || document.hidden) {
    arm()
    return
  }
  line.value = LINES[visits % LINES.length]!
  visits++
  visible.value = true
  shownAt = performance.now()
  gsap.fromTo(
    root.value,
    { x: 200, rotation: 24, opacity: 0 },
    { x: 0, rotation: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.5)' },
  )
}

function hide() {
  if (!visible.value) return
  visible.value = false
  gsap.to(root.value, { x: 220, rotation: 24, opacity: 0, duration: 0.45, ease: 'power2.in' })
}

function onActivity() {
  // A grace period, so the movement that made him appear cannot also be
  // the one that chases him off.
  if (visible.value) {
    if (performance.now() - shownAt > 1200) {
      hide()
      arm()
    }
    return
  }
  const now = performance.now()
  if (now - lastArm > 250) {
    lastArm = now
    arm()
  }
}

const EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const

onMounted(() => {
  gsap.set(root.value, { opacity: 0, x: 200 })
  for (const e of EVENTS) window.addEventListener(e, onActivity, { passive: true })
  arm()
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  for (const e of EVENTS) window.removeEventListener(e, onActivity)
})
</script>

<template>
  <div
    ref="root"
    class="fixed bottom-6 right-4 z-89 flex items-end gap-3 sm:bottom-10 sm:right-8"
    :class="visible ? 'pointer-events-auto' : 'pointer-events-none'"
    :aria-hidden="!visible"
  >
    <p
      class="relative mb-16 max-w-[13rem] rounded-2xl rounded-br-sm bg-[#f1ece2] px-4 py-3 text-[15px] leading-snug text-[#1b1026] shadow-[0_12px_30px_rgba(0,0,0,0.45)] sm:max-w-[16rem] sm:text-base"
      style="font-family: var(--font-scrawl)"
    >
      {{ line }}
    </p>
    <div class="w-20 -rotate-12 sm:w-24" @click="hide">
      <JokerCard class="w-full" />
    </div>
  </div>
</template>
