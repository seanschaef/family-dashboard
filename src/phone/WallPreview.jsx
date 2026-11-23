import { useEffect, useRef, useState } from 'react'
import { C } from '../theme.js'

const WALL_W = 1080
const WALL_H = 1920

// The real wall page, scaled to fit: Layout's "Live view". The iframe is
// same-origin, so it renders with the signed-in session and live data.
// Pointer events are off so it stays a clean preview.
export function LiveWall({ src }) {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const scale = w ? w / WALL_W : 0
  return (
    <div ref={ref} style={{ width: '100%', height: scale ? WALL_H * scale : 0, position: 'relative', borderRadius: 18, overflow: 'hidden', border: `3px solid ${C.ink}`, background: C.cream }}>
      {scale > 0 && (
        <iframe key={src} title="Live view of the wall" src={src} style={{ width: WALL_W, height: WALL_H, border: 'none', transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }} />
      )}
    </div>
  )
}
