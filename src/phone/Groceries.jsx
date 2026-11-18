import { useMemo, useState } from 'react'
import { C } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useAuth } from '../lib/auth.jsx'
import {
  useGroceries, addGrocery, toggleGrocery, clearCheckedGroceries, updateGrocerySection,
  GROCERY_SECTIONS, useStaples, addStaple, removeStaple, parseQty, setGroceryQty, removeGrocery,
} from '../lib/kitchen.js'
import { useLongPress } from '../lib/longPress.js'
import ConfirmSheet from '../components/ConfirmSheet.jsx'

const stepBtn = { all: 'unset', cursor: 'pointer', width: 30, height: 30, borderRadius: 15, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: C.ink, boxSizing: 'border-box' }

// One list item: tap to tick, press and hold to remove, − / + for quantity.
function GroceryRow({ it, nameFor, onAskRemove }) {
  const lp = useLongPress(() => onAskRemove(it))
  const qty = it.qty || 1
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 44 }}>
      <button type="button" {...lp} aria-label={`${it.label}${qty > 1 ? `, ${qty}` : ''}, ${it.done ? 'done' : 'not done'}. Press and hold to remove.`} aria-pressed={it.done} onClick={() => toggleGrocery(it.id, !it.done)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flexGrow: 1, minWidth: 0, WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}>
        <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 14, boxSizing: 'border-box', background: it.done ? C.meals : 'transparent', border: it.done ? 'none' : `2px solid ${C.meals}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {it.done && <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} />}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: 17, color: it.done ? C.muted : C.ink, textDecoration: it.done ? 'line-through' : 'none' }}>
            {it.label}
            {qty > 1 && <b style={{ color: C.tealText, marginLeft: 6 }}>×{qty}</b>}
          </span>
          {(it.source === 'meal' || it.added_by_member_key) && (
            <span style={{ fontSize: 13, color: C.muted }}>{it.source === 'meal' ? 'Meal plan' : nameFor(it.added_by_member_key)}</span>
          )}
        </span>
      </button>
      {!it.done && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button type="button" aria-label={`Fewer ${it.label}`} disabled={qty <= 1} onClick={() => setGroceryQty(it.id, qty - 1)} style={{ ...stepBtn, opacity: qty <= 1 ? 0.35 : 1 }}>−</button>
          <span style={{ minWidth: 18, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>{qty}</span>
          <button type="button" aria-label={`More ${it.label}`} onClick={() => setGroceryQty(it.id, qty + 1)} style={stepBtn}>+</button>
        </span>
      )}
      <select aria-label="Section" value={it.section || 'Other'} onChange={(e) => updateGrocerySection(it.id, e.target.value)} style={{ font: 'inherit', fontSize: 12, color: C.muted, background: C.cream, border: `2px solid ${C.border}`, borderRadius: 8, padding: '4px 6px', flexShrink: 0, maxWidth: 92 }}>
        {GROCERY_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}

export default function Groceries() {
  const { me, nameFor } = useMembers()
  const { configured } = useAuth()
  const { rows: items } = useGroceries()
  const { rows: staples } = useStaples()
  const [text, setText] = useState('')
  const [editStaples, setEditStaples] = useState(false)
  const [newStaple, setNewStaple] = useState('')
  const [removing, setRemoving] = useState(null)

  const bySection = useMemo(() => {
    const map = {}
    for (const it of items) (map[it.section || 'Other'] ||= []).push(it)
    return map
  }, [items])
  // Show sections in shelf order, only those that have items.
  const sections = GROCERY_SECTIONS.filter((s) => bySection[s]?.length)
  const openCount = items.filter((it) => !it.done).length

  async function add(e) {
    e.preventDefault()
    const { label, qty } = parseQty(text)
    if (!label) return
    setText('')
    await addGrocery({ label, qty, added_by_member_key: me?.key, source: 'manual' })
  }
  async function saveStaple(e) {
    e.preventDefault()
    if (!newStaple.trim()) return
    await addStaple(newStaple)
    setNewStaple('')
  }

  const input = { flexGrow: 1, font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }

  return (
    <>
      <PhoneHeader title="Groceries" subtitle={`${openCount} items · synced`} />

      <form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
        <input aria-label="Add an item" type="text" placeholder="Add milk, 2 apples, eggs x3…" value={text} onChange={(e) => setText(e.target.value)} style={input} />
        <button type="submit" aria-label="Add item" style={{ all: 'unset', cursor: 'pointer', width: 48, height: 48, borderRadius: 12, background: C.meals, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="check" size={22} color="#FFFFFF" strokeWidth={3} />
        </button>
      </form>

      {/* Recurring staples: tap to add to the list */}
      <div style={{ background: C.tealTint, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Staples</div>
          <button type="button" onClick={() => setEditStaples((v) => !v)} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.tealText }}>{editStaples ? 'Done' : 'Edit'}</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {staples.length === 0 && <div style={{ fontSize: 14, color: C.muted }}>No staples yet. Tap Edit to add ones you buy often.</div>}
          {staples.map((s) => (
            <button key={s.id} type="button" onClick={() => (editStaples ? removeStaple(s.id) : addGrocery({ label: s.label, section: s.section, added_by_member_key: me?.key, source: 'manual' }))}
              style={{ all: 'unset', cursor: 'pointer', background: C.card, color: C.ink, border: `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              {!editStaples && <span style={{ color: C.tealText, fontWeight: 800 }}>+</span>}
              {s.label}
              {editStaples && <span style={{ color: C.danger, fontWeight: 800 }}>×</span>}
            </button>
          ))}
        </div>
        {editStaples && (
          <form onSubmit={saveStaple} style={{ display: 'flex', gap: 8 }}>
            <input aria-label="New staple" placeholder="Add a staple" value={newStaple} onChange={(e) => setNewStaple(e.target.value)} style={{ ...input, fontSize: 15, padding: '10px 12px' }} />
            <button type="submit" disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', background: C.meals, color: '#FFF', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>Save</button>
          </form>
        )}
      </div>

      {items.length === 0 && <div style={{ fontSize: 15, color: C.muted }}>List is empty. Add something above.</div>}

      {sections.map((name) => (
        <div key={name} style={{ background: C.card, borderRadius: 20, padding: 16, border: `2px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>{name}</div>
          {bySection[name].map((it) => (
            <GroceryRow key={it.id} it={it} nameFor={nameFor} onAskRemove={setRemoving} />
          ))}
        </div>
      ))}

      {items.length > 0 && <div style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>Press and hold an item to remove it.</div>}

      <ConfirmSheet
        open={!!removing}
        title={removing ? `Remove ${removing.label}?` : ''}
        detail="It comes off everyone's list."
        onCancel={() => setRemoving(null)}
        onConfirm={async () => { const id = removing.id; setRemoving(null); await removeGrocery(id) }}
      />

      {items.some((it) => it.done) && (
        <button type="button" onClick={() => clearCheckedGroceries()} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', fontSize: 15, fontWeight: 700, color: C.tealText, padding: 8 }}>Clear checked items</button>
      )}
    </>
  )
}
