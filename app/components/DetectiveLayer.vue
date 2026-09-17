<script setup lang="ts">
import gsap from 'gsap'
import ScrollSmoother from 'gsap/ScrollSmoother'

/**
 * Detective vision. The page goes cold blue, and every element carrying
 * `data-intel` gets orange brackets and a note on how it works — the case
 * file on the site itself, for anyone curious how the tricks are done.
 *
 * It is also a small game: every clue that passes through view counts as
 * found, the tally survives reloads, and finding the lot closes the case —
 * with a colony of bats and a pointer to the man who planted the clues.
 * Only clues that are actually rendered at this screen size count, so the
 * case can be closed on a phone too.
 *
 * Two separate fixed layers, and the split matters: the tint has to be its
 * own element in the root stacking context, because mix-blend-mode only
 * blends with what is inside the stacking context it sits in. Put it inside
 * the labels' container and it would blend with nothing at all. The labels
 * sit above the tint, so they keep their colour.
 *
 * Labels follow their targets from a rAF loop that only runs while the mode is
 * on. Positions are written straight to the DOM — a dozen boxes moving every
 * frame is no job for reactive state.
 */
const { active, toggle } = useDetective()
const { release } = useSwarm()

const STORE = 'yh-case-v1'

interface Clue {
  el: HTMLElement
  text: string
}

const clues = shallowRef<Clue[]>([])
const boxEls = ref<HTMLElement[]>([])
const inView = ref(0)
const tint = ref<HTMLElement | null>(null)
const hud = ref<HTMLElement | null>(null)
const tally = ref<HTMLElement | null>(null)

/** Everything ever found, by its note. Kept across visits. */
const found = new Set<string>()
const foundCount = ref(0)
const solved = ref(false)
const showClosed = ref(false)

let raf = 0

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? '{}') as { found?: string[]; solved?: boolean }
    saved.found?.forEach((t) => found.add(t))
    solved.value = !!saved.solved
  } catch {
    // No storage (private mode, blocked): the case just starts fresh.
  }
}

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify({ found: [...found], solved: solved.value }))
  } catch {
    // Same as above; the tally still works for this visit.
  }
}

function recount() {
  foundCount.value = clues.value.filter((c) => found.has(c.text)).length
}

function discover(text: string) {
  found.add(text)
  save()
  recount()
  gsap.fromTo(
    tally.value,
    { scale: 1.4, color: '#ffffff' },
    { scale: 1, color: '#ffb347', duration: 0.6, ease: 'power3.out' },
  )
  if (!solved.value && foundCount.value >= clues.value.length) closeCase()
}

function closeCase() {
  solved.value = true
  showClosed.value = true
  save()
  release({ x: window.innerWidth / 2, y: window.innerHeight * 0.8, spread: 2.4 })
}

function track() {
  raf = requestAnimationFrame(track)
  const vw = window.innerWidth
  const vh = window.innerHeight
  let seen = 0
  clues.value.forEach((clue, i) => {
    const box = boxEls.value[i]
    if (!box) return
    const r = clue.el.getBoundingClientRect()
    const visible = r.bottom > 60 && r.top < vh - 60 && r.right > 0 && r.left < vw
    if (!visible) {
      box.style.visibility = 'hidden'
      return
    }
    seen++
    if (!found.has(clue.text)) discover(clue.text)
    // Clamped to the screen, so a tall element still gets a readable frame.
    const x = Math.max(8, r.left - 8)
    const y = Math.max(72, r.top - 8)
    const w = Math.min(vw - 8, r.right + 8) - x
    const h = Math.min(vh - 8, r.bottom + 8) - y
    box.style.visibility = 'visible'
    box.style.transform = `translate(${x}px, ${y}px)`
    box.style.width = `${Math.max(w, 24)}px`
    box.style.height = `${Math.max(h, 24)}px`
  })
  if (seen !== inView.value) inView.value = seen
}

watch(active, async (on) => {
  document.documentElement.classList.toggle('detective', on)
  if (on) {
    // Only what is actually on the page at this size, once per note.
    const seen = new Set<string>()
    clues.value = [...document.querySelectorAll<HTMLElement>('[data-intel]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const text = el.dataset.intel ?? ''
        if (!r.width || !r.height || !text || seen.has(text)) return false
        seen.add(text)
        return true
      })
      .map((el) => ({ el, text: el.dataset.intel! }))
    recount()
    await nextTick()
    cancelAnimationFrame(raf)
    track()
    gsap.fromTo(tint.value, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    // Opacity only: track() owns the transform.
    gsap.fromTo(
      boxEls.value,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power3.out', delay: 0.2 },
    )
    gsap.fromTo(hud.value, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.1 })
  } else {
    cancelAnimationFrame(raf)
    showClosed.value = false
    gsap.to(tint.value, { opacity: 0, duration: 0.35 })
  }
})

function hireTheDetective() {
  active.value = false
  const target = document.querySelector('#contact')
  if (!target) return
  const smoother = ScrollSmoother.get()
  if (smoother) smoother.scrollTo(target, true, 'top top')
  else target.scrollIntoView({ behavior: 'smooth' })
}

function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (e.metaKey || e.ctrlKey || e.altKey || t?.closest('input, textarea, [contenteditable]')) return
  if (e.key === 'd' || e.key === 'D') toggle()
  else if (e.key === 'Escape' && active.value) active.value = false
}

onMounted(() => {
  load()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  cancelAnimationFrame(raf)
  document.documentElement.classList.remove('detective')
})
</script>

<template>
  <!-- The tint: its own element, so it blends with the whole page. -->
  <div
    ref="tint"
    class="pointer-events-none fixed inset-0 z-85 opacity-0 mix-blend-color"
    style="background: #1f6fe0"
    aria-hidden="true"
  />

  <div v-if="active" class="pointer-events-none fixed inset-0 z-86">
    <!-- Survey grid and a slow sweep, so the screen reads as being scanned. -->
    <div class="detective-grid absolute inset-0" />
    <div class="detective-sweep absolute inset-x-0 h-40" />

    <div
      v-for="(clue, i) in clues"
      :key="clue.text"
      ref="boxEls"
      class="detective-box absolute left-0 top-0 will-change-transform"
    >
      <span class="detective-tag">
        <span class="opacity-60">{{ String(i + 1).padStart(2, '0') }}</span>
        {{ clue.text }}
      </span>
    </div>

    <!-- The case, so far. -->
    <div
      ref="hud"
      class="absolute bottom-8 right-6 w-60 text-right font-mono text-[10px] uppercase tracking-[0.3em] text-[#ffb347] sm:right-10 sm:w-72 sm:text-[11px]"
      aria-live="polite"
    >
      <p class="flex items-center justify-end gap-2">
        <span class="inline-block h-2 w-2 rounded-full bg-[#ffb347] animate-signal-breathe" />
        Detective mode
      </p>
      <p class="mt-3 flex items-baseline justify-end gap-2 text-white/60">
        Clues found
        <span ref="tally" class="inline-block origin-right text-base tabular-nums text-[#ffb347] sm:text-lg">
          {{ String(foundCount).padStart(2, '0') }}
        </span>
        / {{ String(clues.length).padStart(2, '0') }}
      </p>
      <div class="mt-2 h-px w-full bg-white/15">
        <div
          class="h-full origin-right bg-[#ffb347] transition-transform duration-500"
          :style="{ transform: `scaleX(${clues.length ? foundCount / clues.length : 0})` }"
        />
      </div>
      <p class="mt-2 text-white/40">
        {{ solved ? 'Case closed' : 'Scroll to find the rest' }} · D to exit
      </p>
    </div>

    <!-- Every clue found. -->
    <Transition name="case">
      <div
        v-if="showClosed"
        class="pointer-events-auto absolute bottom-40 left-1/2 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 border border-[#ffb347]/60 bg-[#050a12]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:p-8"
        role="dialog"
        aria-label="Case closed"
      >
        <p class="font-mono text-[11px] uppercase tracking-[0.35em] text-[#ffb347]">Case closed</p>
        <p class="mt-4 font-passion text-[clamp(1.4rem,3vw,2rem)] uppercase leading-none text-white">
          Every clue found.<br />You'd make a fine detective.
        </p>
        <p class="mt-4 font-roboto text-sm leading-relaxed text-white/60">
          The one who planted them builds sites like this for a living — and he is taking new cases.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            data-cursor
            class="cursor-none bg-[#ffb347] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#050a12] transition-opacity hover:opacity-85"
            @click="hireTheDetective"
          >
            Light the signal
          </button>
          <button
            type="button"
            data-cursor
            class="cursor-none border border-white/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
            @click="showClosed = false"
          >
            Keep looking around
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.detective-grid {
  background-image:
    linear-gradient(rgb(120 190 255 / 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgb(120 190 255 / 0.07) 1px, transparent 1px);
  background-size: 48px 48px;
}

.detective-sweep {
  top: -10rem;
  background: linear-gradient(to bottom, transparent, rgb(120 190 255 / 0.12) 80%, rgb(160 215 255 / 0.5) 100%);
  animation: detective-sweep 3.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes detective-sweep {
  to {
    transform: translateY(calc(100vh + 10rem));
  }
}

/* Corner brackets in the orange the eye is trained to follow. */
.detective-box {
  --c: #ffb347;
  background:
    linear-gradient(var(--c), var(--c)) top left / 14px 2px,
    linear-gradient(var(--c), var(--c)) top left / 2px 14px,
    linear-gradient(var(--c), var(--c)) top right / 14px 2px,
    linear-gradient(var(--c), var(--c)) top right / 2px 14px,
    linear-gradient(var(--c), var(--c)) bottom left / 14px 2px,
    linear-gradient(var(--c), var(--c)) bottom left / 2px 14px,
    linear-gradient(var(--c), var(--c)) bottom right / 14px 2px,
    linear-gradient(var(--c), var(--c)) bottom right / 2px 14px;
  background-repeat: no-repeat;
  outline: 1px dashed rgb(255 179 71 / 0.25);
}

.detective-tag {
  position: absolute;
  left: 0;
  top: -1.9rem;
  display: flex;
  gap: 0.6rem;
  max-width: min(34rem, 80vw);
  padding: 0.35rem 0.6rem;
  background: rgb(5 10 18 / 0.88);
  border: 1px solid rgb(255 179 71 / 0.5);
  color: #ffb347;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Vertical only: the horizontal centring is Tailwind's `translate`, a
   separate property this does not touch. */
.case-enter-active,
.case-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.case-enter-from,
.case-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

@media (prefers-reduced-motion: reduce) {
  .detective-sweep {
    display: none;
  }
}
</style>
