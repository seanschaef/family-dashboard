import { useLayoutEffect, useRef, useState } from 'react'

// Text that shrinks to fit its box: starts at `max` px and steps down until it
// fits on one line (to `min`); past that it wraps onto a second line instead
// of being cut off. Re-fits when the text or the box width changes.
export default function FitText({ children, max, min = Math.round(max * 0.55), style }) {
  const ref = useRef(null)
  const [size, setSize] = useState(max)
  const [wrap, setWrap] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const fit = () => {
      el.style.whiteSpace = 'nowrap'
      let s = max
      el.style.fontSize = `${s}px`
      while (el.scrollWidth > el.clientWidth + 1 && s > min) {
        s -= 1
        el.style.fontSize = `${s}px`
      }
      const tooLong = el.scrollWidth > el.clientWidth + 1
      setSize(s)
      setWrap(tooLong)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children, max, min])

  return (
    <div ref={ref} style={{ ...style, fontSize: size, whiteSpace: wrap ? 'normal' : 'nowrap', overflow: 'hidden', minWidth: 0, width: '100%' }}>
      {children}
    </div>
  )
}
