<template>
  <footer
    id="contact"
    ref="sectionEl"
    class="relative bg-bg text-text overflow-hidden"
  >
    <!-- Marquee ribbon -->
    <div class="relative border-y border-text/15 overflow-hidden py-4 bg-bg">
      <div ref="ribbonEl" class="flex whitespace-nowrap will-change-transform">
        <div v-for="n in 2" :key="n" class="flex items-center shrink-0" :aria-hidden="n === 2">
          <template v-for="i in 6" :key="`${n}-${i}`">
            <span class="font-passion uppercase text-2xl sm:text-4xl px-6 text-text">Open to work</span>
            <span class="text-secondary text-xl px-2">✦</span>
            <span class="font-passion uppercase text-2xl sm:text-4xl px-6 text-text/40">Let's talk</span>
            <span class="text-secondary text-xl px-2">✦</span>
          </template>
        </div>
      </div>
    </div>

    <div class="relative px-6 sm:px-14 lg:px-28 pt-24 sm:pt-36 pb-10">
      <!-- Aurora blob -->
      <div
        ref="auroraEl"
        class="pointer-events-none absolute top-[10%] left-1/2 -translate-x-1/2 w-[120vw] sm:w-[70vw] h-[70vw] sm:h-[45vw] rounded-full blur-[120px] opacity-40"
        style="background: radial-gradient(circle at 30% 30%, var(--color-secondary) 0%, transparent 55%), radial-gradient(circle at 70% 60%, var(--color-signal) 0%, transparent 60%);"
      />

      <!-- Availability. The one genuinely live thing on the page, so it gets
           the signal — a status lamp is exactly what the colour is for. -->
      <div ref="availEl" class="relative flex items-center gap-3 mb-14 sm:mb-20">
        <span class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full rounded-full bg-signal opacity-75 animate-ping" />
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
        </span>
        <p class="font-display text-[13px] tracking-[0.3em] uppercase text-text-muted">
          Available for freelance &amp; full-time
          <span class="block mt-1.5 text-[11px] tracking-[0.25em] text-text-muted/60">
            Currently building at Scientiae — Rabat
          </span>
        </p>
      </div>

      <!-- Kinetic headline -->
      <h2
        ref="headingEl"
        class="relative font-passion uppercase leading-[0.82] text-[clamp(3rem,13vw,13rem)] text-text"
      >
        Let's build<br />
        <span class="headline-signal">something</span> big
      </h2>

      <!-- Magnetic email button -->
      <div class="relative mt-16 sm:mt-24 flex justify-center sm:justify-start">
        <!-- The signal, thrown on the cloud beside the button. Barely there
             until someone reaches for the switch that lights it — and anchored
             to this row, not the footer, which is thousands of pixels tall. -->
        <div
          ref="projEl"
          class="pointer-events-none absolute left-1/2 top-1/2 hidden w-[min(38vw,480px)] -translate-y-1/2 opacity-[0.06] sm:block"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 220" class="h-auto w-full overflow-visible">
            <defs>
              <radialGradient id="contact-disc">
                <stop offset="0" style="stop-color: var(--color-signal); stop-opacity: 0.75" />
                <stop offset="0.62" style="stop-color: var(--color-signal); stop-opacity: 0.3" />
                <stop offset="1" style="stop-color: var(--color-signal); stop-opacity: 0" />
              </radialGradient>
            </defs>
            <ellipse cx="200" cy="110" rx="200" ry="104" fill="url(#contact-disc)" />
            <g transform="translate(80 60)" class="fill-bg">
              <path :d="BAT_HALF" />
              <path :d="BAT_HALF" :transform="BAT_MIRROR" />
            </g>
          </svg>
        </div>

        <a
          ref="magnetEl"
          href="mailto:youssefhayyati1997@gmail.com"
          data-intel="Magnetic CTA · hover strikes the signal behind the headline, click releases the bats"
          data-cursor
          data-cursor-text="Say hi"
          class="group relative inline-flex items-center justify-center rounded-full bg-text text-bg cursor-none
                 w-52 h-52 sm:w-64 sm:h-64"
        >
          <span ref="magnetInner" class="flex flex-col items-center gap-2 will-change-transform">
            <Icon name="lucide:arrow-up-right" class="text-4xl transition-transform duration-500 group-hover:rotate-45" />
            <span class="font-display text-sm tracking-[0.25em] uppercase">Light the signal</span>
          </span>
          <!-- rotating caption ring -->
          <svg ref="ringEl" class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <defs>
              <path id="ring" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
            </defs>
            <text class="fill-bg/50 font-mono uppercase" style="font-size: 11px; letter-spacing: 6px;">
              <textPath href="#ring" startOffset="0%">
                Youssef Hayyati • Full-Stack Developer • Rabat •
              </textPath>
            </text>
          </svg>
        </a>
      </div>

      <!-- Line of the night. A different one each visit. -->
      <figure ref="nightEl" class="relative mt-24 sm:mt-32 border-y border-text/15 py-10 sm:py-12 grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-16 items-baseline">
        <figcaption class="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted/60 flex items-center gap-3">
          <span :class="night.side === 'joker' ? 'text-joker-green' : 'text-signal'">●</span>
          Line of the night
        </figcaption>
        <div>
          <blockquote class="font-passion text-[clamp(1.4rem,3vw,2.6rem)] leading-[1.1] text-text">
            <span
              v-for="(w, i) in nightWords"
              :key="`${nightIndex}-${i}`"
              class="inline-block mr-[0.24em]"
              :class="w.mark ? (night.side === 'joker' ? 'text-joker-green night-scrawl' : 'text-signal') : ''"
            >{{ w.text }}</span>
          </blockquote>
          <p class="mt-5 font-mono text-[11px] tracking-[0.3em] uppercase text-text-muted">
            <span class="text-text">{{ night.who }}</span> — {{ night.note }}
            <button
              type="button"
              data-cursor
              data-cursor-text="Another"
              class="ml-4 text-text-muted/70 hover:text-text transition-colors cursor-none underline underline-offset-4 decoration-text/30"
              @click="nextNight"
            >
              another
            </button>
          </p>
        </div>
      </figure>

      <!-- Detail grid -->
      <div class="relative mt-20 sm:mt-28 grid grid-cols-2 sm:grid-cols-4 gap-y-12 gap-x-8">
        <div>
          <p class="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted/60 mb-4">Email</p>
          <a
            href="mailto:youssefhayyati1997@gmail.com"
            data-cursor
            data-cursor-text="Write"
            class="font-display text-sm sm:text-base text-text leading-tight break-all hover:text-secondary transition-colors cursor-none"
          >
            {{ EMAIL }}
          </a>
          <!-- Not everyone wants a mail client to open; some just want the
               address. Both, then, and the button says which it did. -->
          <button
            type="button"
            data-cursor
            :data-cursor-text="copied ? 'Copied' : 'Copy'"
            class="mt-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-text-muted hover:text-text transition-colors cursor-none"
            @click="copyEmail"
          >
            <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="text-sm" />
            {{ copied ? 'Copied' : 'Copy address' }}
          </button>
        </div>

        <div>
          <p class="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted/60 mb-4">Local time</p>
          <p class="font-display text-base sm:text-lg text-text tabular-nums tracking-[0.1em]">{{ moroccoTime }}</p>
          <p class="font-display text-sm text-text-muted mt-1">Rabat, Morocco</p>
        </div>

        <div>
          <p class="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted/60 mb-4">Languages</p>
          <ul class="font-display text-sm sm:text-base text-text leading-tight space-y-1">
            <li v-for="lang in languages" :key="lang">{{ lang }}</li>
          </ul>
        </div>

        <div>
          <p class="font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted/60 mb-4">Socials</p>
          <ul class="flex flex-col gap-2">
            <li v-for="social in socials" :key="social.label">
              <a
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                :data-cursor-text="social.label"
                class="group/link inline-flex items-center gap-2 font-display text-sm sm:text-base text-text hover:text-secondary transition-colors cursor-none"
              >
                <Icon :name="social.icon" class="text-xl" />
                <span class="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-secondary after:transition-transform after:duration-300 group-hover/link:after:origin-left group-hover/link:after:scale-x-100">
                  {{ social.label }}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Gotham. The name hangs in the sky over the city, the signal is lit
           over the name, and he is on the tallest roof, watching. -->
      <div class="relative mt-20 sm:mt-24 -mx-6 sm:-mx-14 lg:-mx-28 select-none pointer-events-none">
        <p
          ref="watermarkEl"
          class="px-6 sm:px-14 lg:px-28 font-passion uppercase leading-none text-[19vw] text-transparent whitespace-nowrap"
          style="-webkit-text-stroke: 1px var(--color-text); opacity: 0.12;"
        >
          Hayyati
        </p>
        <div class="relative -mt-[13vw] h-[max(200px,25vw)]" data-intel="Seeded skyline · generated identically on server and client, one path per layer">
          <GothamSkyline class="absolute inset-0 h-full" />
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="relative mt-10 pt-8 border-t border-text/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <p class="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted/70">
          © {{ year }} Youssef Hayyati — All rights reserved
        </p>
        <p class="font-mono text-[11px] tracking-[0.2em] uppercase text-text-muted/70">
          Built with Nuxt · GSAP · Tailwind
        </p>
        <button
          type="button"
          data-cursor
          data-cursor-text="Top"
          class="group inline-flex items-center gap-2 font-display text-[13px] tracking-[0.25em] uppercase text-text-muted hover:text-text transition-colors cursor-none"
          @click="scrollToTop"
        >
          Back to top
          <Icon name="lucide:arrow-up" class="text-lg transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { BAT_HALF, BAT_MIRROR } from '~/utils/emblem'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollSmoother from 'gsap/ScrollSmoother'
import SplitText from 'gsap/SplitText'

import { NIGHT_QUOTES, quoteWords } from '~/data/lore'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)

const year = 2026
const EMAIL = 'youssefhayyati1997@gmail.com'

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(EMAIL)
    copied.value = true
    clearTimeout(copyTimer)
    // Long enough to read, short enough that the button goes back to being
    // an offer rather than a receipt.
    copyTimer = setTimeout(() => (copied.value = false), 2200)
  } catch {
    // Clipboard blocked (insecure context, denied permission): the address is
    // on screen and the mailto link above still works.
  }
}
const languages = ['Arabic — Native', 'English — Professional', 'French — Intermediate']
const socials = [
  { label: 'GitHub', href: 'https://github.com', icon: 'streamline-logos:github-logo-2-solid' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'streamline-logos:linkedin-logo-block' },
  { label: 'X / Twitter', href: 'https://x.com', icon: 'streamline-logos:x-twitter-logo-block' },
]

const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const availEl = ref<HTMLElement | null>(null)
const watermarkEl = ref<HTMLElement | null>(null)
const ribbonEl = ref<HTMLElement | null>(null)
const auroraEl = ref<HTMLElement | null>(null)
const projEl = ref<HTMLElement | null>(null)
const { release } = useSwarm()

const ringEl = ref<HTMLElement | null>(null)
const magnetEl = ref<HTMLElement | null>(null)
const magnetInner = ref<HTMLElement | null>(null)

// Rendered with the first line on the server, then swapped for a random one
// once mounted, so hydration always agrees.
const nightIndex = ref(0)
const night = computed(() => NIGHT_QUOTES[nightIndex.value]!)
const nightWords = computed(() => quoteWords(night.value.text))
const nightEl = ref<HTMLElement | null>(null)
const nextNight = () => {
  nightIndex.value = (nightIndex.value + 1) % NIGHT_QUOTES.length
  if (nightEl.value) {
    gsap.fromTo(
      nightEl.value.querySelectorAll('blockquote span'),
      { opacity: 0, yPercent: 40 },
      { opacity: 1, yPercent: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out' },
    )
  }
}

const moroccoTime = ref('')
let clockInterval: ReturnType<typeof setInterval>
const updateClock = () => {
  moroccoTime.value = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

const scrollToTop = () => {
  const smoother = ScrollSmoother.get()
  if (smoother) smoother.scrollTo(0, true)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

let splitHeading: InstanceType<typeof SplitText> | null = null
const triggers: ScrollTrigger[] = []
let ribbonTween: gsap.core.Tween | undefined
let ringTween: gsap.core.Tween | undefined

onMounted(() => {
  if (!sectionEl.value) return

  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  nightIndex.value = Math.floor(Math.random() * NIGHT_QUOTES.length)

  // Ribbon marquee
  if (ribbonEl.value) {
    ribbonTween = gsap.to(ribbonEl.value, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 })
  }

  // Rotating caption ring
  if (ringEl.value) {
    ringTween = gsap.to(ringEl.value, { rotation: 360, duration: 22, ease: 'none', repeat: -1, transformOrigin: 'center' })
  }

  // Headline reveal
  if (headingEl.value) {
    splitHeading = new SplitText(headingEl.value, { type: 'lines,words' })
    splitHeading.lines.forEach((l) => {
      ;(l as HTMLElement).style.overflow = 'hidden'
      ;(l as HTMLElement).style.paddingBottom = '0.1em'
    })
    gsap.set(splitHeading.words, { yPercent: 120 })
    triggers.push(
      ScrollTrigger.create({
        trigger: headingEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(splitHeading!.words, { yPercent: 0, stagger: 0.08, duration: 1.05, ease: 'power4.out' }),
      }),
    )
  }

  // Availability reveal
  gsap.set(availEl.value, { opacity: 0, y: 20 })
  triggers.push(
    ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top 70%',
      once: true,
      onEnter: () => gsap.to(availEl.value, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
    }),
  )

  // Aurora + watermark parallax
  if (auroraEl.value) {
    gsap.to(auroraEl.value, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: { trigger: sectionEl.value, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    })
  }
  if (watermarkEl.value) {
    gsap.fromTo(
      watermarkEl.value,
      { xPercent: -8 },
      {
        xPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: watermarkEl.value, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      },
    )
  }

  // Magnetic button
  const magnet = magnetEl.value
  const inner = magnetInner.value
  if (magnet && inner) {
    const strength = 0.4
    const onMove = (e: MouseEvent) => {
      const rect = magnet.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      gsap.to(magnet, { x: relX * strength, y: relY * strength, duration: 0.6, ease: 'power3.out' })
      gsap.to(inner, { x: relX * strength * 0.4, y: relY * strength * 0.4, duration: 0.6, ease: 'power3.out' })
    }
    const onLeave = () => {
      gsap.to([magnet, inner], { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
    }
    // Reaching for the button strikes the lamp — caught, not faded up, the
    // same stutter the boot screen uses — and letting go lets it die back.
    const strike = () => {
      if (!projEl.value) return
      gsap.killTweensOf(projEl.value)
      gsap
        .timeline()
        .to(projEl.value, { opacity: 0.85, duration: 0.05, ease: 'none' })
        .to(projEl.value, { opacity: 0.15, duration: 0.08, ease: 'none' })
        .to(projEl.value, { opacity: 1, scale: 1.04, duration: 0.6, ease: 'power2.out' })
    }
    const douse = () => {
      if (projEl.value) gsap.to(projEl.value, { opacity: 0.06, scale: 1, duration: 0.9, ease: 'power2.inOut', overwrite: true })
    }
    // The mail client opens either way; the colony is just the send-off.
    const launch = () => {
      const r = magnet.getBoundingClientRect()
      release({ x: r.left + r.width / 2, y: r.top + r.height / 2, spread: 2.8 })
    }
    magnet.addEventListener('mousemove', onMove)
    magnet.addEventListener('mouseleave', onLeave)
    magnet.addEventListener('mouseenter', strike)
    magnet.addEventListener('mouseleave', douse)
    magnet.addEventListener('click', launch)
    onBeforeUnmount(() => {
      magnet.removeEventListener('mousemove', onMove)
      magnet.removeEventListener('mouseleave', onLeave)
      magnet.removeEventListener('mouseenter', strike)
      magnet.removeEventListener('mouseleave', douse)
      magnet.removeEventListener('click', launch)
    })
  }
})

onBeforeUnmount(() => {
  clearTimeout(copyTimer)
  clearInterval(clockInterval)
  splitHeading?.revert()
  triggers.forEach((t) => t.kill())
  ribbonTween?.kill()
  ringTween?.kill()
})
</script>

<style scoped>
/* Outlined rather than filled. At this size a solid fill made "something" the
   single largest patch of colour on the site, which is precisely the way the
   signal stops meaning anything. Hollowing it keeps the word emphatic while
   spending a hairline of amber instead of a slab.

   Both properties are inherited, so they survive SplitText re-wrapping the
   word into its own nested spans. */
.night-scrawl {
  font-family: var(--font-scrawl);
  rotate: -3deg;
}

.headline-signal {
  color: transparent;
  -webkit-text-stroke: 2.5px var(--color-signal);
}
</style>
