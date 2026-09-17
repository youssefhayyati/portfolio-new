import type * as THREE from 'three'
import type { PageMotion } from '~/composables/usePageMotion'

export interface SceneContext {
  renderer: THREE.WebGLRenderer
  /** CSS pixel size of the canvas. */
  width: number
  height: number
  /** Device pixel ratio actually in use (already clamped). */
  dpr: number
  dark: boolean
}

export interface FrameState extends SceneContext {
  motion: PageMotion
  /** Seconds since the scene started. */
  time: number
  /** Seconds since the previous frame, clamped. */
  dt: number
}

export interface SceneInstance {
  /** Advance simulation and draw. The host clears nothing — scenes own it. */
  render(state: FrameState): void
  resize(ctx: SceneContext): void
  setTheme(dark: boolean): void
  dispose(): void
  /**
   * Max device pixel ratio this scene wants. Heavier scenes ask for less.
   */
  maxDpr?: number
}

export interface SceneFactory {
  id: string
  label: string
  blurb: string
  create(ctx: SceneContext): SceneInstance
}

/* ── Palette ─────────────────────────────────────────────────────────────
   Mirrors the tokens in assets/css/main.css so the WebGL layer stays in
   step with the rest of the site instead of inventing its own colours. */

export interface Palette {
  /** Base tint the scene sits on. */
  bg: [number, number, number]
  /**
   * The body colour of whatever the scene draws. For the bats this is the
   * silhouette tone on the light theme; the dark theme lifts its own, since
   * there the shapes have to sit *above* the background rather than below it.
   */
  core: [number, number, number]
}

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
]

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: hex('#C5C3C6'),
    core: hex('#46494C'),
  },
  dark: {
    bg: hex('#08090b'),
    core: hex('#0e131a'),
  },
}

export const paletteFor = (dark: boolean) => palettes[dark ? 'dark' : 'light']
