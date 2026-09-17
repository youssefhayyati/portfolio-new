export const useCursor = () => {
    const x = useState("cursor-x", () => 0)
    const y = useState("cursor-y", () => 0)

    const hovered = useState("cursor-hover", () => false)
    const text = useState("cursor-text", () => "")
    const visible = useState("cursor-visible", () => true)

    return {
        x,
        y,
        hovered,
        text,
        visible
    }
}