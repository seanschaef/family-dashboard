import { useMemo, useState } from 'react'
import { C } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useGroceries, addGrocery, toggleGrocery, clearCheckedGroceries } from '../lib/kitchen.js'

export default function Groceries() {
  const { me, nameFor } = useMembers()
  const { rows: items } = useGroceries()
  const [text, setText] = useState('')

  const bySection = useMemo(() => {
    const map = {}
    for (const it of items) (map[it.section || 'Other'] ||= []).push(it)
    return map
  }, [items])
  const sections = Object.keys(bySection).sort()
  const openCount = items.filter((it) => !it.done).length

  async function add(e) {
    e.preventDefault()
    const label = text.trim()
    if (!label) return
    setText('')
    await addGrocery({ label, section: 'Other', added_by_member_key: me?.key, source: 'manual' })
  }

  return (
    <>
      <PhoneHeader title="Groceries" subtitle={`${openCount} items · synced`} />

      <form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
        <input aria-label="Add an item" type="text" placeholder="Add milk, eggs…" value={text} onChange={(e) => setText(e.target.value)} style={{ flexGrow: 1, font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }} />
        <button type="submit" aria-label="Add item" style={{ all: 'unset', cursor: 'pointer', width: 48, height: 48, borderRadius: 12, background: C.meals, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="check" size={22} color="#FFFFFF" strokeWidth={3} />
        </button>
      </form>

      {items.length === 0 && <div style={{ fontSize: 15, color: C.muted }}>List is empty. Add something above.</div>}

      {sections.map((name) => (
        <div key={name} style={{ background: C.card, borderRadius: 20, padding: 16, border: `2px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>{name}</div>
          {bySection[name].map((it) => (
            <button key={it.id} type="button" aria-label={`${it.label}, ${it.done ? 'done' : 'not done'}`} aria-pressed={it.done} onClick={() => toggleGrocery(it.id, !it.done)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', minHeight: 44 }}>
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
          ))}
        </div>
      ))}

      {items.some((it) => it.done) && (
        <button type="button" onClick={() => clearCheckedGroceries()} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', fontSize: 15, fontWeight: 700, color: C.tealText, padding: 8 }}>Clear checked items</button>
      )}
    </>
  )
}
