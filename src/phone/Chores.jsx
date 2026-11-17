import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useChores, addChore, removeChore } from '../lib/chores.js'

const REPEATS = [
  { label: 'Once', value: 'once' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
]
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] // index = getDay() (0=Sun)
const POINTS = [
  { label: 'None', value: 0 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
]

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}>
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
  const { members, nameFor } = useMembers()
  const { configured } = useAuth()
  const { rows: chores } = useChores()
  const [name, setName] = useState('')
  const [who, setWho] = useState('')
  const [repeat, setRepeat] = useState('weekly')
  const [days, setDays] = useState([1, 3, 5])
  const [points, setPoints] = useState(0)
  const [status, setStatus] = useState(null)

  const toggleDay = (i) => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))

  async function save() {
    if (!name.trim()) return
    setStatus(null)
    try {
      await addChore({ member_key: who === 'rotate' || who === '' ? null : who, title: name.trim(), repeat, days: repeat === 'weekly' ? days : [], points })
      setName('')
      setStatus('Saved')
    } catch (e) {
      setStatus(e.message)
    }
  }

  const repeatLabel = (c) => (c.repeat === 'weekly' ? (c.days || []).map((d) => DAYS[d]).join('') : c.repeat)

  return (
    <>
      <PhoneHeader title="Chores" action={<Link to="/app/rewards" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>Rewards & points ›</Link>} />

      <div style={{ fontSize: 16, fontWeight: 800 }}>New chore</div>
      <Field label="Chore">
        <input aria-label="Chore name" type="text" placeholder="Walk the dog" value={name} onChange={(e) => setName(e.target.value)} style={{ font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }} />
      </Field>
      <Field label="Who">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {members.map((p) => (
            <Chip key={p.key} active={who === p.key} color={p.color} onClick={() => setWho(p.key)}>{p.name}</Chip>
          ))}
          <Chip active={who === 'rotate'} onClick={() => setWho('rotate')}>Anyone</Chip>
        </div>
      </Field>
      <Field label="Repeats">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {REPEATS.map((r) => (
            <Chip key={r.value} active={repeat === r.value} onClick={() => setRepeat(r.value)}>{r.label}</Chip>
          ))}
        </div>
      </Field>
      {repeat === 'weekly' && (
        <Field label="Days">
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS.map((d, i) => (
              <Chip key={i} active={days.includes(i)} onClick={() => toggleDay(i)}>{d}</Chip>
            ))}
          </div>
        </Field>
      )}
      <Field label="Points (optional)">
        <div style={{ display: 'flex', gap: 8 }}>
          {POINTS.map((p) => (
            <Chip key={p.value} active={points === p.value} onClick={() => setPoints(p.value)}>{p.label}</Chip>
          ))}
        </div>
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={save} disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: '14px 24px', fontSize: 16, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>Save chore</button>
        {status && <span style={{ fontSize: 14, color: status === 'Saved' ? C.tealText : '#8A3E1F' }}>{status}</span>}
      </div>
      {!configured && <div style={{ fontSize: 13, color: C.muted }}>Connect Supabase to save chores.</div>}

      <div style={{ fontSize: 18, fontWeight: 800, paddingTop: 8 }}>All chores</div>
      {chores.length === 0 ? (
        <div style={{ fontSize: 15, color: C.muted }}>No chores yet.</div>
      ) : (
        chores.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12 }}>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {c.member_key ? nameFor(c.member_key) : 'Anyone'} · {repeatLabel(c)}{c.points ? ` · ${c.points} pts` : ''}
              </div>
            </div>
            <button type="button" onClick={() => removeChore(c.id)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#8A3E1F' }}>Delete</button>
          </div>
        ))
      )}
    </>
  )
}
