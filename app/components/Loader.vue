<template>
  <div ref="overlay" class="fixed inset-0 z-100 bg-surface overflow-hidden">
    <!-- Cold pool behind everything, so the field reads as lit rather than filled. -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full bg-primary/10 blur-[200px] animate-spin-slow"
    ></div>

    <div
      v-for="corner in corners"
      :key="corner.class"
      ref="cornerEls"
      class="absolute w-6 h-6 border-text/30"
      :class="corner.class"
    ></div>

    <!-- Boot read-out. Terse and unglamorous on purpose: the moment it starts
         narrating itself it turns into set dressing. -->
    <div class="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex flex-col gap-1.5">
      <p
        v-for="line in bootLines"
        :key="line.text"
        ref="lineEls"
        class="font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase"
        :class="line.signal ? 'text-signal' : 'text-text-muted'"
      >
        <span class="text-text-muted/40 mr-2">&gt;</span>{{ line.text }}
      </p>
    </div>

    <div ref="counterLabel" class="absolute bottom-6 right-6 md:right-10 md:bottom-10 font-mono text-xs tracking-[0.2em] text-text-muted">
      {{ String(progress).padStart(3, '0') }}%
    </div>

    <!-- Scanlines over everything, so the boot screen reads as a display
         rather than as a web page that happens to be black. -->
    <div class="scanlines pointer-events-none absolute inset-0 opacity-60" />

    <div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <!-- The lamp warming up. Struck rather than faded in — see the flicker
           timeline below. -->
      <BatMark ref="markEl" class="w-16 md:w-24 h-auto text-signal mb-6" />

      <p ref="textWrap" class="loader-name font-brand text-xl md:text-3xl tracking-[0.2em] uppercase">
        <span
          v-for="(letter, i) in letters"
          :key="i"
          ref="letterEls"
          class="inline-block"
        >{{ letter }}</span>
      </p>

      <div ref="barTrack" class="w-56 h-px bg-text/20 overflow-hidden">
        <div ref="bar" class="h-full bg-signal" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Something to read while it boots. Picked after mount, and hidden
           until then, so the server and client never disagree about it. -->
      <p
        ref="quoteEl"
        class="mt-6 max-w-[min(30rem,85vw)] text-center font-display text-xs sm:text-sm leading-relaxed text-text-muted opacity-0"
      >
        “{{ bootLine }}”
        <span class="block mt-2 font-mono text-[10px] tracking-[0.3em] uppercase text-text-muted/60">
          {{ bootQuote.who }} — remixed
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import gsap from 'gsap'
import { NIGHT_QUOTES } from '~/data/lore'

const emit = defineEmits(['done'])
const quoteEl = ref(null)
const bootQuote = ref(NIGHT_QUOTES[0])
const bootLine = computed(() => bootQuote.value.text.split('*').join(''))

const overlay = ref(null)
const textWrap = ref(null)
const barTrack = ref(null)
const bar = ref(null)
const letterEls = ref([])
const cornerEls = ref([])
const lineEls = ref([])
const counterLabel = ref(null)
const markEl = ref(null)
const progress = ref(0)

// Each letter gets its own inline-block span so it can be filled individually,
// and an inline-block containing a plain space collapses to nothing — which
// rendered the name as "YoussefHayyati". The gap has to be non-breaking.
const letters = 'Youssef Hayyati'
  .split('')
  .map((c) => (c === ' ' ? '\u00A0' : c))

/** Rabat, to four places. Real coordinates rather than invented ones — the
 *  detail costs nothing and anyone who checks gets rewarded. */
const bootLines = [
  { text: 'Uplink secure' },
  { text: '34.0209° N / 6.8416° W' },
  { text: 'Operator — Hayyati, Y.' },
  { text: 'Joker — whereabouts unknown' },
  { text: 'Case files mounted' },
  { text: 'Clearance granted', signal: true },
]

const corners = [
  { class: 'top-6 left-6 md:top-10 md:left-10 border-t-2 border-l-2' },
  { class: 'top-6 right-6 md:top-10 md:right-10 border-t-2 border-r-2' },
  { class: 'bottom-6 left-6 md:bottom-10 md:left-10 border-b-2 border-l-2' },
  { class: 'bottom-6 right-6 md:bottom-10 md:right-10 border-b-2 border-r-2' },
]

/** Total time before the curtain lifts. Long enough to land, short enough
 *  that a returning visitor does not resent it. */
const BOOT_DURATION = 3

onMounted(() => {
  // Resolved at runtime rather than hardcoded: the previous fixed #46494C was
  // the *light* theme's ink, which left the name almost invisible on the dark
  // theme the site actually ships with.
  const ink =
    getComputedStyle(document.documentElement)
      .getPropertyValue('--color-text')
      .trim() || '#dde4ea'

  // The mark is a component, so the DOM node is one level down.
  const mark = markEl.value?.$el ?? markEl.value

  gsap.set(cornerEls.value, { opacity: 0, scale: 0.6 })
  gsap.set(counterLabel.value, { opacity: 0, y: 10 })
  gsap.set(lineEls.value, { opacity: 0, x: -8 })
  gsap.set(mark, { opacity: 0 })
  bootQuote.value = NIGHT_QUOTES[Math.floor(Math.random() * NIGHT_QUOTES.length)]
  gsap.to(quoteEl.value, { opacity: 1, duration: 0.8, delay: 0.9, ease: 'power2.out' })

  // A cold-cathode lamp does not fade up, it catches — two false starts and a
  // dip before it holds. The uneven, un-eased steps are the whole effect;
  // smooth them out and it turns back into a crossfade.
  gsap
    .timeline({ delay: 0.15 })
    .to(mark, { opacity: 1, duration: 0.05 })
    .to(mark, { opacity: 0.12, duration: 0.09 })
    .to(mark, { opacity: 0.95, duration: 0.04 })
    .to(mark, { opacity: 0.3, duration: 0.11 })
    .to(mark, { opacity: 1, duration: 0.55, ease: 'power2.out' })

  gsap.to(cornerEls.value, {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.08,
  })
  gsap.to(counterLabel.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
    delay: 0.2,
  })

  // Read-out lines land one at a time across most of the boot.
  gsap.to(lineEls.value, {
    opacity: 1,
    x: 0,
    duration: 0.4,
    ease: 'power2.out',
    stagger: (BOOT_DURATION * 0.62) / (bootLines.length - 1),
    delay: 0.35,
  })

  gsap.to(letterEls.value, {
    color: ink,
    duration: 0.6,
    stagger: {
      each: (BOOT_DURATION * 0.78) / (letters.length - 1),
    },
    ease: 'power1.inOut',
  })

  const counterVal = { val: 0 }

  gsap.to(counterVal, {
    val: 100,
    duration: BOOT_DURATION,
    ease: 'power2.inOut',
    onUpdate: () => {
      progress.value = Math.round(counterVal.val)
    },
    onComplete: () => {
      const tl = gsap.timeline({
        onComplete: () => emit('done'),
      })

      tl.to([...cornerEls.value, counterLabel.value, ...lineEls.value, mark], {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        stagger: 0.015,
      })
        .to(
          bar.value,
          { backgroundColor: 'var(--color-bg)', duration: 0.2 },
          '<'
        )
        .to([barTrack.value, bar.value], {
          y: -60,
          duration: 0.5,
          ease: 'power3.in',
        })
        .to(
          [textWrap.value, quoteEl.value],
          { opacity: 0, duration: 0.3, ease: 'power2.in' },
          '<'
        )
        .to(overlay.value, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
        })
    },
  })
})
</script>

<style scoped>
/* Outline-first, filled in letter by letter. Stroked in the theme's own ink so
   it works on both without a second hardcoded colour. */
.loader-name span {
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklab, var(--color-text) 28%, transparent);
}

/* The mark used to carry two amber drop-shadows here. Removed with the rest of
   the glows — the flicker timeline in the script is what sells it as a lamp
   catching, and it does that better on a crisp silhouette than on a smeared
   one. */
</style>
