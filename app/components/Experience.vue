<template>
  <section
    id="experience"
    ref="sectionEl"
    class="relative bg-surface text-text overflow-hidden py-28 sm:py-40"
  >
    <div class="px-6 sm:px-14 lg:px-28 grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr] gap-16 lg:gap-24">
      <!-- ── Sticky left column ── -->
      <div
        ref="railEl"
        class="relative lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:justify-center"
        data-intel="Sticky column · the rail and the figure on the line both run off section progress"
      >
        <!-- On the line. He comes down the page as the career goes on. -->
        <div
          ref="ropeEl"
          class="pointer-events-none absolute right-0 top-0 hidden w-12 lg:block xl:right-6"
          aria-hidden="true"
        >
          <BatFigure pose="line" class="bat-rim h-auto w-full" />
        </div>

        <p class="font-display text-[13px] tracking-[0.35em] uppercase text-text-muted mb-6">
          Patrol Log / Career
        </p>
        <h2
          ref="headingEl"
          class="font-passion uppercase leading-[0.82] text-[clamp(3rem,8vw,7rem)] text-text"
        >
          Years<br />on<br />watch
        </h2>

        <!-- Running year + progress -->
        <div class="mt-12 flex items-end gap-6">
          <span ref="yearEl" class="font-passion text-6xl sm:text-7xl leading-none tabular-nums text-secondary">
            {{ activeYear }}
          </span>
          <div class="flex-1 pb-3">
            <div class="h-px w-full bg-text/15 overflow-hidden">
              <div ref="progressEl" class="h-full w-full bg-text origin-left scale-x-0" />
            </div>
            <p class="font-mono text-[11px] tracking-[0.25em] uppercase text-text-muted mt-3">
              {{ activeLabel }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Scrolling right column ── -->
      <div class="flex flex-col">
        <article
          v-for="(role, i) in roles"
          :key="role.company"
          ref="rowEls"
          data-cursor
          data-cursor-text="Role"
          class="relative border-t border-text/15 last:border-b py-10 sm:py-16 cursor-none group"
          @mouseenter="setActive(i)"
        >
          <div class="flex items-baseline justify-between gap-6 mb-6">
            <span class="font-mono text-xs tracking-[0.3em] text-text-muted/70">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="font-mono text-xs sm:text-sm tracking-[0.2em] text-text-muted tabular-nums">
              {{ role.period }}
            </span>
          </div>

          <h3 class="font-passion uppercase leading-[0.92] text-[clamp(2rem,5.5vw,4.25rem)] text-text/80 transition-colors duration-500 group-hover:text-text">
            {{ role.title }}
          </h3>
          <p class="font-display text-sm sm:text-lg tracking-[0.15em] uppercase text-text-muted mt-3">
            {{ role.company }} <span class="text-secondary">· {{ role.type }}</span> — {{ role.location }}
          </p>

          <ul class="mt-8 grid gap-4 max-w-2xl">
            <li
              v-for="point in role.points"
              :key="point"
              class="font-roboto text-sm sm:text-base leading-relaxed text-text-muted flex gap-3"
            >
              <span class="text-secondary mt-1 shrink-0">◆</span>
              <span>{{ point }}</span>
            </li>
          </ul>
        </article>

        <!-- Education -->
        <div class="mt-24 sm:mt-32">
          <p class="font-display text-[13px] tracking-[0.35em] uppercase text-text-muted mb-10">
            Training / Foundations
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-px bg-text/15 border border-text/15">
            <div
              v-for="edu in education"
              :key="edu.degree"
              ref="eduEls"
              class="bg-surface p-8 sm:p-10 flex flex-col justify-between gap-8 min-h-[220px]"
            >
              <div class="flex items-start justify-between gap-4">
                <p class="font-passion uppercase text-2xl sm:text-3xl text-text leading-tight max-w-[75%]">
                  {{ edu.degree }}
                </p>
                <span class="font-mono text-xs tracking-[0.2em] text-text-muted whitespace-nowrap">{{ edu.year }}</span>
              </div>
              <div>
                <p class="font-roboto text-sm text-text-muted leading-relaxed">{{ edu.field }}</p>
                <p class="font-display text-xs tracking-[0.25em] uppercase text-text-muted/60 mt-3">{{ edu.place }}</p>
              </div>
            </div>
          </div>
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

const roles = [
  {
    title: 'Full-Stack Developer',
    company: 'Scientiae',
    type: 'Full-time',
    location: 'Rabat, Morocco',
    period: '2024 — Present',
    year: '2024',
    label: 'Currently building',
    points: [
      'Collaborate with engineers, designers and data scientists to build robust, scalable solutions around real user needs.',
      'Implemented measures that strengthened confidentiality and data protection, safeguarding sensitive information.',
      'Identified and resolved critical software errors, significantly improving system stability and security for end users.',
    ],
  },
  {
    title: 'Full-Stack Developer',
    company: 'E-Impact',
    type: 'Internship',
    location: 'Fez, Morocco',
    period: '2023 — 2024',
    year: '2023',
    label: 'Where it started',
    points: [
      'Designed, coded and tested clean, high-quality solutions for client projects, contributing to overall project success.',
      'Analyzed software requirements and worked closely with the team to shape and deliver solutions.',
      'Updated existing integrations for new API versions, ensuring seamless functionality across systems.',
      'Evaluated products and technologies, recommending enhancements and proposing new approaches.',
    ],
  },
]

const education = [
  {
    degree: "Master's — Intelligent Systems & Networks",
    field: 'Advanced study of intelligent systems, networks and distributed architectures.',
    place: 'Fez, Morocco',
    year: '2024',
  },
  {
    degree: "Bachelor's — Computer Engineering",
    field: 'Mathematics, Physics & Computer Science.',
    place: 'Fez, Morocco',
    year: '2022',
  },
]

const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const rowEls = ref<HTMLElement[]>([])
const eduEls = ref<HTMLElement[]>([])
const yearEl = ref<HTMLElement | null>(null)
const progressEl = ref<HTMLElement | null>(null)
const railEl = ref<HTMLElement | null>(null)
const ropeEl = ref<HTMLElement | null>(null)

const activeIndex = ref(0)
const activeYear = computed(() => roles[activeIndex.value]?.year ?? roles[0].year)
const activeLabel = computed(() => roles[activeIndex.value]?.label ?? roles[0].label)

let splitHeading: InstanceType<typeof SplitText> | null = null
const triggers: ScrollTrigger[] = []

const setActive = (i: number) => {
  if (activeIndex.value === i) return
  activeIndex.value = i
  if (yearEl.value) {
    gsap.fromTo(yearEl.value, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
  }
}

onMounted(() => {
  if (!sectionEl.value) return

  if (headingEl.value) {
    splitHeading = new SplitText(headingEl.value, { type: 'lines,words' })
    splitHeading.lines.forEach((l) => ((l as HTMLElement).style.overflow = 'hidden'))
    gsap.set(splitHeading.words, { yPercent: 115 })
    triggers.push(
      ScrollTrigger.create({
        trigger: headingEl.value,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(splitHeading!.words, { yPercent: 0, stagger: 0.12, duration: 1, ease: 'power4.out' }),
      }),
    )
  }

  // Section progress drives the rail + active role
  triggers.push(
    ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (progressEl.value) gsap.set(progressEl.value, { scaleX: self.progress })
        if (ropeEl.value && railEl.value) {
          // Down the rail with the scroll, swinging a little on the way.
          const travel = railEl.value.clientHeight - ropeEl.value.clientHeight - 120
          gsap.to(ropeEl.value, {
            y: 60 + self.progress * Math.max(0, travel),
            rotation: Math.sin(self.progress * 18) * 4 * Math.min(1, Math.abs(self.getVelocity()) / 600),
            transformOrigin: '68% 0%',
            duration: 0.6,
            ease: 'power3.out',
            overwrite: true,
          })
        }
      },
    }),
  )

  // Reveal rows + switch active role as each enters
  rowEls.value.forEach((row, i) => {
    const inner = row.children
    gsap.set(inner, { y: 40, opacity: 0 })
    triggers.push(
      ScrollTrigger.create({
        trigger: row,
        start: 'top 80%',
        onEnter: () => {
          setActive(i)
          gsap.to(inner, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out' })
        },
        onEnterBack: () => setActive(i),
        onLeaveBack: () => gsap.set(inner, { y: 40, opacity: 0 }),
      }),
    )
  })

  eduEls.value.forEach((el, i) => {
    gsap.set(el, { y: 50, opacity: 0 })
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 0.9, delay: i * 0.1, ease: 'power3.out' }),
        onLeaveBack: () => gsap.set(el, { y: 50, opacity: 0 }),
      }),
    )
  })
})

onBeforeUnmount(() => {
  splitHeading?.revert()
  triggers.forEach((t) => t.kill())
})
</script>
