import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxtjs/color-mode'],
  css: ['~/assets/css/main.css'],

  // The tab is the one surface the design never reached: it was still shipping
  // the stock Nuxt icon and an empty title. The favicon is the signal itself —
  // an amber disc with the mark cut out of it — which at 16px is the only form
  // of the emblem that survives, and reads as a lit lamp rather than a logo.
  app: {
    head: {
      title: 'Youssef Hayyati — Full-Stack Developer',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Youssef Hayyati — full-stack developer in Rabat, Morocco. Hardened back-ends, motion-led front-ends, and the systems I get called in to fix.',
        },
        // Matches --color-bg on the dark theme, so mobile browser chrome sinks
        // into the page instead of framing it in white.
        { name: 'theme-color', content: '#0a0d11' },
        { name: 'author', content: 'Youssef Hayyati' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Youssef Hayyati — Full-Stack Developer' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Youssef Hayyati' },
        { property: 'og:locale', content: 'en_US' },
        {
          property: 'og:description',
          content: 'Hardened back-ends, motion-led front-ends. Rabat, Morocco.',
        },
        // The card image is generated from the site's own design language and
        // lives in public/og.png; the absolute URLs it needs are built from the
        // request in app.vue, so nothing here has to know the domain.
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        {
          property: 'og:image:alt',
          content: 'The signal thrown on the clouds over Gotham, beside the name Youssef Hayyati',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Youssef Hayyati — Full-Stack Developer' },
        {
          name: 'twitter:description',
          content: 'Hardened back-ends, motion-led front-ends. Rabat, Morocco.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/signal.svg' },
        // Fallback for the handful of clients that still refuse SVG icons.
        { rel: 'alternate icon', href: '/favicon.ico' },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },
  icon: {
    customCollections: [
      {
        prefix: 'icons',
        dir: './assets/icons',
      },
    ],
  },
})