<template>
  <section id="stack" ref="sectionEl" class="relative bg-transparent overflow-hidden min-h-screen flex flex-col justify-center py-28 gap-16 sm:gap-20">

    <div class="px-6 sm:px-14 lg:px-28">
      <!-- Section label -->
      <p class="font-display text-[14px] tracking-[0.35em] uppercase text-text-muted mb-16">
        Utility Belt / 2026
      </p>

      <!-- Heading. The joke only works because it is also the honest label —
           a stack is a set of tools you carry for the job. -->
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <h2 ref="headingEl" class="font-passion uppercase text-[clamp(3rem,9vw,9rem)] leading-[0.88] text-text">
          Utility Belt
        </h2>
        <p ref="noteEl" class="max-w-sm font-roboto text-sm sm:text-base leading-relaxed text-text-muted lg:pb-4">
          Every tool earns its pouch. Nothing rides along for show — each one is
          here because a job once needed it, and will again.
        </p>
      </div>
    </div>

    <!-- Marquee columns -->
    <div class="flex flex-row px-6 sm:px-14 lg:px-28" data-intel="Three endless columns · hover drops the tween's timeScale to 0.25">
      <TechMarqueeColumn
        ref="col1Ref"
        label="Frontend"
        :items="col1"
        direction="up"
      />
      <TechMarqueeColumn
        ref="col2Ref"
        label="Backend"
        :items="col2"
        direction="down"
      />
      <TechMarqueeColumn
        ref="col3Ref"
        label="Tools"
        :items="col3"
        direction="up"
      />
    </div>

  </section>
</template>

<script lang="ts" setup>
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import TechMarqueeColumn from '~/components/TechMarqueeColumn.vue'

gsap.registerPlugin(ScrollTrigger)

const sectionEl = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const noteEl = ref<HTMLElement | null>(null)
const col1Ref = ref<InstanceType<typeof TechMarqueeColumn> | null>(null)
const col2Ref = ref<InstanceType<typeof TechMarqueeColumn> | null>(null)
const col3Ref = ref<InstanceType<typeof TechMarqueeColumn> | null>(null)

// ── Edit your stack here ──
const col1 = [
  { name: 'Vue', icon: 'simple-icons:vuedotjs', category: 'Frontend' },
  { name: 'Nuxt', icon: 'simple-icons:nuxtdotjs', category: 'Framework' },
  { name: 'Javascript', icon: 'simple-icons:javascript', category: 'Language' },
  { name: 'Tailwind', icon: 'simple-icons:tailwindcss', category: 'Styling' },
  { name: 'GSAP', icon: 'simple-icons:greensock', category: 'Animation' },
  { name: 'Three.js', icon: 'simple-icons:threedotjs', category: '3D' }
]

const col2 = [
  { name: 'Laravel', icon: 'simple-icons:laravel', category: 'Backend' },
  { name: 'PostgreSQL', icon: 'simple-icons:postgresql', category: 'Database' },
  { name: 'PHP', icon: 'simple-icons:php', category: 'Language' },
  { name: 'RabbitMQ', icon: 'simple-icons:rabbitmq', category: 'Messaging' },
  { name: 'Redis', icon: 'simple-icons:redis', category: 'Caching' },
]

const col3 = [
  { name: 'Figma', icon: 'simple-icons:figma', category: 'Design' },
  { name: 'Docker', icon: 'simple-icons:docker', category: 'DevOps' },
  { name: 'Git', icon: 'simple-icons:git', category: 'Version Control' },
  { name: 'Photoshop', icon: 'simple-icons:adobephotoshop', category: 'Design' },
  { name: 'Illustrator', icon: 'simple-icons:adobeillustrator', category: 'Design' },
]

onMounted(() => {
  gsap.from(headingEl.value, {
    y: 60, opacity: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: headingEl.value, start: 'top 85%' },
  })

  gsap.from(noteEl.value, {
    y: 30, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out',
    scrollTrigger: { trigger: headingEl.value, start: 'top 85%' },
  })

  const cols = [col1Ref.value?.$el, col2Ref.value?.$el, col3Ref.value?.$el].filter(Boolean)

  gsap.from(cols, {
    y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%' },
  })
})
</script>
