import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import {
  normalizeHubLayout,
  HUB_BLOCK_LABELS,
  SIZES,
  WIDTHS,
  WIDTH_LABELS,
  WIDTH_SPAN,
  entryLabel,
  combineEntries,
  separateEntry,
  approxHeight,
  entryHeight,
  ROW_UNIT,
} from '../wall/hubLayout.js'
import { PERSON_BLOCK_LABELS, normalizePersonLayout, personApproxHeight } from '../wall/personLayout.js'

const INTERVALS = [0, 5, 10, 15, 20, 30, 60] // 0 = manual (swipe or tap to change)
const TRANSITIONS = [
  { v: 'fade', label: 'Fade' },
  { v: 'slide', label: 'Slide' },
  { v: 'none', label: 'Instant' },
]
// The wall's page area (1080x1920 screen minus its margins and the nav bar at
// the bottom). The wall never scrolls: anything below WALL_HEIGHT is cut off.
// The preview is drawn to scale, with that edge marked.
const WALL_WIDTH = 976
const WALL_HEIGHT = 1680
const WALL_GAP = 24
const SPANS = [1, 2, 4]
const SPAN_WIDTH = { 1: 'quarter', 2: 'half', 4: 'full' }

function Pick({ active, disabled, onClick, children }) {
  return (
    <button type="button" aria-pressed={active} disabled={disabled} onClick={onClick} style={{ all: 'unset', cursor: disabled ? 'default' : 'pointer', boxSizing: 'border-box', minWidth: 38, height: 32, padding: '0 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: active ? C.meals : C.cream, color: active ? '#FFF' : C.ink, border: `2px solid ${active ? C.meals : C.border}`, borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
      {children}
    </button>
  )
}

// True when the screen is wide enough for the preview and settings to sit
// side by side (matches the flex-wrap breakpoint below: 320 + 300 + 16 + margins).
function useWide() {
  const query = '(min-width: 680px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

const rowLabel = { fontSize: 12, fontWeight: 700, color: C.muted, marginTop: 10, marginBottom: 4 }

// The wall drawn to scale. Tap a window to select it; press and hold (or drag
// with a mouse) to move it; drag the round corner handle to resize it.
function Preview({ items, labels, heightFor, canEdit, selected, onSelect, onMove, onResize }) {
  const gridRef = useRef(null)
  const [width, setWidth] = useState(360)
  const [drag, setDrag] = useState(null) // { id, dx, dy, target, before }
  const dragRef = useRef(null)

  useEffect(() => {
    const el = gridRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    // While dragging, stop the page from scrolling under your finger.
    const block = (e) => {
      if (dragRef.current?.active) e.preventDefault()
    }
    el.addEventListener('touchmove', block, { passive: false })
    return () => {
      ro.disconnect()
      el.removeEventListener('touchmove', block)
    }
  }, [])

  const scale = width / WALL_WIDTH
  const GAP = WALL_GAP * scale
  const edge = Math.round(WALL_HEIGHT * scale)
  const colW = (width - GAP * 3) / 4
  const spanPx = (n) => colW * n + GAP * (n - 1)
  // Packed exactly like the wall (same row units and spans, scaled), so the
  // preview's bottom edge is where the wall's really is.
  const tileHeight = (b) => entryHeight(b, heightFor) * scale
  const rowSpan = (b) => Math.ceil((entryHeight(b, heightFor) + WALL_GAP) / ROW_UNIT)
  const visible = items.filter((b) => b.visible)

  const endDrag = () => {
    const d = dragRef.current
    if (!d) return
    clearTimeout(d.timer)
    window.removeEventListener('pointermove', d.move)
    window.removeEventListener('pointerup', d.up)
    window.removeEventListener('pointercancel', d.cancel)
    dragRef.current = null
    setDrag(null)
  }

  const startMove = (e, b) => {
    if (!canEdit || e.button > 0) return
    const d = { id: b.id, x0: e.clientX, y0: e.clientY, active: false, moved: false }
    const activate = () => {
      d.active = true
      navigator.vibrate?.(10)
      setDrag({ id: b.id, dx: 0, dy: 0, target: null, before: true })
    }
    if (e.pointerType !== 'mouse') d.timer = setTimeout(activate, 280)
    d.move = (ev) => {
      const dx = ev.clientX - d.x0
      const dy = ev.clientY - d.y0
      if (!d.active) {
        if (Math.hypot(dx, dy) < 8) return
        d.moved = true
        if (ev.pointerType === 'mouse') activate()
        else return endDrag() // finger moved before the hold: it's a scroll
      }
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-tile]')
      let target = null
      let before = true
      if (el && el.dataset.tile !== b.id) {
        target = el.dataset.tile
        const r = el.getBoundingClientRect()
        const wide = r.width > width * 0.75
        before = wide ? ev.clientY < r.top + r.height / 2 : ev.clientX < r.left + r.width / 2
      }
      d.target = target
      d.before = before
      setDrag({ id: b.id, dx, dy, target, before })
    }
    d.up = () => {
      if (d.active && d.target) onMove(d.id, d.target, d.before)
      else if (!d.active && !d.moved) onSelect(b.id)
      endDrag()
    }
    d.cancel = endDrag
    dragRef.current = d
    window.addEventListener('pointermove', d.move)
    window.addEventListener('pointerup', d.up)
    window.addEventListener('pointercancel', d.cancel)
  }

  const startResize = (e, b) => {
    e.stopPropagation()
    e.preventDefault()
    const tile = e.currentTarget.closest('[data-tile]')
    const r = tile.getBoundingClientRect()
    const x0 = e.clientX
    const y0 = e.clientY
    const heights = SIZES.map((s) => ({ v: s.v, h: tileHeight({ ...b, size: s.v }) }))
    const move = (ev) => {
      const w = r.width + ev.clientX - x0
      const h = r.height + ev.clientY - y0
      const span = SPANS.reduce((a, n) => (Math.abs(spanPx(n) - w) < Math.abs(spanPx(a) - w) ? n : a), 4)
      const size = heights.reduce((a, s) => (Math.abs(s.h - h) < Math.abs(a.h - h) ? s : a), heights[0]).v
      onResize(b.id, { width: SPAN_WIDTH[span], size })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  return (
    <div style={{ background: C.cream, border: `3px solid ${C.ink}`, borderRadius: 16, padding: 10 }}>
      <div style={{ position: 'relative', minHeight: edge + 24 }}>
      {/* Same packing as the wall: tiny rows, each tile spans its height + gap. */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoRows: ROW_UNIT * scale, columnGap: GAP, rowGap: 0, alignItems: 'start' }}>
        {visible.map((b) => {
          const isSel = selected === b.id
          const isDrag = drag?.id === b.id
          const isTarget = drag?.target === b.id
          const wideTile = b.width === 'full'
          const marker = isTarget ? (wideTile ? { [drag.before ? 'borderTop' : 'borderBottom']: `5px solid ${C.rust}` } : { [drag.before ? 'borderLeft' : 'borderRight']: `5px solid ${C.rust}` }) : {}
          return (
            <div
              key={b.id}
              data-tile={b.id}
              onPointerDown={(e) => startMove(e, b)}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                position: 'relative',
                gridColumn: `span ${WIDTH_SPAN[b.width] || 4}`,
                gridRow: `span ${rowSpan(b)}`,
                height: tileHeight(b),
                background: b.group ? C.tealTint : C.card,
                border: `2px ${b.group ? 'dashed' : 'solid'} ${isSel ? C.rust : b.group ? C.meals : C.border}`,
                ...marker,
                boxShadow: isSel ? `0 0 0 2px ${C.rust}` : 'none',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 4,
                fontSize: b.width === 'quarter' ? 10 : 12,
                fontWeight: 700,
                color: C.ink,
                boxSizing: 'border-box',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                cursor: canEdit ? 'grab' : 'default',
                transform: isDrag ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.03)` : 'none',
                opacity: isDrag ? 0.85 : 1,
                zIndex: isDrag ? 3 : isSel ? 2 : 1,
                pointerEvents: isDrag ? 'none' : 'auto',
                transition: isDrag ? 'none' : 'transform 120ms',
              }}
            >
              <span style={{ overflow: 'hidden', maxHeight: '100%' }}>{b.group ? `${entryLabel(b, labels)} ⟳` : labels[b.id].replace(/ \(.*\)$/, '')}</span>
              {isSel && canEdit && !drag && (
                <span
                  role="presentation"
                  onPointerDown={(e) => startResize(e, b)}
                  style={{ position: 'absolute', right: -9, bottom: -9, width: 24, height: 24, borderRadius: 12, background: C.rust, border: `3px solid ${C.card}`, boxSizing: 'border-box', touchAction: 'none', cursor: 'nwse-resize' }}
                />
              )}
            </div>
          )
        })}
      </div>
      {/* Bottom of the wall's screen: anything below is cut off. */}
      <div style={{ position: 'absolute', left: -10, right: -10, top: edge, bottom: 0, background: 'rgba(200, 60, 40, 0.10)', borderTop: `2px dashed ${C.rust}`, pointerEvents: 'none', zIndex: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.rust, textAlign: 'right', padding: '2px 12px' }}>Bottom of the screen · below here is cut off</div>
      </div>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8, textAlign: 'center', lineHeight: 1.4 }}>
        {canEdit ? 'Tap to select · press and hold to drag · drag the corner dot to resize' : 'Preview'}
        <br />
        Dashed = combined window that rotates (⟳)
      </div>
    </div>
  )
}

export default function Arrange() {
  const { wallLayout, updateFamily, updateMember, isAdmin, members, me } = useMembers()
  // Which page: the family hub, or one person's page (?who=<member key>).
  const [params, setParams] = useSearchParams()
  const who = params.get('who') || 'hub'
  const person = who === 'hub' ? null : members.find((m) => m.key === who)
  const labels = person ? PERSON_BLOCK_LABELS : HUB_BLOCK_LABELS
  const short = (id) => labels[id].replace(/ \(.*\)$/, '')
  const load = (stored) => (person ? normalizePersonLayout(stored, person.role) : normalizeHubLayout(stored))
  const heightFor = person ? personApproxHeight : approxHeight
  // You can arrange your own page; admins can arrange the hub and anyone's.
  const canEdit = person ? isAdmin || me?.id === person.id : isAdmin

  // Unsaved edits are kept per page, so the windows shown always belong to
  // the page picked (a person's page opened by link renders only once the
  // family has loaded; before, it briefly mixed the hub's windows with the
  // person's names and crashed).
  const pageKey = who === 'hub' ? 'hub' : person ? person.key : null
  const [draft, setDraft] = useState(null) // { key, items }
  const [selected, setSelected] = useState(null)
  const wide = useWide()
  const [status, setStatus] = useState(null) // null | 'saved' | 'reset' | 'error'
  useEffect(() => {
    setDraft(null)
    setStatus(null)
    setSelected(null)
  }, [wallLayout, who, person?.page_layout, person?.role])
  const items = draft?.key === pageKey ? draft.items : load(person ? person.page_layout : wallLayout)
  const setItems = (next) => setDraft({ key: pageKey, items: next })

  const change = (next) => { setItems(next); setStatus(null) }
  const update = (id, p) => change(items.map((b) => (b.id === id ? { ...b, ...p } : b)))

  // Put window `id` just before or after window `targetId`.
  const moveTo = (id, targetId, before) => {
    const from = items.find((b) => b.id === id)
    const rest = items.filter((b) => b.id !== id)
    const t = rest.findIndex((b) => b.id === targetId)
    if (!from || t < 0) return
    rest.splice(before ? t : t + 1, 0, from)
    change(rest)
    setSelected(id)
  }
  const step = (id, dir) => {
    const vis = items.filter((b) => b.visible)
    const k = vis.findIndex((b) => b.id === id)
    const other = vis[k + dir]
    if (other) moveTo(id, other.id, dir < 0)
  }

  const store = (value) => (person ? updateMember(person.id, { page_layout: value }) : updateFamily({ wall_layout: value }))
  const save = async () => {
    try { await store(items); setStatus('saved') } catch { setStatus('error') }
  }
  // Reset shows the default straight away (the saved layout may already be
  // the default, in which case nothing reloads by itself) and saves it.
  const reset = async () => {
    setItems(load(null))
    setSelected(null)
    try { await store(null); setStatus('reset') } catch { setStatus('error') }
  }

  const i = items.findIndex((b) => b.id === selected)
  const b = i >= 0 ? items[i] : null
  const hidden = items.filter((x) => !x.visible)
  const visible = items.filter((x) => x.visible)
  const vIndex = b ? visible.findIndex((x) => x.id === b.id) : -1

  // Save / Reset: in the right-hand column (always in view) when the preview
  // and settings sit side by side; otherwise stuck to the bottom of the screen.
  const saveBar = (
    <div style={{ position: 'sticky', bottom: wide ? undefined : 92, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '10px 12px', background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, zIndex: 5 }}>
      <button type="button" onClick={save} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFF', borderRadius: 14, padding: '12px 22px', fontSize: 16, fontWeight: 700 }}>Save to wall</button>
      <button type="button" onClick={reset} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.muted }}>Reset to default</button>
      {status && <span style={{ fontSize: 14, color: status === 'error' ? C.rust : C.tealText }}>{status === 'saved' ? 'Saved' : status === 'reset' ? 'Reset and saved' : 'Couldn’t save'}</span>}
    </div>
  )

  if (!pageKey) {
    return (
      <>
        <PhoneHeader title="Arrange the Wall" subtitle="Drag, resize, combine and hide windows" />
        <div style={{ fontSize: 15, color: C.muted }}>{members.length ? 'That person isn’t in the family any more.' : 'Loading…'}</div>
        <Link to="/app/arrange" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>Arrange the family hub ›</Link>
      </>
    )
  }

  return (
    <>
      <PhoneHeader title="Arrange the Wall" subtitle="Drag, resize, combine and hide windows" action={<Link to="/app/settings" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>‹ Settings</Link>} />

      {/* Which page to arrange */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[{ key: 'hub', name: 'Family Hub', color: C.family }, ...members].map((m) => {
          const active = who === m.key
          return (
            <button key={m.key} type="button" aria-pressed={active} onClick={() => setParams(m.key === 'hub' ? {} : { who: m.key })} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 36, padding: '0 14px', display: 'inline-flex', alignItems: 'center', background: active ? m.color : C.card, color: active ? '#FFFFFF' : C.ink, border: `2px solid ${active ? m.color : C.border}`, borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
              {m.key === 'hub' ? m.name : `${m.name}'s Page`}
            </button>
          )
        })}
      </div>

      {/* Preview and the selected window's settings side by side when the
          screen is wide enough (laptop, tablet); stacked on a phone. */}
      <div style={{ alignSelf: 'center', width: 'min(1000px, calc(100vw - 40px))', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 320px', maxWidth: 480, minWidth: 0 }}>
      <Preview
        items={items}
        labels={labels}
        heightFor={heightFor}
        canEdit={canEdit}
        selected={selected}
        onSelect={(id) => setSelected((s) => (s === id ? null : id))}
        onMove={moveTo}
        onResize={(id, p) => update(id, p)}
      />
      </div>
      <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 16 }}>
      {canEdit && wide && saveBar}

      {!canEdit && <div style={{ fontSize: 13, color: C.muted }}>{person ? `Only ${person.name} or an admin can change this page.` : 'Only an admin can change the hub.'}</div>}
      {person && <div style={{ fontSize: 13, color: C.muted }}>Big job tiles with stars suit younger kids; the chores list suits everyone else. Photos show when {person.name} has a photo collection.</div>}
      {person && canEdit && (
        <select
          aria-label="Copy another page's layout"
          value=""
          onChange={(e) => {
            const from = members.find((m) => m.key === e.target.value)
            if (from) { change(normalizePersonLayout(from.page_layout, from.role)); setSelected(null) }
          }}
          style={{ font: 'inherit', fontSize: 14, padding: '8px 10px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink, alignSelf: 'flex-start' }}
        >
          <option value="">Copy the layout of another page…</option>
          {members.filter((m) => m.key !== person.key).map((m) => (
            <option key={m.key} value={m.key}>{m.name}&apos;s page</option>
          ))}
        </select>
      )}

      {/* The selected window's settings */}
      {b ? (
        <div style={{ background: C.card, border: `2px solid ${C.rust}`, borderRadius: 14, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 800, flexGrow: 1, minWidth: 0 }}>{b.group ? `Combined: ${entryLabel(b, labels)}` : labels[b.id]}</div>
            <button type="button" onClick={() => setSelected(null)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.muted }}>Done</button>
          </div>

          <div style={rowLabel}>Size (height)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SIZES.map((s) => (
              <Pick key={s.v} active={b.size === s.v} disabled={!canEdit} onClick={() => update(b.id, { size: s.v })}>{s.label}</Pick>
            ))}
          </div>
          <div style={rowLabel}>Width</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {WIDTHS.map((w) => (
              <Pick key={w} active={b.width === w} disabled={!canEdit} onClick={() => update(b.id, { width: w })}>{WIDTH_LABELS[w]}</Pick>
            ))}
          </div>

          <div style={rowLabel}>Position</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Pick disabled={!canEdit || vIndex <= 0} onClick={() => step(b.id, -1)}>← Earlier</Pick>
            <Pick disabled={!canEdit || vIndex >= visible.length - 1} onClick={() => step(b.id, 1)}>Later →</Pick>
          </div>

          {b.id === 'photo' && (
            <>
              <div style={rowLabel}>Photo</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Pick active={b.fit !== 'contain'} disabled={!canEdit} onClick={() => update(b.id, { fit: 'cover' })}>Fill (crop)</Pick>
                <Pick active={b.fit === 'contain'} disabled={!canEdit} onClick={() => update(b.id, { fit: 'contain' })}>Fit (whole photo)</Pick>
              </div>
            </>
          )}

          {b.group && (
            <>
              <div style={rowLabel}>Rotates between (tap one to take it out)</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {b.group.map((id) => (
                  <button key={id} type="button" disabled={!canEdit} onClick={() => change(separateEntry(items, i, id))} title="Take out of this window" style={{ all: 'unset', cursor: canEdit ? 'pointer' : 'default', background: C.tealTint, color: C.ink, borderRadius: 999, padding: '5px 10px', fontSize: 13, fontWeight: 600 }}>
                    {short(id)} <span aria-hidden="true" style={{ color: C.muted }}>×</span>
                  </button>
                ))}
              </div>
              <div style={rowLabel}>Change every (Manual: swipe or tap the arrows on the wall)</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {INTERVALS.map((s) => (
                  <Pick key={s} active={b.interval === s} disabled={!canEdit} onClick={() => update(b.id, { interval: s })}>{s === 0 ? 'Manual' : s < 60 ? `${s}s` : '1 min'}</Pick>
                ))}
              </div>
              <div style={rowLabel}>Transition</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TRANSITIONS.map((t) => (
                  <Pick key={t.v} active={b.transition === t.v} disabled={!canEdit} onClick={() => update(b.id, { transition: t.v })}>{t.label}</Pick>
                ))}
              </div>
            </>
          )}

          {canEdit && items.length > 1 && (
            <>
              <div style={rowLabel}>{b.group ? 'Add another window' : 'Combine with (rotates in this spot)'}</div>
              <select
                aria-label="Combine with"
                value=""
                onChange={(e) => {
                  const j = items.findIndex((x) => x.id === e.target.value)
                  if (j >= 0) change(combineEntries(items, i, j))
                }}
                style={{ font: 'inherit', fontSize: 14, padding: '6px 8px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.cream, color: C.ink, maxWidth: '100%' }}
              >
                <option value="">Choose a window…</option>
                {items.filter((x, k) => k !== i).map((x) => (
                  <option key={x.id} value={x.id}>{x.group ? `Combined: ${entryLabel(x, labels)}` : short(x.id)}</option>
                ))}
              </select>
            </>
          )}

          {canEdit && (
            <div style={{ marginTop: 12 }}>
              <button type="button" onClick={() => { update(b.id, { visible: false }); setSelected(null) }} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.rust }}>Hide this window</button>
            </div>
          )}
        </div>
      ) : (
        canEdit && <div style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>Tap a window in the preview to change its size, width or other settings.</div>
      )}

      {hidden.length > 0 && (
        <div>
          <div style={rowLabel}>Hidden windows{canEdit ? ' (tap to add back)' : ''}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hidden.map((x) => (
              <button key={x.id} type="button" disabled={!canEdit} onClick={() => { update(x.id, { visible: true }); setSelected(x.id) }} style={{ all: 'unset', cursor: canEdit ? 'pointer' : 'default', background: C.card, border: `2px dashed ${C.border}`, color: C.ink, borderRadius: 999, padding: '6px 12px', fontSize: 13, fontWeight: 700 }}>
                + {x.group ? entryLabel(x, labels) : short(x.id)}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
      </div>

      {canEdit && !wide && saveBar}
      <Link to="/app/wall-preview" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>Open full wall preview ›</Link>
    </>
  )
}
