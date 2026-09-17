import { batsScene } from './scenes/bats'

/**
 * One scene, wired straight in. This used to be a registry of four
 * interchangeable backgrounds behind a dev-only picker; the picker is gone and
 * so are the other three, because a portfolio only ever ships one of them and
 * the indirection was pure carrying cost.
 */
export { batsScene }

export * from './types'
