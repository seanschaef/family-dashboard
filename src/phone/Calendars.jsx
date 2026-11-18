import { useEffect, useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useAuth } from '../lib/auth.jsx'
import { listCalendars, addCalendar, removeCalendar, syncCalendars } from '../lib/calendars.js'

const KINDS = [
  { key: 'personal', label: 'Personal' },
  { key: 'work', label: 'Work (owner page only)' },
]

export default function Calendars() {
  const { configured } = useAuth()
  const { members } = useMembers()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [person, setPerson] = useState('')
  const [kind, setKind] = useState('personal')
  const [showOnHub, setShowOnHub] = useState(true)

  async function refresh() {
    try {
      setList(await listCalendars())
    } catch (e) {
      setStatus({ kind: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (configured) refresh()
    else setLoading(false)
  }, [configured])

  async function onAdd(e) {
    e.preventDefault()
    setStatus(null)
    const p = members.find((x) => x.key === person)
    try {
      await addCalendar({
        name: name.trim(),
        ics_url: url.trim(),
        person_key: person,
        kind,
        show_on_hub: kind === 'work' ? false : showOnHub,
        color: person === 'family' ? C.ink : p?.color,
      })
      setName('')
      setUrl('')
      await refresh()
      setStatus({ kind: 'ok', text: 'Calendar added.' })
    } catch (err) {
      setStatus({ kind: 'error', text: err.message })
    }
  }

  async function onSync() {
    setStatus({ kind: 'ok', text: 'Syncing…' })
    try {
      await syncCalendars()
      await refresh()
      setStatus({ kind: 'ok', text: 'Synced.' })
    } catch (err) {
      setStatus({ kind: 'error', text: err.message })
    }
  }

  const input = { font: 'inherit', fontSize: 16, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }

  return (
    <>
      <PhoneHeader title="Calendar links" subtitle="Private ICS feeds · read-only" />

      <div style={{ fontSize: 14, color: C.muted }}>
        Paste the private ICS link from Google Calendar or Outlook. Events are
        still created in those apps; the wall just shows them, colour-coded by
        person. A work calendar shows only on that person's page, never on the
        family hub.
      </div>

      {!configured && (
        <div style={{ background: '#FBE9E3', color: '#8A3E1F', borderRadius: 12, padding: 14, fontSize: 14 }}>
          Connect Supabase first (.env.local) to save calendar links.
        </div>
      )}

      <form onSubmit={onAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input aria-label="Calendar name" placeholder="e.g. Work (Outlook)" value={name} onChange={(e) => setName(e.target.value)} required style={input} />
        <input aria-label="ICS URL" type="url" placeholder="https://…/basic.ics" value={url} onChange={(e) => setUrl(e.target.value)} required style={input} />

        <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Whose calendar</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPerson('family')}
            style={{ all: 'unset', cursor: 'pointer', background: person === 'family' ? C.ink : C.card, color: person === 'family' ? '#FFFFFF' : C.ink, border: person === 'family' ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}
          >
            Family
          </button>
          {members.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPerson(p.key)}
              style={{ all: 'unset', cursor: 'pointer', background: person === p.key ? p.color : C.card, color: person === p.key ? '#FFFFFF' : C.ink, border: person === p.key ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Type</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {KINDS.map((k) => (
            <button key={k.key} type="button" onClick={() => setKind(k.key)} style={{ all: 'unset', cursor: 'pointer', background: kind === k.key ? C.rust : C.card, color: kind === k.key ? '#FFFFFF' : C.ink, border: kind === k.key ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}>
              {k.label}
            </button>
          ))}
        </div>

        {kind === 'personal' && (
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15 }}>
            <input type="checkbox" checked={showOnHub} onChange={(e) => setShowOnHub(e.target.checked)} />
            Show on the family hub
          </label>
        )}

        {status && <div style={{ fontSize: 14, color: status.kind === 'error' ? '#8A3E1F' : C.tealText }}>{status.text}</div>}

        <button type="submit" disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', textAlign: 'center', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 16, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>
          Add calendar
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Linked calendars</div>
        {configured && list.length > 0 && (
          <button type="button" onClick={onSync} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.tealText }}>
            Refresh events now
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 15, color: C.muted }}>Loading…</div>
      ) : list.length === 0 ? (
        <div style={{ fontSize: 15, color: C.muted }}>No calendars linked yet.</div>
      ) : (
        list.map((cal) => (
          <div key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 14 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: cal.color || C.muted, flexShrink: 0 }} />
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{cal.name}</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {cal.kind === 'work' ? 'Work · owner page only' : cal.show_on_hub ? 'Personal · on hub' : 'Personal'}
                {cal.last_synced_at ? ` · synced ${new Date(cal.last_synced_at).toLocaleDateString('en-CA')}` : ' · not synced yet'}
              </div>
            </div>
            <button type="button" onClick={() => removeCalendar(cal.id).then(refresh)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#8A3E1F' }}>
              Remove
            </button>
          </div>
        ))
      )}
    </>
  )
}
