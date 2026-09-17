<template>
  <div
    ref="wrapEl"
    class="relative overflow-hidden h-[60vh] sm:h-[65vh] flex-1 border-l border-r border-text/10"
    style="mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);"
  >

    <!-- Faint oversized label sitting behind the marquee -->
    <!-- <p
      class="pointer-events-none select-none absolute left-16 top-1/2 translate-y-1/2 origin-left flex items-center justify-center font-passion uppercase text-[clamp(2.5rem,8vw,6rem)] leading-none text-transparent whitespace-nowrap"
      style="-webkit-text-stroke: 1px rgba(255,255,255,0.05); transform: rotate(-90deg);"
    >
      {{ label }}
    </p> -->


    <div ref="trackEl" class="relative z-10 flex flex-col items-center w-full will-change-transform">
      <div v-for="pass in 2" :key="pass" class="flex flex-col items-center w-full shrink-0" :aria-hidden="pass === 2">
        <template v-for="tech in items" :key="`${pass}-${tech.name}`">
          <div
            class="group flex flex-col items-center gap-2 py-8 px-2 w-full shrink-0"
          >
            <Icon
              :name="tech.icon"
              class="text-2xl sm:text-4xl text-text/40 group-hover:text-text group-hover:scale-110 transition-all duration-300"
            />
            <span class="max-w-full font-passion uppercase text-[0.8rem] min-[420px]:text-base sm:text-2xl lg:text-4xl leading-none text-text/80 group-hover:text-text transition-colors duration-300 text-center wrap-break-word">
              {{ tech.name }}
            </span>
            <span class="max-w-full font-display text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-text-muted/60 text-center wrap-break-word">
              {{ tech.category }}
            </span>
          </div>
          <span class="text-lg text-text/15 select-none">◆</span>
        </template>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import gsap from 'gsap'

const props = defineProps<{
  label: string
  items: { name: string; icon: string; category: string }[]
  direction: 'up' | 'down'
}>()

const wrapEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)

let tween: gsap.core.Tween | undefined

onMounted(() => {
  if (!trackEl.value || !wrapEl.value) return

  const duration = 8 + props.items.length * 3

  tween = props.direction === 'up'
    ? gsap.fromTo(trackEl.value, { yPercent: 0 }, { yPercent: -50, duration, ease: 'none', repeat: -1 })
    : gsap.fromTo(trackEl.value, { yPercent: -50 }, { yPercent: 0, duration, ease: 'none', repeat: -1 })

  const wrap = wrapEl.value
  const onEnter = () => tween?.timeScale(0.25)
  const onLeave = () => tween?.timeScale(1)

  wrap.addEventListener('mouseenter', onEnter)
  wrap.addEventListener('mouseleave', onLeave)

  onBeforeUnmount(() => {
    wrap.removeEventListener('mouseenter', onEnter)
    wrap.removeEventListener('mouseleave', onLeave)
  })
})

onBeforeUnmount(() => {
  tween?.kill()
})
</script>
