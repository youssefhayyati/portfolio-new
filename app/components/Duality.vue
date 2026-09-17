<script setup lang="ts">
import { BAT_HALF, BAT_MIRROR } from '~/utils/emblem'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Order and Chaos: the two halves of the job, as two characters.
 *
 * Two full-bleed layers stacked. Order is underneath; Chaos sits on top,
 * clipped to everything right of a divider that follows the pointer — push it
 * left and the Joker takes the room, push it right and Batman does. Each side
 * keeps a line hidden in the half it normally cedes, as a reward for pushing.
 * The coin on the divider turns with it.
 *
 * Everything on the two lists is taken from the rest of the page — the roles,
 * the stack, the degree — so the conceit dresses the facts up without adding
 * any.
 *
 * On a phone there is no divider to drag, so the layers simply stack.
 */

const order = [
  'Confidentiality-first systems — access control and data protection that hold up.',
  'Critical bugs, followed all the way to the root.',
  'Queues, caches and clean contracts: Laravel, PostgreSQL, RabbitMQ, Redis.',
  "Master's in Intelligent Systems & Networks.",
]

const chaos = [
  'Motion, type and micro-interaction treated as first-class citizens.',
  'Draws by hand — the eye that makes a layout feel right.',
  'Figma, Photoshop, Illustrator, GSAP, Three.js.',
  'Experiments like the cowl up top: 64,000 grains of sand on one GPU.',
]


/** How far the divider may travel, as a fraction of the width. */
const MIN = 0.12
const MAX = 0.88

const sectionEl = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const chaosEl = ref<HTMLElement | null>(null)
const dividerEl = ref<HTMLElement | null>(null)
const coinEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const figureEl = ref<HTMLElement | null>(null)
const cardEl = ref<HTMLElement | null>(null)
const orderTextEl = ref<HTMLElement | null>(null)
const chaosTextEl = ref<HTMLElement | null>(null)

const { release } = useSwarm()

const state = { split: 0.5, target: 0.5, hovering: false, demo: false }
let mm: ReturnType<typeof gsap.matchMedia> | null = null
let split: InstanceType<typeof SplitText> | null = null
const triggers: ScrollTrigger[] = []

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * The pointer pushes the line AWAY from itself, so whichever side you point
 * at is the side that takes the room. Tying the line to the cursor instead
 * read as broken: pointing at Chaos clipped Chaos away, and you had to hover
 * the left half to read the right one.
 */
function onMove(e: PointerEvent) {
  const stage = stageEl.value
  if (!stage || state.demo) return
  const r = stage.getBoundingClientRect()
  const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  state.hovering = true
  state.target = MIN + (MAX - MIN) * (1 - frac)
}

function onLeave() {
  state.hovering = false
}

function paint(s: number) {
  if (chaosEl.value) chaosEl.value.style.clipPath = `inset(0 0 0 ${(s * 100).toFixed(3)}%)`
  if (dividerEl.value) dividerEl.value.style.left = `${(s * 100).toFixed(3)}%`
  // The bat face while the line idles about the middle; it only turns to the
  // Joker's once Chaos is clearly winning.
  if (coinEl.value) {
    const turn = 180 * smoothstep(0.44, 0.34, s) + (s - 0.5) * 50
    coinEl.value.style.transform = `rotateY(${turn.toFixed(2)}deg)`
  }
  // The copy of whichever side is losing fades out rather than being cut off
  // mid-sentence: the clip is a good wipe for a photograph and a bad one for
  // a paragraph. Both are fully lit while the line is anywhere near centre.
  if (orderTextEl.value) orderTextEl.value.style.opacity = smoothstep(0.2, 0.42, s).toFixed(3)
  if (chaosTextEl.value) chaosTextEl.value.style.opacity = smoothstep(0.8, 0.58, s).toFixed(3)
  // Each side's hero leans away from the line as it closes in on them; the
  // card goes with its own side's copy.
  if (figureEl.value) figureEl.value.style.transform = `translateX(${((s - 0.5) * -40).toFixed(1)}px)`
  if (cardEl.value) {
    cardEl.value.style.transform = `translateX(${((s - 0.5) * -40).toFixed(1)}px) rotate(${(8 + (s - 0.5) * 30).toFixed(1)}deg)`
    cardEl.value.style.opacity = smoothstep(0.86, 0.62, s).toFixed(3)
  }
}

function tick() {
  const t = performance.now() / 1000
  // At rest the line never quite stops: a slow tug-of-war between the two.
  const target = state.hovering || state.demo ? state.target : 0.5 + Math.sin(t * 0.45) * 0.012
  state.split += (target - state.split) * (state.demo ? 0.12 : 0.08)
  paint(state.split)
}

onMounted(() => {
  if (!sectionEl.value) return

  if (headingEl.value) {
    split = new SplitText(headingEl.value, { type: 'lines,words' })
    split.lines.forEach((l) => ((l as HTMLElement).style.overflow = 'hidden'))
    gsap.set(split.words, { yPercent: 110 })
    triggers.push(
      ScrollTrigger.create({
        trigger: sectionEl.value,
        start: 'top 70%',
        once: true,
        onEnter: () => gsap.to(split!.words, { yPercent: 0, stagger: 0.07, duration: 1, ease: 'power4.out' }),
      }),
    )
  }

  mm = gsap.matchMedia()
  mm.add('(min-width: 768px)', () => {
    let running = false
    const start = () => {
      if (running) return
      running = true
      gsap.ticker.add(tick)
    }
    const stop = () => {
      running = false
      gsap.ticker.remove(tick)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // The first time it comes into view, the two sides fight over it once,
    // which is how anyone learns the line can be pushed.
    const demo = ScrollTrigger.create({
      trigger: stageEl.value,
      start: 'top 45%',
      once: true,
      onEnter: () => {
        if (reduced) return
        state.demo = true
        gsap
          .timeline({ onComplete: () => void (state.demo = false) })
          .to(state, { target: 0.8, duration: 0.7, ease: 'power2.inOut' })
          .to(state, { target: 0.2, duration: 0.9, ease: 'power2.inOut' })
          .to(state, { target: 0.5, duration: 0.7, ease: 'power2.inOut' })
      },
    })
    const visibility = ScrollTrigger.create({
      trigger: stageEl.value,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? start() : stop()),
    })

    return () => {
      stop()
      demo.kill()
      visibility.kill()
      if (chaosEl.value) chaosEl.value.style.clipPath = ''
      for (const el of [figureEl.value, cardEl.value, coinEl.value]) if (el) el.style.transform = ''
      for (const el of [orderTextEl.value, chaosTextEl.value, cardEl.value]) if (el) el.style.opacity = ''
    }
  })

  // The colony comes up out of the bottom of the screen as the two sides
  // arrive — once a visit, or it would be a screensaver.
  triggers.push(
    ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top 75%',
      once: true,
      onEnter: () => release({ x: window.innerWidth / 2, y: window.innerHeight + 40, spread: 1.8 }),
    }),
  )

  // The children, not the wrappers: paint() owns the wrappers' transform.
  const art = [figureEl.value?.firstElementChild, cardEl.value?.firstElementChild].filter(Boolean)
  gsap.set(art, { opacity: 0, y: 60 })
  triggers.push(
    ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top 60%',
      once: true,
      onEnter: () => gsap.to(art, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' }),
    }),
  )
})

onBeforeUnmount(() => {
  mm?.revert()
  split?.revert()
  triggers.forEach((t) => t.kill())
})
</script>

<template>
  <section id="duality" ref="sectionEl" class="relative overflow-hidden bg-[#05070a] text-white">
    <div
      ref="stageEl"
      class="relative md:h-screen md:min-h-[680px]"
      @pointermove="onMove"
      @pointerleave="onLeave"
    >
      <!-- ── Order ─────────────────────────────────────────────────────── -->
      <div
        class="duality-order relative px-6 pb-24 pt-44 sm:px-14 md:absolute md:inset-0 md:p-0"
        data-intel="Two stacked layers · clip-path follows the pointer · no layout work per frame"
      >
        <!-- Revealed only when Order pushes past the middle. -->
        <p
          class="pointer-events-none absolute left-[54%] top-1/2 hidden w-[22%] -translate-y-1/2 font-passion text-[clamp(1.6rem,3vw,3rem)] uppercase leading-[0.95] text-white/10 md:block"
          aria-hidden="true"
        >
          I'm whatever<br />this sprint<br />needs me to be.
        </p>

        <div
          ref="figureEl"
          class="pointer-events-none mx-auto mb-14 w-28 md:absolute md:bottom-0 md:left-[45%] md:mb-0 md:h-[70%] md:w-auto md:-translate-x-1/2"
        >
          <BatFigure class="duality-figure h-auto w-full md:h-full md:w-auto" />
        </div>

        <div ref="orderTextEl" class="relative md:absolute md:left-[6%] md:top-[56%] md:w-[30%] md:-translate-y-1/2">
          <p class="mb-5 font-mono text-[11px] uppercase tracking-[0.35em] text-[#e0a93f]">Side A — The Detective</p>
          <h3 class="font-passion text-[clamp(3.2rem,7vw,7rem)] uppercase leading-[0.85]">Order</h3>
          <p class="mt-4 font-display text-sm uppercase tracking-[0.2em] text-white/50">Back-ends, systems, security</p>
          <ul class="mt-9 space-y-4">
            <li v-for="line in order" :key="line" class="flex gap-3 font-roboto text-sm leading-relaxed text-white/75 lg:text-base">
              <BatMark class="mt-1.5 h-auto w-4 shrink-0 text-[#e0a93f]" />
              <span>{{ line }}</span>
            </li>
          </ul>
        </div>

      </div>

      <!-- ── Chaos ─────────────────────────────────────────────────────── -->
      <div
        ref="chaosEl"
        class="duality-chaos relative px-6 py-24 sm:px-14 md:absolute md:inset-0 md:p-0"
      >
        <!-- The walls, and a line revealed only when Chaos takes the room. -->
        <p
          class="pointer-events-none absolute left-[26%] top-[14%] hidden -rotate-12 select-none text-[7vw] leading-none text-[#4cc97a]/15 md:block"
          style="font-family: var(--font-scrawl)"
          aria-hidden="true"
        >
          HA HA
        </p>
        <p
          class="pointer-events-none absolute bottom-[14%] left-[24%] hidden w-[26%] rotate-[-4deg] select-none text-[clamp(1.6rem,3vw,3rem)] leading-[1.05] text-[#9b5de5]/40 md:block"
          style="font-family: var(--font-scrawl)"
          aria-hidden="true"
        >
          Why so serious?<br />It's only production.
        </p>
        <p
          class="pointer-events-none absolute bottom-[16%] right-[34%] hidden rotate-6 select-none text-[4vw] leading-none text-[#e0263a]/20 md:block"
          style="font-family: var(--font-scrawl)"
          aria-hidden="true"
        >
          hehe
        </p>

        <div ref="chaosTextEl" class="relative md:absolute md:right-[6%] md:top-[56%] md:w-[28%] md:-translate-y-1/2 md:text-right">
          <p class="mb-5 font-mono text-[11px] uppercase tracking-[0.35em] text-[#4cc97a]">Side B — The Wild Card</p>
          <h3 class="-rotate-3 text-[clamp(3.2rem,7vw,7rem)] leading-[0.9] text-[#4cc97a]" style="font-family: var(--font-scrawl)">
            Chaos
          </h3>
          <p class="mt-4 font-display text-sm uppercase tracking-[0.2em] text-white/50">Front-ends, motion, art</p>
          <ul class="mt-9 space-y-4">
            <li
              v-for="line in chaos"
              :key="line"
              class="flex gap-3 font-roboto text-sm leading-relaxed text-white/80 md:flex-row-reverse lg:text-base"
            >
              <span class="mt-0.5 shrink-0 text-[#9b5de5]" style="font-family: var(--font-scrawl)">✱</span>
              <span>{{ line }}</span>
            </li>
          </ul>
        </div>

        <div
          ref="cardEl"
          class="mx-auto mt-14 w-40 md:absolute md:left-[57%] md:top-[28%] md:mt-0 md:w-[12vw] md:max-w-[200px] md:-translate-x-1/2"
        >
          <JokerCard class="w-full" />
        </div>
      </div>

      <!-- ── The line between them ─────────────────────────────────────── -->
      <div ref="dividerEl" class="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-white/30 md:block">
        <div class="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 [perspective:600px]">
          <div ref="coinEl" class="relative h-full w-full [transform-style:preserve-3d]">
            <span class="coin-face bg-[radial-gradient(circle_at_35%_30%,#3a4452,#0c1016)]">
              <svg viewBox="0 0 240 100" class="w-12 text-[#e0a93f]" fill="currentColor" aria-hidden="true">
                <path :d="BAT_HALF" /><path :d="BAT_HALF" :transform="BAT_MIRROR" />
              </svg>
            </span>
            <span
              class="coin-face bg-[radial-gradient(circle_at_35%_30%,#6d3aa8,#1c0930)] text-2xl text-[#4cc97a] [transform:rotateY(180deg)]"
              style="font-family: var(--font-scrawl)"
            >HA</span>
          </div>
        </div>
      </div>

      <!-- ── Over both ─────────────────────────────────────────────────── -->
      <div class="pointer-events-none absolute inset-x-0 top-0 px-6 pt-20 text-center md:pt-[11vh]">
        <p class="mb-4 font-mono text-[11px] uppercase tracking-[0.35em] text-white/50">Dossier / Duality</p>
        <h2 ref="headingEl" class="font-passion text-[clamp(1.9rem,4vw,3.6rem)] uppercase leading-[0.95]">
          Two sides. One developer.
        </h2>
      </div>
      <p class="pointer-events-none relative px-6 pb-16 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-white/45 md:absolute md:inset-x-0 md:bottom-[5vh] md:pb-0">
        Every system needs a Batman. Every interface needs a little Joker.
        <span class="hidden text-white/25 md:inline">— point at a side to push the line</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.duality-order {
  background:
    radial-gradient(60% 70% at 30% 60%, rgb(90 147 184 / 0.16), transparent 70%),
    linear-gradient(90deg, #05080c, #0b1119 60%, #0d141d);
}

.duality-chaos {
  background:
    radial-gradient(45% 55% at 85% 88%, rgb(76 201 122 / 0.22), transparent 70%),
    radial-gradient(60% 70% at 68% 35%, #3b1260, transparent 70%),
    linear-gradient(90deg, #12061d, #1c0930 55%, #0c0514);
}

/* Backlit, always: this section is dark in both themes. */
.duality-figure {
  color: #010203;
  filter:
    drop-shadow(0 0 1px rgb(221 228 234 / 0.6))
    drop-shadow(0 0 30px rgb(90 147 184 / 0.3));
}

.coin-face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.25);
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.5);
  backface-visibility: hidden;
}
</style>
