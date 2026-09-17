<script setup lang="ts">
import { BAT_HALF, BAT_MIRROR } from '~/utils/emblem'
/**
 * The calling card. Two faces on one card: the Joker's, and a case-file back
 * with the signal on it. Hovering turns it over; clicking it lets the Joker
 * have the screen for a moment (see ChaosLayer).
 *
 * Both faces are drawn here, not imported — the jester hat, the grin and the
 * card furniture are all original shapes, so the only thing borrowed is the
 * idea of a Joker leaving a card behind.
 */
const props = withDefaults(defineProps<{ face?: 'joker' | 'bat' }>(), { face: 'joker' })

const { unleash } = useChaos()
const flipped = ref(false)

const faces = computed(() =>
  props.face === 'joker' ? (['joker', 'bat'] as const) : (['bat', 'joker'] as const),
)

const INDEX = ['O', 'K', 'E', 'R']
</script>

<template>
  <button
    type="button"
    data-cursor
    data-cursor-text="Wild card"
    class="group block aspect-[5/7] cursor-none [perspective:1200px]"
    aria-label="The wild card. Click for a little chaos."
    @mouseenter="flipped = true"
    @mouseleave="flipped = false"
    @focus="flipped = true"
    @blur="flipped = false"
    @click="unleash"
  >
    <span
      class="relative block h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d]"
      :style="{ transform: `rotateY(${flipped ? 180 : 0}deg)` }"
    >
      <span
        v-for="(side, i) in faces"
        :key="side"
        class="absolute inset-0 [backface-visibility:hidden]"
        :style="i ? { transform: 'rotateY(180deg)' } : undefined"
      >
        <svg viewBox="0 0 250 350" class="h-full w-full overflow-visible" aria-hidden="true">
          <!-- ── The Joker ── -->
          <template v-if="side === 'joker'">
            <rect x="1" y="1" width="248" height="348" rx="16" fill="#f1ece2" />
            <rect x="13" y="13" width="224" height="324" rx="9" fill="none" stroke="#5b2a86" stroke-width="1.5" />
            <rect x="18" y="18" width="214" height="314" rx="6" fill="none" stroke="#2f9e5a" stroke-width="0.8" stroke-dasharray="2 3" />
            <g v-for="rot in [0, 180]" :key="rot" :transform="`rotate(${rot} 125 175)`">
              <text x="27" y="50" font-size="27" font-weight="700" fill="#5b2a86" style="font-family: var(--font-passion)">J</text>
              <text
                v-for="(ch, k) in INDEX"
                :key="k"
                x="31"
                :y="68 + k * 12"
                font-size="10"
                fill="#2f9e5a"
                style="font-family: var(--font-mono)"
              >{{ ch }}</text>
            </g>
            <!-- Hat -->
            <path d="M86 168 C80 142 68 124 50 116 C76 116 96 130 106 150 Z" fill="#5b2a86" />
            <path d="M104 160 C104 130 114 104 125 84 C136 104 146 130 146 160 Z" fill="#2f9e5a" />
            <path d="M164 168 C170 142 182 124 200 116 C174 116 154 130 144 150 Z" fill="#5b2a86" />
            <rect x="82" y="156" width="86" height="18" rx="5" fill="#1b1026" />
            <g fill="#f1ece2"><circle cx="100" cy="165" r="2.4" /><circle cx="125" cy="165" r="2.4" /><circle cx="150" cy="165" r="2.4" /></g>
            <g fill="#e0a93f"><circle cx="49" cy="116" r="7" /><circle cx="125" cy="82" r="7" /><circle cx="201" cy="116" r="7" /></g>
            <!-- Grin -->
            <path d="M54 198 Q125 286 196 198 Q188 214 176 218 Q125 262 74 218 Q62 214 54 198 Z" fill="#b3121f" />
            <path d="M78 219 Q125 252 172 219 Q125 236 78 219 Z" fill="#f1ece2" />
            <g stroke="#b3121f" stroke-width="1.4">
              <line x1="94" y1="224" x2="95" y2="236" />
              <line x1="109" y1="228" x2="109" y2="241" />
              <line x1="125" y1="229" x2="125" y2="243" />
              <line x1="141" y1="228" x2="141" y2="241" />
              <line x1="156" y1="224" x2="155" y2="236" />
            </g>
            <text
              x="125"
              y="298"
              text-anchor="middle"
              font-size="30"
              fill="#2f9e5a"
              transform="rotate(-5 125 298)"
              style="font-family: var(--font-scrawl)"
            >HA HA HA</text>
          </template>

          <!-- ── The case file ── -->
          <template v-else>
            <rect x="1" y="1" width="248" height="348" rx="16" fill="#07090c" />
            <rect x="13" y="13" width="224" height="324" rx="9" fill="none" stroke="#e0a93f" stroke-opacity="0.35" />
            <path d="M13 60 H237 M13 290 H237" stroke="#e0a93f" stroke-opacity="0.12" />
            <circle cx="125" cy="175" r="70" fill="#e0a93f" fill-opacity="0.08" stroke="#e0a93f" stroke-opacity="0.5" />
            <g transform="translate(70 152) scale(0.46)" fill="#e0a93f">
              <path :d="BAT_HALF" />
              <path :d="BAT_HALF" :transform="BAT_MIRROR" />
            </g>
            <text x="125" y="44" text-anchor="middle" font-size="10" letter-spacing="4" fill="#e0a93f" fill-opacity="0.75" style="font-family: var(--font-mono)">CASE FILE</text>
            <text x="125" y="314" text-anchor="middle" font-size="10" letter-spacing="4" fill="#dde4ea" fill-opacity="0.5" style="font-family: var(--font-mono)">CALLSIGN — B</text>
          </template>
        </svg>
      </span>
    </span>
  </button>
</template>
