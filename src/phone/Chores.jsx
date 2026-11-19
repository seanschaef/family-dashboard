import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useChores, addChore, updateChore, removeChore, assigneesOf, isEachChore } from '../lib/chores.js'

const REPEATS = [
  { label: 'Once', value: 'once' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
]
const DAYS = ['Su', 'M', 'T', 'W', 'R', 'F', 'Sa'] // index = getDay() (0=Sun); R = Thursday
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
  const { members, nameFor, petName } = useMembers()
  const { configured } = useAuth()
  const { rows: chores } = useChores()
  const [name, setName] = useState('')
  const [who, setWho] = useState([]) // member keys; empty = anyone
  const [mode, setMode] = useState('each')
  const [repeat, setRepeat] = useState('weekly')
  const [days, setDays] = useState([1, 3, 5])
  const [points, setPoints] = useState(0)
  const [tag, setTag] = useState(null) // 'pet' or null
  const [editing, setEditing] = useState(null) // chore id being edited, or null for a new one
  const [status, setStatus] = useState(null)

  const toggleDay = (i) => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort((a, b) => a - b)))

  const resetForm = () => {
    setEditing(null)
    setName('')
    setWho([])
    setMode('each')
    setRepeat('weekly')
    setDays([1, 3, 5])
    setPoints(0)
    setTag(null)
  }

  const startEdit = (c) => {
    setEditing(c.id)
    setName(c.title)
    setWho(assigneesOf(c))
    setMode(c.shared_mode === 'any' ? 'any' : 'each')
    setRepeat(c.repeat || 'weekly')
    setDays(c.days?.length ? [...c.days].sort((a, b) => a - b) : [1, 3, 5])
    setPoints(c.points || 0)
    setTag(c.tag || null)
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.querySelector('main')?.parentElement?.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  async function save() {
    if (!name.trim()) return
    setStatus(null)
    const fields = { member_keys: who, shared_mode: mode, title: name.trim(), repeat, days, points, tag }
    try {
      if (editing) await updateChore(editing, fields)
      else await addChore(fields)
      resetForm()
      setStatus('Saved')
    } catch (e) {
      setStatus(e.message)
    }
  }

  const whoLabel = (c) => {
    const keys = assigneesOf(c)
    if (!keys.length) return 'Anyone'
    const names = keys.map(nameFor)
    if (keys.length === 1) return names[0]
    return isEachChore(c) ? `${names.join(', ')} (each)` : `${names.join(' or ')} (any one)`
  }
  const repeatLabel = (c) => (c.repeat === 'weekly' ? [...(c.days || [])].sort((a, b) => a - b).map((d) => DAYS[d]).join(' ') : c.repeat)

  return (
    <>
      <PhoneHeader title="Chores" action={<Link to="/app/rewards" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>Rewards & points ›</Link>} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{editing ? 'Edit chore' : 'New chore'}</div>
        {editing && <button type="button" onClick={resetForm} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.muted }}>Cancel edit</button>}
      </div>
      <Field label="Chore">
        <input aria-label="Chore name" type="text" placeholder="Walk the dog" value={name} onChange={(e) => setName(e.target.value)} style={{ font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }} />
      </Field>
      <Field label="Who (tap one or more)">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {members.map((p) => (
            <Chip key={p.key} active={who.includes(p.key)} color={p.color} onClick={() => setWho((w) => (w.includes(p.key) ? w.filter((k) => k !== p.key) : [...w, p.key]))}>{p.name}</Chip>
          ))}
          <Chip active={who.length === 0} onClick={() => setWho([])}>Anyone</Chip>
        </div>
      </Field>
      {who.length > 1 && (
        <Field label="When it's shared">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip active={mode === 'each'} onClick={() => setMode('each')}>Each person does it</Chip>
            <Chip active={mode === 'any'} onClick={() => setMode('any')}>Any one of them</Chip>
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {mode === 'each'
              ? 'It shows on everyone’s list; each person ticks their own and earns their own points.'
              : 'One tick clears it for everyone; points go to whoever ticked it.'}
          </div>
        </Field>
      )}
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {POINTS.map((p) => (
            <Chip key={p.value} active={points === p.value} onClick={() => setPoints(p.value)}>{p.label}</Chip>
          ))}
          <input aria-label="Points" type="number" inputMode="numeric" min="0" max="1000" value={points} onChange={(e) => setPoints(Math.max(0, Math.min(1000, Number(e.target.value) || 0)))} style={{ width: 80, font: 'inherit', fontSize: 15, padding: '8px 10px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink }} />
        </div>
      </Field>
      <Field label="Type">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip active={tag !== 'pet'} onClick={() => setTag(null)}>Regular chore</Chip>
          <Chip active={tag === 'pet'} color={C.home} onClick={() => setTag('pet')}>{petName || 'Pet'} chore</Chip>
        </div>
        {tag === 'pet' && <div style={{ fontSize: 13, color: C.muted }}>Shows in {petName || 'the pet'}&apos;s window on the hub as well as on chore lists.</div>}
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={save} disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: '14px 24px', fontSize: 16, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>{editing ? 'Save changes' : 'Save chore'}</button>
        {status && <span style={{ fontSize: 14, color: status === 'Saved' ? C.tealText : C.danger }}>{status}</span>}
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
                {c.tag === 'pet' ? `${petName || 'Pet'} · ` : ''}{whoLabel(c)} · {repeatLabel(c)}{c.points ? ` · ${c.points} pts` : ''}
              </div>
            </div>
            <button type="button" onClick={() => startEdit(c)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.tealText }}>Edit</button>
            <button type="button" onClick={() => { if (window.confirm(`Delete “${c.title}”? Its history and points go too.`)) removeChore(c.id) }} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.danger }}>Delete</button>
          </div>
        ))
      )}
    </>
  )
}
