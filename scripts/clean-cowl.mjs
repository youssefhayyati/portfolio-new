/**
 * Cleans `Untitled-1.png` (the raw cowl cutout) into `cowl-clean.png`.
 *
 * This is the only part of the cowl pipeline that is still baked, and the
 * reason is that it has no look to it: it repairs the cutout, and there is
 * exactly one correct answer. How the cowl is *fitted* to him — anchor, scale,
 * nudge — used to be baked into the same artifact, which meant every tweak was
 * edit, re-run, reload, and a stale PNG if you forgot the middle step. Those
 * numbers now live in Hero.vue and are applied as a CSS transform, so they
 * hot-reload as you type them. Nothing here needs re-running to change the fit.
 *
 * Run it only when the cutout itself is replaced:
 *
 *   node scripts/clean-cowl.mjs
 *
 * Needs playwright-core + Edge, already a devDependency, used purely as a
 * canvas/PNG codec so the project gains no image library.
 */
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

const COWL = path.resolve('app/assets/images/Untitled-1.png')
const OUTPUT = path.resolve('app/assets/images/cowl-clean.png')

/**
 * Connected alpha blobs smaller than this are dropped.
 *
 * The cutout carries scattered crumbs from a rough selection; left in, they
 * composite as dirt floating around his head. The cowl itself is one enormous
 * component, so the gap between signal and noise is vast and this is safe.
 */
const MIN_BLOB_AREA = 3000

/**
 * Pixels of alpha erosion applied to the cowl.
 *
 * The cutout's outermost ring is semi-transparent and carries colour from
 * whatever was behind it originally — a pale lavender fringe that reads as a
 * halo once the cowl sits against his dark hair. Shrinking the silhouette by a
 * couple of pixels removes that ring; at 2000px wide it costs nothing visible.
 */
const ERODE_PX = 2

/** Alpha above this counts as part of the cowl. */
const ALPHA_HIT = 32

const cowlUrl = 'data:image/png;base64,' + readFileSync(COWL).toString('base64')

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
await page.setContent('<body></body>')

const result = await page.evaluate(
  async ({ cowlUrl, MIN_BLOB_AREA, ERODE_PX, ALPHA_HIT }) => {
    const load = (src) =>
      new Promise((r) => {
        const i = new Image()
        i.onload = () => r(i)
        i.src = src
      })

    const cowl = await load(cowlUrl)

    const w = cowl.width
    const h = cowl.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const c = canvas.getContext('2d', { willReadFrequently: true })
    c.drawImage(cowl, 0, 0)

    const img = c.getImageData(0, 0, w, h)
    const d = img.data

    // ── 1. Keep only large connected blobs ──
    const seen = new Uint8Array(w * h)
    let removed = 0
    let kept = 0

    for (let start = 0; start < w * h; start++) {
      if (seen[start] || d[start * 4 + 3] <= ALPHA_HIT) continue

      // Flood the blob, recording it so it can be erased if it turns out small.
      const blob = []
      const stack = [start]
      seen[start] = 1
      while (stack.length) {
        const p = stack.pop()
        blob.push(p)
        const x = p % w
        const y = (p - x) / w
        const tryPush = (nx, ny) => {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) return
          const q = ny * w + nx
          if (seen[q] || d[q * 4 + 3] <= ALPHA_HIT) return
          seen[q] = 1
          stack.push(q)
        }
        tryPush(x - 1, y)
        tryPush(x + 1, y)
        tryPush(x, y - 1)
        tryPush(x, y + 1)
      }

      if (blob.length < MIN_BLOB_AREA) {
        for (const p of blob) d[p * 4 + 3] = 0
        removed++
      } else {
        kept++
      }
    }

    // ── 2. Erode the alpha to drop the fringe ring ──
    // Separable minimum filter: min across each row, then down each column.
    if (ERODE_PX > 0) {
      const a = new Uint8ClampedArray(w * h)
      for (let p = 0; p < w * h; p++) a[p] = d[p * 4 + 3]

      const rowMin = new Uint8ClampedArray(w * h)
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          let m = 255
          for (let k = -ERODE_PX; k <= ERODE_PX; k++) {
            const xx = x + k
            if (xx < 0 || xx >= w) continue
            const v = a[y * w + xx]
            if (v < m) m = v
          }
          rowMin[y * w + x] = m
        }

      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          let m = 255
          for (let k = -ERODE_PX; k <= ERODE_PX; k++) {
            const yy = y + k
            if (yy < 0 || yy >= h) continue
            const v = rowMin[yy * w + x]
            if (v < m) m = v
          }
          d[(y * w + x) * 4 + 3] = m
        }
    }

    c.putImageData(img, 0, 0)

    // ── 3. Report the landmarks Hero.vue's fit is written against ──
    // The eye opening and the horn tip are what the anchor and the sky
    // allowance are measured from, so they are printed here: replace the
    // cutout and these are the numbers to carry across.
    let top = -1
    let left = 2000
    let right = -1
    for (let y = 0; y < h && top < 0; y++)
      for (let x = 0; x < w; x++)
        if (d[(y * w + x) * 4 + 3] > 128) { top = y; break }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (d[(y * w + x) * 4 + 3] > 128) {
          if (x < left) left = x
          if (x > right) right = x
        }

    return { png: canvas.toDataURL('image/png'), size: [w, h], kept, removed, top, left, right }
  },
  { cowlUrl, MIN_BLOB_AREA, ERODE_PX, ALPHA_HIT },
)

writeFileSync(OUTPUT, Buffer.from(result.png.split(',')[1], 'base64'))
console.log(`Wrote ${OUTPUT}`)
console.log(`  ${result.size[0]}x${result.size[1]}, blobs kept ${result.kept}, speckles removed ${result.removed}`)
console.log(`  silhouette: top y=${result.top}, x ${result.left}..${result.right}`)
console.log(`  fit lives in app/components/Hero.vue — nothing to re-run for it`)

await browser.close()
