import { useEffect, useRef, useState } from 'react'
import { C, card } from '../theme.js'
import { useFamilyTable, insertRow, updateRow } from '../lib/db.js'
import { useMembers } from '../lib/members.jsx'
import { isSupabaseConfigured } from '../lib/supabase.js'

// A shared drawing board: draw with a finger on the wall (or on a phone) and
// it shows everywhere the Ink window is. One board per family, stored as
// strokes in ink_boards (x and y from 0 to 1, so it scales to any size).
// The board keeps every stroke until someone taps Clear (twice).

const MAX_STROKES = 400
const EMPTY = []
const MIN_STEP = 0.003 // skip points closer than this (keeps strokes small)

// Theme colours are CSS variables (they flip in dark mode); canvas needs the
// real colour, looked up at draw time so ink stays readable in either theme.
function resolve(c, el) {
  if (!c || !c.startsWith('var(')) return c
  const name = c.slice(4, -1).split(',')[0].trim()
  return getComputedStyle(el).getPropertyValue(name).trim() || '#2B2420'
}

function draw(ctx, strokes, w, h) {
  ctx.clearRect(0, 0, w, h)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of strokes) {
    const p = s.p || []
    if (!p.length) continue
    const color = resolve(s.c, ctx.canvas)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = s.w * w
    if (p.length === 1) {
      ctx.beginPath()
      ctx.arc(p[0][0] * w, p[0][1] * h, (s.w * w) / 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }
    ctx.beginPath()
    ctx.moveTo(p[0][0] * w, p[0][1] * h)
    for (let i = 1; i < p.length - 1; i++) {
      // Smooth through midpoints.
      const mx = ((p[i][0] + p[i + 1][0]) / 2) * w
      const my = ((p[i][1] + p[i + 1][1]) / 2) * h
      ctx.quadraticCurveTo(p[i][0] * w, p[i][1] * h, mx, my)
    }
    const last = p[p.length - 1]
    ctx.lineTo(last[0] * w, last[1] * h)
    ctx.stroke()
  }
}

export default function InkBoard({ title = 'Ink', big = false }) {
  const { members, me } = useMembers()
  const { rows } = useFamilyTable('ink_boards')
  const board = rows[0] || null
  const [local, setLocal] = useState(null) // strokes not yet confirmed by the server
  const strokes = local ?? board?.strokes ?? EMPTY

  const colors = [C.ink, ...members.map((m) => m.color), '#2E8B57', '#D9A441'].filter((c, i, a) => c && a.indexOf(c) === i).slice(0, 7)
  const [color, setColor] = useState(null)
  const [thick, setThick] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [tools, setTools] = useState(false) // pen tools tucked away until tapped
  const pen = color || colors[0]

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const sizeRef = useRef({ w: 1, h: 1 })
  const liveRef = useRef(null) // the stroke being drawn
  const strokesRef = useRef(strokes)
  strokesRef.current = strokes

  // Keep the canvas sized to its box (sharp on high-DPI screens).
  useEffect(() => {
    const el = wrapRef.current
    const cv = canvasRef.current
    if (!el || !cv) return undefined
    const ro = new ResizeObserver(([e]) => {
      const w = Math.max(1, e.contentRect.width)
      const h = Math.max(1, e.contentRect.height)
      const dpr = window.devicePixelRatio || 1
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      cv.style.width = `${w}px`
      cv.style.height = `${h}px`
      sizeRef.current = { w, h }
      const ctx = cv.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(ctx, liveRef.current ? [...strokesRef.current, liveRef.current] : strokesRef.current, w, h)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Redraw whenever the saved strokes change (another screen drew, or Clear).
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const { w, h } = sizeRef.current
    draw(cv.getContext('2d'), liveRef.current ? [...strokes, liveRef.current] : strokes, w, h)
  }, [strokes])

  // Once the server copy catches up with what we drew, drop the local copy.
  useEffect(() => {
    if (local && board && JSON.stringify(board.strokes) === JSON.stringify(local)) setLocal(null)
  }, [board, local])

  async function save(next) {
    setLocal(next)
    if (!isSupabaseConfigured) return
    try {
      if (board) await updateRow('ink_boards', board.id, { strokes: next, updated_by: me?.key || null, updated_at: new Date().toISOString() })
      else await insertRow('ink_boards', { strokes: next, updated_by: me?.key || null })
    } catch {
      /* stays drawn locally; the next stroke tries again */
    }
  }

  const point = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]
  }

  // Drawing never counts as a swipe for a combined window around this one.
  const handlers = {
    onPointerDown(e) {
      e.stopPropagation()
      e.preventDefault()
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      setConfirmClear(false)
      setTools(false)
      const width = (thick ? 0.018 : 0.007) * (big ? 0.7 : 1)
      liveRef.current = { c: pen, w: width, p: [point(e)] }
      const { w, h } = sizeRef.current
      draw(canvasRef.current.getContext('2d'), [...strokesRef.current, liveRef.current], w, h)
    },
    onPointerMove(e) {
      const s = liveRef.current
      if (!s) return
      e.stopPropagation()
      const pt = point(e)
      const last = s.p[s.p.length - 1]
      if (Math.hypot(pt[0] - last[0], pt[1] - last[1]) < MIN_STEP) return
      s.p.push(pt)
      const { w, h } = sizeRef.current
      draw(canvasRef.current.getContext('2d'), [...strokesRef.current, s], w, h)
    },
    onPointerUp(e) {
      e.stopPropagation()
      const s = liveRef.current
      liveRef.current = null
      if (!s) return
      const round = (n) => Math.round(n * 10000) / 10000
      const done = { ...s, p: s.p.map(([x, y]) => [round(x), round(y)]) }
      save([...strokesRef.current, done].slice(-MAX_STROKES))
    },
    onPointerCancel(e) {
      e.stopPropagation()
      liveRef.current = null
    },
  }

  const undo = () => strokes.length && save(strokes.slice(0, -1))
  const clear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 4000)
      return
    }
    setConfirmClear(false)
    save([])
  }

  const dot = big ? 34 : 26
  const btn = { all: 'unset', cursor: 'pointer', fontSize: big ? 18 : 15, fontWeight: 700, padding: '6px 10px', borderRadius: 10, background: C.cream, color: C.ink, whiteSpace: 'nowrap' }

  return (
    <div style={card({ padding: big ? 24 : 16, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', minHeight: 0, boxSizing: 'border-box' })}>
      {/* Tools stay tucked into one small button (showing the pen colour)
          until tapped; they fold away again when you start drawing. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {title && <div style={{ fontSize: big ? 26 : 20, fontWeight: 800 }}>{title}</div>}
        <span style={{ flexGrow: 1 }} />
        <button type="button" aria-expanded={tools} aria-label="Pen tools" onClick={() => setTools((t) => !t)} style={{ ...btn, display: 'flex', alignItems: 'center', gap: 8, background: tools ? C.tealTint : C.cream }}>
          <span style={{ width: dot * 0.7, height: dot * 0.7, borderRadius: dot, background: pen, border: `2px solid ${C.card}`, boxShadow: `0 0 0 2px ${pen}` }} />
          {tools ? 'Done' : 'Pen'}
        </button>
      </div>
      {tools && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {colors.map((c) => (
            <button key={c} type="button" aria-label="Pen colour" aria-pressed={pen === c} onClick={() => setColor(c)} style={{ all: 'unset', cursor: 'pointer', width: dot, height: dot, borderRadius: dot / 2, background: c, boxShadow: pen === c ? `0 0 0 3px ${C.card}, 0 0 0 6px ${c}` : 'none', flexShrink: 0 }} />
          ))}
          <button type="button" aria-pressed={thick} onClick={() => setThick((t) => !t)} style={btn}>{thick ? 'Thick' : 'Thin'}</button>
          <span style={{ flexGrow: 1 }} />
          <button type="button" onClick={undo} disabled={!strokes.length} style={{ ...btn, opacity: strokes.length ? 1 : 0.4 }}>Undo</button>
          <button type="button" onClick={clear} disabled={!strokes.length} style={{ ...btn, opacity: strokes.length ? 1 : 0.4, background: confirmClear ? C.rust : C.cream, color: confirmClear ? '#FFFFFF' : C.ink }}>{confirmClear ? 'Tap to Clear' : 'Clear'}</button>
        </div>
      )}
      <div ref={wrapRef} style={{ position: 'relative', flex: '1 1 0', minHeight: 0, borderRadius: 16, background: C.cream, overflow: 'hidden' }}>
        <canvas ref={canvasRef} {...handlers} style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: 'crosshair' }} />
        {!strokes.length && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: big ? 22 : 16, pointerEvents: 'none' }}>Draw or write here</div>
        )}
      </div>
    </div>
  )
}
