/**
 * The Joker's button. Anything can pull it — the wild card, typing "joker" —
 * and ChaosLayer answers by laughing across the screen for a couple of seconds.
 *
 * A counter rather than a boolean, so pulling it twice in a row laughs twice
 * instead of being swallowed by a flag that is still set.
 */
export function useChaos() {
  const bursts = useState('chaos-bursts', () => 0)
  const unleash = () => {
    bursts.value++
  }
  return { bursts, unleash }
}
