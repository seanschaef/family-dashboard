import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C, MEMBER_PALETTE } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import { useImportantDates, addImportantDate, removeImportantDate, DATE_KINDS, dateCountdown, countdownText } from '../lib/dates.js'

const input = { font: 'inherit', fontSize: 16, padding: '10px 12px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }
const label = { fontSize: 13, fontWeight: 700, color: C.muted }

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={{ all: 'unset', cursor: 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? '2px solid transparent' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}>
      {children}
    </button>
  )
}

export default function Dates() {
  const { configured } = useAuth()
  const { petName } = useMembers()
  const { rows: dates } = useImportantDates()

  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('birthday')
  const [date, setDate] = useState('')
  const [yearKnown, setYearKnown] = useState(true)
  const [repeats, setRepeats] = useState(true)
  const [color, setColor] = useState(null)
  const [status, setStatus] = useState(null)

  async function save(e) {
    e.preventDefault()
    if (!title.trim() || !date) return
    setStatus(null)
    try {
      await addImportantDate({ title: title.trim(), kind, date, year_known: yearKnown, repeats: kind === 'other' ? repeats : true, color })
      setTitle('')
      setDate('')
      setColor(null)
      setStatus({ ok: true, text: 'Saved. It shows in the hub countdown.' })
    } catch (err) {
      setStatus({ ok: false, text: err.message })
    }
  }

  const sorted = [...dates]
    .map((d) => ({ d, c: dateCountdown(d) }))
    .sort((a, b) => (a.c?.days ?? 1e9) - (b.c?.days ?? 1e9))

  return (
    <>
      <PhoneHeader title="Important dates" subtitle="Counted down on the hub" action={<Link to="/app/settings" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>‹ Settings</Link>} />

      <div style={{ fontSize: 14, color: C.muted }}>
        Birthdays of people who aren&apos;t in the family list, {petName ? `${petName}'s` : 'the pet’s'} birthday,
        anniversaries and other dates. Family members&apos; own birthdays come from Settings › People.
      </div>

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DATE_KINDS.map((k) => (
            <Chip key={k.key} active={kind === k.key} onClick={() => setKind(k.key)}>{k.label}</Chip>
          ))}
        </div>
        <div>
          <div style={label}>{kind === 'birthday' ? 'Whose birthday' : kind === 'anniversary' ? 'Name' : 'What'}</div>
          <input
            aria-label="Name"
            required
            placeholder={kind === 'birthday' ? (petName || 'Grandma Jean') : kind === 'anniversary' ? 'Our anniversary' : 'Trip to the mountains'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={input}
          />
        </div>
        <div>
          <div style={label}>Date</div>
          <input aria-label="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={input} />
        </div>
        {kind !== 'other' && (
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15 }}>
            <input type="checkbox" checked={!yearKnown} onChange={(e) => setYearKnown(!e.target.checked)} />
            I&apos;m not sure of the year (don&apos;t show {kind === 'birthday' ? 'the age' : 'how many years'})
          </label>
        )}
        {kind === 'other' && (
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15 }}>
            <input type="checkbox" checked={repeats} onChange={(e) => setRepeats(e.target.checked)} />
            Every year (untick for a one-off date)
          </label>
        )}
        <div>
          <div style={label}>Dot colour (optional)</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            {MEMBER_PALETTE.map((col) => (
              <button key={col} type="button" aria-label={`Colour ${col}`} aria-pressed={color === col} onClick={() => setColor(color === col ? null : col)} style={{ all: 'unset', cursor: 'pointer', width: 26, height: 26, borderRadius: 13, background: col, boxShadow: color === col ? `0 0 0 3px ${C.cream}, 0 0 0 5px ${col}` : 'none' }} />
            ))}
          </div>
        </div>
        {status && <div style={{ fontSize: 14, color: status.ok ? C.tealText : C.danger }}>{status.text}</div>}
        <button type="submit" disabled={!configured} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 16, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>
          Add date
        </button>
      </form>

      <div style={{ fontSize: 18, fontWeight: 800, paddingTop: 8 }}>Saved dates</div>
      {sorted.length === 0 ? (
        <div style={{ fontSize: 15, color: C.muted }}>None yet.</div>
      ) : (
        sorted.map(({ d, c }) => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: d.color || C.muted, flexShrink: 0 }} />
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{d.title}</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {DATE_KINDS.find((k) => k.key === d.kind)?.label} ·{' '}
                {new Date(d.date + 'T00:00:00').toLocaleDateString('en-CA', d.year_known === false || (d.kind === 'other' && d.repeats) ? { month: 'long', day: 'numeric' } : { year: 'numeric', month: 'long', day: 'numeric' })}
                {c ? ` · ${countdownText({ ...c, kind: d.kind })}` : ' · passed'}
              </div>
            </div>
            <button type="button" onClick={() => removeImportantDate(d.id)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.danger }}>Delete</button>
          </div>
        ))
      )}
    </>
  )
}
