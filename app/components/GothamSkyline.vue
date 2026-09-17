<script setup lang="ts">
import { BAT_HALF, BAT_MIRROR } from '~/utils/emblem'
/**
 * The city at the bottom of the page, with him on the tallest roof and the
 * signal up over it.
 *
 * Generated rather than drawn, from a fixed seed, so the server and the client
 * build the same skyline to the pixel — no hydration mismatch, no asset — and
 * changing SEED is all it takes to get a different city. Two depths: a hazy
 * back row that carries the gothic spires, and a black front row with the odd
 * lit window. Windows are one path, not hundreds of rects.
 *
 * Two knobs, because the footer and the intro want different cities:
 *  - `signal`: draw the lamp and what it throws. The intro lights its own
 *    signal over the top, so there it asks for the city alone.
 *  - `tone`: `auto` follows the page theme; `night` is fixed dark, for use
 *    inside something that is dark in both themes (the intro curtain).
 */
const props = withDefaults(
  defineProps<{ signal?: boolean; tone?: 'auto' | 'night' }>(),
  { signal: true, tone: 'auto' },
)

const night = computed(() => props.tone === 'night')
const backFill = computed(() => (night.value ? 'fill-[#0b111c]' : 'fill-[#a9abb0] dark:fill-[#10151c]'))
const frontFill = computed(() => (night.value ? 'fill-[#01030a]' : 'fill-[#3e4246] dark:fill-[#020305]'))
const frontInk = computed(() => (night.value ? 'text-[#01030a]' : 'text-[#3e4246] dark:text-[#020305]'))
const W = 1440
const H = 360
const SEED = 11

/** The tower he stands on. Drawn last so nothing overlaps the ledge. */
const TOWER = { x: 1000, w: 76, top: 170 }
/** Where the lamp sits, and where it throws the mark. */
const LAMP = { x: 560, y: 262 }
const SIGNAL = { x: 470, y: 72 }

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (v: number) => v.toFixed(1)

function row(rand: () => number, hMin: number, hMax: number, wMin: number, wMax: number, windows?: string[]) {
  let d = ''
  let x = -20
  while (x < W + 20) {
    const w = wMin + rand() * (wMax - wMin)
    const h = hMin + rand() * (hMax - hMin)
    const top = H - h
    const kind = rand()
    d += `M${f(x)} ${H}V${f(top)}`
    if (kind < 0.18) {
      // Gothic spire
      d += `H${f(x + w * 0.2)}L${f(x + w * 0.5)} ${f(top - h * 0.45)}L${f(x + w * 0.8)} ${f(top)}H${f(x + w)}`
    } else if (kind < 0.36) {
      // Stepped deco crown
      const s = w / 5
      d += `H${f(x + s)}V${f(top - 10)}H${f(x + 2 * s)}V${f(top - 22)}H${f(x + 3 * s)}V${f(top - 10)}H${f(x + 4 * s)}V${f(top)}H${f(x + w)}`
    } else if (kind < 0.5) {
      // Antenna
      const ax = x + w * (0.3 + rand() * 0.4)
      d += `H${f(ax - 1)}V${f(top - 30 - rand() * 30)}H${f(ax + 1)}V${f(top)}H${f(x + w)}`
    } else if (kind < 0.6) {
      // Water tank
      const tx = x + w * 0.25
      d += `H${f(tx)}V${f(top - 6)}H${f(tx + 3)}V${f(top - 18)}L${f(tx + 9)} ${f(top - 24)}L${f(tx + 15)} ${f(top - 18)}V${f(top - 6)}H${f(tx + 18)}V${f(top)}H${f(x + w)}`
    } else {
      d += `H${f(x + w)}`
    }
    d += `V${H}Z`
    if (windows) {
      for (let wy = top + 8; wy < H - 6; wy += 9) {
        for (let wx = x + 5; wx < x + w - 6; wx += 8) {
          if (rand() < 0.06) windows.push(`M${f(wx)} ${f(wy)}h3v4h-3z`)
        }
      }
    }
    x += w + (rand() < 0.3 ? rand() * 8 : 0)
  }
  return d
}

const rand = mulberry32(SEED)
const lit: string[] = []
const back = row(rand, 90, 230, 40, 90)
const front = row(rand, 40, 150, 30, 80, lit)
const windows = lit.join('')
const tower =
  `M${TOWER.x} ${H}V${TOWER.top + 16}H${TOWER.x + 16}V${TOWER.top}H${TOWER.x + TOWER.w - 16}` +
  `V${TOWER.top + 16}H${TOWER.x + TOWER.w}V${H}Z`


const PERCH_W = 104

/** Flight lines for the bats over the city: start, end, timing. */
const SKY_BATS = [
  { '--from': '180px, 150px', '--to': '1500px, 40px', animationDuration: '19s', animationDelay: '-4s' },
  { '--from': '-80px, 90px', '--to': '1300px, 170px', animationDuration: '26s', animationDelay: '-15s' },
  { '--from': '700px, 200px', '--to': '1560px, -20px', animationDuration: '16s', animationDelay: '-9s' },
]

// The beam: a cone from the lamp to either side of the disc.
const beam = `M${LAMP.x - 4} ${LAMP.y}L${SIGNAL.x - 92} ${SIGNAL.y + 8}L${SIGNAL.x + 92} ${SIGNAL.y - 8}L${LAMP.x + 4} ${LAMP.y}Z`
</script>

<template>
  <svg
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="xMidYMax slice"
    class="block w-full overflow-visible"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="gotham-beam" :x1="LAMP.x" :y1="LAMP.y" :x2="SIGNAL.x" :y2="SIGNAL.y" gradientUnits="userSpaceOnUse">
        <stop offset="0" style="stop-color: var(--color-signal); stop-opacity: 0.4" />
        <stop offset="1" style="stop-color: var(--color-signal); stop-opacity: 0.05" />
      </linearGradient>
      <radialGradient id="gotham-haze">
        <stop offset="0" style="stop-color: var(--color-signal); stop-opacity: 0.14" />
        <stop offset="1" style="stop-color: var(--color-signal); stop-opacity: 0" />
      </radialGradient>
      <radialGradient id="gotham-disc">
        <stop offset="0" style="stop-color: var(--color-signal); stop-opacity: 0.55" />
        <stop offset="0.7" style="stop-color: var(--color-signal); stop-opacity: 0.18" />
        <stop offset="1" style="stop-color: var(--color-signal); stop-opacity: 0" />
      </radialGradient>
    </defs>

    <!-- The signal, on the underside of the cloud. -->
    <g v-if="signal" class="gotham-signal">
      <path :d="beam" fill="url(#gotham-beam)" />
      <ellipse :cx="SIGNAL.x" :cy="SIGNAL.y" rx="100" ry="46" fill="url(#gotham-disc)" />
      <g :transform="`translate(${SIGNAL.x - 60} ${SIGNAL.y - 24}) scale(0.5)`" class="fill-bg">
        <path :d="BAT_HALF" />
        <path :d="BAT_HALF" :transform="BAT_MIRROR" />
      </g>
    </g>

    <path :d="back" :class="backFill" />
    <path :d="front" :class="frontFill" />
    <path :d="windows" class="fill-signal" :class="night ? 'opacity-40' : 'opacity-50 dark:opacity-35'" />

    <!-- The lamp itself, on a roof of its own so it never hangs in the air. -->
    <path
      v-if="signal"
      :d="`M${LAMP.x - 34} ${H}V${LAMP.y + 10}H${LAMP.x + 34}V${H}Z M${LAMP.x - 9} ${LAMP.y + 10}h18l-4 -12h-10z`"
      :class="frontFill"
    />

    <!-- Haze off the city behind the tower, so the figure on it reads as a
         silhouette instead of a dark shape on a dark sky. -->
    <ellipse :cx="TOWER.x + TOWER.w / 2" :cy="TOWER.top - 6" rx="150" ry="96" fill="url(#gotham-haze)" />
    <path :d="tower" :class="frontFill" />
    <!-- On his gargoyle at the top of it. The ledge in the drawing sits at
         158/196 of its height, which is what lands it on the roof line. -->
    <BatFigure
      pose="perch"
      :x="TOWER.x + TOWER.w / 2 - PERCH_W / 2"
      :y="TOWER.top - PERCH_W * (158 / 200)"
      :width="PERCH_W"
      :height="PERCH_W * (196 / 200)"
      :class="frontInk"
    />

    <!-- A few of his neighbours, out over the city. -->
    <g v-for="(b, i) in SKY_BATS" :key="i" class="sky-bat" :style="b">
      <g class="sky-bat-wings" :class="frontFill">
        <path :d="BAT_HALF" transform="scale(0.08)" />
        <path :d="BAT_HALF" transform="scale(0.08) translate(240,0) scale(-1,1)" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.sky-bat {
  animation: sky-bat linear infinite;
}

.sky-bat-wings {
  transform-box: fill-box;
  transform-origin: center;
  animation: sky-flap 0.18s ease-in-out infinite alternate;
}

@keyframes sky-bat {
  from {
    transform: translate(var(--from));
  }
  to {
    transform: translate(var(--to));
  }
}

@keyframes sky-flap {
  to {
    transform: scale(0.35, 1.1);
  }
}

/* The lamp is never perfectly steady. */
.gotham-signal {
  animation: signal-breathe 4.2s ease-in-out infinite;
}
</style>
