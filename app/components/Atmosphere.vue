<script setup lang="ts">
import gsap from 'gsap'

/**
 * Two cheap, purely-CSS layers that do most of the work of making the page feel
 * lit rather than merely dark:
 *
 *  - a vignette that pulls the corners down, so the eye stays centred
 *  - a cold pool of light that trails the cursor, revealing whatever it passes
 *
 * Both sit above the content but below the cursor, and neither takes pointer
 * events. Deliberately restrained: the light pool is barely there at rest and
 * only opens up while you are actually moving.
 */

const pool = ref<HTMLElement | null>(null)

let setX: ((v: number) => void) | null = null
let setY: ((v: number) => void) | null = null
let raf = 0

const mouse = { x: -9999, y: -9999 }
let lastX = 0
let lastY = 0
let energy = 0

const onMove = (e: PointerEvent) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

onMounted(() => {
  if (!pool.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.set(pool.value, { xPercent: -50, yPercent: -50, opacity: 0 })
  setX = gsap.quickTo(pool.value, 'x', { duration: 0.5, ease: 'power3.out' })
  setY = gsap.quickTo(pool.value, 'y', { duration: 0.5, ease: 'power3.out' })

  window.addEventListener('pointermove', onMove, { passive: true })

  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!pool.value) return

    setX?.(mouse.x)
    setY?.(mouse.y)

    // Open the pool up while moving, let it settle back when still.
    const speed = Math.min(Math.hypot(mouse.x - lastX, mouse.y - lastY) / 45, 1)
    lastX = mouse.x
    lastY = mouse.y
    energy += (speed - energy) * 0.06

    gsap.set(pool.value, {
      opacity: mouse.x < -1000 ? 0 : 0.05 + energy * 0.09,
      scale: 1 + energy * 0.35,
    })
  }
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', onMove)
})
</script>

<template>
  <!-- Theme is switched by Tailwind's `dark:` variant, which is a plain global
       utility keyed off the `.dark` class colour-mode writes onto <html> before
       hydration. The two obvious alternatives are both traps here:

         - a `:class="isDark ? …"` binding renders the DARK branch during SSR
           whatever the real preference is, because `colorMode.value` is only
           resolved on the client; the mismatch is never repaired, so the light
           theme shipped with an 86%-black vignette over it.
         - `:global(html:not(.dark)) .atmosphere-pool` in the scoped block gets
           mangled by Vue's scoped-style transform into a bare `html:not(.dark)`
           rule, which put multiply-blending on the document element itself.

       A utility class sidesteps both: no SSR window, no scoped selector. -->
  <div
    class="pointer-events-none fixed inset-0 z-[80]
           [--vignette-mid:0.05] [--vignette-edge:0.14]
           dark:[--vignette-mid:0.42] dark:[--vignette-edge:0.86]"
    aria-hidden="true"
  >
    <!-- Vignette. Sized past the viewport so the falloff never shows a seam. -->
    <div class="atmosphere-vignette absolute inset-0" />

    <!-- Cold pool of light trailing the cursor. On the light theme "screen"
         would only wash the page out, so the pool darkens instead. -->
    <div
      ref="pool"
      class="atmosphere-pool absolute left-0 top-0 mix-blend-multiply dark:mix-blend-screen"
    />
  </div>
</template>

<style scoped>
/* A vignette is a shadow, so it is always black — only its strength is
   theme-dependent. Tinting it with --color-surface made it a *light* wash on
   the light theme, which is the opposite of a vignette. */
.atmosphere-vignette {
  background: radial-gradient(
    120% 95% at 50% 45%,
    transparent 38%,
    rgb(0 0 0 / var(--vignette-mid)) 78%,
    rgb(0 0 0 / var(--vignette-edge)) 100%
  );
}

/* The strengths themselves live on the element as utilities, so that the dark
   theme can push the corners almost fully down — which is what makes the centre
   read as *lit from somewhere* rather than evenly bright — while the light
   theme keeps only the faintest falloff. */

/* A tungsten searchlight rather than a flat wash: warm at the filament, cold
   at the spill. Real lamps do this — the warm core is what stops the pool from
   looking like a blue circle following the mouse, and it is the one place the
   signal colour is allowed to move around freely, because it is so diffuse. */
.atmosphere-pool {
  width: 46rem;
  height: 46rem;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--color-signal) 55%, white) 0%,
    color-mix(in oklab, var(--color-accent) 65%, white) 18%,
    color-mix(in oklab, var(--color-accent) 38%, transparent) 38%,
    transparent 70%
  );
}

@media (pointer: coarse) {
  .atmosphere-pool {
    display: none;
  }
}
</style>
