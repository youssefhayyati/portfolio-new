/**
 * Shared pointer + scroll motion state, sampled once per frame and consumed by
 * the WebGL background. Kept outside Vue reactivity on purpose — these values
 * change every frame and nothing in the DOM should re-render because of them.
 */

export interface PageMotion {
  /** Smoothed pointer in NDC (-1..1, y up). */
  px: number
  py: number
  /** Raw pointer in NDC, no smoothing. */
  rx: number
  ry: number
  /** Smoothed pointer velocity in NDC units per second. */
  vx: number
  vy: number
  /** Pointer speed, roughly normalised to 0..1. */
  speed: number
  /** Page scroll progress, 0..1. */
  scroll: number
  /** Smoothed scroll velocity, roughly -1..1. */
  scrollVel: number
  /** Index of the section currently filling most of the viewport. */
  section: number
  /** Total sections found on the page. */
  sectionCount: number
  /** True while the pointer has never moved (avoids a blob parked at 0,0). */
  idle: boolean
}

const motion: PageMotion = {
  px: 0,
  py: 0,
  rx: 0,
  ry: 0,
  vx: 0,
  vy: 0,
  speed: 0,
  scroll: 0,
  scrollVel: 0,
  section: 0,
  sectionCount: 1,
  idle: true,
}

let bound = false
let lastScroll = 0
let sections: HTMLElement[] = []
let sectionScanAt = 0

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

function onPointer(e: PointerEvent | MouseEvent) {
  motion.rx = (e.clientX / window.innerWidth) * 2 - 1
  motion.ry = -((e.clientY / window.innerHeight) * 2 - 1)
  motion.idle = false
}

function onTouch(e: TouchEvent) {
  const t = e.touches[0]
  if (!t) return
  motion.rx = (t.clientX / window.innerWidth) * 2 - 1
  motion.ry = -((t.clientY / window.innerHeight) * 2 - 1)
  motion.idle = false
}

/**
 * Binds the global listeners once. Returns the mutable motion object plus a
 * `step` to be called from the render loop, and an unbind for teardown.
 */
export function usePageMotion() {
  const bind = () => {
    if (bound || typeof window === 'undefined') return
    bound = true
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
  }

  const unbind = () => {
    if (!bound) return
    bound = false
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('touchmove', onTouch)
    sections = []
  }

  /** Advance the smoothed values. `dt` in seconds. */
  const step = (dt: number) => {
    const prevX = motion.px
    const prevY = motion.py

    // Follow the pointer with a soft lag — this is what makes the object feel
    // like it has weight rather than being glued to the cursor.
    motion.px = damp(motion.px, motion.rx, 7, dt)
    motion.py = damp(motion.py, motion.ry, 7, dt)

    const instVx = dt > 0 ? (motion.px - prevX) / dt : 0
    const instVy = dt > 0 ? (motion.py - prevY) / dt : 0
    motion.vx = damp(motion.vx, instVx, 12, dt)
    motion.vy = damp(motion.vy, instVy, 12, dt)

    const rawSpeed = Math.min(Math.hypot(motion.vx, motion.vy) / 3, 1)
    motion.speed = damp(motion.speed, rawSpeed, 8, dt)

    // ScrollSmoother transforms #smooth-content instead of scrolling the
    // window, so read the transform when it is present and fall back to
    // window scroll otherwise.
    const content = document.getElementById('smooth-content')
    let y = window.scrollY
    let max = document.documentElement.scrollHeight - window.innerHeight

    if (content) {
      const t = content.style.transform
      const m = /translate3d\(\s*[^,]+,\s*(-?[\d.]+)px/.exec(t)
      if (m?.[1]) y = -parseFloat(m[1])
      max = content.scrollHeight - window.innerHeight
    }

    max = Math.max(max, 1)
    const progress = Math.min(Math.max(y / max, 0), 1)

    const instScrollVel = dt > 0 ? ((y - lastScroll) / dt) / 2000 : 0
    lastScroll = y
    motion.scrollVel = damp(
      motion.scrollVel,
      Math.max(-1, Math.min(1, instScrollVel)),
      6,
      dt,
    )
    motion.scroll = progress

    // Re-scan sections occasionally; the DOM is stable but images/fonts settle.
    const now = performance.now()
    if (now - sectionScanAt > 2000) {
      sectionScanAt = now
      sections = Array.from(
        document.querySelectorAll<HTMLElement>('#smooth-content section'),
      )
    }

    if (sections.length) {
      motion.sectionCount = sections.length
      const mid = window.innerHeight * 0.5
      let best = 0
      let bestDist = Infinity
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i]!.getBoundingClientRect()
        const d = Math.abs(r.top + r.height / 2 - mid)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      }
      motion.section = best
    }
  }

  return { motion, bind, unbind, step }
}
