<template>
  <section ref="sectionEl" class="relative h-screen overflow-hidden bg-transparent">

    <!-- ── The sky either side of the bands ──────────────────────────────
         Before the two strips expand, most of this section is empty night.
         Two streams of bats fill it, each one travelling with the band it
         sits next to — upper stream left with row 1, lower stream right with
         row 2, off the same speed and the same scroll-velocity boost, so the
         whole frame reads as one movement rather than a marquee on a
         backdrop.

         Behind the strips on purpose: nothing has to be faded out or timed,
         because the bands expanding over the screen is what swallows them. -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span
        v-for="(b, i) in bats"
        :key="i"
        ref="batEls"
        class="marquee-bat absolute left-0 top-0 will-change-transform"
        :class="i % BATS_PER_STREAM >= MOBILE_PER_STREAM ? 'hidden sm:block' : ''"
        :style="{ width: `${b.size}px`, '--flap': `${b.flap}s`, color: b.ink }"
      >
        <svg viewBox="0 0 240 100" aria-hidden="true">
          <path :d="BAT_HALF" />
          <path :d="BAT_HALF" :transform="BAT_MIRROR" />
        </svg>
      </span>
    </div>

    <!-- Row 1 — initially tilted counterclockwise -->
    <div
      ref="row1WrapEl"
      class="absolute overflow-hidden flex items-center"
      style="width: 150%; left: -25%;"
    >
      <div ref="row1El" class="flex items-center will-change-transform shrink-0">
        <div ref="measureEl" class="flex items-center shrink-0">
          <template v-for="n in 5" :key="n">
            <span class="font-passion uppercase whitespace-nowrap px-10 text-[6rem]">{{ quote1 }}</span>
            <span class="text-2xl shrink-0 select-none opacity-30">◆</span>
          </template>
        </div>
        <div class="flex items-center shrink-0" aria-hidden="true">
          <template v-for="n in 5" :key="`d${n}`">
            <span class="font-passion uppercase whitespace-nowrap px-10 text-[6rem]">{{ quote1 }}</span>
            <span class="text-2xl shrink-0 select-none opacity-30">◆</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Row 2 — initially tilted clockwise -->
    <div
      ref="row2WrapEl"
      class="absolute overflow-hidden flex items-center"
      style="width: 150%; left: -25%;"
    >
      <div ref="row2El" class="flex items-center will-change-transform shrink-0">
        <div class="flex items-center shrink-0">
          <template v-for="n in 5" :key="n">
            <span class="font-passion uppercase whitespace-nowrap px-10 text-[6rem]">{{ quote2 }}</span>
            <span class="text-2xl shrink-0 select-none opacity-30">◆</span>
          </template>
        </div>
        <div class="flex items-center shrink-0" aria-hidden="true">
          <template v-for="n in 5" :key="`d${n}`">
            <span class="font-passion uppercase whitespace-nowrap px-10 text-[6rem]">{{ quote2 }}</span>
            <span class="text-2xl shrink-0 select-none opacity-30">◆</span>
          </template>
        </div>
      </div>
    </div>

    <!-- ── The line in the dark ──────────────────────────────────────────
         Surfaces only once both bands have merged to black, so it arrives in
         an empty frame rather than competing with the marquee. Sits above the
         bands and takes no pointer events — it is a beat, not a UI. -->
    <div
      ref="quoteEl"
      class="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-8"
    >
      <blockquote class="max-w-5xl text-center" data-intel="3600px pinned timeline · the bands rotate, fill, merge, then the line surfaces">
        <p class="font-passion uppercase leading-[0.95] text-[clamp(1.6rem,4.4vw,4.25rem)] text-white/90">
          <span
            v-for="(word, i) in quoteWords"
            :key="i"
            ref="wordEls"
            class="inline-block mr-[0.26em]"
            :class="word.signal ? 'text-signal' : ''"
          >{{ word.text }}</span>
        </p>
        <footer
          ref="citeEl"
          class="mt-7 sm:mt-9 font-mono text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-white/35"
        >
          {{ QUOTE_SOURCE }}
        </footer>
      </blockquote>
    </div>

  </section>
</template>

<script lang="ts" setup>
import { BAT_HALF, BAT_MIRROR } from '~/utils/emblem'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Edit your quotes here ──
const quote1 = 'Full Stack Developer — Rabat, Morocco'
// Original line, not a film quote. Lifting dialogue verbatim is the fastest
// way to turn an atmosphere into a costume.
const quote2 = 'Built in the dark — Shipped before dawn'

/* ── The quote ────────────────────────────────────────────────────────────
   Chosen for where it lands, not just for who says it: this section resolves
   straight into "Case Files", so a line about being defined by what you do is
   doing double duty as the transition into the work.

   `signal: true` marks the words that take the amber. Three of them, and they
   are the operative phrase — the accent is rationed everywhere else on this
   site and this is the one place it gets to carry meaning rather than status.
   To swap the quote, rewrite this array and the source line below. */
const quoteWords: { text: string; signal?: boolean }[] = [
  { text: "It's" },
  { text: 'not' },
  { text: 'who' },
  { text: 'I' },
  { text: 'am' },
  { text: 'underneath,' },
  { text: 'but' },
  { text: 'what', signal: true },
  { text: 'I', signal: true },
  { text: 'do', signal: true },
  { text: 'that' },
  { text: 'defines' },
  { text: 'me.' },
]

const QUOTE_SOURCE = 'Batman — Batman Begins, 2005'


/** Per stream: how many exist, and how many a phone shows. */
const BATS_PER_STREAM = 9
const MOBILE_PER_STREAM = 5

/** Seeded so SSR and the client place them identically. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Two streams, in the bands' own directions. Size doubles as depth: the big
 * ones are near and keep pace with the type, the small ones hang back.
 */
const bats = (() => {
  const rand = mulberry32(4242)
  const out: {
    dir: number
    top: number
    size: number
    depth: number
    offset: number
    phase: number
    bob: number
    flap: number
    ink: string
  }[] = []
  for (const dir of [-1, 1]) {
    for (let i = 0; i < BATS_PER_STREAM; i++) {
      const size = 26 + rand() ** 1.6 * 64
      // Out of the middle, where the strips sit at rest — a bat behind a band
      // is just a bat nobody sees.
      const lane = 4 + rand() * 30
      out.push({
        dir,
        top: dir < 0 ? lane : 100 - lane,
        size,
        depth: 0.35 + ((size - 26) / 64) * 0.65,
        offset: (i + rand() * 0.7) / BATS_PER_STREAM,
        phase: rand() * Math.PI * 2,
        bob: 5 + rand() * 12,
        flap: 0.11 + rand() * 0.1,
        ink: rand() < 0.3 ? '#1d2531' : '#151b24',
      })
    }
  }
  return out
})()

const batEls = ref<HTMLElement[]>([])

const ROW1_COLOR  = '#12161b'
const ROW2_COLOR  = '#1d3a4f'
// Was '#0000000' — a 7-digit hex GSAP could not parse, so the merge never took.
const MERGE_COLOR = '#08090b'  // matches --color-surface on the dark theme
const TEXT_COLOR  = 'rgba(255,255,255,0.88)'
const STRIP_H     = 160  // px — initial strip height

const sectionEl   = ref<HTMLElement | null>(null)
const row1WrapEl  = ref<HTMLElement | null>(null)
const row2WrapEl  = ref<HTMLElement | null>(null)
const row1El      = ref<HTMLElement | null>(null)
const row2El      = ref<HTMLElement | null>(null)
const measureEl   = ref<HTMLElement | null>(null)
const quoteEl     = ref<HTMLElement | null>(null)
const wordEls     = ref<HTMLElement[]>([])
const citeEl      = ref<HTMLElement | null>(null)

/* Teardown is registered synchronously here, rather than at the end of the
   mounted body, because that body awaits nextTick() — and Vue loses the active
   instance across an await, so an onBeforeUnmount() placed after it is silently
   never registered. That left the ticker callback below running every frame for
   the life of the page, writing to element refs that no longer exist, plus two
   live ScrollTriggers. The body fills this in once there is something to kill. */
let cleanup: (() => void) | null = null
onBeforeUnmount(() => cleanup?.())

onMounted(async () => {
  await nextTick()

  const singleWidth = measureEl.value?.offsetWidth ?? 0
  if (!singleWidth || !row1El.value || !row2El.value) return

  const vh     = window.innerHeight
  const centerY = vh / 2 - STRIP_H / 2  // y that centers the strip

  // ── Initial states (all via GSAP so timeline can interpolate FROM them) ──
  gsap.set(sectionEl.value!, { backgroundColor: MERGE_COLOR })

  gsap.set(row1WrapEl.value!, {
    top: centerY, height: STRIP_H,
    rotation: -7, backgroundColor: ROW1_COLOR,
  })
  gsap.set(row2WrapEl.value!, {
    top: centerY, height: STRIP_H,
    rotation: 7, backgroundColor: ROW2_COLOR,
  })
  gsap.set([
    ...row1WrapEl.value!.querySelectorAll('span'),
    ...row2WrapEl.value!.querySelectorAll('span'),
  ], { color: TEXT_COLOR })

  // ── Autonomous marquee (ticker) ──
  let pos1 = 0
  let pos2 = singleWidth * 0.5
  let rawVel = 0
  let smoothVel = 0
  const BASE = 0.6

  const velTracker = ScrollTrigger.create({
    onUpdate(self) { rawVel = self.getVelocity() },
  })

  // The rows are cheap, but eighteen bats are not worth moving while the
  // section is nowhere near the screen.
  let onScreen = true
  const presence = ScrollTrigger.create({
    trigger: sectionEl.value,
    start: 'top bottom+=40%',
    end: 'bottom top-=40%',
    onToggle: (self) => (onScreen = self.isActive),
  })

  // Continuous, unlike pos1/pos2: those wrap on the tile width, and a bat
  // reading a wrapped value would jump every lap.
  let drift = 0

  const tick = () => {
    smoothVel += (rawVel - smoothVel) * 0.07
    const boost = smoothVel * 0.0025
    pos1 = ((pos1 + BASE + boost) % singleWidth + singleWidth) % singleWidth
    pos2 = ((pos2 - BASE - boost) % singleWidth + singleWidth) % singleWidth
    gsap.set(row1El.value!, { x: -pos1 })
    gsap.set(row2El.value!, { x: -pos2 })

    if (!onScreen) return
    drift += BASE + boost
    const t = performance.now() / 1000
    const h = sectionEl.value?.clientHeight ?? window.innerHeight
    for (let i = 0; i < bats.length; i++) {
      const el = batEls.value[i]
      const b = bats[i]!
      if (!el) continue
      // One lap is the screen plus a bat, so they enter and leave off-frame.
      const lap = window.innerWidth + b.size * 2
      const travel = b.offset * lap + b.dir * drift * b.depth
      const x = ((travel % lap) + lap) % lap - b.size
      const y = (b.top / 100) * h + Math.sin(t * 0.55 + b.phase) * b.bob
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }
  }
  gsap.ticker.add(tick)

  // ── Scroll-driven reveal timeline ──
  const halfVh = vh * 0.5

  // Scoped to the two marquee rows, NOT the whole section. This used to be a
  // blanket querySelectorAll('span'), which now also matches every word of the
  // quote below and would fade the line to nothing on the way in.
  const allSpans = [
    ...row1WrapEl.value!.querySelectorAll('span'),
    ...row2WrapEl.value!.querySelectorAll('span'),
  ]

  // The quote waits in the dark until the bands have merged over it.
  gsap.set(wordEls.value, { opacity: 0, yPercent: 70, filter: 'blur(14px)' })
  gsap.set(citeEl.value, { opacity: 0, y: 14 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl.value,
      start: 'top top',
      // Longer than the 2400 this ran at before: the extra distance is the
      // quote's, and it buys the hold at the end so the line can actually be
      // read instead of flashing past on the way to the next section.
      end: '+=3600',
      scrub: 1.5,
      pin: true,
    },
  })

  tl
    // Phase 1 — rotate both rows to horizontal
    .to(row1WrapEl.value!, { rotation: 0, duration: 1 }, 0)
    .to(row2WrapEl.value!, { rotation: 0, duration: 1 }, 0)

    // Phase 2 — expand rows to fill the screen (top half / bottom half)
    .to(row1WrapEl.value!, { top: 0,       height: halfVh, duration: 1 }, 0.2)
    .to(row2WrapEl.value!, { top: halfVh,  height: halfVh, duration: 1 }, 0.2)

    // Phase 3 — scale text up inside the expanding rows
    .to([row1El.value!, row2El.value!], { scale: 3.8, duration: 0.9 }, 0.15)

    // Phase 4 — fade text out
    .to(allSpans, { opacity: 0, duration: 0.35 }, 0.62)

    // Phase 5 — merge colors (both bands become the same dark color)
    .to(row1WrapEl.value!, { backgroundColor: MERGE_COLOR, duration: 0.45 }, 0.68)
    .to(row2WrapEl.value!, { backgroundColor: MERGE_COLOR, duration: 0.45 }, 0.68)

    // Phase 6 — close any sub-pixel gap at the seam
    .to(row1WrapEl.value!, { height: halfVh + 2, duration: 0.15 }, 0.88)

    // Phase 7 — the line surfaces out of the black. Word by word rather than
    // as a block: the stagger is what makes it read as something being said
    // rather than a caption being switched on. Starts at 1.12, a beat after
    // the merge completes at 1.13, so it never overlaps the marquee text.
    .to(
      wordEls.value,
      {
        opacity: 1,
        yPercent: 0,
        filter: 'blur(0px)',
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.out',
      },
      1.12,
    )
    .to(citeEl.value, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, '>-0.1')

    // Phase 8 — hold. An empty tween is the cheapest way to buy scroll distance
    // where nothing moves, which is the whole point: the quote gets a moment of
    // stillness before the section unpins and Case Files arrives.
    .to({}, { duration: 0.4 })

  cleanup = () => {
    gsap.ticker.remove(tick)
    velTracker.kill()
    presence.kill()
    tl.scrollTrigger?.kill()
  }
})
</script>

<style scoped>
.marquee-bat svg {
  display: block;
  width: 100%;
  height: auto;
  fill: currentColor;
  animation: marquee-flap var(--flap, 0.15s) ease-in-out infinite alternate;
}

@keyframes marquee-flap {
  to {
    transform: scale(0.36, 1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-bat svg {
    animation: none;
  }
}
</style>
