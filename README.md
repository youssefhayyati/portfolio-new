# Youssef Hayyati — portfolio

Full-stack developer in Rabat, Morocco. Hardened back-ends, motion-led
front-ends. The site is a single long page with a Gotham grade: it is night,
light is an event, and exactly one warm colour is allowed on screen.

Nuxt 4 · Vue 3 · Tailwind CSS 4 · GSAP (ScrollTrigger, ScrollSmoother,
SplitText) · Three.js.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run preview    # serve the build
```

The dev server skips the boot screen (`isLoading` is false under
`import.meta.dev`) and mounts a fit tuner in the corner — see below.

## What is where

```
app/
  components/         one file per section, plus the effects layers
  composables/        useCowlFit, useDetective, useChaos, useSwarm, usePageMotion
  utils/
    emblem.ts         THE bat silhouette — every other bat on the site imports it
    cowlAssembly.ts   the WebGL build of the cowl in the hero
    lore.ts           every quote on the page, and where each is remixed from
  webgl/scenes/       the instanced colony behind the page
public/
  og.png             social card, generated from the site's own design language
  signal.svg         favicon: the lamp, with the mark as the hole in the light
scripts/             one-off asset jobs (cutting the cowl, removing backgrounds)
```

## The set pieces

- **The opening.** A lamp is struck at the bottom of frame, throws a beam up
  through drifting cloud, and prints the mark on it as a dark stencil — a real
  signal is a lamp with a stencil in front of it, so the bat is the part where
  the light is *missing*. Then the camera pushes through it into the hero.
- **The cowl.** 64,000 GPU grains land on a noise-warped front that climbs from
  the gorget to the horns, flaring white-hot and cooling to leather as it goes,
  then handing off to a CSS-graded plate at `p = 0.94`. Hover runs the whole
  thing backwards. See `utils/cowlAssembly.ts`; the fit itself lives in
  `useCowlFit` and is tunable live in dev (`CowlTuner`).
- **Duality.** Order and Chaos, split by a line you push with the pointer: the
  side you point at takes the room, and the copy of the losing side fades
  rather than being sliced mid-sentence.
- **Detective mode.** `D` anywhere. The page goes cold blue and every element
  carrying `data-intel` is bracketed and labelled with how it was built. It
  keeps score; finding every clue closes the case.
- **The Joker.** A wild card that flips, `HA HA HA` across the screen if you
  type `joker`, and a card that leans in from the corner if you leave the page
  alone for twenty seconds.

## Notes for future edits

- **One emblem.** `utils/emblem.ts` is the only copy of the silhouette. The nav
  lockup, the favicon, the background colony, the swarm and the cards all pull
  from it.
- **The accent is rationed.** `--color-signal` is for one live thing at a time:
  a status lamp, a single word, the cursor's contact dot. The Joker's purple and
  green are the one sanctioned exception, and only where the page is being
  deliberately chaotic.
- **Quotes are remixes.** Everything in `utils/lore.ts` is a film line with its
  back half swapped for something a developer would recognise, and each is
  labelled as remixed so nobody reads it as a misquote. The one line quoted
  straight is attributed in `MarqueeBand`.
- **Reduced motion** is honoured by the intro, the cowl, the swarm, the
  interludes, the chaos burst and the split.
- **The artwork is original.** The bat, the figures, the Joker card and the
  skyline are all drawn here rather than traced from anything.

## Still to do

- Real social URLs — GitHub, LinkedIn and X are placeholders in `Contact.vue`
  and the nav menu.
- A CV to link from the footer.
