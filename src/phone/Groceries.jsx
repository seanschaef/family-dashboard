import { useMemo, useState } from 'react'
import { C } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { PhoneHeader } from './parts.jsx'
import { grocerySections } from '../data/sample.js'

// Local-only for now (step 3 wires realtime sync + offline persistence).
// Interactions work so the flow can be reviewed.
let nextId = 1
const seed = grocerySections.flatMap((s) =>
  s.items.map((it) => ({ id: nextId++, label: it.label, note: it.note, section: s.name, done: it.done })),
)

const SECTION_ORDER = ['PRODUCE', 'PANTRY AND OTHER']

export default function Groceries() {
  const [items, setItems] = useState(seed)
  const [text, setText] = useState('')

  const bySection = useMemo(() => {
    const map = {}
    for (const name of SECTION_ORDER) map[name] = []
    for (const it of items) (map[it.section] ||= []).push(it)
    return map
  }, [items])

  function add(e) {
    e.preventDefault()
    const label = text.trim()
    if (!label) return
    setItems((prev) => [...prev, { id: nextId++, label, note: 'You', section: 'PANTRY AND OTHER', done: false }])
    setText('')
  }

  const toggle = (id) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)))
  const clearChecked = () => setItems((prev) => prev.filter((it) => !it.done))

  const openCount = items.filter((it) => !it.done).length

  return (
    <>
      <PhoneHeader title="Groceries" subtitle={`${openCount} items · synced`} />

      <form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
        <input
          aria-label="Add an item"
          type="text"
          placeholder="Add milk, eggs…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flexGrow: 1,
            font: 'inherit',
            fontSize: 17,
            padding: '12px 14px',
            borderRadius: 12,
            border: `2px solid ${C.border}`,
            background: C.card,
            color: C.ink,
          }}
        />
        <button type="submit" aria-label="Add item" style={micBtn}>
          <Icon name="mic" size={22} color="#FFFFFF" />
        </button>
      </form>

      <div style={{ fontSize: 13, color: C.muted }}>Suggestions from past lists: Bananas · Yogurt · Coffee</div>

      {SECTION_ORDER.map((name) =>
        bySection[name] && bySection[name].length ? (
          <div
            key={name}
            style={{
              background: C.card,
              borderRadius: 20,
              padding: 16,
              border: `2px solid ${C.border}`,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, letterSpacing: 1 }}>{name}</div>
            {bySection[name].map((it) => (
              <button
                key={it.id}
                type="button"
                aria-label={`${it.label}, ${it.done ? 'done' : 'not done'}`}
                aria-pressed={it.done}
                onClick={() => toggle(it.id)}
                style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', minHeight: 44 }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                    borderRadius: 14,
                    boxSizing: 'border-box',
                    background: it.done ? C.meals : 'transparent',
                    border: it.done ? 'none' : `2px solid ${C.meals}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {it.done && <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} />}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 17, color: it.done ? C.muted : C.ink, textDecoration: it.done ? 'line-through' : 'none' }}>
                    {it.label}
                  </span>
                  {it.note && <span style={{ fontSize: 13, color: C.muted }}>{it.note}</span>}
                </span>
              </button>
            ))}
          </div>
        ) : null,
      )}

      <button type="button" onClick={clearChecked} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', fontSize: 15, fontWeight: 700, color: C.tealText, padding: 8 }}>
        Clear checked items
      </button>
    </>
  )
}

const micBtn = {
  all: 'unset',
  cursor: 'pointer',
  width: 48,
  height: 48,
  borderRadius: 12,
  background: C.meals,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}
