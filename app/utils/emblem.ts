/**
 * The emblem, once, for the whole site.
 *
 * The nav lockup, the favicon, the thirty bats drifting behind the page, the
 * colony that bursts out of the menu, the signal thrown on the clouds in the
 * intro and the one printed on the back of the Joker's card are all this one
 * shape. It used to be pasted into seven files, which is a promise to drift.
 *
 * Deliberately an original silhouette rather than DC's registered emblem —
 * the shape language (long swept wings, three scallops, short ears) is what
 * carries the reference; copying the actual trademark onto a portfolio would
 * be both a legal problem and, frankly, the lazier read.
 *
 * Drawn as a RIGHT HALF only and mirrored, because on a shape this familiar
 * any asymmetry reads as a mistake rather than as style. Authored in a
 * 240x100 box, wide and low, so it still resolves at 16px in a browser tab.
 */

export const BAT_VIEWBOX = '0 0 240 100'

/** Right half of the emblem, from the centre line at x = 120. */
export const BAT_HALF =
  'M120 16 L126.5 2 L132 20 C140 13 149.5 13.5 158 22 C176 8 205 6 235 13 ' +
  'C217 23 206.5 30 196 45 C190 32 181.5 34 170 50 C164 40 155 42 145.5 58 ' +
  'C139 50 130 54 126 68 L120 80 Z'

/** Flips the right half onto the left. */
export const BAT_MIRROR = 'translate(240,0) scale(-1,1)'

/** The whole emblem as markup, for the places that build HTML by hand. */
export const batSvg = (attrs = '') =>
  `<svg viewBox="${BAT_VIEWBOX}" ${attrs}><path d="${BAT_HALF}"/>` +
  `<path d="${BAT_HALF}" transform="${BAT_MIRROR}"/></svg>`
