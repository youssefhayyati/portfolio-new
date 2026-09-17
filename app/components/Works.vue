<template>
  <section
    id="works"
    ref="sectionEl"
    class="relative bg-bg text-text overflow-hidden"
  >
    <div ref="pinEl" class="relative w-full overflow-hidden md:h-screen py-24 md:py-0">
      <!-- Track: column on mobile, absolute horizontal row on desktop -->
      <div
        ref="trackEl"
        class="flex flex-col md:flex-row md:absolute md:top-0 md:left-0 md:h-full md:items-center gap-10 md:gap-10 px-6 sm:px-14 lg:px-28 md:pr-6 will-change-transform"
      >
        <!-- Lead / intro card (holds the section heading; scrolls away with the track) -->
        <div class="shrink-0 md:h-full flex md:items-center md:pr-10">
          <div class="max-w-md">
            <p class="font-display text-[13px] tracking-[0.35em] uppercase text-text-muted mb-5">
              Case Files / Selected Work
            </p>
            <h2 ref="headingEl" class="font-passion uppercase leading-[0.82] text-[clamp(2.6rem,7vw,6rem)] text-text">
              Case<br />files
            </h2>
            <p class="font-roboto text-sm text-text-muted mt-6 leading-relaxed max-w-xs">
              The problems worth writing down — hardened back-ends, motion-led
              front-ends, and the systems I was called in to fix. Scroll
              sideways.
            </p>
            <div class="mt-8 flex items-center gap-3 text-text-muted">
              <span class="font-mono text-[11px] tracking-[0.3em] uppercase">Scroll</span>
              <span ref="scrollHint" class="h-px w-16 bg-text/40 origin-left inline-block" />
              <Icon name="lucide:arrow-right" class="text-lg" />
            </div>
          </div>
        </div>

        <!-- Project panels -->
        <article
          v-for="(p, i) in projects"
          :key="p.title"
          ref="panelEls"
          data-cursor
          data-cursor-text="View"
          class="panel group relative shrink-0 h-[70vh] md:h-[68vh] w-full md:w-[62vw] lg:w-[46vw] rounded-2xl overflow-hidden cursor-none"
          :style="{ background: p.bg }"
          @mousemove="(e) => onTilt(e, i)"
          @mouseleave="() => resetTilt(i)"
        >
          <!-- Depth layers -->
          <div ref="artEls" class="absolute inset-0 will-change-transform">
            <span
              class="absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full blur-3xl opacity-60"
              :style="{ background: p.glow }"
            />
            <span
              class="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full blur-3xl opacity-50"
              :style="{ background: p.glow2 }"
            />
            <span class="absolute top-10 right-10 w-24 h-24 rounded-full border border-white/15" />
            <span class="absolute bottom-16 left-10 w-16 h-16 rotate-45 border border-white/10" />
            <span
              class="absolute -bottom-6 sm:-bottom-10 left-4 sm:left-6 font-passion leading-none text-[30vw] md:text-[18vw] lg:text-[15vw] text-transparent select-none"
              style="-webkit-text-stroke: 1px rgba(255,255,255,0.18);"
            >
              {{ String(i + 1).padStart(2, '0') }}
            </span>
          </div>

          <!-- Grain overlay -->
          <div class="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" :style="grainStyle" />

          <!-- Content -->
          <div class="relative z-10 h-full flex flex-col justify-between p-7 sm:p-10 text-white">
            <div class="flex items-start justify-between gap-4">
              <span class="font-mono text-[11px] tracking-[0.3em] uppercase text-white/70">
                Case {{ String(i + 1).padStart(2, '0') }} <span class="text-white/35">·</span> {{ p.kind }}
              </span>
              <div class="flex flex-col items-end gap-3">
                <span class="font-mono text-[11px] tracking-[0.25em] text-white/60">{{ p.year }}</span>
                <!-- The stamp on the folder. -->
                <span
                  class="rotate-[-8deg] border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
                  :class="p.year.includes('Now') ? 'border-signal/60 text-signal/80' : 'border-white/30 text-white/45'"
                >
                  {{ p.year.includes('Now') ? 'Active case' : 'Case closed' }}
                </span>
              </div>
            </div>

            <div>
              <h3 class="font-passion uppercase leading-[0.9] text-[clamp(2rem,4.5vw,3.5rem)] text-white">
                {{ p.title }}
              </h3>
              <p class="font-roboto text-sm sm:text-base text-white/80 leading-relaxed mt-4 max-w-md">
                {{ p.description }}
              </p>

              <div class="mt-6 flex flex-wrap gap-2">
                <span
                  v-for="tag in p.tags"
                  :key="tag"
                  class="font-display text-[11px] tracking-[0.15em] uppercase text-white/85 border border-white/25 rounded-full px-3 py-1 backdrop-blur-sm"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="mt-7 inline-flex items-center gap-3 overflow-hidden">
                <span class="font-display text-xs tracking-[0.3em] uppercase text-white/80">{{ p.at }}</span>
                <span class="h-px w-10 bg-white/40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <Icon name="lucide:arrow-up-right" class="text-xl text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
              </div>
            </div>
          </div>
        </article>

        <!-- End card: the one file still open. -->
        <div class="shrink-0 md:h-full flex flex-col sm:flex-row items-start sm:items-center gap-10 md:pl-8 md:pr-28">
          <JokerCard class="w-36 md:w-44 shrink-0 -rotate-6" />
          <div class="max-w-sm">
            <p class="font-mono text-[11px] tracking-[0.3em] uppercase text-text-muted mb-5">
              Case 0{{ projects.length + 1 }} <span class="text-joker-green">· wild card</span>
            </p>
            <p class="font-passion uppercase text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] text-text">
              Your project<br />could be next.
            </p>
            <p class="font-roboto text-sm text-text-muted mt-5 leading-relaxed max-w-xs">
              Every deck needs a wild card. Bring the strange idea — I'll bring
              the order it needs to ship.
            </p>
            <a
              href="mailto:youssefhayyati1997@gmail.com"
              data-cursor
              data-cursor-text="Email"
              class="mt-7 inline-flex items-center gap-3 font-display text-sm tracking-[0.2em] uppercase text-text border-b border-text/40 pb-1 hover:text-secondary hover:border-secondary transition-colors cursor-none"
            >
              Let's talk
              <Icon name="lucide:arrow-up-right" class="text-lg" />
            </a>
          </div>
        </div>
      </div>

      <!-- Progress rail + counter (desktop) -->
      <div
        class="hidden md:flex absolute bottom-10 left-6 sm:left-14 lg:left-28 right-6 sm:right-14 lg:right-28 z-30 items-center gap-6 pointer-events-none"
        data-intel="Vertical scroll drives this horizontal track · pinned ScrollTrigger + containerAnimation"
      >
        <span class="font-mono text-xs tracking-[0.25em] text-text-muted tabular-nums shrink-0">
          <span class="text-text text-base">{{ counter }}</span> / {{ String(projects.length).padStart(2, '0') }}
        </span>
        <div class="h-px flex-1 bg-text/15 overflow-hidden">
          <div ref="progressEl" class="h-full w-full bg-text origin-left scale-x-0" />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const projects = [
  {
    title: 'Secure Data Platform',
    kind: 'Backend / Security',
    at: 'Scientiae',
    year: '2024 — Now',
    description:
      'Confidentiality-first architecture — hardened data protection and access control that safeguards sensitive information across the platform.',
    tags: ['Laravel', 'PostgreSQL', 'RabbitMQ'],
    bg: 'linear-gradient(135deg,#0b1218 0%,#12222c 55%,#3e6e8e 140%)',
    glow: 'radial-gradient(circle,#5a93b8 0%,transparent 70%)',
    glow2: 'radial-gradient(circle,#2b4d63 0%,transparent 70%)',
  },
  {
    title: 'Realtime Engine',
    kind: 'Infrastructure',
    at: 'Scientiae',
    year: '2024 — Now',
    description:
      'Event-driven, message-queued services delivering live updates through resilient, decoupled infrastructure that scales calmly under load.',
    tags: ['Reverb', 'RabbitMQ', 'Redis'],
    bg: 'linear-gradient(135deg,#0d101a 0%,#171c2e 55%,#3b4a7a 150%)',
    glow: 'radial-gradient(circle,#5566a8 0%,transparent 70%)',
    glow2: 'radial-gradient(circle,#2e3a63 0%,transparent 70%)',
  },
  {
    title: 'API Integration Suite',
    kind: 'Full-Stack',
    at: 'E-Impact',
    year: '2023 — 2024',
    description:
      'Re-engineered integrations across evolving API versions — keeping every connected system in seamless, uninterrupted sync.',
    tags: ['REST', 'Vue', 'Nuxt'],
    // Stays dark like its siblings — the amber lives in the glows below, so the
    // signal colour reads as a highlight rather than a gold slab.
    bg: 'linear-gradient(135deg,#14100a 0%,#221a0e 55%,#3a2a10 150%)',
    // Deeper than --color-signal: at the shared opacity-60 the pure signal colour
    // is far more luminous than the blue cards' glows and floods the panel.
    glow: 'radial-gradient(circle,#8a6520 0%,transparent 70%)',
    glow2: 'radial-gradient(circle,#54401a 0%,transparent 70%)',
  },
  {
    title: 'Motion Interfaces',
    kind: 'Frontend / Design',
    at: 'Craft',
    year: '2025 — Now',
    description:
      'Detail-driven front-ends where logic meets aesthetics — motion, typography and micro-interaction treated as first-class citizens.',
    tags: ['Nuxt', 'GSAP', 'Tailwind'],
    bg: 'linear-gradient(135deg,#0e1214 0%,#1a2226 55%,#46626e 150%)',
    glow: 'radial-gradient(circle,#6f909c 0%,transparent 70%)',
    glow2: 'radial-gradient(circle,#33505c 0%,transparent 70%)',
  },
]

const grainStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
}

const sectionEl = ref<HTMLElement | null>(null)
const pinEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const panelEls = ref<HTMLElement[]>([])
const artEls = ref<HTMLElement[]>([])
const progressEl = ref<HTMLElement | null>(null)
const scrollHint = ref<HTMLElement | null>(null)

const counter = ref('01')

let splitHeading: InstanceType<typeof SplitText> | null = null
let mm: ReturnType<typeof gsap.matchMedia> | null = null

const onTilt = (e: MouseEvent, i: number) => {
  const panel = panelEls.value[i]
  const art = artEls.value[i]
  if (!panel) return
  const rect = panel.getBoundingClientRect()
  const rx = (e.clientX - rect.left) / rect.width - 0.5
  const ry = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(panel, { rotateY: rx * 6, rotateX: -ry * 6, duration: 0.5, ease: 'power2.out', transformPerspective: 900 })
  if (art) gsap.to(art, { x: rx * 26, y: ry * 26, duration: 0.6, ease: 'power2.out' })
}

const resetTilt = (i: number) => {
  const panel = panelEls.value[i]
  const art = artEls.value[i]
  if (panel) gsap.to(panel, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' })
  if (art) gsap.to(art, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' })
}

onMounted(() => {
  if (!sectionEl.value || !trackEl.value || !pinEl.value) return

  if (headingEl.value) {
    splitHeading = new SplitText(headingEl.value, { type: 'lines,words' })
    splitHeading.lines.forEach((l) => ((l as HTMLElement).style.overflow = 'hidden'))
    gsap.set(splitHeading.words, { yPercent: 115 })
    ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top 70%',
      once: true,
      onEnter: () =>
        gsap.to(splitHeading!.words, { yPercent: 0, stagger: 0.08, duration: 1, ease: 'power4.out' }),
    })
  }

  if (scrollHint.value) {
    gsap.to(scrollHint.value, { scaleX: 0.2, duration: 1, repeat: -1, yoyo: true, ease: 'power1.inOut', transformOrigin: 'left' })
  }

  mm = gsap.matchMedia()

  // ── Desktop / tablet: horizontal pinned scroll ──
  mm.add('(min-width: 768px)', () => {
    const track = trackEl.value!
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 40)

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinEl.value!,
        start: 'top top',
        end: () => '+=' + getDistance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressEl.value) gsap.set(progressEl.value, { scaleX: self.progress })
          const idx = Math.min(projects.length, Math.max(1, Math.round(self.progress * (projects.length - 1)) + 1))
          counter.value = String(idx).padStart(2, '0')
        },
      },
    })

    panelEls.value.forEach((panel) => {
      gsap.from(panel, {
        opacity: 0,
        scale: 0.94,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: tween,
          start: 'left 92%',
          end: 'left 55%',
          scrub: true,
        },
      })
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(track, { clearProps: 'x' })
    }
  })

  // ── Mobile: vertical reveals ──
  mm.add('(max-width: 767px)', () => {
    const ctx: ScrollTrigger[] = []
    panelEls.value.forEach((panel, i) => {
      gsap.set(panel, { opacity: 0, y: 60 })
      ctx.push(
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 88%',
          onEnter: () => gsap.to(panel, { opacity: 1, y: 0, duration: 0.9, delay: i * 0.05, ease: 'power3.out' }),
          onLeaveBack: () => gsap.set(panel, { opacity: 0, y: 60 }),
        }),
      )
    })
    return () => ctx.forEach((t) => t.kill())
  })
})

onBeforeUnmount(() => {
  splitHeading?.revert()
  mm?.revert()
})
</script>

<style scoped>
.panel {
  transform-style: preserve-3d;
}
</style>
