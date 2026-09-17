<script setup lang="ts">
import { BAT_HALF, BAT_MIRROR } from '~/utils/emblem'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { quoteWords, type Quote } from '~/data/lore'

gsap.registerPlugin(ScrollTrigger)

/**
 * A breath between sections: one remixed line, said by one side or the other.
 *
 * Gotham's lines get the amber and a figure on watch; the Joker's get marker
 * pen, his card, and HA HA HA on the wall behind. Short sections on purpose —
 * a quote that takes a full screen to arrive is a speech, not a beat.
 */
const props = defineProps<{ quote: Quote }>()


const words = computed(() => quoteWords(props.quote.text))
const joker = computed(() => props.quote.side === 'joker')

const sectionEl = ref<HTMLElement | null>(null)
const wordEls = ref<HTMLElement[]>([])
const citeEl = ref<HTMLElement | null>(null)
const artEl = ref<HTMLElement | null>(null)
const wallEl = ref<HTMLElement | null>(null)

const triggers: ScrollTrigger[] = []

onMounted(() => {
  if (!sectionEl.value) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const hide = () => {
    gsap.set(wordEls.value, { opacity: 0, yPercent: 60, filter: 'blur(10px)' })
    gsap.set(citeEl.value, { opacity: 0, x: -16 })
    gsap.set(artEl.value, { opacity: 0, y: 40 })
  }
  if (!reduced) hide()

  triggers.push(
    ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top 72%',
      onEnter: () => {
        if (reduced) return
        gsap.to(wordEls.value, {
          opacity: 1,
          yPercent: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.045,
          ease: 'power3.out',
        })
        gsap.to(citeEl.value, { opacity: 1, x: 0, duration: 0.6, delay: 0.5, ease: 'power3.out' })
        gsap.to(artEl.value, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' })
      },
      onLeaveBack: () => {
        if (!reduced) hide()
      },
    }),
  )

  // The writing on the wall drifts against the scroll.
  if (wallEl.value && !reduced) {
    const tween = gsap.fromTo(
      wallEl.value,
      { xPercent: -6 },
      {
        xPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: sectionEl.value, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    )
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
  }
})

onBeforeUnmount(() => triggers.forEach((t) => t.kill()))
</script>

<template>
  <section
    ref="sectionEl"
    class="relative overflow-hidden bg-surface px-6 py-28 sm:px-14 sm:py-40 lg:px-28"
  >
    <!-- What he left on the wall. -->
    <p
      v-if="joker"
      ref="wallEl"
      class="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[22vw] leading-none text-joker/10 -rotate-6"
      style="font-family: var(--font-scrawl)"
      aria-hidden="true"
    >
      HA HA HA HA
    </p>

    <div class="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_auto] lg:gap-24">
      <blockquote>
        <p class="mb-8 font-mono text-[11px] uppercase tracking-[0.35em] text-text-muted">
          <span :class="joker ? 'text-joker-green' : 'text-signal'">●</span>
          {{ joker ? 'Intercepted transmission' : 'From the case notes' }}
        </p>

        <p class="font-passion text-[clamp(1.9rem,4.6vw,4.4rem)] leading-[1.04] text-text">
          <span
            v-for="(w, i) in words"
            :key="i"
            ref="wordEls"
            class="mr-[0.24em] inline-block"
            :class="w.mark ? (joker ? 'interlude-scrawl text-joker-green' : 'text-signal') : ''"
          >{{ w.text }}</span>
        </p>

        <footer ref="citeEl" class="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.3em]">
          <span class="h-px w-10 bg-text/30" />
          <span class="text-text">{{ quote.who }}</span>
          <span class="text-text-muted/70">{{ quote.note }}</span>
        </footer>
      </blockquote>

      <div ref="artEl" class="mx-auto w-40 sm:w-48 lg:w-52">
        <JokerCard v-if="joker" class="w-full rotate-6" />
        <!-- On a ledge, against the moon. -->
        <div v-else class="relative aspect-[4/5] w-full">
          <!-- Weather and wildlife cross it, clipped to the disc: against the
               moon is the only place either would be seen at night. -->
          <div class="interlude-moon absolute left-1/2 top-0 aspect-square w-[92%] -translate-x-1/2 overflow-hidden rounded-full">
            <span class="moon-cloud moon-cloud-a" />
            <span class="moon-cloud moon-cloud-b" />
            <span v-for="n in 3" :key="n" class="moon-bat" :class="`moon-bat-${n}`">
              <svg viewBox="0 0 240 100" aria-hidden="true">
                <path :d="BAT_HALF" />
                <path :d="BAT_HALF" :transform="BAT_MIRROR" />
              </svg>
            </span>
          </div>
          <BatFigure class="absolute bottom-[6%] left-1/2 h-[78%] w-auto -translate-x-1/2 text-[#05070a]" />
          <div class="absolute inset-x-0 bottom-0 h-[7%] rounded-t-sm bg-[#05070a]" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Cold and a little uneven, the way a moon is when there is weather over the
   city. Pale enough on both themes for a black figure to cut out of it. */
.interlude-moon {
  background:
    radial-gradient(circle at 34% 30%, rgb(255 255 255 / 0.55), transparent 32%),
    radial-gradient(circle at 62% 58%, rgb(120 130 145 / 0.18) 0 9%, transparent 10%),
    radial-gradient(circle at 36% 66%, rgb(120 130 145 / 0.14) 0 6%, transparent 7%),
    radial-gradient(circle at 50% 50%, #e6e9ee, #b9c0c9 70%, #9aa3ae);
  box-shadow: 0 0 80px rgb(200 215 235 / 0.18);
}

.moon-cloud {
  position: absolute;
  left: 0;
  width: 95%;
  border-radius: 50%;
  background: rgb(22 28 38 / 0.5);
  filter: blur(7px);
  animation: moon-cloud linear infinite;
}

.moon-cloud-a {
  top: 20%;
  height: 16%;
  animation-duration: 24s;
}

.moon-cloud-b {
  top: 60%;
  height: 11%;
  opacity: 0.7;
  animation-duration: 17s;
  animation-delay: -9s;
}

@keyframes moon-cloud {
  from {
    transform: translateX(-110%);
  }
  to {
    transform: translateX(120%);
  }
}

.moon-bat {
  position: absolute;
  left: 0;
  width: 11%;
  animation: moon-bat linear infinite;
}

.moon-bat svg {
  display: block;
  width: 100%;
  fill: #05070a;
  animation: moon-flap 0.16s ease-in-out infinite alternate;
}

.moon-bat-1 {
  top: 34%;
  animation-duration: 7s;
}

.moon-bat-2 {
  top: 48%;
  width: 7%;
  animation-duration: 9.5s;
  animation-delay: -3s;
}

.moon-bat-3 {
  top: 26%;
  width: 5%;
  animation-duration: 12s;
  animation-delay: -7s;
}

/* Mostly off the disc: a bat crosses the moon for a moment, then the sky is
   empty for a while, which is what makes it worth noticing. */
@keyframes moon-bat {
  0% {
    transform: translate(-200%, 60%);
  }
  45% {
    transform: translate(1100%, -120%);
  }
  100% {
    transform: translate(1100%, -120%);
  }
}

@keyframes moon-flap {
  to {
    transform: scale(0.35, 1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .moon-cloud,
  .moon-bat,
  .moon-bat svg {
    animation: none;
  }

  .moon-bat {
    display: none;
  }
}

/* The Joker's words in his own hand. Slightly larger and knocked off the
   baseline, so they read as written over the sentence rather than set in it. */
.interlude-scrawl {
  font-family: var(--font-scrawl);
  font-weight: 400;
  transform-origin: left bottom;
  rotate: -3deg;
  font-size: 1.05em;
}
</style>
