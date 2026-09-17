<script setup lang="ts">
import Navbar from '~/components/Navbar.vue';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollSmoother from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

let smoother: ScrollSmoother | undefined

onMounted(() => {
  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 2,
  })
})

onBeforeUnmount(() => {
  smoother?.kill()
})
</script>

<template>
    <Navbar class="fixed top-0 left-0 right-0 z-50" />
    <div id="smooth-wrapper">
        <div id="smooth-content" class="bg-surface w-full text-text mx-auto">
            <div id="main" tabindex="-1" />
            <slot>
            </slot>
        </div>
    </div>
</template>
