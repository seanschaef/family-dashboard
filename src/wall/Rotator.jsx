import { useEffect, useState } from 'react'
import { C } from '../theme.js'

// A combined window: shows one of its windows at a time and moves to the
// next every `interval` seconds (0 = manual: it only changes when someone
// swipes or taps a dot). Transition: 'fade', 'slide' or 'none'.
// Swipe sideways to change; tap a dot to jump. Touching the window pauses
// the rotation for a minute so you can read or tick something.
//
// All windows sit in the same grid cell, so the combined window is as tall as
// its tallest part and nothing jumps when it changes.

const PAUSE_MS = 60 * 1000

export default function Rotator({ items, interval = 10, transition = 'fade' }) {
  const [state, setState] = useState({ cur: 0, prev: null, dir: 1 })
  const [pausedUntil, setPausedUntil] = useState(0)
  const n = items.length
  const cur = state.cur % Math.max(n, 1)

  const show = (next, dir) => setState((s) => (next === s.cur ? s : { cur: next, prev: s.cur, dir }))
  const go = (dir) => show((cur + dir + n) % n, dir)
  const pause = () => setPausedUntil(Date.now() + PAUSE_MS)

  useEffect(() => {
    if (n < 2 || !interval) return undefined
    const id = setInterval(() => {
      if (Date.now() < pausedUntil) return
      setState((s) => ({ cur: (s.cur + 1) % n, prev: s.cur, dir: 1 }))
    }, interval * 1000)
    return () => clearInterval(id)
  }, [n, interval, pausedUntil])

  // Swipe sideways to change (a clear horizontal swipe, so vertical
  // scrolling inside a window still works). A calendar inside handles its
  // own swipes (previous/next week) and they don't reach here.
  const [start, setStart] = useState(null)
  const down = (e) => {
    pause()
    setStart({ x: e.clientX, y: e.clientY })
  }
  const up = (e) => {
    if (!start || n < 2) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    setStart(null)
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  }

  const layer = (i) => {
    const on = i === cur
    const base = { gridArea: '1 / 1', minWidth: 0, display: 'flex', flexDirection: 'column' }
    if (transition === 'slide') {
      // The new window comes in from the side you swiped towards; the old one
      // leaves the other way. The rest wait, hidden, on the incoming side.
      const leaving = i === state.prev
      const offset = leaving ? -100 * state.dir : 100 * state.dir
      // The window on show has no transform at all (not even translateX(0)):
      // a transform would trap its pop-ups inside the window instead of the
      // middle of the screen.
      return { ...base, transform: on ? 'none' : `translateX(${offset}%)`, transition: on || leaving ? 'transform 500ms ease' : 'none', visibility: on || leaving ? 'visible' : 'hidden' }
    }
    if (transition === 'none') return { ...base, visibility: on ? 'visible' : 'hidden' }
    return { ...base, opacity: on ? 1 : 0, transition: 'opacity 700ms ease', pointerEvents: on ? 'auto' : 'none' }
  }

  return (
    <div onPointerDown={down} onPointerUp={up} onPointerCancel={() => setStart(null)} style={{ position: 'relative', height: '100%', display: 'grid', overflow: 'hidden', borderRadius: 28 }}>
      {items.map((el, i) => (
        <div key={i} aria-hidden={i !== cur} style={layer(i)}>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{el}</div>
        </div>
      ))}
      {n > 1 && (
        // Small page dots: the current one is a longer pill. Each has a
        // finger-sized tap area, but only the dot itself is drawn.
        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show part ${i + 1} of ${n}`}
              onClick={() => {
                show(i, i > cur ? 1 : -1)
                pause()
              }}
              style={{ all: 'unset', cursor: 'pointer', pointerEvents: 'auto', padding: '10px 6px', display: 'flex', alignItems: 'center' }}
            >
              <span style={{ display: 'block', width: i === cur ? 26 : 10, height: 10, borderRadius: 5, background: i === cur ? C.ink : C.border, opacity: i === cur ? 0.7 : 1, transition: 'width 300ms ease' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
