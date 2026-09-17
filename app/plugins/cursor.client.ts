export default defineNuxtPlugin(() => {
    const { x, y } = useCursor()

    window.addEventListener("mousemove", (e) => {
        x.value = e.clientX
        y.value = e.clientY
    })
})