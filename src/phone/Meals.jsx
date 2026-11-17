import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader, Pill } from './parts.jsx'

// Sample week (step 3 wires real meal plans + saved recipes).
const DAYS = [
  { day: 'Mon', meal: '[Meal]', sub: '4 ingredients · on list', highlight: true },
  { day: 'Tue', meal: '[Meal]', sub: '3 ingredients' },
  { day: 'Wed', meal: '[Meal]', sub: '5 ingredients' },
  { day: 'Thu', meal: '+ Plan a dinner' },
  { day: 'Fri', meal: 'Pizza night' },
  { day: 'Sat', meal: '+ Plan a dinner' },
  { day: 'Sun', meal: '+ Plan a dinner' },
]

export default function Meals() {
  const [tab, setTab] = useState('this')
  return (
    <>
      <PhoneHeader title="Meals" subtitle="Week of Nov 16" />

      <div style={{ display: 'flex', gap: 8 }}>
        <Pill active={tab === 'this'} onClick={() => setTab('this')}>
          This week
        </Pill>
        <Pill active={tab === 'next'} onClick={() => setTab('next')}>
          Next week
        </Pill>
        <Pill active={tab === 'saved'} onClick={() => setTab('saved')}>
          Saved recipes
        </Pill>
      </div>

      {DAYS.map((d) => (
        <button
          key={d.day}
          type="button"
          aria-label={`Edit ${d.day} dinner`}
          style={{
            all: 'unset',
            cursor: 'pointer',
            background: d.highlight ? C.tealTint : C.card,
            border: `2px solid ${C.border}`,
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, width: 40 }}>{d.day}</span>
          <span style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <span style={{ fontSize: 17 }}>{d.meal}</span>
            {d.sub && <span style={{ fontSize: 13, color: C.muted }}>{d.sub}</span>}
          </span>
          <span style={{ fontSize: 20, color: C.muted }}>›</span>
        </button>
      ))}

      <button
        type="button"
        style={{
          all: 'unset',
          cursor: 'pointer',
          background: C.meals,
          color: '#FFFFFF',
          borderRadius: 14,
          padding: 14,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        Add week's ingredients to groceries
      </button>
    </>
  )
}
