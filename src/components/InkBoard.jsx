import { useEffect, useRef, useState } from 'react'
import { C, card } from '../theme.js'
import { useFamilyTable, insertRow, updateRow, deleteRow } from '../lib/db.js'
import { useMembers } from '../lib/members.jsx'
import { isSupabaseConfigured } from '../lib/supabase.js'

// A shared drawing board: draw with a finger on the wall (or on a phone) and
// it shows everywhere the Ink window is. Several pages (one ink_boards row
// each, oldest first); + in the header adds one. Strokes are stored with x and
// y from 0 to 1, so they scale to any size. Eraser strokes are stored too
// ({ e: 1 }) and cut through what was drawn before them.

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
    // The eraser removes ink (the board's background shows through).
    ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over'
    const color = s.e ? '#000000' : resolve(s.c, ctx.canvas)
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
  ctx.globalCompositeOperation = 'source-over'
}

export default function InkBoard({ title = 'Ink', big = false }) {
  const { members, me } = useMembers()
  const { rows: pages } = useFamilyTable('ink_boards', { order: { column: 'created_at' } })
  const [page, setPage] = useState(0)
  const [jumpToLast, setJumpToLast] = useState(false) // after adding a page
  const idx = Math.min(page, Math.max(0, pages.length - 1))
  const board = pages[idx] || null
  const [local, setLocal] = useState(null) // { id, strokes } not yet confirmed by the server
  const strokes = (local && local.id === (board?.id ?? null) ? local.strokes : null) ?? board?.strokes ?? EMPTY

  const colors = [C.ink, ...members.map((m) => m.color), '#2E8B57', '#D9A441'].filter((c, i, a) => c && a.indexOf(c) === i).slice(0, 7)
  const [color, setColor] = useState(null)
  const [thick, setThick] = useState(false)
  const [eraser, setEraser] = useState(false)
  const [confirm, setConfirm] = useState(null) // 'clear' | 'delete' while waiting for the second tap
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

  // Redraw whenever the strokes change (another screen drew, a new page…).
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const { w, h } = sizeRef.current
    draw(cv.getContext('2d'), liveRef.current ? [...strokes, liveRef.current] : strokes, w, h)
  }, [strokes])

  // Once the server copy catches up with what we drew, drop the local copy.
  useEffect(() => {
    if (local && board && local.id === board.id && JSON.stringify(board.strokes) === JSON.stringify(local.strokes)) setLocal(null)
  }, [board, local])

  // A page was added: show it as soon as it arrives.
  useEffect(() => {
    if (jumpToLast && pages.length) {
      setPage(pages.length - 1)
      setJumpToLast(false)
    }
  }, [jumpToLast, pages.length])

  async function save(next) {
    setLocal({ id: board?.id ?? null, strokes: next })
    if (!isSupabaseConfigured) return
    try {
      if (board) await updateRow('ink_boards', board.id, { strokes: next, updated_by: me?.key || null, updated_at: new Date().toISOString() })
      else await insertRow('ink_boards', { strokes: next, updated_by: me?.key || null })
    } catch {
      /* stays drawn locally; the next stroke tries again */
    }
  }

  async function addPage() {
    setTools(false)
    setConfirm(null)
    if (!isSupabaseConfigured) return
    // The very first page is made by drawing on it; after that, + adds one.
    if (!pages.length) await insertRow('ink_boards', { strokes: [], updated_by: me?.key || null })
    await insertRow('ink_boards', { strokes: [], updated_by: me?.key || null })
    setJumpToLast(true)
  }
  async function deletePage() {
    if (confirm !== 'delete') return askTwice('delete')
    setConfirm(null)
    if (!board) return
    await deleteRow('ink_boards', board.id)
    setPage((p) => Math.max(0, p - 1))
  }
  function askTwice(what) {
    setConfirm(what)
    setTimeout(() => setConfirm((c) => (c === what ? null : c)), 4000)
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
      setConfirm(null)
      setTools(false)
      const scale = big ? 0.7 : 1
      liveRef.current = eraser ? { e: 1, w: 0.045 * scale, p: [point(e)] } : { c: pen, w: (thick ? 0.018 : 0.007) * scale, p: [point(e)] }
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
    if (confirm !== 'clear') return askTwice('clear')
    setConfirm(null)
    save([])
  }

  const dot = big ? 34 : 26
  const btn = { all: 'unset', cursor: 'pointer', fontSize: big ? 18 : 15, fontWeight: 700, padding: '6px 10px', borderRadius: 10, background: C.cream, color: C.ink, whiteSpace: 'nowrap' }
  const round = { ...btn, width: big ? 36 : 30, height: big ? 36 : 30, padding: 0, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: big ? 22 : 18, fontWeight: 800 }
  const count = Math.max(1, pages.length)
  const showing = Math.min(idx + 1, count)

  return (
    <div style={card({ padding: big ? 24 : 16, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', minHeight: 0, boxSizing: 'border-box' })}>
      {/* Header: title, pages (‹ 2 / 3 ›), + to add a page, and one small
          button holding the pen tools. Tools fold away when you draw. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {title && <div style={{ fontSize: big ? 26 : 20, fontWeight: 800 }}>{title}</div>}
        <span style={{ flexGrow: 1 }} />
        {count > 1 && (
          <>
            <button type="button" aria-label="Previous page" disabled={showing <= 1} onClick={() => setPage(idx - 1)} style={{ ...round, opacity: showing <= 1 ? 0.35 : 1 }}>‹</button>
            <span style={{ fontSize: big ? 18 : 15, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>{showing} / {count}</span>
            <button type="button" aria-label="Next page" disabled={showing >= count} onClick={() => setPage(idx + 1)} style={{ ...round, opacity: showing >= count ? 0.35 : 1 }}>›</button>
          </>
        )}
        <button type="button" aria-label="Add a page" onClick={addPage} style={round}>+</button>
        <button type="button" aria-expanded={tools} aria-label="Pen tools" onClick={() => setTools((t) => !t)} style={{ ...btn, display: 'flex', alignItems: 'center', gap: 8, background: tools ? C.tealTint : C.cream }}>
          {eraser ? (
            <span style={{ width: dot * 0.7, height: dot * 0.5, borderRadius: 4, background: C.card, border: `2px solid ${C.muted}` }} />
          ) : (
            <span style={{ width: dot * 0.7, height: dot * 0.7, borderRadius: dot, background: pen, border: `2px solid ${C.card}`, boxShadow: `0 0 0 2px ${pen}` }} />
          )}
          {tools ? 'Done' : eraser ? 'Eraser' : 'Pen'}
        </button>
      </div>
      {tools && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {colors.map((c) => (
            <button key={c} type="button" aria-label="Pen colour" aria-pressed={!eraser && pen === c} onClick={() => { setColor(c); setEraser(false) }} style={{ all: 'unset', cursor: 'pointer', width: dot, height: dot, borderRadius: dot / 2, background: c, boxShadow: !eraser && pen === c ? `0 0 0 3px ${C.card}, 0 0 0 6px ${c}` : 'none', flexShrink: 0 }} />
          ))}
          <button type="button" aria-pressed={thick} onClick={() => { setThick((t) => !t); setEraser(false) }} style={btn}>{thick ? 'Thick' : 'Thin'}</button>
          <button type="button" aria-pressed={eraser} onClick={() => setEraser((x) => !x)} style={{ ...btn, background: eraser ? C.tealText : C.cream, color: eraser ? '#FFFFFF' : C.ink }}>Eraser</button>
          <span style={{ flexGrow: 1 }} />
          <button type="button" onClick={undo} disabled={!strokes.length} style={{ ...btn, opacity: strokes.length ? 1 : 0.4 }}>Undo</button>
          <button type="button" onClick={clear} disabled={!strokes.length} style={{ ...btn, opacity: strokes.length ? 1 : 0.4, background: confirm === 'clear' ? C.rust : C.cream, color: confirm === 'clear' ? '#FFFFFF' : C.ink }}>{confirm === 'clear' ? 'Tap to Clear' : 'Clear'}</button>
          {count > 1 && (
            <button type="button" onClick={deletePage} style={{ ...btn, background: confirm === 'delete' ? C.rust : C.cream, color: confirm === 'delete' ? '#FFFFFF' : C.danger }}>{confirm === 'delete' ? 'Tap to Delete Page' : 'Delete Page'}</button>
          )}
        </div>
      )}
      <div ref={wrapRef} style={{ position: 'relative', flex: '1 1 0', minHeight: 0, borderRadius: 16, background: C.cream, overflow: 'hidden' }}>
        <canvas ref={canvasRef} {...handlers} style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: eraser ? 'cell' : 'crosshair' }} />
        {!strokes.length && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: big ? 22 : 16, pointerEvents: 'none' }}>Draw or write here</div>
        )}
      </div>
    </div>
  )
}
