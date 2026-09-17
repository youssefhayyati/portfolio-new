<template>
  <section id="about" ref="sectionEl" class="relative z-20 bg-surface overflow-hidden">
  <div ref="skewEl" class="px-6 py-0 sm:px-14 lg:px-28 will-change-transform">

    <!-- Headline -->
    <div ref="headlineEl" class="mb-14 sm:mb-10">
      <!-- Every other section announces itself with one of these ("Case Files",
           "Patrol Log", "Utility Belt"); About was the only one that didn't,
           which made it read as a page from a different site. Centred rather
           than left-aligned like its siblings because this section's whole
           composition is centred. -->
      <p class="font-display text-center text-[13px] tracking-[0.35em] uppercase text-text-muted mb-10 sm:mb-14">
        Dossier / Subject
      </p>

      <h2 class="font-passion text-center uppercase leading-[0.88] text-[clamp(2.6rem,8vw,8.5rem)] text-text">
        I'm Youssef
        Hayyati
        based in<br class="sm:hidden" /> Rabat,
        <span ref="moroccoRef" class="text-signal/70 cursor-none" data-intel="Hover me · a flag trails the cursor on a lerped GSAP ticker">Morocco</span>.
      </h2>
    </div>

    <!-- Bio -->
    <div ref="bioEl" class="max-w-lg mb-28 sm:mb-40 ml-auto sm:ml-[33%]">
      <p class="font-roboto text-base text-center sm:text-lg leading-relaxed text-text/60">
        Full-stack developer with a detective's patience and an artist's eye.
        I build the parts nobody sees — secure, stable back-ends — and the
        parts everybody feels: interfaces where motion, typography and small
        details do the talking. Off the clock, I draw.
      </p>
    </div>

    <!-- Three pillars -->
    <div ref="pillarsEl" class="relative overflow-hidden" data-intel="Each pillar enters from its own direction · ScrollTrigger, reset on leave-back">
      <!-- connecting line (desktop) -->
      <div class="hidden sm:block absolute top-3 left-0 right-0 h-px bg-text/20 z-0" />

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-10">
        <div
          v-for="pillar in pillars"
          :key="pillar.number"
          ref="pillarItemEls"
        >
          <p class="relative z-10 inline-flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-text-muted mb-10 leading-6 bg-surface pr-3">
            {{ pillar.number }}
            <span class="text-[10px] tracking-[0.3em] uppercase text-signal/80">{{ pillar.alias }}</span>
          </p>
          <h3 class="font-passion uppercase text-2xl sm:text-3xl text-text mb-4 leading-tight">
            {{ pillar.title }}
          </h3>
          <p class="font-roboto text-sm sm:text-base leading-relaxed text-text-muted">
            {{ pillar.description }}
          </p>
        </div>
      </div>
    </div>

  </div>
  </section>

  <!-- Morocco flag cursor follower -->
  <Teleport to="body">
    <div
      ref="flagEl"
      class="pointer-events-none fixed top-0 left-0 z-9998 select-none opacity-0"
      style="will-change: transform;"
    >
      <!-- ClientOnly wraps the icon *only*, never the div above it. Inside a
           Teleport this Icon renders empty on the server and populated on the
           client, which is a hydration mismatch on the wrapper; deferring it
           removes that. The div has to stay server-rendered because flagEl is
           the ref GSAP animates, and it must exist by the time onMounted runs
           — a ClientOnly around the whole thing would leave it null and
           silently kill the follower. -->
      <ClientOnly>
        <Icon name="twemoji:flag-morocco" class="text-7xl" />
      </ClientOnly>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const sectionEl = ref<HTMLElement | null>(null)
const skewEl = ref<HTMLElement | null>(null)
const headlineEl = ref<HTMLElement | null>(null)
const bioEl = ref<HTMLElement | null>(null)
const pillarsEl = ref<HTMLElement | null>(null)
const pillarItemEls = ref<HTMLElement[]>([])
const moroccoRef = ref<HTMLElement | null>(null)
const flagEl = ref<HTMLElement | null>(null)

const pillars = [
  {
    number: '01',
    alias: 'The detective',
    title: 'Full Stack Dev',
    description:
      'End-to-end web apps — from APIs and databases to the interfaces people touch. When something breaks, I follow it until it confesses.',
  },
  {
    number: '02',
    alias: 'The showman',
    title: 'Frontend & Design',
    description:
      "Smooth, detail-driven UIs built with a designer's eye. Motion, spacing and colour are never afterthoughts — they are the performance.",
  },
  {
    number: '03',
    alias: 'The artist',
    title: 'Drawing & Art',
    description:
      'Drawing shaped how I see the world. That visual thinking runs through every layout and interface I build.',
  },
]

let splitHeadline: InstanceType<typeof SplitText> | null = null
let splitBio: InstanceType<typeof SplitText> | null = null
const triggers: ScrollTrigger[] = []

onMounted(() => {
  if (!sectionEl.value) return

  // ── Skew on scroll velocity ──
  const clamp = gsap.utils.clamp(-6, 6)
  const proxy = { skewY: 0 }
  const skewSetter = gsap.quickSetter(skewEl.value!, 'skewY', 'deg')

  triggers.push(
    ScrollTrigger.create({
      trigger: sectionEl.value,
      start: 'top 95%',
      onUpdate(self) {
        const skew = clamp(-self.getVelocity() / 400)
        if (Math.abs(skew) > Math.abs(proxy.skewY)) {
          proxy.skewY = skew
          gsap.to(proxy, {
            skewY: 0,
            duration: 0.8,
            ease: 'power3',
            overwrite: true,
            onUpdate: () => skewSetter(proxy.skewY),
          })
        }
      },
    }),
  )

  // ── Headline: words slide up from behind each line mask ──
  const h2 = headlineEl.value?.querySelector('h2')
  if (h2) {
    splitHeadline = new SplitText(h2, { type: 'lines,words,chars' })

    splitHeadline.lines.forEach((line) => {
      ;(line as HTMLElement).style.overflow = 'hidden'
      ;(line as HTMLElement).style.paddingBottom = '0.08em'
    })

    gsap.set(splitHeadline.words, { yPercent: 110 })

    triggers.push(
      ScrollTrigger.create({
        trigger: sectionEl.value,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(splitHeadline!.words, {
            yPercent: 0,
            stagger: 0.09,
            duration: 1.05,
            ease: 'power4.out',
          })
        },
        onLeaveBack: () => {
          gsap.set(splitHeadline!.words, { yPercent: 110 })
        },
      }),
    )
  }

  // ── Bio: lines slide up one by one ──
  const bioP = bioEl.value?.querySelector('p')
  if (bioP) {
    splitBio = new SplitText(bioP, { type: 'chars' })

        gsap.set(splitBio.chars, { yPercent: 100 })

    triggers.push(
      ScrollTrigger.create({
        trigger: bioEl.value,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(splitBio!.chars, {
            yPercent: 100,
            opacity: 0,
            filter: 'blur(10px)',
          }, {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: {
              each: 0.01,
              from: 'start',
            },
            duration: 0.3,
            ease: 'power3.out',
          })
        },
        onLeaveBack: () => {
          gsap.set(splitBio!.chars, { yPercent: 100, opacity: 0 })
        },
      }),
    )
  }

  // ── Pillars: each from a different direction ──
  const directions = [
    { x: -90, y: 0 },  // 01 — from the left
    { x: 0,  y: 70 },  // 02 — from below
    { x: 90, y: 0 },   // 03 — from the right
  ]

  pillarItemEls.value.forEach((el, i) => {
    const d = directions[i] ?? { x: 0, y: 70 }
    gsap.set(el, { x: d.x, y: d.y, opacity: 0 })

    triggers.push(
      ScrollTrigger.create({
        trigger: pillarsEl.value,
        start: 'top 88%',
        onEnter: () => {
          gsap.to(el, {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.95,
            delay: i * 0.13,
            ease: 'power3.out',
          })
        },
        onLeaveBack: () => {
          gsap.set(el, { x: d.x, y: d.y, opacity: 0 })
        },
      }),
    )
  })

  // ── Morocco flag cursor follower ──
  const morocco = moroccoRef.value
  const flag = flagEl.value
  if (morocco && flag) {
    const mouse = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }

    const tick = () => {
      pos.x += (mouse.x - pos.x) * 0.12
      pos.y += (mouse.y - pos.y) * 0.12
      gsap.set(flag, { x: pos.x, y: pos.y, xPercent: -50, yPercent: -110 })
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const onEnter = () => {
      gsap.ticker.add(tick)
      gsap.to(flag, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' })
    }

    const onLeave = () => {
      gsap.ticker.remove(tick)
      gsap.to(flag, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power2.in' })
    }

    gsap.set(flag, { scale: 0.6 })
    morocco.addEventListener('mouseenter', onEnter)
    morocco.addEventListener('mousemove', onMove)
    morocco.addEventListener('mouseleave', onLeave)

    onBeforeUnmount(() => {
      gsap.ticker.remove(tick)
      morocco.removeEventListener('mouseenter', onEnter)
      morocco.removeEventListener('mousemove', onMove)
      morocco.removeEventListener('mouseleave', onLeave)
    })
  }
})

onBeforeUnmount(() => {
  splitHeadline?.revert()
  splitBio?.revert()
  triggers.forEach((t) => t.kill())
})
</script>
