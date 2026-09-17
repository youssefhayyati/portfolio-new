<script setup lang="ts">
/**
 * Him, from behind. Original silhouettes in the same spirit as BatMark: the
 * cowl ears and the scalloped cape carry the whole reference, so neither is
 * traced from anything.
 *
 * Seen from the back on purpose. A figure facing away reads as watching over
 * something — the city, the page — which is the only way a costume on a
 * portfolio stays a mood rather than a mascot.
 *
 *  - `stand`: on a ledge, cape down.
 *  - `line`: hanging off a grapple line, which runs up out of the frame. The
 *    line is part of the drawing, so wherever the figure is placed the rope
 *    goes with it.
 *  - `perch`: crouched on a stone ledge, facing out, cape spread — the one
 *    pose that is not from behind, because a gargoyle watch is the shape
 *    everybody already knows. The ledge is part of the drawing and sits on
 *    the bottom edge of the box.
 */
withDefaults(defineProps<{ pose?: 'stand' | 'line' | 'perch' }>(), { pose: 'stand' })

/** Right half of the crouch; the left is this mirrored about x = 100. */
const PERCH = `M100 30 Q106 30 108.5 33 L113 14 L116 37
  C118 43 118 50 115 55 L121 57 C131 48 142 47 150 56
  C162 70 172 98 184 124 L197 150 L182 141 L178 160 L164 146 L156 162 L143 149 L131 158
  L121 148 L112 159 L100 156 Z`

const BODY = `M41 21 L42.5 3 L46.5 14.5 Q50 13 53.5 14.5 L57.5 3 L59 21
  C61 26 61 31 58.5 35 C57.5 37 58.5 39 61.5 40
  C70 42 78 44 81 50 C84 56 84 64 84 72`

const NECK_LEFT = `C16 64 16 56 19 50 C22 44 30 42 38.5 40
  C41.5 39 42.5 37 41.5 35 C39 31 39 26 41 21 Z`
</script>

<template>
  <svg
    v-if="pose === 'stand'"
    viewBox="0 0 100 220"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path
      :d="`${BODY}
        C86 110 89 150 92 196 L85 205 L77 199 L68 209 L60 201 L50 211 L40 201 L32 209 L23 199 L15 205 L8 196
        C11 150 14 110 16 72 ${NECK_LEFT}`"
    />
    <path d="M41 205 h7 v13 h-9 z M52 205 h7 l2 13 h-9 z" />
  </svg>

  <svg
    v-else-if="pose === 'perch'"
    viewBox="0 0 200 196"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="PERCH" />
    <path :d="PERCH" transform="translate(200 0) scale(-1 1)" />
    <!-- The ledge, and the corbel carrying it. -->
    <path d="M14 158 H186 V170 H14 Z M40 170 H160 L146 188 H54 Z M92 188 H108 V196 H92 Z" />
  </svg>

  <svg
    v-else
    viewBox="0 0 100 260"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    style="overflow: visible"
  >
    <!-- The line, long enough to leave the top of any container it sits in. -->
    <rect x="67.4" y="-4000" width="1.3" height="4044" />
    <path d="M64.5 40 C64.5 35.5 71.5 35.5 71.5 40 L71.5 49 C71.5 53 64.5 53 64.5 49 Z" />
    <path d="M65 48 L72 48 L83 88 L72 93 Z" />
    <g transform="translate(0 40)">
      <path
        :d="`${BODY.replace('C84 56 84 64 84 72', 'C84 56 84 64 83 72')}
          C88 110 94 150 98 190 L91 197 L84 190 L76 200 L68 193 L58 203 L48 195 L40 203 L32 194 L24 200 L16 192
          C15 150 15 110 16 72 ${NECK_LEFT}`"
      />
      <path d="M40 199 h7 v15 h-9 z M52 199 h7 l3 14 h-9 z" />
    </g>
  </svg>
</template>
