import cowlImage from '~/assets/images/cowl-clean.png'
import portraitImage from '~/assets/images/portfolio-image.png'

/**
 * How the cowl sits on his head.
 *
 * These used to be baked into a composited PNG by a script, which meant every
 * tweak was edit, re-run, reload — and a silently stale image whenever the
 * middle step was skipped. They are reactive state applied as a CSS transform
 * now, which is what lets CowlTuner drive them from the page in dev.
 *
 * All of them are pixels in the 2000x2000 frame both source images share, so
 * they can be read straight off a 100px grid laid over either plate.
 */
export interface CowlFit {
  /** Centre of the cowl's eye opening, in cowl pixels. */
  eyeCowlX: number
  eyeCowlY: number
  /** Centre of his eye, in portrait pixels. The two are pinned together. */
  eyeFaceX: number
  eyeFaceY: number
  scaleX: number
  scaleY: number
  /** Clockwise degrees about the eye anchor. */
  rotate: number
  /** Slide off the anchor, in portrait pixels. See NUDGE_X below. */
  nudgeX: number
  nudgeY: number
  /** How far the key light falls off across the cowl, 0-1. See LIGHT below. */
  shade: number
  /** Where that falloff starts, as a % across the cowl. */
  shadeFrom: number
  /** Contrast multiplier on the cowl, matching its tonal range to his. */
  contrast: number
  /** Gain on the cowl, lifting its highlights to the scene's. */
  brighten: number
  /** How far his clothing sinks toward black in the transformed state, 0-1. */
  bodyShade: number
  /** Where that starts, as a % down the portrait. */
  bodyFrom: number
  /** Blur over his clothing, in px, dissolving the weave into the suit. */
  suitBlur: number
  /** Extra blur on the cowl's bottom edge, in px, feathering it into him. */
  hemBlur: number
  /** Where that starts, as a % down the cowl. */
  hemFrom: number
  /** Blur on the cowl, in image px, matching the portrait's focus. */
  soften: number
  /** Opacity of the shadow the cowl casts onto him, 0-1. */
  contact: number
  /** How soft that shadow is, in image px. */
  contactBlur: number
  /** Film grain over both photographs, 0-1. */
  grain: number
}

/** The frame both plates are authored in. */
export const COWL_FRAME = 2000

/**
 * Tip of the cowl's rear horn in its own frame, from clean-cowl.mjs. Needs to
 * be the whole point, not just its height, because rotation swings it: the
 * horn stands ~716px above the eye and 440px behind it, so a few degrees moves
 * it further than the sky margin would forgive.
 */
export const COWL_HORN = { x: 700, y: 36 }

/**
 * The fit. The starting values were read off a 100px grid laid over each
 * plate — nothing here was solved, because the two plates are photographs of
 * different head angles and no single transform satisfies both the eye opening
 * and the silhouette. What they are now is those measurements taken the rest
 * of the way by eye in CowlTuner, which is the only judge that matters for the
 * last few degrees. The notes below are the constraints each one is bounded
 * by, not a derivation of its value.
 *
 *   EYE_COWL / EYE_FACE is the one correspondence that has to hold: the
 *   opening spans x 200-320, y 715-790 on the cowl; his eyelid line runs
 *   x 650-790 at y ~598. An earlier value put this on his tear duct rather
 *   than his eye, which hung the whole mask ~75px forward and left his own eye
 *   against the back edge of the opening.
 *
 *   SCALE_X, NUDGE_X and ROTATE together are the length of the head, and the
 *   reason they have to cooperate is that the plates disagree about where an
 *   eye belongs: his sits ~5% of his skull's length back from the front, the
 *   cowl's opening ~16% back. Registering them exactly charges the difference
 *   to the stretch — his hair reaches 850px behind his eye against the cowl's
 *   684px, which wants scaleX 1.24+ with no rotation, and at that it reads as
 *   a long, drawn-out skull. Two things buy it back. NudgeX slides the mask
 *   rearward, putting his eye forward of the opening's centre, where a worn
 *   cowl actually holds it; and the tilt swings the cowl's back down over his
 *   nape, which covers ground a stretch would otherwise have to. With both,
 *   the scale comes back to uniform — 1.16 on each axis — so the cowl is no
 *   longer distorted at all, only moved.
 *
 *   SCALE_Y has room in one direction only. The cowl already stands 506px over
 *   its own eye against the 451px his hair needs, so going up is cheap — the
 *   sky below simply grows to match — but under ~0.90 the dome drops into his
 *   hair and spills a band of it along the upper-left edge.
 *
 *   ROTATE tips the cowl clockwise about the eye. The cowl was photographed
 *   with its head held a few degrees off his, and without this the brow line
 *   and the jaw run at a slightly different angle to the face underneath —
 *   which reads as a mask resting on him rather than pulled onto him. It
 *   pivots on the anchor, so it cannot walk the eye out of the opening.
 *
 *   LIGHT — shade, shadeFrom and contrast — is what makes the two
 *   photographs agree about where the lamp is. Measured across the head, his
 *   falls from 96 to 10 front to back, a 9.2x falloff; the cowl's only falls
 *   from 89 to 36, 2.5x. Same direction, but the cowl's back stays lit where
 *   his goes almost black, which reads as a flatter, fill-lit object sitting
 *   on a moodier one. Shade is a gradient multiplied over the cowl to steepen
 *   that falloff — at shade 1 from 0% it is a full ramp across the mask, front
 *   lit to back black. Contrast trims the cowl's own range slightly to sit
 *   under it. Both are cosmetic and both are tunable; neither moves the fit.
 *
 *   BODY is the clothing. There is a mask and no suit, so the cardigan under
 *   it stays a cardigan — and in a portrait this dark it is the one thing left
 *   reading as a Tuesday afternoon. Rather than fake a costume, his clothing
 *   is sunk toward black as the cowl arrives, which is what the reference
 *   photography does anyway: the body becomes a silhouette and the eye is left
 *   with the cowl. Multiplied rather than painted over, so the folds and the
 *   shoulder line survive instead of flattening into a cut-out.
 *
 *   SUIT_BLUR is the other half of that, and it is what actually joins the two
 *   materials. Darkening alone leaves the knit, the collar seam and the button
 *   legible — texture reads at values far below where shape does, so a nearly
 *   black cardigan is still unmistakably a cardigan. Blurring the clothing
 *   dissolves the weave into a smooth mass that carries on from the gorget,
 *   and because it is masked to his own silhouette the shoulder line stays
 *   exactly as sharp as it was. Detail goes, edge stays.
 *
 *   COHERENCE — soften, contact, contactBlur, grain — is the optics rather
 *   than the fit, and it is what is left once the geometry is right. Three
 *   things give a composite away even when nothing is misaligned: a cut-out
 *   edge sharper than the photograph it sits in, a mask that casts no shadow
 *   on the face it is resting against, and two different grain structures in
 *   one frame. Soften blurs the cowl a touch to match his focus; contact is
 *   the cowl's own silhouette, blackened, blurred and offset away from the key
 *   light, so it lands on his cheek and neck the way a real one would; grain
 *   lays a single noise field over both, which is the oldest trick in
 *   compositing and still the most effective — a shared texture reads as one
 *   exposure more convincingly than any amount of colour matching.
 *
 *   HEM is the cowl's bottom edge. Everywhere else the mask should end
 *   crisply — it is a hard object against a face — but where it runs out at
 *   the gorget it has nothing to end against, and a sharp line there reads as
 *   the join it is. Blurring only that last stretch lets it fall away into his
 *   clothing, which is the one place the two are supposed to be continuous.
 *   Held to a band so the rest of the silhouette keeps its edge.
 *
 *   NUDGE_Y has far less room than NUDGE_X, because the opening is shallower
 *   than it is long: slide the cowl *down* even 60px and the eye opening
 *   becomes a patch of cheek. Upward is the safer direction, and where the
 *   tuned value sits.
 */
export const COWL_FIT_DEFAULTS: CowlFit = {
  eyeCowlX: 258,
  eyeCowlY: 748,
  eyeFaceX: 723,
  eyeFaceY: 612,
  scaleX: 1.16,
  scaleY: 1.16,
  rotate: 14.5,
  nudgeX: 42,
  nudgeY: -30,
  shade: 0.75,
  shadeFrom: 0,
  contrast: 1.3,
  brighten: 1.4,
  bodyShade: 0.45,
  bodyFrom: 52,
  suitBlur: 2,
  hemBlur: 6,
  hemFrom: 76,
  soften: 0.6,
  contact: 0.45,
  contactBlur: 26,
  grain: 0.06,
}


export function useCowlFit() {
  const fit = useState<CowlFit>('cowl-fit', () => ({ ...COWL_FIT_DEFAULTS }))

  /**
   * Pins the transformation, freezing the cowl on while it is being tuned.
   *
   * Off by default: the cowl is now the resting state of the hero anyway, and
   * hover is what takes it *off*, so pinning it would only stop that being
   * felt. It exists so a stray pointer cannot undress him mid-adjustment.
   */
  const hold = useState<boolean>('cowl-fit-hold', () => false)

  /**
   * Room above the portrait for the horns, in portrait pixels.
   *
   * His eye sits 598px below the top of the frame and the cowl's rear horn
   * stands ~716px above its own, so at any useful scale the horns need frame
   * the portrait does not have. The masked box is grown upward by this much —
   * which is also the limit, since the mask hides anything outside it.
   *
   * Derived rather than stated so that scaling the cowl up cannot silently
   * behead it; the 40px is margin. It is capped in practice by the portrait's
   * own `mt-24`, the only space the hero wrapper's overflow will show.
   */
  const sky = computed(() => {
    const f = fit.value
    // The horn tip relative to the eye, through the same scale and rotation
    // the cowl gets, so the box tracks where the horn actually ends up rather
    // than where it would be unrotated.
    const hx = (COWL_HORN.x - f.eyeCowlX) * f.scaleX
    const hy = (COWL_HORN.y - f.eyeCowlY) * f.scaleY
    const rad = (f.rotate * Math.PI) / 180
    const top = hx * Math.sin(rad) + hy * Math.cos(rad)
    return Math.max(0, Math.ceil(-top - f.eyeFaceY) + 40)
  })

  /**
   * The fit as a style. Scale about the cowl's own eye, then carry that eye
   * onto his: transform-origin does the first, the translate the second, and
   * because CSS applies the list right to left the scale happens first and the
   * origin stays put through it.
   *
   * Percentages resolve against the element, which is exactly the portrait's
   * frame, so 1% is 20 portrait pixels at any screen size — the numbers stay
   * in the units they were measured in.
   */
  const cowlStyle = computed(() => {
    const f = fit.value
    const pct = (px: number) => (px / COWL_FRAME) * 100
    return {
      height: `${(COWL_FRAME / (COWL_FRAME + sky.value)) * 100}%`,
      transformOrigin: `${pct(f.eyeCowlX)}% ${pct(f.eyeCowlY)}%`,
      // Right to left: scale, then rotate, then carry the anchor onto his eye.
      // Rotation shares the origin with the scale, so it pivots on the eye and
      // cannot walk the registration off.
      transform:
        `translate(${pct(f.eyeFaceX + f.nudgeX - f.eyeCowlX)}%, ` +
        `${pct(f.eyeFaceY + f.nudgeY - f.eyeCowlY)}%) ` +
        `rotate(${f.rotate}deg) ` +
        `scale(${f.scaleX}, ${f.scaleY})`,
    }
  })

  /**
   * The key light, as a gradient multiplied over the cowl.
   *
   * Masked by the cowl's own image so it only darkens the mask and never hazes
   * the empty frame around it, and counter-rotated by the fit's own angle so
   * the light stays put in the page while the cowl tips under it — a lamp that
   * rotated with the object would give the game away immediately.
   */
  const shadeStyle = computed(() => {
    const f = fit.value
    const url = `url("${cowlImage}")`
    return {
      backgroundImage:
        `linear-gradient(${90 - f.rotate}deg, ` +
        `rgba(0,0,0,0) ${f.shadeFrom}%, rgba(0,0,0,${f.shade}) 100%)`,
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
    }
  })

  /**
   * His clothing, blurred: the same photograph over itself, softened, clipped
   * to the band below bodyFrom and to his own outline.
   *
   * Two mask layers intersected rather than one. The gradient alone would let
   * the blur bleed past his shoulder into the frame — blur spreads alpha, and
   * the halo it leaves is exactly the ghosting that gives a composite away —
   * while his silhouette alone would soften him head to foot.
   */
  const suitStyle = computed(() => {
    const f = fit.value
    const url = `url("${portraitImage}")`
    const band = `linear-gradient(180deg, rgba(0,0,0,0) ${f.bodyFrom}%, rgba(0,0,0,1) ${Math.min(100, f.bodyFrom + 14)}%)`
    return {
      backgroundImage: url,
      backgroundSize: '100% 100%',
      filter: `blur(${f.suitBlur}px)`,
      WebkitMaskImage: `${band}, ${url}`,
      maskImage: `${band}, ${url}`,
      WebkitMaskSize: '100% 100%, 100% 100%',
      maskSize: '100% 100%, 100% 100%',
      WebkitMaskComposite: 'source-in',
      maskComposite: 'intersect',
    }
  })

  /**
   * The clothing shade: black from bodyFrom down, masked to his own silhouette
   * so it never darkens the frame around him. Its opacity is driven by the
   * transformation, not set here — at rest the cardigan is simply a cardigan.
   */
  const bodyStyle = computed(() => {
    const f = fit.value
    const url = `url("${portraitImage}")`
    return {
      backgroundImage:
        `linear-gradient(180deg, rgba(0,0,0,0) ${f.bodyFrom}%, ` +
        `rgba(0,0,0,${f.bodyShade}) 100%)`,
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
    }
  })

  /**
   * The shadow the cowl casts onto him: its own silhouette, blackened and
   * blurred, offset down and back — away from a key light that comes from the
   * front. Normal blending, not multiply: it has to darken the portrait, which
   * is outside this layer's stacking context, and a blend mode would be
   * trapped inside it.
   */
  const contactStyle = computed(() => {
    const f = fit.value
    return {
      filter: `brightness(0) blur(${f.contactBlur}px)`,
      opacity: String(f.contact),
      transform: `translate(${(f.contactBlur * 0.55).toFixed(1)}px, ${(f.contactBlur * 0.7).toFixed(1)}px)`,
    }
  })

  /** Both plates go monochrome; the cowl also gets its range matched to his,
   *  plus a touch of blur so its edge is no sharper than the photograph. */
  const cowlFilter = computed(
    () =>
      `grayscale(1) brightness(${fit.value.brighten}) ` +
      `contrast(${fit.value.contrast}) blur(${fit.value.soften}px)`,
  )

  /**
   * The cowl's hem: the same plate again, blurred, showing only in a band at
   * its bottom. Drawn over the sharp one, so within the band it replaces it and
   * the change is gradual rather than a second edge of its own.
   */
  const hemStyle = computed(() => {
    const f = fit.value
    const band = `linear-gradient(180deg, rgba(0,0,0,0) ${f.hemFrom}%, rgba(0,0,0,1) 100%)`
    return {
      filter: `grayscale(1) brightness(${f.brighten}) contrast(${f.contrast}) blur(${f.soften + f.hemBlur}px)`,
      WebkitMaskImage: band,
      maskImage: band,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
    }
  })

  /**
   * One grain field over both photographs. Static fractal noise, overlaid —
   * fine enough to read as film rather than as dirt, and applied above both so
   * neither can look cleaner than the other.
   */
  const grainStyle = computed(() => ({
    opacity: String(fit.value.grain),
  }))

  const reset = () => {
    fit.value = { ...COWL_FIT_DEFAULTS }
  }

  /** The current fit written as the defaults block, ready to paste back. */
  const snippet = computed(() => {
    const f = fit.value
    const n = (v: number) => (Number.isInteger(v) ? v : +v.toFixed(3))
    return `export const COWL_FIT_DEFAULTS: CowlFit = {
  eyeCowlX: ${n(f.eyeCowlX)},
  eyeCowlY: ${n(f.eyeCowlY)},
  eyeFaceX: ${n(f.eyeFaceX)},
  eyeFaceY: ${n(f.eyeFaceY)},
  scaleX: ${n(f.scaleX)},
  scaleY: ${n(f.scaleY)},
  rotate: ${n(f.rotate)},
  nudgeX: ${n(f.nudgeX)},
  nudgeY: ${n(f.nudgeY)},
  shade: ${n(f.shade)},
  shadeFrom: ${n(f.shadeFrom)},
  contrast: ${n(f.contrast)},
  brighten: ${n(f.brighten)},
  bodyShade: ${n(f.bodyShade)},
  bodyFrom: ${n(f.bodyFrom)},
  suitBlur: ${n(f.suitBlur)},
  hemBlur: ${n(f.hemBlur)},
  hemFrom: ${n(f.hemFrom)},
  soften: ${n(f.soften)},
  contact: ${n(f.contact)},
  contactBlur: ${n(f.contactBlur)},
  grain: ${n(f.grain)},
}`
  })

  return {
    fit,
    hold,
    sky,
    cowlStyle,
    shadeStyle,
    bodyStyle,
    suitStyle,
    contactStyle,
    hemStyle,
    grainStyle,
    cowlFilter,
    reset,
    snippet,
  }
}
