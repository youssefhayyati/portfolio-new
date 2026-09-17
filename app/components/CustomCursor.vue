<script setup lang="ts">
import gsap from 'gsap'

/**
 * The instrument, in three parts, because no single element can be all of
 * them at once:
 *
 *  - the DOT sits exactly on the pointer with no smoothing at all, so the
 *    click point is never ambiguous. It is four pixels wide, which is small
 *    enough to spend the signal colour on continuously.
 *  - the RETICLE is four corner brackets that lag behind, canted 45° while
 *    it is hunting and square-on when it has something. Being late is the
 *    point: the lag is what makes it feel like a device tracking a target
 *    rather than a sprite glued to the mouse. It also stretches along its
 *    own direction of travel, which is the whole difference between a shape
 *    that moves and a thing with mass.
 *  - the LABEL rides just off the pointer and says what the target is for.
 *
 * The old version drew in mix-blend-difference, which is theme-proof in
 * theory and muddy in practice: over the portrait and the project panels it
 * inverted into colours that belong to neither side. This one takes the
 * theme's own ink with a hairline shadow under it, which stays legible on a
 * black sky, a photograph and a light page alike.
 */

const root = ref<HTMLElement | null>(null)
const reticle = ref<HTMLElement | null>(null)
const dot = ref<HTMLElement | null>(null)
const labelEl = ref<HTMLElement | null>(null)
const pulse = ref<HTMLElement | null>(null)

const text = ref('')
const locked = ref(false)
const inside = ref(false)

/** Size of the reticle while it is not framing anything. */
const REST = 26
/** Breathing room around a target. */
const PAD = 12

const mouse = { x: -200, y: -200 }
const ring = { x: -200, y: -200, w: REST, h: REST, rot: 45, radius: 3 }
let last = { x: -200, y: -200 }
let stretch = 0
let angle = 0
let reduced = false

let hovered: HTMLElement | null = null
let resetTimer: ReturnType<typeof setTimeout> | undefined

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function onMove(e: PointerEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  if (!inside.value) inside.value = true
}

function acquire(el: HTMLElement) {
  hovered = el
  locked.value = true
  text.value = el.dataset.cursorText ?? ''
  ring.radius = el.getAttribute('cursorShape') === 'circle' ? 999 : 4
}

function release() {
  hovered = null
  locked.value = false
  text.value = ''
  ring.radius = 3
}

function onOver(e: PointerEvent) {
  const el = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null
  if (!el) return
  clearTimeout(resetTimer)
  if (el !== hovered) acquire(el)
}

function onOut(e: PointerEvent) {
  if (!hovered) return
  const related = e.relatedTarget as HTMLElement | null
  if (related && hovered.contains(related)) return
  const next = related?.closest?.('[data-cursor]') as HTMLElement | null
  if (next) {
    clearTimeout(resetTimer)
    acquire(next)
    return
  }
  // relatedTarget flickers to null across nested icons and SVG children, so
  // letting go is debounced; latching on never is.
  clearTimeout(resetTimer)
  resetTimer = setTimeout(release, 40)
}

/** A ring thrown off at the point of contact. */
function onDown() {
  if (reduced || !pulse.value) return
  gsap.set(pulse.value, { x: mouse.x, y: mouse.y, scale: 0.5, opacity: 0.9 })
  gsap.to(pulse.value, { scale: 2.1, opacity: 0, duration: 0.5, ease: 'power2.out' })
}

function frame() {
  if (!reticle.value || !dot.value) return

  // Where the reticle wants to be: framing its target, or trailing the
  // pointer while it has none.
  let tx = mouse.x
  let ty = mouse.y
  let tw = REST
  let th = REST
  let trot = 45

  if (hovered) {
    const r = hovered.getBoundingClientRect()
    // A target that has scrolled away or been hidden stops being one.
    if (!r.width && !r.height) release()
    else {
      tx = r.left + r.width / 2
      ty = r.top + r.height / 2
      tw = r.width + PAD
      th = r.height + PAD
      trot = 0
    }
  }

  const ease = reduced ? 1 : 0.2
  ring.x = lerp(ring.x, tx, ease)
  ring.y = lerp(ring.y, ty, ease)
  ring.w = lerp(ring.w, tw, reduced ? 1 : 0.24)
  ring.h = lerp(ring.h, th, reduced ? 1 : 0.24)
  ring.rot = lerp(ring.rot, trot, reduced ? 1 : 0.18)

  // Squash and stretch along the direction of travel, and only while it is
  // hunting — a reticle that deformed while framing a button would read as
  // a rendering fault rather than as speed.
  const dx = ring.x - last.x
  const dy = ring.y - last.y
  last = { x: ring.x, y: ring.y }
  const speed = Math.hypot(dx, dy)
  if (speed > 0.4) angle = (Math.atan2(dy, dx) * 180) / Math.PI
  const want = hovered || reduced ? 0 : Math.min(speed / 90, 0.3)
  stretch = lerp(stretch, want, 0.15)

  reticle.value.style.width = `${ring.w.toFixed(1)}px`
  reticle.value.style.height = `${ring.h.toFixed(1)}px`
  reticle.value.style.borderRadius = `${ring.radius}px`
  reticle.value.style.transform =
    `translate3d(${(ring.x - ring.w / 2).toFixed(1)}px, ${(ring.y - ring.h / 2).toFixed(1)}px, 0)` +
    ` rotate(${angle.toFixed(1)}deg) scale(${(1 + stretch).toFixed(3)}, ${(1 - stretch * 0.55).toFixed(3)})` +
    ` rotate(${(ring.rot - angle).toFixed(1)}deg)`

  dot.value.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`
  if (labelEl.value) {
    labelEl.value.style.transform = `translate3d(${mouse.x + 16}px, ${mouse.y + 18}px, 0)`
  }
}

function onLeaveWindow() {
  inside.value = false
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerover', onOver, true)
  document.addEventListener('pointerout', onOut, true)
  document.addEventListener('mouseleave', onLeaveWindow)
  gsap.ticker.add(frame)
})

onBeforeUnmount(() => {
  clearTimeout(resetTimer)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerdown', onDown)
  document.removeEventListener('pointerover', onOver, true)
  document.removeEventListener('pointerout', onOut, true)
  document.removeEventListener('mouseleave', onLeaveWindow)
  gsap.ticker.remove(frame)
})
</script>

<template>
  <div ref="root" class="cursor-root" :class="{ 'is-out': !inside, 'is-locked': locked }" aria-hidden="true">
    <!-- Four brackets, never a closed ring: a bracket says "this is the thing"
         where a circle just says "here is the mouse". -->
    <div ref="reticle" class="reticle">
      <span class="corner corner-tl" />
      <span class="corner corner-tr" />
      <span class="corner corner-bl" />
      <span class="corner corner-br" />
      <span class="tick tick-t" />
      <span class="tick tick-b" />
      <span class="tick tick-l" />
      <span class="tick tick-r" />
    </div>

    <p v-show="text" ref="labelEl" class="cursor-label">{{ text }}</p>

    <!-- Point of contact. Small enough to spend the signal colour on. -->
    <div ref="dot" class="cursor-dot" />
    <div ref="pulse" class="cursor-pulse" />
  </div>
</template>

<style scoped>
.cursor-root {
  --ink: #e8eef4;
  --ink-soft: rgb(232 238 244 / 0.5);
  --shadow: rgb(0 0 0 / 0.55);
}

/* The light theme needs the opposite ink; the shadow becomes a highlight so
   the brackets still separate from a pale page. */
:root:not(.dark) .cursor-root {
  --ink: #1d2226;
  --ink-soft: rgb(29 34 38 / 0.45);
  --shadow: rgb(255 255 255 / 0.5);
}

.cursor-root > * {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9999;
  pointer-events: none;
}

.cursor-root.is-out .reticle,
.cursor-root.is-out .cursor-dot {
  opacity: 0;
}

.reticle {
  width: 26px;
  height: 26px;
  opacity: 1;
  transition: opacity 0.3s ease;
  will-change: transform, width, height;
}

.corner,
.tick {
  position: absolute;
  background: transparent;
}

/* Each corner is an L of two hairlines, drawn with borders so one element
   carries both arms. */
.corner {
  width: 9px;
  height: 9px;
  filter: drop-shadow(0 0 1px var(--shadow));
}

.corner-tl {
  top: 0;
  left: 0;
  border-top: 1.5px solid var(--ink);
  border-left: 1.5px solid var(--ink);
}

.corner-tr {
  top: 0;
  right: 0;
  border-top: 1.5px solid var(--ink);
  border-right: 1.5px solid var(--ink);
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-bottom: 1.5px solid var(--ink);
  border-left: 1.5px solid var(--ink);
}

.corner-br {
  bottom: 0;
  right: 0;
  border-bottom: 1.5px solid var(--ink);
  border-right: 1.5px solid var(--ink);
}

/* Sight lines, out from the middle of each edge. They only swing out once
   something is framed — the "lock acquired" tell. */
.tick {
  background: var(--ink-soft);
  opacity: 0;
  transition:
    opacity 0.3s ease,
    transform 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
}

.tick-t,
.tick-b {
  left: 50%;
  width: 1px;
  height: 6px;
  margin-left: -0.5px;
}

.tick-l,
.tick-r {
  top: 50%;
  height: 1px;
  width: 6px;
  margin-top: -0.5px;
}

.tick-t {
  top: 0;
  transform: translateY(0);
}

.tick-b {
  bottom: 0;
  transform: translateY(0);
}

.tick-l {
  left: 0;
  transform: translateX(0);
}

.tick-r {
  right: 0;
  transform: translateX(0);
}

.is-locked .tick {
  opacity: 1;
}

.is-locked .tick-t {
  transform: translateY(-9px);
}

.is-locked .tick-b {
  transform: translateY(9px);
}

.is-locked .tick-l {
  transform: translateX(-9px);
}

.is-locked .tick-r {
  transform: translateX(9px);
}

.cursor-dot {
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 9999px;
  background: var(--color-signal);
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.35);
  transition: opacity 0.3s ease;
}

.cursor-pulse {
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border-radius: 9999px;
  border: 1px solid var(--color-signal);
  opacity: 0;
}

.cursor-label {
  margin: 0;
  padding: 0.3rem 0.5rem;
  background: color-mix(in oklab, var(--color-bg) 82%, transparent);
  border: 1px solid var(--ink-soft);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  white-space: nowrap;
  backdrop-filter: blur(6px);
}

@media (pointer: coarse) {
  .cursor-root {
    display: none;
  }
}
</style>
