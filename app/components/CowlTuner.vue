<template>
  <!-- Dev only. Mounted from Hero.vue behind `import.meta.dev`, so it never
       renders for a visitor. -->
  <div
    class="cowl-tuner fixed z-[100] bottom-4 left-4 font-mono text-[11px] text-white/90 select-none"
  >
    <button
      class="px-2.5 py-1.5 rounded bg-black/85 border border-white/20 backdrop-blur hover:border-white/50"
      @click="open = !open"
    >
      {{ open ? '× cowl fit' : '⚙ cowl fit' }}
    </button>

    <div
      v-if="open"
      class="mt-2 w-[290px] rounded border border-white/20 bg-black/90 backdrop-blur p-3 space-y-2.5 max-h-[80vh] overflow-y-auto"
    >
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="hold" type="checkbox" class="accent-amber-400" />
        <span>hold cowl on</span>
        <span class="text-white/40">— then drag the photo</span>
      </label>

      <div v-for="row in rows" :key="row.key" class="space-y-1">
        <div class="flex justify-between items-baseline">
          <span class="text-white/60">{{ row.key }}</span>
          <input
            v-model.number="fit[row.key]"
            type="number"
            :step="row.step"
            class="w-[72px] bg-white/10 rounded px-1.5 py-0.5 text-right tabular-nums outline-none focus:bg-white/20"
          />
        </div>
        <input
          v-model.number="fit[row.key]"
          type="range"
          :min="row.min"
          :max="row.max"
          :step="row.step"
          class="w-full accent-amber-400"
        />
      </div>

      <div class="pt-1 text-white/40 leading-relaxed">
        sky {{ sky }}px — headroom the horns need, derived from scaleY
      </div>

      <div class="flex gap-2 pt-1">
        <button
          class="flex-1 px-2 py-1.5 rounded bg-amber-400/90 text-black font-bold hover:bg-amber-300"
          @click="copy"
        >
          {{ copied ? 'copied ✓' : 'copy values' }}
        </button>
        <button
          class="px-2 py-1.5 rounded bg-white/10 hover:bg-white/20"
          @click="resetAll"
        >
          reset
        </button>
      </div>

      <!-- Readable as well as copyable: the numbers are the deliverable, and a
           textarea survives a screenshot or a paste into chat either way. -->
      <textarea
        :value="snippet"
        readonly
        rows="10"
        class="w-full bg-white/5 rounded p-2 text-[10px] leading-snug resize-none outline-none"
        @focus="($event.target as HTMLTextAreaElement).select()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CowlFit } from '~/composables/useCowlFit'

const { fit, hold, sky, reset, snippet } = useCowlFit()

const open = ref(true)
const copied = ref(false)

/** Ranges are wide enough to be useless as well as useful — the point of a
 *  tuner is to be able to overshoot and see why a value is wrong. */
const rows: { key: keyof CowlFit; min: number; max: number; step: number }[] = [
  { key: 'scaleX', min: 0.6, max: 2, step: 0.01 },
  { key: 'scaleY', min: 0.6, max: 2, step: 0.01 },
  { key: 'rotate', min: -20, max: 20, step: 0.5 },
  { key: 'nudgeX', min: -300, max: 300, step: 1 },
  { key: 'nudgeY', min: -300, max: 300, step: 1 },
  { key: 'eyeFaceX', min: 400, max: 1200, step: 1 },
  { key: 'eyeFaceY', min: 300, max: 1100, step: 1 },
  { key: 'eyeCowlX', min: 0, max: 800, step: 1 },
  { key: 'eyeCowlY', min: 300, max: 1400, step: 1 },
  { key: 'shade', min: 0, max: 1, step: 0.01 },
  { key: 'shadeFrom', min: 0, max: 100, step: 1 },
  { key: 'contrast', min: 0.6, max: 2, step: 0.01 },
  { key: 'brighten', min: 0.5, max: 2.5, step: 0.01 },
  { key: 'bodyShade', min: 0, max: 1, step: 0.01 },
  { key: 'bodyFrom', min: 0, max: 100, step: 1 },
  { key: 'suitBlur', min: 0, max: 20, step: 0.5 },
  { key: 'hemBlur', min: 0, max: 30, step: 0.5 },
  { key: 'hemFrom', min: 40, max: 100, step: 1 },
  { key: 'soften', min: 0, max: 4, step: 0.1 },
  { key: 'contact', min: 0, max: 1, step: 0.01 },
  { key: 'contactBlur', min: 0, max: 80, step: 1 },
  { key: 'grain', min: 0, max: 0.4, step: 0.01 },
]

/* ── Persist across reloads ───────────────────────────────────────────────
   A tuning session outlives the page: HMR remounts the hero on every save,
   and without this each remount would throw away the last ten minutes of
   dragging. Kept in the component rather than the composable so that nothing
   in the shipped path ever touches localStorage. */
const STORAGE_KEY = 'cowl-fit'

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) Object.assign(fit.value, JSON.parse(saved))
  } catch {
    // Private mode, blocked storage: tuning simply starts from the defaults.
  }
  watch(
    fit,
    (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      } catch {
        // As above — persistence is a convenience, never a requirement.
      }
    },
    { deep: true },
  )
})

async function copy() {
  try {
    await navigator.clipboard.writeText(snippet.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1400)
  } catch {
    // Clipboard needs a secure context; the textarea below is the fallback.
  }
}

/** Reset clears the saved session too, or the next reload resurrects it. */
function resetAll() {
  reset()
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}
</script>

<style scoped>
/* The site runs a custom cursor that hides the native one. Inside the panel
   that makes every control feel dead, so it is turned back on here. */
.cowl-tuner,
.cowl-tuner * {
  cursor: auto !important;
}

.cowl-tuner input[type='range'] {
  cursor: ew-resize !important;
}

.cowl-tuner button,
.cowl-tuner label {
  cursor: pointer !important;
}
</style>
