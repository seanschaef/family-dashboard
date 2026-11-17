import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'

// New-chore form. Selections are local; saving to Supabase arrives with the
// chores/points feature (step 2).
const REPEATS = ['Once', 'Daily', 'Weekly', 'Custom']
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const POINTS = ['None', '5', '10', '20']

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        background: active ? color : C.card,
        color: active ? '#FFFFFF' : C.ink,
        border: active ? 'none' : `2px solid ${C.border}`,
        borderRadius: 999,
        padding: '8px 14px',
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{label}</div>
      {children}
    </div>
  )
}

export default function Chores() {
  const { members } = useMembers()
  const [name, setName] = useState('')
  const [who, setWho] = useState('')
  const [repeat, setRepeat] = useState('Weekly')
  const [days, setDays] = useState([1, 3, 5]) // Mon, Wed, Fri
  const [points, setPoints] = useState('5')

  const toggleDay = (i) => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))

  return (
    <>
      <PhoneHeader title="New chore" />

      <Field label="Chore">
        <input
          aria-label="Chore name"
          type="text"
          placeholder="Walk the dog"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }}
        />
      </Field>

      <Field label="Who">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {members.map((p) => (
            <Chip key={p.key} active={who === p.key} color={p.color} onClick={() => setWho(p.key)}>
              {p.name}
            </Chip>
          ))}
          <Chip active={who === 'rotate'} onClick={() => setWho('rotate')}>
            Rotate
          </Chip>
        </div>
      </Field>

      <Field label="Repeats">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {REPEATS.map((r) => (
            <Chip key={r} active={repeat === r} onClick={() => setRepeat(r)}>
              {r}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Days">
        <div style={{ display: 'flex', gap: 6 }}>
          {DAYS.map((d, i) => (
            <Chip key={i} active={days.includes(i)} onClick={() => toggleDay(i)}>
              {d}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Points (optional)">
        <div style={{ display: 'flex', gap: 8 }}>
          {POINTS.map((p) => (
            <Chip key={p} active={points === p} onClick={() => setPoints(p)}>
              {p}
            </Chip>
          ))}
        </div>
      </Field>

      <div style={{ flexGrow: 1 }} />

      <button
        type="button"
        style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: 16, textAlign: 'center', fontSize: 17, fontWeight: 700 }}
      >
        Save chore
      </button>
    </>
  )
}
