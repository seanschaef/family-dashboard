import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import {
  usePhotoCollections,
  addCollection,
  updateCollection,
  removeCollection,
  scheduleSummary,
  MONTH_LABELS,
} from '../lib/photos.js'

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
const inputStyle = { font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }

export default function Photos() {
  const { configured } = useAuth()
  const { members, nameFor } = useMembers()
  const { rows: collections } = usePhotoCollections()

  const [name, setName] = useState('')
  const [folder, setFolder] = useState('')
  const [who, setWho] = useState('family')
  const [months, setMonths] = useState([])
  const [useHours, setUseHours] = useState(false)
  const [startHour, setStartHour] = useState(6)
  const [endHour, setEndHour] = useState(11)
  const [status, setStatus] = useState(null)

  const toggleMonth = (m) => setMonths((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]))

  async function save() {
    if (!name.trim() || !folder.trim()) return
    setStatus(null)
    try {
      await addCollection({
        name: name.trim(),
        folder: folder.trim(),
        member_key: who === 'family' ? null : who,
        months,
        start_hour: useHours ? Number(startHour) : null,
        end_hour: useHours ? Number(endHour) : null,
        sort_order: collections.length + 1,
      })
      setName('')
      setFolder('')
      setMonths([])
      setUseHours(false)
      setStatus('Saved')
    } catch (e) {
      setStatus(e.message)
    }
  }

  const whoLabel = (c) => (c.member_key ? nameFor(c.member_key) : 'Everyone')

  return (
    <>
      <PhoneHeader title="Photos" subtitle="Folders from your home NAS" />

      <div style={{ background: C.tealTint, borderRadius: 16, padding: 14, fontSize: 14, color: C.ink }}>
        Each collection points at a folder on your NAS. Route it to a person, a season, or a time of day. Photos stay on the NAS and only show on the wall.
      </div>

      <div style={{ fontSize: 16, fontWeight: 800 }}>New collection</div>
      <Field label="Name">
        <input aria-label="Collection name" type="text" placeholder="Holidays" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="NAS folder">
        <input aria-label="NAS folder" type="text" placeholder="Family/Christmas" value={folder} onChange={(e) => setFolder(e.target.value)} style={{ ...inputStyle, fontFamily: 'ui-monospace, monospace', fontSize: 15 }} />
      </Field>
      <Field label="Show on">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip active={who === 'family'} onClick={() => setWho('family')}>Hub (everyone)</Chip>
          {members.map((p) => (
            <Chip key={p.key} active={who === p.key} color={p.color} onClick={() => setWho(p.key)}>{p.name}&apos;s page</Chip>
          ))}
        </div>
      </Field>
      <Field label="Only these months (optional)">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MONTH_LABELS.map((d, i) => (
            <Chip key={i} active={months.includes(i + 1)} onClick={() => toggleMonth(i + 1)}>{d}</Chip>
          ))}
        </div>
      </Field>
      <Field label="Only certain hours (optional)">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip active={useHours} onClick={() => setUseHours((v) => !v)}>{useHours ? 'On' : 'Off'}</Chip>
          {useHours && (
            <>
              <input aria-label="Start hour" type="number" min="0" max="23" value={startHour} onChange={(e) => setStartHour(e.target.value)} style={{ ...inputStyle, width: 70, fontSize: 15 }} />
              <span style={{ color: C.muted }}>to</span>
              <input aria-label="End hour" type="number" min="0" max="23" value={endHour} onChange={(e) => setEndHour(e.target.value)} style={{ ...inputStyle, width: 70, fontSize: 15 }} />
              <span style={{ color: C.muted, fontSize: 14 }}>24h</span>
            </>
          )}
        </div>
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={save} disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: '14px 24px', fontSize: 16, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>Save collection</button>
        {status && <span style={{ fontSize: 14, color: status === 'Saved' ? C.tealText : '#8A3E1F' }}>{status}</span>}
      </div>
      {!configured && <div style={{ fontSize: 13, color: C.muted }}>Connect Supabase to save collections.</div>}

      <div style={{ fontSize: 18, fontWeight: 800, paddingTop: 8 }}>Collections</div>
      {collections.length === 0 ? (
        <div style={{ fontSize: 15, color: C.muted }}>No collections yet.</div>
      ) : (
        collections.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12, opacity: c.active ? 1 : 0.55 }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: C.muted, fontFamily: 'ui-monospace, monospace' }}>{c.folder}</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {whoLabel(c)}{scheduleSummary(c) ? ` · ${scheduleSummary(c)}` : ''}
              </div>
            </div>
            <button type="button" onClick={() => updateCollection(c.id, { active: !c.active })} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.tealText }}>{c.active ? 'Hide' : 'Show'}</button>
            <button type="button" onClick={() => removeCollection(c.id)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#8A3E1F' }}>Delete</button>
          </div>
        ))
      )}
    </>
  )
}
