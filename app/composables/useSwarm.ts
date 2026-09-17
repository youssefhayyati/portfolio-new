/**
 * Releases a colony across the screen (see BatSwarm). Anything can call it —
 * a section arriving, a click on the mark, a case being closed — with the
 * viewport point the bats should burst from and the way they should head.
 */
export interface SwarmRelease {
  /** Viewport coordinates of the burst. */
  x: number
  y: number
  /** Heading in radians; -π/2 is straight up. */
  dir?: number
  /** How wide the colony fans out around that heading, in radians. */
  spread?: number
}

export function useSwarm() {
  const last = useState<(SwarmRelease & { id: number }) | null>('bat-swarm', () => null)
  const release = (r: SwarmRelease) => {
    last.value = { ...r, id: (last.value?.id ?? 0) + 1 }
  }
  return { last, release }
}
