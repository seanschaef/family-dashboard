import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { normalizeHubLayout, HUB_BLOCK_LABELS } from '../wall/hubLayout.js'

const SIZES = [
  { v: 's', label: 'S' },
  { v: 'm', label: 'M' },
  { v: 'l', label: 'L (full width)' },
]
const schemHeight = (size) => (size === 'l' ? 58 : size === 'm' ? 92 : 58)

function IconBtn({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ all: 'unset', cursor: disabled ? 'default' : 'pointer', width: 34, height: 34, borderRadius: 10, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: disabled ? C.border : C.ink }}>
      {children}
    </button>
  )
}

export default function Arrange() {
  const { wallLayout, updateFamily, isAdmin } = useMembers()
  const [items, setItems] = useState(() => normalizeHubLayout(wallLayout))
  const [saved, setSaved] = useState(false)
  useEffect(() => setItems(normalizeHubLayout(wallLayout)), [wallLayout])

  const change = (next) => { setItems(next); setSaved(false) }
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    change(next)
  }
  const setSize = (i, v) => change(items.map((b, k) => (k === i ? { ...b, size: v } : b)))
  const toggle = (i) => change(items.map((b, k) => (k === i ? { ...b, visible: !b.visible } : b)))

  const save = async () => { await updateFamily({ wall_layout: items }); setSaved(true) }
  const reset = async () => { await updateFamily({ wall_layout: null }); setSaved(true) }

  const visible = items.filter((b) => b.visible)

  return (
    <>
      <PhoneHeader title="Arrange the hub" subtitle="Reorder, resize and hide the wall's windows" action={<Link to="/app/settings" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>‹ Settings</Link>} />

      {/* Live schematic of the hub grid */}
      <div style={{ background: C.cream, border: `3px solid ${C.ink}`, borderRadius: 16, padding: 10 }}>
        <div style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginBottom: 6 }}>Greeting · clock · weather</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridAutoFlow: 'row dense', gap: 6 }}>
          {visible.map((b) => (
            <div key={b.id} style={{ gridColumn: b.size === 'l' ? '1 / -1' : 'auto', height: schemHeight(b.size), background: C.card, border: `2px solid ${C.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: C.ink }}>
              {HUB_BLOCK_LABELS[b.id]}
            </div>
          ))}
        </div>
      </div>

      {!isAdmin && <div style={{ fontSize: 13, color: C.muted }}>Only an admin can change the wall layout. This is a preview.</div>}

      {items.map((b, i) => (
        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 10, opacity: b.visible ? 1 : 0.5 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <IconBtn onClick={() => move(i, -1)} disabled={!isAdmin || i === 0}>↑</IconBtn>
            <IconBtn onClick={() => move(i, 1)} disabled={!isAdmin || i === items.length - 1}>↓</IconBtn>
          </div>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{HUB_BLOCK_LABELS[b.id]}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {SIZES.map((s) => (
                <button key={s.v} type="button" disabled={!isAdmin} onClick={() => setSize(i, s.v)} style={{ all: 'unset', cursor: isAdmin ? 'pointer' : 'default', background: b.size === s.v ? C.meals : C.cream, color: b.size === s.v ? '#FFF' : C.ink, border: `2px solid ${b.size === s.v ? C.meals : C.border}`, borderRadius: 999, padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>{s.label}</button>
              ))}
            </div>
          </div>
          <button type="button" disabled={!isAdmin} onClick={() => toggle(i)} style={{ all: 'unset', cursor: isAdmin ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, color: b.visible ? C.tealText : C.muted }}>{b.visible ? 'Hide' : 'Show'}</button>
        </div>
      ))}

      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
          <button type="button" onClick={save} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFF', borderRadius: 14, padding: '12px 22px', fontSize: 16, fontWeight: 700 }}>Save to wall</button>
          <button type="button" onClick={reset} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.muted }}>Reset to default</button>
          {saved && <span style={{ fontSize: 14, color: C.tealText }}>Saved</span>}
        </div>
      )}
      <Link to="/app/wall-preview" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>Open full wall preview ›</Link>
    </>
  )
}
