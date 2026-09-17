<template>
  <section
    ref="heroSection"
    class="hud-frame w-full flex flex-col items-center justify-center gap-2 text-center relative h-screen overflow-hidden will-change-transform z-10"
    style="transform-origin: center center; --hud-inset: 1.5rem; --hud-size: 1.4rem;"
  >
    <!-- The page's actual heading. The masthead behind him is set as a
         paragraph because it is a composition, not a sentence a crawler or a
         screen reader should lead with; this says who he is in one line, for
         both of them, and is never seen. -->
    <h1 class="sr-only">Youssef Hayyati — full-stack developer in Rabat, Morocco</h1>

    <!-- ── The line behind him ────────────────────────────────────────────
         Set in the site's display face, big enough that his head has to take a
         bite out of it: the whole point of putting type *behind* a cutout is
         that the silhouette overlaps the words, which is what makes the photo
         read as standing in front of something rather than pasted over it.
         z-0 against the photograph's z-10, and earlier in the DOM for good
         measure. Real text, not an image — it is the one sentence on the page
         that says what he does. Each piece sits in its own overflow-hidden
         slot so the intro can raise it into place.

         Set as one centred masthead, as wide as the screen allows, with his
         head cutting into it the way a cover subject cuts into the title. -->
    <p
      ref="taglineEl"
      class="hero-tagline pointer-events-none select-none absolute inset-x-0 z-0 px-4 font-passion uppercase leading-[0.86] tracking-[-0.02em] font-bold"
      data-intel="Type set behind the cutout · z-order lets his head take a bite out of the headline"
    >
      <span class="tagline-row">
        <span class="tagline-slot"><span class="tagline-line">Saving</span></span>
        <span class="tagline-slot"><span class="tagline-line tagline-accent">code</span></span>
      </span>
      <span class="tagline-row">
        <span class="tagline-slot"><span class="tagline-line">from old</span></span>
        <span class="tagline-slot"><span class="tagline-line">ages</span></span>
      </span>
    </p>

    <!-- `grayscale` sits here rather than on the photo itself: the intro tweens
         an inline `filter: blur()` onto both plates, and an inline filter beats
         a class outright — put it on the image and the reveal quietly hands the
         colour back at the end of the animation. On the wrapper it also catches
         the cowl, so the two photographs go monochrome together. -->
    <div
      ref="imageWrapper"
      class="z-10 absolute inset-0 w-full overflow-hidden grayscale"
    >
      <!-- ── The transformation rig ────────────────────────────────────────
           The portrait and the cowl live inside ONE parallax wrapper and are
           sized by the same rules, so nothing can ever drift them apart: the
           photo is in flow and defines the box, the cowl is absolutely pinned
           to that same box and placed on him by the Fit constants below. Only
           the cutout is baked (scripts/clean-cowl.mjs); the fit is a live
           transform, so it hot-reloads while you watch it. -->
      <!-- The natural photo stays IN FLOW with its original classes, because it
           is what gives this wrapper its height — the whole layout hangs off a
           percentage-height chain that collapses the moment every child goes
           absolute. The cowl is therefore overlaid and sized to match it in JS
           (see syncOverlay), which is exact and survives any resize.
           The cowl's box is taller than the portrait, by the sky its horns need,
           so syncOverlay pins the two by their shared bottom edge rather than by
           the element box. -->
      <img
        ref="naturalEl"
        :src="heroImage"
        alt="Youssef Hayyati"
        class="absolute inset-x-0 bottom-0 z-10 w-full h-[70vh] object-contain object-bottom will-change-transform select-none"
        draggable="false"
      />

      <!-- ── The body, graded ───────────────────────────────────────────────
           Both of these belong BELOW the cowl, and the ordering is load-bearing
           rather than tidiness: they are painted from his own photograph, so
           sitting above the cowl meant a blurred copy of his neck being drawn
           straight over the gorget — which read, correctly, as a mask you could
           see through. They share the portrait's z-index, so DOM order is the
           only thing deciding it. -->

      <!-- His clothing, softened into the suit. Under the shade below, so the
           shade darkens an already smooth surface rather than a knit one. -->
      <div ref="suitEl" class="pointer-events-none absolute left-0 top-0 z-10" :style="suitStyle" aria-hidden="true" />

      <!-- The suit he does not own: his clothing sunk toward black, masked to
           his own silhouette. Graded with the photograph rather than switched
           on by the transformation, so it is simply how he is lit. -->
      <div ref="bodyEl" class="body-shade pointer-events-none absolute left-0 top-0 z-10" :style="bodyStyle" aria-hidden="true" />

      <div
        ref="overlayEl"
        class="pointer-events-none absolute left-0 top-0 z-10 will-change-transform"
        aria-hidden="true"
      >
        <!-- The mask rides this box, NOT the cowl, and that separation is the
             whole reason the fit can be a live transform: a CSS mask is applied
             in the element's own coordinates and then transformed with it, so
             masking the cowl directly would make the sweep line scale and slide
             every time the fit changed. Here the box is fixed to the portrait,
             so the sweep is always in portrait space and the cowl is free to
             move underneath it. -->
        <div ref="maskEl" class="absolute inset-0" style="opacity: 0">
          <!-- Square, bottom-aligned: the same rectangle the portrait is drawn
               into, so one image pixel here is one image pixel there and the
               fit constants below are plain portrait coordinates. The box above
               is taller than this by the sky the horns need to stand in. -->
          <div ref="cowlBoxEl" class="absolute inset-x-0 bottom-0 w-full" :style="cowlStyle">
            <!-- The shadow it casts on him. Same silhouette, blackened and
                 thrown down and back off the key light, painted under the cowl
                 so the mask reads as resting against his face rather than
                 hovering a centimetre off it. -->
            <img
              :src="cowlImage"
              alt=""
              class="absolute inset-0 w-full h-full select-none"
              :style="contactStyle"
              aria-hidden="true"
              draggable="false"
            />

            <img
              ref="cowlEl"
              :src="cowlImage"
              alt=""
              class="absolute inset-0 w-full h-full select-none"
              :style="{ filter: cowlFilter }"
              draggable="false"
            />

            <!-- The hem. The same plate, blurred, banded to the bottom so the
                 cowl runs out into his clothing instead of stopping at a line.
                 It is allowed to bleed past the silhouette down there — that
                 bleed is the blend. -->
            <img
              :src="cowlImage"
              alt=""
              class="absolute inset-0 w-full h-full select-none"
              :style="hemStyle"
              aria-hidden="true"
              draggable="false"
            />

            <!-- The key light. A gradient multiplied over the cowl so its front
                 stays lit and its back falls away the way his does — the two
                 photographs are lit from the same side already, but the cowl's
                 back sits far too bright, which is what reads as a flat object
                 pasted onto a moodier one. Masked to the cowl's own silhouette,
                 so it shades the mask and never hazes the frame around it. -->
            <div class="cowl-shade absolute inset-0" :style="shadeStyle" />
          </div>
        </div>

        <!-- The cowl while it is being made (utils/cowlAssembly): the storm,
             and the plate building under it. Oversized so grains can fly in
             from well outside the head. Painted over the DOM plate, which only
             takes over once the front has finished. -->
        <canvas ref="assemblyEl" class="absolute -left-1/2 -top-1/4 w-[200%] h-[150%]" />
        <!-- Detective mode's handle on the effect: the canvas is oversized,
             so the note sits on the head's own box instead. -->
        <div
          class="absolute inset-x-[18%] top-[6%] bottom-[34%]"
          data-intel="WebGL · 64k GPU grains land on a noise-warped front, then hand off to the CSS plate"
        />
      </div>

      <!-- The hover target, sized in JS to the rectangle the portrait is
           actually drawn into. The wrapper is w-full, so hanging the handlers
           off it made the whole viewport hot: the only way to stop hovering him
           was to leave the window. -->
      <div
        ref="hitEl"
        class="absolute left-0 top-0 z-30"
        @pointerdown="onTap"
      />

      <!-- One grain field over both photographs, so neither can read as the
           cleaner of the two. Above the plates, below the atmosphere. -->
      <div class="hero-grain pointer-events-none absolute inset-0 z-20" :style="grainStyle" aria-hidden="true" />

      <!-- Both of these switch on Tailwind's `dark:` variant rather than on a
           `:class` binding over `colorMode`. That value only resolves on the
           client, so a binding renders the dark branch into the SSR HTML no
           matter what the visitor's theme is, and the hydration mismatch is
           never repaired — which shipped a near-black foot gradient and an
           inverted cloud plate on the *light* theme, burying the read-outs
           below. A utility has no such window. -->

      <!-- Light theme gets far less cloud. The plate is dark clouds on
           transparent, so at the old 40% it sat directly under the near-black
           location copy and pulled that text down to roughly 3:1. -->
      <img
        :src="cloud" alt=""
        class="absolute bottom-0 left-0 right-0 w-full h-full object-cover z-20 opacity-15 dark:opacity-20 dark:invert"
      />
      <!-- Foot gradient. The dark theme sinks the base to black; the light one
           has to go the *other* way — the copy down there is near-black, and
           the old grey wash left it sitting on its own value. -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-linear-to-t h-full w-full z-20 from-[#f2f2f3e6] dark:from-[#06080acc] to-transparent"
      >
      </div>
    </div>

    <!-- Location + live time -->
    <div ref="locationEl" class="absolute bottom-8 left-6 sm:left-10 z-30 text-left" data-intel="Live clock · Intl.DateTimeFormat in Africa/Casablanca">
      <!-- For the people who already call him that. Small enough that anyone
           who does not get it reads it as a design flourish. -->
      <p class="font-mono text-[10px] tracking-[0.35em] uppercase text-signal/80 mb-3">
        Callsign — B
      </p>
      <p class="font-display text-2xl sm:text-3xl text-text leading-none">Rabat, Morocco</p>
      <p class="font-display font-bold text-5xl text-text mt-2 tabular-nums tracking-[0.15em]">{{ moroccoTime }}</p>
    </div>

    <!-- Stats -->
    <div ref="statsEl" class="absolute bottom-8 right-6 sm:right-10 z-20 flex flex-col gap-2 sm:gap-4">
      <div class="text-right">
        <p class="font-passion text-6xl sm:text-7xl text-text leading-none">4</p>
        <p class="font-display text-sm font-bold tracking-[0.3em] uppercase text-text/90 mt-2">Yrs Exp.</p>
      </div>
      <div class="h-0.5 bg-text/60 self-stretch rounded-2xl" />
      <div class="text-right">
        <p class="font-passion text-6xl sm:text-7xl text-text leading-none">11<span class="text-3xl sm:text-4xl text-text/40">+</span></p>
        <p class="font-display text-sm font-bold tracking-[0.3em] uppercase text-text/90 mt-2">Clients</p>
      </div>
    </div>

    <!-- Dev-only fit tuner. Nothing behind this renders for a visitor, and
         the fit it drives falls back to the measured defaults. -->
    <CowlTuner v-if="isDev" />

    <!-- ── Intro: the signal ──────────────────────────────────────────────
         The shot everyone knows: a searchlight thrown from the rooftops onto
         the cloud base, and the emblem punched out of the disc of light.

         Five layers, back to front: the night, cloud to catch the light, the
         beam, the disc, cloud again in FRONT of the light, and Gotham along
         the bottom. The order is what sells it — the beam's base runs *into*
         the city rather than stopping above it, and the wisps crossing the
         disc put the signal inside the weather instead of on top of it.

         The mark is a HOLE in the disc, not a shape drawn on it: the lamp has
         a stencil across its glass, so the bat is where the light is missing
         and the night sky shows through it.

         Geometry is set once in syncSignal() and shared: the beam is a cone
         pivoted at the lamp on the rooftops, its length and angle measured to
         the middle of the disc, so the two cannot drift apart at any size.

         This layer is cold — the one place on the site that is. Everything
         else is lit by the amber signal; here the signal IS the light source,
         and a searchlight through cloud is blue-white. The only warm things
         in frame are the windows of the city underneath it. -->
    <div ref="introEl" class="intro-curtain absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
      <!-- The night, navy where the cloud is lit and near-black at the
           horizon. -->
      <div class="signal-sky absolute inset-0" />

      <!-- Three cloud banks at different scales and speeds. One plate would
           be weather; three at different rates is a sky. -->
      <img
        ref="skyEl"
        :src="cloud"
        alt=""
        class="absolute inset-0 h-full w-full select-none object-cover object-bottom invert opacity-0"
        draggable="false"
      />
      <img
        ref="skyMidEl"
        :src="cloud"
        alt=""
        class="signal-cloud-mid absolute inset-0 h-full w-full select-none object-cover opacity-0"
        draggable="false"
      />

      <!-- The bloom where the beam leaves the lamp. Drawn before the city, so
           the rooftops cut it and only the spill above them shows. -->
      <div ref="lampGlowEl" class="signal-lamp-glow opacity-0" />

      <!-- Everything the lamp throws hangs off this one pivot on the rooftops:
           the cone, and the disc sitting on the end of it. Locking the disc to
           the cone's tip is what makes the two one object — the beam's width
           at the top IS the disc's diameter, so its edges run tangent to the
           circle instead of stopping short of it. The pivot sways a third of
           a degree, because no lamp is ever perfectly still. -->
      <div ref="anchorEl" class="signal-anchor">
        <div ref="beamEl" class="signal-beam opacity-0">
          <!-- Two layers, and the split is the point: the light is blurred
               AFTER being clipped, which is the only way a cone gets soft
               edges — but that same blur was wiping out everything hanging in
               it. So the air gets its own copy of the clip and no blur. -->
          <span class="signal-beam-light" />
          <span class="signal-beam-air">
            <!-- Dust drifts in beam space, because that is the direction the
                 light travels; rain falls in screen space, because that is
                 the direction gravity does. -->
            <span class="signal-dust" />
            <span class="signal-rain"><span class="signal-rain-fall" /></span>
          </span>
        </div>

        <div ref="discEl" class="signal-disc opacity-0">
          <!-- Counter-rotates the pivot, so the emblem stays level while the
               disc rides the end of an angled beam. -->
          <div class="signal-level">
            <span class="signal-halo" />
            <svg class="signal-disc-art" viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <radialGradient :id="`${uid}-lamp`">
                  <stop offset="0" stop-color="#ffffff" />
                  <stop offset="0.45" stop-color="#f4f8ff" />
                  <stop offset="0.82" stop-color="#c6dbf8" />
                  <stop offset="1" stop-color="#9dbdec" stop-opacity="0.9" />
                </radialGradient>
                <mask :id="`${uid}-stencil`">
                  <circle cx="100" cy="100" r="97" fill="#fff" />
                  <g transform="translate(25 68.5) scale(0.625)" fill="#000">
                    <path :d="BAT_HALF" />
                    <path :d="BAT_HALF" :transform="BAT_MIRROR" />
                  </g>
                </mask>
              </defs>

              <circle cx="100" cy="100" r="97" :fill="`url(#${uid}-lamp)`" :mask="`url(#${uid}-stencil)`" />
              <!-- The cloud the light is landing on, mottling it from inside
                   the same stencil so the bat stays a clean hole. -->
              <image
                :href="cloud"
                x="-20"
                y="-20"
                width="240"
                height="240"
                preserveAspectRatio="xMidYMid slice"
                :mask="`url(#${uid}-stencil)`"
                opacity="0.38"
                style="mix-blend-mode: overlay"
              />
              <!-- The lens rim, just enough to read as glass. -->
              <circle cx="100" cy="100" r="97" fill="none" stroke="#e7f0ff" stroke-opacity="0.45" stroke-width="1.6" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Weather in front of the signal. Not inverted: this plate is dark
           cloud, so it multiplies down over the light and reads as wisps
           crossing it. -->
      <img
        ref="wispEl"
        :src="cloud"
        alt=""
        class="signal-wisp absolute inset-0 h-full w-full select-none object-cover opacity-0"
        draggable="false"
      />

      <!-- Gotham. Drawn last, so the beam runs down into the rooftops and the
           lamp itself stays where it belongs: out of frame, in the city. -->
      <div ref="cityEl" class="absolute inset-x-0 bottom-0 h-[34vh] min-h-[160px] opacity-0">
        <GothamSkyline :signal="false" tone="night" class="absolute inset-0 h-full" />
        <!-- Haze in the streets, so the city has air in it. -->
        <div class="signal-fog absolute inset-x-0 bottom-0 h-2/3" />
      </div>
    </div>

    <!-- ── How long this is going to take ────────────────────────────────
         The opening is a few seconds of theatre, and theatre with no visible
         end is just a wait. The bar is the whole timeline — the signal, the
         reveal and the cowl assembling — so when it fills, the page is done
         moving. It sits outside the curtain because it has to outlive it.

         Skipping runs the timeline to its end rather than hiding it, so the
         page lands in exactly the state it would have reached anyway. -->
    <div
      v-if="showProgress"
      ref="progressEl"
      class="absolute inset-x-0 bottom-14 z-50 flex flex-col items-center gap-2.5 px-6 sm:bottom-12"
    >
      <p
        ref="introLabelEl"
        class="font-mono text-[10px] tracking-[0.35em] uppercase text-white/70 tabular-nums [text-shadow:0_1px_6px_rgb(2_6_14/0.9)]"
      >
        Striking the lamp — 0%
      </p>
      <div class="h-px w-40 overflow-hidden bg-white/20 sm:w-56">
        <div ref="introBarEl" class="h-full w-full origin-left scale-x-0 bg-white/70" />
      </div>
      <button
        type="button"
        data-cursor
        data-cursor-text="Skip"
        class="mt-1 cursor-none font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 transition-colors hover:text-white/80"
        @click="skipIntro"
      >
        Skip
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import heroImage from '~/assets/images/portfolio-image.png'
import cowlImage from '~/assets/images/cowl-clean.png'
import cloud from '~/assets/images/cloud.png'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import type { CowlAssembly } from '~/utils/cowlAssembly'
import { BAT_HALF, BAT_MIRROR } from '~/utils/emblem'

gsap.registerPlugin(ScrollTrigger)

/* ── Tuning ───────────────────────────────────────────────────────────────
   Everything about the effect that is a judgement call rather than a
   mechanism, gathered in one place. */


/* ── Fit ──────────────────────────────────────────────────────────────────
   How the cowl sits on him lives in useCowlFit, as reactive state rather than
   constants here, so that CowlTuner can drive it from the page in dev. The
   measurements and the reasoning behind each number are documented there. */
const {
  fit,
  hold,
  sky,
  cowlStyle,
  shadeStyle,
  bodyStyle,
  suitStyle,
  contactStyle,
  hemStyle,
  grainStyle,
  cowlFilter,
} = useCowlFit()

/** Gates the tuner. import.meta.dev is compiled out of a production build. */
const isDev = import.meta.dev

/* How the build itself looks lives in utils/cowlAssembly. These are only its
   pacing: taking the cowl off is quick to answer the pointer, putting it back
   on is unhurried. */
const HOVER_IN = { duration: 1.6, ease: 'power2.out' }
const HOVER_OUT = { duration: 2.8, ease: 'sine.inOut' }

const heroSection = ref<HTMLElement | null>(null)
const imageWrapper = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)
const naturalEl = ref<HTMLImageElement | null>(null)
const maskEl = ref<HTMLElement | null>(null)
const cowlEl = ref<HTMLImageElement | null>(null)
const bodyEl = ref<HTMLElement | null>(null)
const suitEl = ref<HTMLElement | null>(null)
const hitEl = ref<HTMLElement | null>(null)
const cowlBoxEl = ref<HTMLElement | null>(null)
const assemblyEl = ref<HTMLCanvasElement | null>(null)
let assembly: CowlAssembly | undefined
const colorMode = useColorMode()
const { release } = useSwarm()
const introEl = ref<HTMLElement | null>(null)
const skyEl = ref<HTMLImageElement | null>(null)
const beamEl = ref<HTMLElement | null>(null)
const anchorEl = ref<HTMLElement | null>(null)
const discEl = ref<HTMLElement | null>(null)
const wispEl = ref<HTMLImageElement | null>(null)
const cityEl = ref<HTMLElement | null>(null)
const skyMidEl = ref<HTMLImageElement | null>(null)
const lampGlowEl = ref<HTMLElement | null>(null)
const progressEl = ref<HTMLElement | null>(null)
const introBarEl = ref<HTMLElement | null>(null)
const introLabelEl = ref<HTMLElement | null>(null)
const showProgress = ref(false)

/** Ids for the disc's gradient and mask, kept unique per instance. */
const uid = useId()

/* ── Where the signal is, and where it is thrown from ─────────────────────
   Fractions of the curtain rather than fixed lengths, so the composition
   survives any window: the lamp low and right, on the rooftops; the disc up
   and left, on the cloud. The beam between them is measured, never guessed. */
const LAMP = { x: 0.66, y: 0.9 }
const DISC = { x: 0.37, y: 0.27 }

/**
 * Points the beam at the disc. One measurement, written to four custom
 * properties the CSS reads, so the cone's base, its length, its angle and
 * the middle of the disc can never disagree.
 */
function syncSignal() {
  const el = introEl.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight
  if (!w || !h) return
  const lx = LAMP.x * w
  const ly = LAMP.y * h
  const dx = DISC.x * w - lx
  const dy = DISC.y * h - ly
  const style = el.style
  style.setProperty('--lamp-x', `${lx.toFixed(1)}px`)
  style.setProperty('--lamp-y', `${(h - ly).toFixed(1)}px`)
  style.setProperty('--signal-x', `${(DISC.x * w).toFixed(1)}px`)
  style.setProperty('--signal-y', `${(DISC.y * h).toFixed(1)}px`)
  style.setProperty('--beam-len', `${Math.hypot(dx, dy).toFixed(1)}px`)
  // Measured off vertical, because the cone is drawn pointing up.
  style.setProperty('--beam-angle', `${((Math.atan2(dx, -dy) * 180) / Math.PI).toFixed(2)}deg`)
}

/** What the read-out says while it fills. */
const PHASES: [number, string][] = [
  [0.08, 'Striking the lamp'],
  [0.26, 'Signal up'],
  [0.42, 'Gotham answers'],
  [0.6, 'Moving in'],
  [1.01, 'Assembling the cowl'],
]

function onIntroProgress(p: number) {
  if (introBarEl.value) introBarEl.value.style.transform = `scaleX(${p.toFixed(4)})`
  if (introLabelEl.value) {
    const phase = PHASES.find(([at]) => p < at)?.[1] ?? 'Ready'
    introLabelEl.value.textContent = `${phase} — ${Math.round(p * 100)}%`
  }
}

/** Runs the opening to its end rather than cutting it off, so the page lands
 *  in the same state either way. */
function skipIntro() {
  introTl?.progress(1)
}
const taglineEl = ref<HTMLElement | null>(null)
const locationEl = ref<HTMLElement | null>(null)
const statsEl = ref<HTMLElement | null>(null)

/* ── The one value that drives the whole effect ───────────────────────────
   0 = natural, 1 = Batman. The intro animates it, hover animates it, and the
   build and the storm are pure functions of it. Nothing else holds
   transformation state, which is what keeps this maintainable. */
const state = {
  /** 0 = natural, 1 = Batman. */
  p: 0,
  /** Intro reveal, 0 until his photo has resolved out of the blur. Kept here
   *  rather than tweened straight onto the element so that the intro and the
   *  transformation cannot fight over the same opacity property. */
  reveal: 0,
}
/** Hover is ignored until the intro has handed over. */
const interactive = ref(false)
let reduced = false

/**
 * Pins the cowl's box onto the rectangle the portrait is actually drawn into,
 * then grows it upward by the sky the horns need (see useCowlFit).
 *
 * The two share a width and a bottom edge, which is all the registration needs:
 * one scale, one shared floor, and the cowl positioned inside by the fit
 * transform in portrait coordinates. Offsets are read pre-transform, so the
 * parallax tween never feeds back into this measurement.
 *
 * The sky rises into the portrait's own top margin (`mt-24`), which is the one
 * thing that caps how much of it the wrapper's `overflow-hidden` will show.
 */
function syncOverlay() {
  const n = naturalEl.value
  const o = overlayEl.value
  if (!n || !o) return

  const nw = n.naturalWidth || 1
  const nh = n.naturalHeight || 1

  // What object-contain does with the portrait: largest fit, centred
  // horizontally and pinned to the bottom (object-bottom).
  const k = Math.min(n.offsetWidth / nw, n.offsetHeight / nh)
  const drawnW = nw * k
  const drawnH = nh * k
  const skyPx = sky.value * (drawnH / COWL_FRAME)

  // The clothing shade is masked by the portrait, so it wants the portrait's
  // drawn rectangle exactly — no sky, or the mask would be scaled against a
  // taller box and slide up his chest.
  for (const layer of [bodyEl.value, suitEl.value, hitEl.value]) {
    if (!layer) continue
    const b = layer.style
    b.left = `${n.offsetLeft + (n.offsetWidth - drawnW) / 2}px`
    b.top = `${n.offsetTop + n.offsetHeight - drawnH}px`
    b.width = `${drawnW}px`
    b.height = `${drawnH}px`
  }

  o.style.left = `${n.offsetLeft + (n.offsetWidth - drawnW) / 2}px`
  o.style.top = `${n.offsetTop + n.offsetHeight - drawnH - skyPx}px`
  o.style.width = `${drawnW}px`
  o.style.height = `${drawnH + skyPx}px`
  // The fit is applied by Vue after this runs, so the grains are re-mapped
  // once the new transform is on the page.
  requestAnimationFrame(() => {
    assembly?.build()
    applyProgress()
  })

  // Mask stops are authored against the portrait but written to the taller
  // box, so they carry this factor. Both end at the same floor, which is why
  // it is a plain ratio and not an offset.
}

/** Writes the current progress to the DOM. Called from a tween's onUpdate. */
function applyProgress() {
  // The cowl is built on the canvas; the DOM plate only comes up under it
  // once the build has finished, and is all that is left at rest.
  assembly?.draw(state.p)
  if (maskEl.value) {
    maskEl.value.style.opacity = String(
      assembly ? assembly.domOpacity(state.p) : smoothstep(0.35, 0.95, state.p),
    )
  }

  if (naturalEl.value) {
    naturalEl.value.style.opacity = String(state.reveal)
  }

  // His clothing is graded, not transformed: it comes up with the photograph in
  // the intro and stays there. Tying it to the sweep meant the cardigan arrived
  // in full and then visibly sank — announcing the trick, and drawing the eye to
  // the one part of the frame that should never hold it.
  {
    const on = String(state.reveal)
    if (bodyEl.value) bodyEl.value.style.opacity = on
    if (suitEl.value) suitEl.value.style.opacity = on
  }
}

/** Animates progress toward a target. The single entry point for the effect. */
function tweenTo(p: number, vars: gsap.TweenVars = HOVER_IN) {
  gsap.to(state, {
    p,
    overwrite: true,
    ...(reduced ? { duration: 0.2, ease: 'none' } : vars),
    onUpdate: applyProgress,
  })
}

/* The resting state is the cowl, so hover runs the transformation backwards:
   pointing at him takes it off and reveals who is under it. It only works this
   way round — a portrait that becomes Batman is a gimmick, a Batman that turns
   out to be a person is an introduction. */
const onEnter = () => interactive.value && !hold.value && tweenTo(0, HOVER_IN)
const onLeave = () => interactive.value && !hold.value && tweenTo(1, HOVER_OUT)

/** Touch has no hover, so a tap toggles instead. */
function onTap(e: PointerEvent) {
  if (e.pointerType !== 'touch' || !interactive.value || hold.value) return
  tweenTo(state.p > 0.5 ? 0 : 1, HOVER_IN)
}

/* ── Tuning, in dev ───────────────────────────────────────────────────────
   The fit is reactive, and two things downstream are not pure functions of the
   CSS transform: the masked box's height (sky) and the mask stops that are
   converted through it. Both are recomputed whenever a value moves. */
watch(
  fit,
  () => {
    syncOverlay()
    applyProgress()
  },
  { deep: true },
)

/** Pins the cowl on while it is being tuned, and hands hover back after. */
watch(hold, (on) => {
  if (!interactive.value) return
  tweenTo(on ? 1 : 0, { duration: 0.35, ease: 'power2.out' })
})

/** The tagline's two lines, for the intro to raise one after the other. */
const taglineLines = () =>
  taglineEl.value ? [...taglineEl.value.querySelectorAll<HTMLElement>('.tagline-line')] : []

const moroccoTime = ref('')
let clockInterval: ReturnType<typeof setInterval>

const updateClock = () => {
  moroccoTime.value = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

let parallaxTween: gsap.core.Tween | undefined
let introTl: gsap.core.Timeline | undefined
const isLoading = useState('isLoading', () => true)

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (assemblyEl.value && cowlBoxEl.value && cowlEl.value) {
    assembly = createCowlAssembly(assemblyEl.value, cowlBoxEl.value, cowlEl.value, () => fit.value)
    assembly.setTheme(colorMode.value === 'dark')
    const img = cowlEl.value
    if (!img.complete) img.addEventListener('load', syncOverlay, { once: true })
  }

  syncOverlay()
  applyProgress()

  // The portrait drives the box, so re-pin whenever its layout can change: on
  // decode, on resize, and after ScrollTrigger re-measures the pinned hero. The
  // cowl's own decode does not matter here — its size comes from the fit
  // constants, not from the file.
  if (naturalEl.value?.complete) requestAnimationFrame(syncOverlay)
  else naturalEl.value?.addEventListener('load', syncOverlay)
  syncSignal()
  window.addEventListener('resize', syncSignal)
  window.addEventListener('resize', syncOverlay)
  ScrollTrigger.addEventListener('refresh', syncOverlay)


  // ── Reduced motion: no curtain, no cinematics. Straight to the resting
  //    state, with hover still available but nearly instant. ──
  if (reduced) {
    gsap.set(introEl.value, { autoAlpha: 0, display: 'none' })
    gsap.set([locationEl.value, statsEl.value], { opacity: 1, y: 0 })
    state.reveal = 1
    // Rests masked, like the full intro leaves it — the hover still works, it
    // simply has no cinematics in front of it.
    state.p = 1
    applyProgress()
    interactive.value = true
  } else {
    // Scale/blur go on BOTH layers so the pair never drifts during the reveal.
    gsap.set([naturalEl.value, overlayEl.value], { scale: 1.06, filter: 'blur(24px)' })
    gsap.set([locationEl.value, statsEl.value], { y: 24, opacity: 0 })
    gsap.set(taglineLines(), { yPercent: 108 })
    gsap.set(skyEl.value, { opacity: 0, scale: 1.9, xPercent: -8, yPercent: -20 })
    // The cone grows out of the lamp, so it reads as switched on rather than
    // slid into place, and swings the last few degrees into line.
    gsap.set(beamEl.value, { opacity: 0, scale: 0.12, rotate: -7, transformOrigin: '50% 100%' })
    gsap.set(discEl.value, { opacity: 0, scale: 0.78, filter: 'blur(16px)' })
    gsap.set(wispEl.value, { opacity: 0, scale: 1.6, xPercent: 6, yPercent: -8 })
    gsap.set(cityEl.value, { opacity: 0, y: 40 })
    gsap.set(skyMidEl.value, { opacity: 0, xPercent: 4, yPercent: 4 })
    gsap.set(lampGlowEl.value, { opacity: 0, scale: 0.4 })
  }

  const runIntro = () => {
    if (reduced) return

    showProgress.value = true
    introTl = gsap
      .timeline({
        onUpdate: () => onIntroProgress(introTl?.progress() ?? 0),
        onComplete: () => {
          interactive.value = true
          gsap.to(progressEl.value, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => (showProgress.value = false),
          })
        },
      })

      // EVERY cue here carries an absolute time, and that is not a style
      // preference. A timeline's `.to()` with no position appends to the END
      // of the timeline — and the cloud drift below is seconds long, so a
      // chained step lands after the drift rather than after the step it was
      // written under. That is how the beam ended up scheduled to strike
      // several seconds after the curtain had already lifted.

      // 1. Night, and weather. The cloud keeps drifting under everything that
      //    follows — a still sky makes the beam look pasted on.
      .to(skyEl.value, { opacity: 0.34, duration: 1.4, ease: 'power2.out' }, 0)
      .to(skyEl.value, { scale: 1.72, xPercent: -2, yPercent: -14, duration: 4.6, ease: 'none' }, 0)
      // The middle bank, drifting the other way and slower: parallax in the
      // weather, which is what stops the sky looking like one photograph.
      .to(skyMidEl.value, { opacity: 0.16, duration: 1.8, ease: 'power2.out' }, 0.1)
      .to(skyMidEl.value, { xPercent: -3, yPercent: -1, duration: 4.6, ease: 'none' }, 0.1)

      // 2. Gotham comes up out of the dark underneath it.
      .to(cityEl.value, { opacity: 1, y: 0, duration: 1.3, ease: 'power2.out' }, 0.15)

      // 3. The lamp is struck: the beam catches, drops out, then holds — and
      //    swings its last few degrees into line as it reaches the cloud.
      .to(beamEl.value, { opacity: 0.55, duration: 0.06, ease: 'none' }, 0.5)
      .to(beamEl.value, { opacity: 0.08, duration: 0.09, ease: 'none' }, 0.56)
      .to(beamEl.value, { opacity: 1, scale: 1, rotate: 0, duration: 1, ease: 'power3.out' }, 0.65)
      // The lens blooms where it sits, behind the rooftops.
      .to(lampGlowEl.value, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.62)

      // 4. It lands on the cloud. The disc strikes with the same stutter and
      //    pulls into focus, because a projection arrives soft.
      .to(discEl.value, { opacity: 0.9, duration: 0.07, ease: 'none' }, 1.15)
      .to(discEl.value, { opacity: 0.22, duration: 0.09, ease: 'none' }, 1.22)
      .to(discEl.value, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.31)
      .to(discEl.value, { scale: 1, filter: 'blur(0.6px)', duration: 1.2, ease: 'power2.out' }, 1.15)

      // 5. Weather drifts across the front of it the whole time it is lit.
      .to(wispEl.value, { opacity: 0.45, duration: 1.6, ease: 'power2.out' }, 1.3)
      .to(wispEl.value, { xPercent: -6, yPercent: -2, duration: 3.4, ease: 'none' }, 1.3)

      // 6. The city answers, out of the rooftops and up across the beam.
      .call(
        () => release({ x: window.innerWidth * 0.62, y: window.innerHeight * 0.78, dir: -1.9, spread: 1.1 }),
        undefined,
        1.9,
      )

      // 7. Curtain lifts: the camera pushes through the light rather than
      //    crossfading out of it.
      .to(
        [discEl.value, beamEl.value, wispEl.value, cityEl.value, lampGlowEl.value, skyMidEl.value],
        { scale: 1.5, opacity: 0, duration: 0.9, ease: 'power2.in' },
        3.4,
      )
      .to(introEl.value, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 3.55)
      .set(introEl.value, { display: 'none' }, 4.35)

      // 8. He resolves out of the blur behind the lifting curtain, so the two
      //    overlap rather than handing over in the dark.
      .to(state, { reveal: 1, duration: 1.3, ease: 'power3.out', onUpdate: applyProgress }, 3.7)
      // The storm starts the moment he is on screen, still out of focus with
      // him, and the cowl builds as the frame sharpens.
      .to(state, { p: 1, duration: 4, ease: 'sine.inOut', onUpdate: applyProgress }, 3.7)
      .to(
        [naturalEl.value, overlayEl.value],
        { scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power3.out' },
        3.7,
      )
      // The line comes up behind him as he resolves — set before the read-outs
      // so the frame is composed, backdrop first, by the time the eye lands.
      .to(taglineLines(), { yPercent: 0, duration: 1.15, stagger: 0.08, ease: 'power4.out' }, 3.85)
      .to(
        [locationEl.value, statsEl.value],
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out' },
        4.05,
      )
  }

  if (isLoading.value) {
    const stopWatch = watch(isLoading, (loading) => {
      if (!loading) {
        runIntro()
        stopWatch()
      }
    })
  } else {
    runIntro()
  }

  // ── Pinned shrink on scroll (unchanged) ──
  if (heroSection.value) {
    const section = heroSection.value
    parallaxTween = gsap.to(section, {
      scale: 0.86,
      borderRadius: '28px',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        pin: true,
        pinSpacing: true,
      },
    })
  }

  const wrapper = imageWrapper.value
  if (!wrapper || !naturalEl.value) return

  // On the photograph's own box, not the wrapper: see hitEl in the template.
  hitEl.value?.addEventListener('pointerenter', onEnter)
  hitEl.value?.addEventListener('pointerleave', onLeave)

  // ── Dev: drag the photo to move the cowl ──
  // Only while the tuner is holding it on, so this can never intercept a real
  // visitor's pointer. Deltas are converted from screen pixels back into
  // portrait pixels, so a drag writes the same units the constants are in and
  // the value it lands on is the value to paste.
  if (import.meta.dev) {
    let drag: { x: number; y: number; nx: number; ny: number } | null = null

    const toPortrait = (px: number) => {
      const n = naturalEl.value
      if (!n) return px
      const k = Math.min(
        n.offsetWidth / (n.naturalWidth || 1),
        n.offsetHeight / (n.naturalHeight || 1),
      )
      return k > 0 ? px / k : px
    }

    const onDragStart = (e: PointerEvent) => {
      if (!hold.value) return
      drag = { x: e.clientX, y: e.clientY, nx: fit.value.nudgeX, ny: fit.value.nudgeY }
      wrapper.setPointerCapture(e.pointerId)
    }
    const onDragMove = (e: PointerEvent) => {
      if (!drag) return
      fit.value.nudgeX = Math.round(drag.nx + toPortrait(e.clientX - drag.x))
      fit.value.nudgeY = Math.round(drag.ny + toPortrait(e.clientY - drag.y))
    }
    const onDragEnd = (e: PointerEvent) => {
      if (!drag) return
      drag = null
      if (wrapper.hasPointerCapture(e.pointerId)) wrapper.releasePointerCapture(e.pointerId)
    }

    wrapper.addEventListener('pointerdown', onDragStart)
    wrapper.addEventListener('pointermove', onDragMove)
    wrapper.addEventListener('pointerup', onDragEnd)
    wrapper.addEventListener('pointercancel', onDragEnd)

    onBeforeUnmount(() => {
      wrapper.removeEventListener('pointerdown', onDragStart)
      wrapper.removeEventListener('pointermove', onDragMove)
      wrapper.removeEventListener('pointerup', onDragEnd)
      wrapper.removeEventListener('pointercancel', onDragEnd)
    })
  }

  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  onBeforeUnmount(() => {
    hitEl.value?.removeEventListener('pointerenter', onEnter)
    hitEl.value?.removeEventListener('pointerleave', onLeave)
  })
})

onBeforeUnmount(() => {
  clearInterval(clockInterval)
  window.removeEventListener('resize', syncSignal)
  window.removeEventListener('resize', syncOverlay)
  ScrollTrigger.removeEventListener('refresh', syncOverlay)
  naturalEl.value?.removeEventListener('load', syncOverlay)
  introTl?.kill()
  gsap.killTweensOf(state)
  parallaxTween?.scrollTrigger?.kill()
  parallaxTween?.kill()
  assembly?.dispose()
  assembly = undefined
})

watch(
  () => colorMode.value,
  (mode) => {
    assembly?.setTheme(mode === 'dark')
    applyProgress()
  },
)
</script>

<style scoped>
/* Fractal noise, generated rather than shipped: an SVG turbulence filter costs
   nothing to download and tiles without a seam. Overlay keeps it out of the
   blacks, where grain would just look like compression artefacts. */
.hero-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
  mix-blend-mode: overlay;
}

/* Same reasoning as .cowl-shade: multiplying keeps the weave and the shoulder
   line, where a flat black fill would turn him into a paper cut-out. */
.body-shade {
  mix-blend-mode: multiply;
  opacity: 0;
}

/* Multiply, so the shade deepens the cowl's own shadows instead of laying a
   flat grey over them. It stays inside the masked layer, which is its own
   stacking context, so it can only ever darken the cowl. */
.cowl-shade {
  mix-blend-mode: multiply;
}

/* The tagline. Solid, in the theme's own text and secondary colours, so the
   light theme follows for free. Phones size it so FROM OLD, the widest piece,
   fills the width, and each row wraps into two. */
.hero-tagline {
  top: 12vh;
  font-size: clamp(2.5rem, calc((100vw - 2rem) / 5.9), 11rem);
  color: var(--color-text);
}

.tagline-accent {
  color: var(--color-secondary);
}

/* Flex rather than inline text so the gap between the two halves of a row
   never depends on template whitespace. */
.tagline-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 0.25em;
}

.tagline-slot {
  display: block;
  overflow: hidden;
  padding-bottom: 0.04em;
  white-space: nowrap;
}

.tagline-line {
  display: block;
}

/* Wide: two rows, sized so FROM OLD AGES, the longer one, runs edge to edge. */
@media (min-width: 768px) {
  .hero-tagline {
    top: 9vh;
    font-size: clamp(2.5rem, calc((100vw - 2rem) / 9.1), 16rem);
  }
}

/* ── The signal ───────────────────────────────────────────────────────────
   Cold, because this layer is lit by the searchlight itself rather than by
   the amber the rest of the site is graded with, and a carbon arc through
   cloud is blue-white. The only warm things in frame are the city's windows.

   Geometry is one construction, not three numbers that have to agree:
   syncSignal() measures --lamp-x/--lamp-y (the pivot on the rooftops),
   --beam-len (to the middle of the disc) and --beam-angle (the lean), and the
   cone and the disc both live inside that pivot. --disc-size is the disc's
   diameter AND the cone's width at the top, which is what puts the edges of
   the light exactly on the edges of the circle. */

.intro-curtain {
  --disc-size: min(38vmin, 62vw);
}

/* Navy where the cloud catches the light, near-black at the horizon. */
.signal-sky {
  background: radial-gradient(125% 95% at 42% 18%, #10294d 0%, #0a1a33 38%, #050c18 72%, #02050c 100%);
}

/* The middle bank: bigger, slower, and turned the other way up, so it never
   reads as the same photograph twice. */
.signal-cloud-mid {
  transform: scale(2.1) rotate(180deg);
  filter: invert(1) blur(2px);
}

/* A pivot on the rooftops: no size of its own, just the angle the light is
   thrown at, and a sway of a third of a degree. Keeping the angle here leaves
   the cone's own transform free for the intro to grow it out of this point. */
.signal-anchor {
  position: absolute;
  left: var(--lamp-x, 66%);
  bottom: var(--lamp-y, 10%);
  width: 0;
  height: 0;
  transform: rotate(var(--beam-angle, -20deg));
  animation: signal-sway 9s ease-in-out infinite;
}

@keyframes signal-sway {
  0%,
  100% {
    transform: rotate(calc(var(--beam-angle, -20deg) - 0.35deg));
  }
  50% {
    transform: rotate(calc(var(--beam-angle, -20deg) + 0.35deg));
  }
}

/* Light in the air, not a shape: a slit at the lens opening to the full width
   of the disc, blurred hard enough that no edge survives. Its base runs down
   into the city, which is drawn over the top of it, so the lamp is implied
   rather than shown — the way it is in the shot. */
.signal-beam {
  position: absolute;
  bottom: 0;
  left: 0;
  width: var(--disc-size);
  height: var(--beam-len, 70vh);
  transform: translateX(-50%);
  transform-origin: 50% 100%;
  mix-blend-mode: screen;
}

/* The light itself: a slit at the lens opening to the full width of the disc,
   so the edges of the beam land on the edges of the circle. */
.signal-beam-light {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgb(206 226 255 / 0.03), rgb(216 233 255 / 0.2) 52%, rgb(233 243 255 / 0.34) 92%, rgb(240 247 255 / 0.08)),
    /* A brighter core up the middle, the way a real beam has a hot centre. */
    linear-gradient(to right, transparent 38%, rgb(235 244 255 / 0.18) 50%, transparent 62%);
  clip-path: polygon(46.8% 100%, 53.2% 100%, 100% 0%, 0% 0%);
  filter: blur(9px);
}

/* The same cone, pulled in a touch so what is hanging in the light never
   touches its edge, and left sharp. */
.signal-beam-air {
  position: absolute;
  inset: 0;
  clip-path: polygon(47.6% 100%, 52.4% 100%, 95% 2%, 5% 2%);
  opacity: 0.9;
}

/* Dust hanging in the beam, and a few brighter shafts through it. Both live
   in beam space, because that is the direction light travels. */
.signal-dust {
  position: absolute;
  inset: -10% 0;
  pointer-events: none;
}

.signal-dust {
  background-image:
    radial-gradient(1.5px 1.5px at 22% 14%, rgb(255 255 255 / 0.5), transparent 60%),
    radial-gradient(1.2px 1.2px at 68% 32%, rgb(255 255 255 / 0.42), transparent 60%),
    radial-gradient(1.8px 1.8px at 41% 58%, rgb(255 255 255 / 0.36), transparent 60%),
    radial-gradient(1.2px 1.2px at 77% 72%, rgb(255 255 255 / 0.4), transparent 60%),
    radial-gradient(1.5px 1.5px at 33% 86%, rgb(255 255 255 / 0.3), transparent 60%);
  background-size: 46% 44%;
  animation: signal-dust 14s linear infinite;
}

@keyframes signal-dust {
  to {
    transform: translate3d(6%, -22%, 0);
  }
}

/* Rain, counter-rotated out of beam space so it falls the way rain does and
   is clipped to the light, which is the only place it would be seen. */
.signal-rain {
  position: absolute;
  inset: -60%;
  transform: rotate(calc(-1 * var(--beam-angle, -20deg)));
  overflow: hidden;
  pointer-events: none;
}

.signal-rain-fall {
  position: absolute;
  inset: -20%;
  background: repeating-linear-gradient(
    76deg,
    transparent 0 11px,
    rgb(226 240 255 / 0.085) 11px 11.8px,
    transparent 11.8px 30px
  );
  animation: signal-rain 1.1s linear infinite;
}

@keyframes signal-rain {
  to {
    transform: translate3d(-2%, 9%, 0);
  }
}

/* The disc, on the end of the beam by construction rather than by
   coordinates: bottom sits at the cone's length, and half its own height
   brings its middle onto the tip. */
.signal-disc {
  position: absolute;
  bottom: var(--beam-len, 70vh);
  left: 0;
  width: var(--disc-size);
  aspect-ratio: 1;
  transform: translate(-50%, 50%);
  mix-blend-mode: screen;
}

.signal-level {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transform: rotate(calc(-1 * var(--beam-angle, -20deg)));
}

/* The light spilling off the disc onto the cloud around it. */
.signal-halo {
  position: absolute;
  width: 250%;
  height: 250%;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgb(206 228 255 / 0.3) 0%,
    rgb(168 200 246 / 0.13) 42%,
    rgb(140 176 232 / 0.05) 62%,
    transparent 76%
  );
  filter: blur(12px);
}

/* The bloom on the disc itself, kept off the element the intro animates so
   pulling the projection into focus cannot overwrite the glow. */
.signal-disc-art {
  display: block;
  width: 100%;
  height: 100%;
  filter:
    drop-shadow(0 0 14px rgb(226 238 255 / 0.5))
    drop-shadow(0 0 48px rgb(190 216 250 / 0.36))
    drop-shadow(0 0 120px rgb(150 186 240 / 0.24));
}

/* The bloom at the source, most of which the rooftops eat. */
.signal-lamp-glow {
  position: absolute;
  left: var(--lamp-x, 66%);
  bottom: var(--lamp-y, 10%);
  width: 30vmin;
  height: 30vmin;
  transform: translate(-50%, 50%);
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(230 242 255 / 0.5), rgb(178 208 250 / 0.16) 42%, transparent 72%);
  filter: blur(10px);
  mix-blend-mode: screen;
}

/* Air in the streets. */
.signal-fog {
  background: linear-gradient(to top, rgb(146 178 222 / 0.2), rgb(120 152 198 / 0.07) 45%, transparent);
  filter: blur(5px);
  mix-blend-mode: screen;
}

@media (prefers-reduced-motion: reduce) {
  .signal-anchor,
  .signal-dust,
  .signal-rain-fall {
    animation: none;
  }
}

/* The plate that passes in front. Multiply, so dark cloud eats into the light
   instead of sitting on top of it as a grey film. */
.signal-wisp {
  mix-blend-mode: multiply;
}

</style>
