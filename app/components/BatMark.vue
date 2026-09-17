<script setup lang="ts">
/**
 * The emblem, as an element. The shape itself lives in utils/emblem, which is
 * the single source every other use pulls from — see the note there.
 */
import { BAT_HALF, BAT_MIRROR, BAT_VIEWBOX } from '~/utils/emblem'
</script>

<template>
  <svg :viewBox="BAT_VIEWBOX" fill="currentColor" aria-hidden="true" focusable="false">
    <path :d="BAT_HALF" />
    <path :d="BAT_HALF" :transform="BAT_MIRROR" />
  </svg>
</template>
