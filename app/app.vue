<template>
  <div>
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-[#06080a]"
    >
      Skip to content
    </a>
    <Loader v-if="isLoading" @done="isLoading = false" />
    <ClientOnly>
      <WebglBackground />
    </ClientOnly>
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Atmosphere />
      <DetectiveLayer />
      <BatSwarm />
      <ChaosLayer />
      <JokerPeek />
    </ClientOnly>
    <CustomCursor />
  </div>
</template>

<script setup>
import CustomCursor from '~/components/CustomCursor.vue'

/* ── The machine-readable half of the page ────────────────────────────────
   Absolute URLs are required by every card scraper worth supporting, and
   they are built from the incoming request rather than a hardcoded domain,
   so this keeps working on localhost, a preview deploy and the real host
   without a config change.

   The JSON-LD says nothing the page does not already say out loud — the
   role, the city, the languages, the stack, where he works. */
const origin = useRequestURL().origin

useHead({
  link: [{ rel: 'canonical', href: `${origin}/` }],
  meta: [
    { property: 'og:url', content: `${origin}/` },
    { property: 'og:image', content: `${origin}/og.png` },
    { name: 'twitter:image', content: `${origin}/og.png` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Youssef Hayyati',
        alternateName: 'Yhi',
        jobTitle: 'Full-Stack Developer',
        description:
          'Full-stack developer in Rabat, Morocco. Hardened back-ends, motion-led front-ends.',
        url: `${origin}/`,
        image: `${origin}/og.png`,
        email: 'mailto:youssefhayyati1997@gmail.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rabat',
          addressCountry: 'MA',
        },
        worksFor: { '@type': 'Organization', name: 'Scientiae' },
        knowsLanguage: ['ar', 'en', 'fr'],
        knowsAbout: [
          'Vue.js',
          'Nuxt',
          'TypeScript',
          'Laravel',
          'PHP',
          'PostgreSQL',
          'RabbitMQ',
          'Redis',
          'GSAP',
          'Three.js',
          'Tailwind CSS',
        ],
      }),
    },
  ],
})
const isLoading = useState('isLoading', () => !import.meta.dev)

onMounted(() => {
  document.documentElement.style.overflow = isLoading.value ? 'hidden' : ''

  // The nickname is only ever spelled out here. On the page itself it stays a
  // single mono line reading "Callsign — B", which lands for the people who
  // already call him that and reads as a design detail to everyone else.
  console.log(
    '%c CALLSIGN — B %c\n\nThey call me Batman. I mostly just refuse to leave a bug alone.\n\nNuxt · GSAP · Three.js · Tailwind\nyoussefhayyati1997@gmail.com\n\nYou opened the console, so you are one of us. Press D for detective mode.\n',
    'background:#e0a93f;color:#06080a;font-weight:700;letter-spacing:0.22em;padding:4px 10px;border-radius:2px;',
    'color:#8b96a2;font-family:monospace;line-height:1.7;',
  )
  // And a note from the other side, for anyone who reads to the end.
  console.log(
    '%c HA HA HA %c Psst — type "joker" anywhere on the page. Why so serious?',
    'background:#1c0930;color:#4cc97a;font-weight:700;letter-spacing:0.3em;padding:4px 10px;border-radius:2px;',
    'color:#9b5de5;font-family:monospace;',
  )
})

// ── The signal goes out when nobody is watching ──────────────────────────
// The page has a boot sequence but no exit, so leaving it was the one moment
// with no character at all. Switch tabs and the lamp reads as unattended;
// come back and it lights again.
//
// Deliberately the *only* thing that changes — no favicon swap, no audio, no
// "come back!" begging. A tab title is the smallest possible surface, which is
// exactly why spending a joke on it stays charming instead of desperate.
onMounted(() => {
  // Captured rather than hardcoded so it keeps matching nuxt.config's title.
  const lit = document.title
  const dark = '// signal down — the city is quiet'

  const onVisibility = () => {
    document.title = document.hidden ? dark : lit
  }

  document.addEventListener('visibilitychange', onVisibility)
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    document.title = lit
  })
})

watch(isLoading, (loading) => {
  document.documentElement.style.overflow = loading ? 'hidden' : ''
})
</script>
