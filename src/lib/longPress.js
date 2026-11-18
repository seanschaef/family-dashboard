import { useRef } from 'react'

// Press and hold (default 550 ms) to trigger onLongPress. Works with touch,
// pen and mouse, including the wall's mouse-style touchscreen. A long press
// swallows the tap that would follow, so it doesn't also tick the item.
// Moving more than a few pixels cancels it (so scrolling still works).
//
//   const lp = useLongPress(() => askToRemove(item))
//   <button {...lp} onClick={...}>
export function useLongPress(onLongPress, { ms = 550 } = {}) {
  const timer = useRef(null)
  const start = useRef(null)
  const fired = useRef(false)

  const clear = () => {
    clearTimeout(timer.current)
    timer.current = null
  }

  return {
    onPointerDown(e) {
      fired.current = false
      start.current = { x: e.clientX, y: e.clientY }
      clear()
      timer.current = setTimeout(() => {
        fired.current = true
        if (navigator.vibrate) navigator.vibrate(15)
        onLongPress(e)
      }, ms)
    },
    onPointerMove(e) {
      if (!start.current || !timer.current) return
      if (Math.abs(e.clientX - start.current.x) > 8 || Math.abs(e.clientY - start.current.y) > 8) clear()
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu(e) {
      e.preventDefault() // no browser menu on a long press
    },
    onClickCapture(e) {
      if (fired.current) {
        e.stopPropagation()
        e.preventDefault()
        fired.current = false
      }
    },
  }
}
