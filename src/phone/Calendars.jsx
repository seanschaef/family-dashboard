import { useEffect, useState } from 'react'
import { C, MEMBER_PALETTE, FAMILY_COLOR } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useAuth } from '../lib/auth.jsx'
import { listCalendars, addCalendar, removeCalendar, syncCalendars, updateCalendar } from '../lib/calendars.js'

const KINDS = [
  { key: 'personal', label: 'Personal' },
  { key: 'work', label: 'Work (owner page only)' },
]

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={{ all: 'unset', cursor: 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? '2px solid transparent' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}>
      {children}
    </button>
  )
}

// Owners: Family (on its own) or one or more people.
function OwnerPicker({ value, onChange, members }) {
  const isFamily = value.length === 1 && value[0] === 'family'
  const toggle = (key) => {
    const people = value.filter((k) => k !== 'family')
    onChange(people.includes(key) ? people.filter((k) => k !== key) : [...people, key])
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Chip active={isFamily} color={FAMILY_COLOR} onClick={() => onChange(['family'])}>Family</Chip>
      {members.map((p) => (
        <Chip key={p.key} active={value.includes(p.key)} color={p.color} onClick={() => toggle(p.key)}>{p.name}</Chip>
      ))}
    </div>
  )
}

// Colour: "match the person" (null), a preset, or any custom colour.
function ColorPicker({ value, onChange, autoColor }) {
  const presets = [...MEMBER_PALETTE, FAMILY_COLOR]
  const swatch = (col, selected) => ({ all: 'unset', cursor: 'pointer', width: 28, height: 28, borderRadius: 14, background: col, boxShadow: selected ? `0 0 0 3px ${C.cream}, 0 0 0 5px ${col}` : 'none', flexShrink: 0 })
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => onChange(null)} aria-pressed={!value} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: !value ? C.ink : C.muted }}>
        <span style={{ ...swatch(autoColor, !value), display: 'inline-block' }} />
        Person&apos;s colour
      </button>
      {presets.map((col) => (
        <button key={col} type="button" aria-label={`Colour ${col}`} aria-pressed={value === col} onClick={() => onChange(col)} style={swatch(col, value === col)} />
      ))}
      <label title="Custom colour" style={{ cursor: 'pointer', width: 28, height: 28, borderRadius: 14, border: `2px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
        <span aria-hidden="true" style={{ fontSize: 16, color: C.muted, lineHeight: 1 }}>+</span>
        <input type="color" aria-label="Custom colour" value={value || autoColor || '#2F6A9E'} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
      </label>
      {value && !presets.includes(value) && <span style={swatch(value, true)} />}
    </div>
  )
}

const ownersOf = (cal) => (cal.person_keys?.length ? cal.person_keys : cal.person_key ? [cal.person_key] : [])

function CalendarRow({ cal, members, colorFor, nameFor, onChanged }) {
  const [open, setOpen] = useState(false)
  const owners = ownersOf(cal)
  const shown = cal.color || colorFor(owners[0])
  const save = async (patch) => {
    await updateCalendar(cal.id, patch)
    onChanged()
  }
  return (
    <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: shown, flexShrink: 0 }} />
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{cal.name}</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {owners.map(nameFor).join(' & ') || 'No owner'} · {cal.kind === 'work' ? 'Work · owner page only' : cal.show_on_hub ? 'on hub' : 'not on hub'}
            {cal.last_synced_at ? ` · synced ${new Date(cal.last_synced_at).toLocaleDateString('en-CA')}` : ' · not synced yet'}
          </div>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.tealText }}>{open ? 'Done' : 'Edit'}</button>
      </div>
      {open && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Belongs to</div>
          <OwnerPicker value={owners} members={members} onChange={(keys) => keys.length && save({ person_keys: keys, person_key: keys[0] })} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Colour</div>
          <ColorPicker value={cal.color} autoColor={colorFor(owners[0])} onChange={(color) => save({ color })} />
          {cal.kind !== 'work' && (
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15 }}>
              <input type="checkbox" checked={cal.show_on_hub} onChange={(e) => save({ show_on_hub: e.target.checked })} />
              Show on the family hub
            </label>
          )}
          <button type="button" onClick={() => removeCalendar(cal.id).then(onChanged)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.danger, alignSelf: 'flex-start' }}>
            Remove calendar
          </button>
        </>
      )}
    </div>
  )
}

export default function Calendars() {
  const { configured } = useAuth()
  const { members, colorFor, nameFor } = useMembers()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [owners, setOwners] = useState([])
  const [color, setColor] = useState(null)
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
    if (!owners.length) {
      setStatus({ kind: 'error', text: 'Pick who the calendar belongs to.' })
      return
    }
    try {
      await addCalendar({
        name: name.trim(),
        ics_url: url.trim(),
        person_keys: owners,
        kind,
        show_on_hub: kind === 'work' ? false : showOnHub,
        color,
      })
      setName('')
      setUrl('')
      setColor(null)
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
  const label = { fontSize: 14, fontWeight: 700, color: C.muted }

  return (
    <>
      <PhoneHeader title="Calendar links" subtitle="Private ICS feeds · read-only" />

      <div style={{ fontSize: 14, color: C.muted }}>
        Paste the private ICS link from Google Calendar or Outlook. Events are
        still created in those apps; the wall just shows them in the calendar&apos;s
        colour. A calendar can belong to several people (it shows on each of
        their pages). A work calendar shows only on its owners&apos; pages, never on
        the family hub.
      </div>

      {!configured && (
        <div style={{ background: C.dangerTint, color: C.danger, borderRadius: 12, padding: 14, fontSize: 14 }}>
          Connect Supabase first (.env.local) to save calendar links.
        </div>
      )}

      <form onSubmit={onAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input aria-label="Calendar name" placeholder="e.g. Soccer (TeamSnap)" value={name} onChange={(e) => setName(e.target.value)} required style={input} />
        <input aria-label="ICS URL" type="url" placeholder="https://…/basic.ics" value={url} onChange={(e) => setUrl(e.target.value)} required style={input} />

        <div style={label}>Whose calendar (tap one or more)</div>
        <OwnerPicker value={owners} onChange={setOwners} members={members} />

        <div style={label}>Colour</div>
        <ColorPicker value={color} onChange={setColor} autoColor={colorFor(owners[0])} />

        <div style={label}>Type</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {KINDS.map((k) => (
            <Chip key={k.key} active={kind === k.key} color={C.rust} onClick={() => setKind(k.key)}>{k.label}</Chip>
          ))}
        </div>

        {kind === 'work' && (
          <div style={{ background: C.dangerTint, color: C.danger, borderRadius: 12, padding: 12, fontSize: 13 }}>
            Publish a work calendar as <b>busy only</b> (Outlook: &quot;Can view when I&apos;m busy&quot;). Whatever the link shows is
            readable by anyone who has it, and gets copied into the family database. Client or confidential details should never be in it.
          </div>
        )}

        {kind === 'personal' && (
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15 }}>
            <input type="checkbox" checked={showOnHub} onChange={(e) => setShowOnHub(e.target.checked)} />
            Show on the family hub
          </label>
        )}

        {status && <div style={{ fontSize: 14, color: status.kind === 'error' ? C.danger : C.tealText }}>{status.text}</div>}

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
        list.map((cal) => <CalendarRow key={cal.id} cal={cal} members={members} colorFor={colorFor} nameFor={nameFor} onChanged={refresh} />)
      )}
    </>
  )
}
