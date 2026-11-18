import { useMemo, useState } from 'react'
import { C } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useAuth } from '../lib/auth.jsx'
import {
  useGroceries, addGrocery, toggleGrocery, clearCheckedGroceries, updateGrocerySection,
  GROCERY_SECTIONS, useStaples, addStaple, removeStaple,
} from '../lib/kitchen.js'

export default function Groceries() {
  const { me, nameFor } = useMembers()
  const { configured } = useAuth()
  const { rows: items } = useGroceries()
  const { rows: staples } = useStaples()
  const [text, setText] = useState('')
  const [editStaples, setEditStaples] = useState(false)
  const [newStaple, setNewStaple] = useState('')

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
    const label = text.trim()
    if (!label) return
    setText('')
    await addGrocery({ label, added_by_member_key: me?.key, source: 'manual' })
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
        <input aria-label="Add an item" type="text" placeholder="Add milk, eggs…" value={text} onChange={(e) => setText(e.target.value)} style={input} />
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
              {editStaples && <span style={{ color: '#8A3E1F', fontWeight: 800 }}>×</span>}
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
            <div key={it.id} style={{ display: 'flex', gap: 10, alignItems: 'center', minHeight: 44 }}>
              <button type="button" aria-label={`${it.label}, ${it.done ? 'done' : 'not done'}`} aria-pressed={it.done} onClick={() => toggleGrocery(it.id, !it.done)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 14, boxSizing: 'border-box', background: it.done ? C.meals : 'transparent', border: it.done ? 'none' : `2px solid ${C.meals}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {it.done && <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} />}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 17, color: it.done ? C.muted : C.ink, textDecoration: it.done ? 'line-through' : 'none' }}>{it.label}</span>
                  {(it.source === 'meal' || it.added_by_member_key) && (
                    <span style={{ fontSize: 13, color: C.muted }}>{it.source === 'meal' ? 'Meal plan' : nameFor(it.added_by_member_key)}</span>
                  )}
                </span>
              </button>
              <select aria-label="Section" value={it.section || 'Other'} onChange={(e) => updateGrocerySection(it.id, e.target.value)} style={{ font: 'inherit', fontSize: 12, color: C.muted, background: C.cream, border: `2px solid ${C.border}`, borderRadius: 8, padding: '4px 6px', flexShrink: 0 }}>
                {GROCERY_SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      ))}

      {items.some((it) => it.done) && (
        <button type="button" onClick={() => clearCheckedGroceries()} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', fontSize: 15, fontWeight: 700, color: C.tealText, padding: 8 }}>Clear checked items</button>
      )}
    </>
  )
}
