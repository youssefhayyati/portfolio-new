<template>
  <div>
    <Hero />
    <About />
    <Duality />
    <MarqueeBand />
    <Works />
    <Interlude :quote="QUOTES.madness" />
    <Technologies />
    <Interlude :quote="QUOTES.fall" />
    <Experience />
    <Interlude :quote="QUOTES.hotfix" />
    <Contact />
  </div>
</template>

<script setup lang="ts">
import Hero from '~/components/Hero.vue'
import About from '~/components/About.vue'
import Duality from '~/components/Duality.vue'
import MarqueeBand from '~/components/MarqueeBand.vue'
import Works from '~/components/Works.vue'
import Interlude from '~/components/Interlude.vue'
import Technologies from '~/components/Technologies.vue'
import Experience from '~/components/Experience.vue'
import Contact from '~/components/Contact.vue'
import { QUOTES } from '~/data/lore'
</script>
