import { useEffect, useState } from 'react'
import { C } from '../theme.js'

// A combined hub window: shows one of its windows at a time and moves to the
// next every `interval` seconds. Transition: 'fade', 'slide' or 'none'.
// Tap a dot to jump; touching the window pauses the rotation for a minute so
// you can read or tick something.
//
// All windows sit in the same grid cell, so the combined window is as tall as
// its tallest part and nothing jumps when it changes.

const PAUSE_MS = 60 * 1000

export default function Rotator({ items, interval = 10, transition = 'fade' }) {
  const [idx, setIdx] = useState(0)
  const [pausedUntil, setPausedUntil] = useState(0)
  const n = items.length

  useEffect(() => {
    if (n < 2) return undefined
    const id = setInterval(() => {
      if (Date.now() < pausedUntil) return
      setIdx((i) => (i + 1) % n)
    }, interval * 1000)
    return () => clearInterval(id)
  }, [n, interval, pausedUntil])

  const pause = () => setPausedUntil(Date.now() + PAUSE_MS)
  const cur = idx % Math.max(n, 1)

  const layer = (i) => {
    const on = i === cur
    const base = { gridArea: '1 / 1', minWidth: 0, display: 'flex', flexDirection: 'column' }
    if (transition === 'slide') {
      // Off-screen windows wait to the right; the one leaving goes left.
      const offset = i === cur ? 0 : (i - cur + n) % n === 1 ? 100 : -100
      return { ...base, transform: `translateX(${offset}%)`, transition: 'transform 600ms ease', visibility: on || Math.abs(offset) === 100 ? 'visible' : 'hidden' }
    }
    if (transition === 'none') return { ...base, visibility: on ? 'visible' : 'hidden' }
    return { ...base, opacity: on ? 1 : 0, transition: 'opacity 700ms ease', pointerEvents: on ? 'auto' : 'none' }
  }

  return (
    <div onPointerDown={pause} style={{ position: 'relative', height: '100%', display: 'grid', overflow: 'hidden', borderRadius: 28 }}>
      {items.map((el, i) => (
        <div key={i} aria-hidden={i !== cur} style={layer(i)}>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{el}</div>
        </div>
      ))}
      {n > 1 && (
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, pointerEvents: 'none' }}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show part ${i + 1} of ${n}`}
              onClick={() => { setIdx(i); pause() }}
              style={{ all: 'unset', cursor: 'pointer', pointerEvents: 'auto', padding: 6 }}
            >
              <span style={{ display: 'block', width: 10, height: 10, borderRadius: 5, background: i === cur ? C.ink : C.border }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
