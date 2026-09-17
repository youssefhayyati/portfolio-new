/**
 * Detective mode: the page seen the way he reads a crime scene. Anything
 * marked `data-intel="…"` gets bracketed and labelled with how it was built.
 * Toggled from the nav or with D; see DetectiveLayer.
 */
export function useDetective() {
  const active = useState('detective-mode', () => false)
  const toggle = () => {
    active.value = !active.value
  }
  return { active, toggle }
}
