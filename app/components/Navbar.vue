<template>
  <div class="w-full h-10 px-8 py-8 flex items-center justify-between">
    <!-- ── The lockup ────────────────────────────────────────────────────
         A lamp lens with the mark inside it, then his name. The badge is a
         ring rather than a filled amber disc: the disc is right at 16px in a
         browser tab, where it has to read as a lit lamp, but parked in the
         corner of every screen it would be a permanent slab of the one
         colour this design rations.

         It behaves like a logo (back to the top) and, because it is his
         mark, it lets the colony go on the way. -->
    <button
      type="button"
      data-cursor
      data-cursor-text="Top"
      class="group flex items-center gap-3 cursor-none"
      aria-label="Youssef Hayyati — back to top"
      @click="onLogo"
    >
      <span
        class="logo-badge relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-signal/45 transition-colors duration-500 group-hover:border-signal"
      >
        <BatMark class="relative w-[17px] h-auto text-signal transition-transform duration-500 group-hover:scale-110" />
      </span>
      <span class="leading-none">
        <span class="hidden sm:block font-passion text-[1.3rem] tracking-[-0.01em] text-text">
          Youssef <span class="text-text-muted">Hayyati</span>
        </span>
        <span class="sm:hidden font-passion text-xl tracking-[0.04em] text-text">YHI</span>
      </span>
    </button>

    <!-- Color Mode Toggle -->
    <button
      type="button"
      aria-label="Toggle color mode"
      class="relative flex flex-col items-center cursor-pointer select-none"
      @click="toggleColorMode"
    >
      <!-- Cord assembly: rope + knob together -->
      <div
        ref="cord"
        class="absolute left-1/2 -translate-x-1/2 -top-16 flex flex-col items-center"
      >
        <!-- Rope -->
        <span
          ref="rope"
          class="w-px h-10 bg-text/40 origin-bottom"
        />
        <!-- Knob -->
        <span
          data-cursor
          cursorShape="circle"
          class="flex items-center justify-center w-8 h-8 rounded-full border border-text/40 bg-background"
        >
          <ClientOnly>
            <Icon
              :name="colorMode.value === 'dark' ? 'solar:sun-2-line-duotone' : 'solar:moon-broken'"
              class="text-text"
              size="20"
            />
            <template #fallback>
              <Icon name="lucide:moon" class="text-text" size="20" />
            </template>
          </ClientOnly>
        </span>
      </div>
    </button>

    <div class="flex items-center gap-5 sm:gap-8">
    <!-- Detective mode. Lit orange while it is on, the colour the mode itself
         uses for everything it has found. -->
    <button
      type="button"
      data-cursor
      data-cursor-text="Press D"
      class="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors duration-300"
      :class="detective ? 'text-[#ffb347]' : 'text-text-muted hover:text-text'"
      :aria-pressed="detective"
      aria-label="Toggle detective mode"
      @click="toggleDetective"
    >
      <Icon name="lucide:scan-eye" class="text-xl" />
      <span class="hidden md:inline">Detective</span>
      <kbd class="hidden md:inline rounded border border-current/40 px-1.5 py-0.5 text-[9px] leading-none">D</kbd>
    </button>

    <!-- Menu Toggle -->
    <button
      data-cursor
      type="button"
      class="flex flex-col gap-1.5 items-center justify-center cursor-pointer w-16 h-4 z-50"
      :aria-expanded="isMenuOpen"
      aria-label="Toggle menu"
      @click="toggleMenu"
    >
      <span
        class="w-16 h-0.5 bg-text rounded-full transition-all duration-300"
        :class="isMenuOpen ? 'translate-y-1' : 'translate-y-0'"
        />
        <!-- <span
        class="w-8 h-0.5 bg-text rounded-full transition-all duration-300"
        :class="isMenuOpen ? 'opacity-0' : ''"
        /> -->
        <span
        class="w-16 h-0.5 bg-text rounded-full transition-all duration-300"
        :class="isMenuOpen ? '-translate-y-1' : 'translate-y-0'"
      />
    </button>
    </div>

    <!-- Menu Overlay -->
    <div class="fixed inset-0 z-40 h-screen " :class="isMenuOpen ? '' : 'pointer-events-none'">
      <div
        class="absolute inset-0 origin-right transition-transform duration-300 ease-in-out"
        :class="isMenuOpen ? 'scale-x-100' : 'scale-x-0'"
        :style="{ transitionDelay: isMenuOpen ? '0ms' : '500ms' }"
      >
        <!-- Always dark, in both themes. The panel's copy is hardcoded white,
             so inheriting `bg-surface` put white text on a light slab in light
             mode — and a menu that drops the room to black is the behaviour
             this design wants anyway. -->
        <div
          class="absolute inset-0 origin-top bg-[#05070a]/95 backdrop-blur-md transition-transform duration-300 ease-in-out"
          :class="isMenuOpen ? 'scale-y-100' : 'scale-y-0'"
          :style="{ transitionDelay: isMenuOpen ? '300ms' : '200ms' }"
        >
          <div
            class="absolute inset-0 flex flex-col justify-between px-8 py-8 sm:px-16 sm:py-12 text-white transition-opacity duration-300"
            :class="isMenuOpen ? 'opacity-100' : 'opacity-0'"
            :style="{ transitionDelay: isMenuOpen ? '600ms' : '0ms' }"
          >
            <!-- He is already in the room. The signal behind him is what makes
                 a black figure on a black panel read at all. -->
            <div
              class="pointer-events-none absolute bottom-32 right-4 w-28 sm:bottom-28 sm:right-[6%] sm:w-[min(22vw,300px)]"
              aria-hidden="true"
            >
              <div class="absolute left-1/2 top-[6%] aspect-square w-[130%] -translate-x-1/2 rounded-full menu-signal" />
              <BatFigure pose="perch" class="relative w-full menu-perch" />
            </div>

            <!-- And somebody has been in here too. -->
            <JokerCard
              class="pointer-events-auto absolute right-4 top-24 w-14 rotate-12 sm:right-[8%] sm:top-28 sm:w-20 lg:w-24"
              face="bat"
            />

            <nav class="flex flex-col gap-1 sm:gap-1.5 mt-24 sm:mt-28 w-min items-start">
              <p class="mb-6 flex items-center gap-4 font-mono text-[10px] tracking-[0.35em] uppercase text-white/35">
                Case index
                <span class="h-px w-16 bg-white/20" />
              </p>

              <button
                data-cursor
                v-for="(item, index) in navItems"
                :key="item.target"
                :ref="(el) => setNavItemRef(el, index)"
                class="group relative flex items-center gap-5 sm:gap-10 opacity-0 translate-y-8"
                @click="goTo(item.target)"
              >
                <!-- Parked off the left edge until this line is the one being
                     read, so the list keeps its alignment. -->
                <BatMark
                  class="pointer-events-none absolute -left-9 top-1/2 hidden h-auto w-6 -translate-y-1/2 -translate-x-2 text-signal opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block"
                  aria-hidden="true"
                />

                <!-- Index, not decoration: it gives the eye somewhere to land
                     and turns the list into a manifest. -->
                <span class="font-mono text-[10px] sm:text-sm tracking-[0.3em] text-white/25 group-hover:text-signal transition-colors duration-300 tabular-nums">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>

                <!-- Two stacked copies rolling under one mask: the white one
                     leaves as the signal-coloured one arrives. -->
                <span class="block h-10 sm:h-[4.4rem] overflow-hidden uppercase font-bold leading-none tracking-tight text-4xl sm:text-[4.4rem]">
                  <span class="block transition-transform duration-300 group-hover:-translate-y-full text-white/70">
                    {{ item.label }}
                  </span>
                  <span class="block transition-transform duration-300 group-hover:-translate-y-full text-signal">
                    {{ item.label }}
                  </span>
                </span>

                <!-- What Gotham calls it. -->
                <span class="hidden sm:block whitespace-nowrap font-mono text-[10px] tracking-[0.3em] uppercase text-white/0 -translate-x-3 transition-all duration-300 group-hover:text-white/45 group-hover:translate-x-0">
                  {{ item.alias }}
                </span>
              </button>
            </nav>

            <div class="relative flex flex-col gap-6">
              <!-- The easter eggs, spelled out once. Nobody finds a keyboard
                   shortcut they were never told about. -->
              <p class="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.25em] uppercase text-white/30">
                <span class="flex items-center gap-2">
                  <kbd class="rounded border border-white/25 px-1.5 py-0.5 text-[9px] leading-none">D</kbd>
                  Detective mode
                </span>
                <span class="flex items-center gap-2">
                  <span class="text-joker-green" style="font-family: var(--font-scrawl)">Type “joker”</span>
                  for chaos
                </span>
              </p>

              <div class="flex items-end justify-between text-sm sm:text-base">
              <a href="mailto:youssefhayyati1997@gmail.com" data-cursor class="hover:opacity-70 transition-opacity">
                youssefhayyati1997@gmail.com
              </a>
              <div class="flex gap-6 font-medium">
                <a href="#" class="hover:opacity-70 transition-opacity" data-cursor><Icon data-cursor name="streamline-logos:github-logo-2-solid" class="text-3xl"/></a>
                <a href="#" class="hover:opacity-70 transition-opacity" data-cursor><Icon data-cursor name="streamline-logos:linkedin-logo-block" class="text-3xl"/></a>
                <a href="#" class="hover:opacity-70 transition-opacity" data-cursor><Icon data-cursor name="streamline-logos:x-twitter-logo-block" class="text-3xl"/></a>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
import ScrollSmoother from 'gsap/ScrollSmoother'

const cord = ref(null)
const rope = ref(null)
const colorMode = useColorMode()
const isTogglingColorMode = ref(false)
const isMenuOpen = ref(false)

const navItems = [
  { target: 'top', label: 'Home', alias: 'The signal' },
  { target: '#about', label: 'About', alias: 'Dossier' },
  { target: '#duality', label: 'Duality', alias: 'Order / Chaos' },
  { target: '#works', label: 'Works', alias: 'Case files' },
  { target: '#stack', label: 'Stack', alias: 'Utility belt' },
  { target: '#experience', label: 'Career', alias: 'Patrol log' },
  { target: '#contact', label: 'Contact', alias: 'Light the signal' },
]

const { active: detective, toggle: toggleDetective } = useDetective()
const { release } = useSwarm()

const onLogo = (e) => {
  // Out of the corner and across the page, then home.
  const r = e.currentTarget.getBoundingClientRect()
  release({ x: r.left + 16, y: r.top + r.height / 2, dir: 0.35, spread: 1.3 })
  goTo('top')
}

const goTo = (target) => {
  closeMenu()
  const scroll = () => {
    const smoother = ScrollSmoother.get()
    if (target === 'top') {
      if (smoother) smoother.scrollTo(0, true)
      else window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.querySelector(target)
    if (!el) return
    if (smoother) smoother.scrollTo(el, true, 'top top')
    else el.scrollIntoView({ behavior: 'smooth' })
  }
  // wait for the menu close/overflow reset before scrolling
  setTimeout(scroll, 500)
}

const navItemRefs = ref([])
const setNavItemRef = (el, index) => {
  navItemRefs.value[index] = el?.$el ?? el ?? null
}

watch(isMenuOpen, (open) => {
  const items = navItemRefs.value.filter(Boolean)
  if (!items.length) return

  gsap.killTweensOf(items)

  if (open) {
    gsap.fromTo(
      items,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.6,
      },
    )
  } else {
    gsap.to(items, {
      opacity: 0,
      y: 32,
      duration: 0.25,
      ease: 'power2.in',
    })
  }
})

const toggleColorMode = () => {
  if (isTogglingColorMode.value) return
  if (!cord.value || !rope.value) return

  isTogglingColorMode.value = true

  gsap.killTweensOf([cord.value, rope.value])

  const tl = gsap.timeline({
    defaults: { overwrite: 'auto' },
    onComplete: () => {
      isTogglingColorMode.value = false
    },
  })

  tl
    // Pull down the whole cord + stretch rope
    .to(cord.value, {
      y: 16,
      duration: 0.2,
      ease: 'power2.out',
    }, 0)
    .to(rope.value, {
      scaleY: 2,
      duration: 0.2,
      ease: 'power2.out',
    }, 0)

    // Launch up the whole cord + rope returns to normal
    .to(cord.value, {
      y: -70,
      duration: 0.35,
      ease: 'power3.in',
    })
    .to(rope.value, {
      scaleY: 0.6,
      duration: 0.35,
      ease: 'power3.in',
    }, '<')

    // Toggle theme while hidden
    .call(() => {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    })

    // Spring back
    .to(cord.value, {
      y: 0,
      duration: 1.2,
      ease: 'elastic.out(0.7, 0.4)',
    })
    .to(rope.value, {
      scaleY: 1,
      duration: 1.2,
      ease: 'elastic.out(0.7, 0.4)',
    }, '<')
}

watch(isMenuOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

const toggleMenu = (e) => {
  isMenuOpen.value = !isMenuOpen.value
  // Bats out of the button that opened it, once the panel is on its way.
  if (isMenuOpen.value) {
    const r = e.currentTarget.getBoundingClientRect()
    setTimeout(() => release({ x: r.left + r.width / 2, y: r.top + r.height / 2, dir: -2.3, spread: 1.6 }), 260)
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>
<style scoped>
/* The lens warms up when you reach for it. */
.logo-badge::after {
  content: '';
  position: absolute;
  inset: -7px;
  border-radius: 9999px;
  background: radial-gradient(circle, color-mix(in oklab, var(--color-signal) 32%, transparent), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.group:hover .logo-badge::after {
  opacity: 1;
}

/* Backlit by the signal behind him — the same trick the interludes use, and
   the only reason a near-black silhouette shows on a near-black panel. */
.menu-perch {
  color: #010204;
  filter: drop-shadow(0 0 1px rgb(221 228 234 / 0.55));
}

.menu-signal {
  background: radial-gradient(circle, color-mix(in oklab, var(--color-signal) 22%, transparent), transparent 62%);
}
</style>
