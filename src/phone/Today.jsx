import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { formatLongDate, useNow } from '../lib/time.js'
import { useAuth } from '../lib/auth.jsx'
import { PhoneHeader, Pill, PhoneCard, PhoneToggle } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { todayISO } from '../lib/db.js'
import { useChores, useChoreLogs, dueChores, isDone, assigneesOf, isEachChore, doneByText } from '../lib/chores.js'
import { useChoreActions } from '../lib/choreActions.jsx'
import Hold from '../components/Hold.jsx'
import { useReminders, addReminder, toggleReminder } from '../lib/household.js'

function firstName(me, user) {
  if (me?.name) return me.name
  const local = (user?.email || '').split('@')[0]
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'there'
}


export default function Today() {
  const now = useNow()
  const { user } = useAuth()
  const { me, setMe, members, nameFor } = useMembers()
  const [scope, setScope] = useState('me')
  const T = todayISO()
  const { rows: chores } = useChores()
  const { rows: logs } = useChoreLogs()
  const { rows: reminders } = useReminders()
  const [newReminder, setNewReminder] = useState('')
  const actions = useChoreActions({ logs })

  const meColor = me?.color || C.rust
  const scopeKey = scope === 'me' ? me?.key : null
  // One row per chore, except a family-view 'each' chore gets a row per
  // assignee (each person ticks their own).
  // "Me" also lists chores nobody is assigned to, so anyone can tick them
  // (the tick and any points are credited to whoever does it).
  // A person's list already includes chores nobody is assigned to.
  const due = dueChores(chores, logs, scopeKey, T)
  const choreList = due
    .sort((a, b) => a.title.localeCompare(b.title))
    .flatMap((c) => {
      if (scope === 'me') return [{ c, who: me?.key, rowKey: c.id }]
      if (isEachChore(c)) return assigneesOf(c).map((k) => ({ c, who: k, rowKey: `${c.id}-${k}` }))
      return [{ c, who: me?.key && assigneesOf(c).includes(me.key) ? me.key : null, rowKey: c.id }]
    })
  const subFor = ({ c, who }) => {
    const by = doneByText(logs, c, T, nameFor)
    if (by) return by
    if (scope === 'me' && !assigneesOf(c).length) return ['Anyone', c.points ? `${c.points} pts` : ''].filter(Boolean).join(' · ')
    if (scope === 'me') return [assigneesOf(c).length > 1 ? `with ${assigneesOf(c).filter((k) => k !== me?.key).map(nameFor).join(', ')}` : '', c.points ? `${c.points} pts` : ''].filter(Boolean).join(' · ') || undefined
    if (isEachChore(c)) return nameFor(who)
    const names = assigneesOf(c).map(nameFor)
    return names.length ? names.join(' or ') : 'Anyone'
  }
  const reminderList = reminders.filter((r) => (scope === 'family' ? true : r.member_key === me?.key || r.member_key === null))

  async function submitReminder(e) {
    e.preventDefault()
    const text = newReminder.trim()
    if (!text) return
    setNewReminder('')
    await addReminder({ member_key: scope === 'me' ? me?.key : null, text })
  }

  const needsWho = !me && members.length > 0

  return (
    <>
      <PhoneHeader title={`Hi ${firstName(me, user)}`} subtitle={formatLongDate(now)} />

      {needsWho && (
        <div style={{ background: C.tealTint, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Who Are You?</div>
          <div style={{ fontSize: 14, color: C.muted }}>Pick yourself so Today shows your chores and reminders.</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {members.map((m) => (
              <button key={m.id} type="button" onClick={() => setMe(m.id)} style={{ all: 'unset', cursor: 'pointer', background: m.color, color: '#FFFFFF', borderRadius: 999, padding: '8px 16px', fontSize: 15, fontWeight: 700 }}>
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Pill active={scope === 'me'} color={meColor} onClick={() => setScope('me')}>Me</Pill>
        <Pill active={scope === 'family'} color={meColor} onClick={() => setScope('family')}>Family</Pill>
      </div>

      <PhoneCard style={{ gap: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{scope === 'me' ? 'My Chores' : 'Chores Today'}</div>
        {scope === 'me' && !me ? (
          <div style={{ fontSize: 15, color: C.muted }}>Pick who you are above.</div>
        ) : choreList.length === 0 ? (
          <div style={{ fontSize: 15, color: C.muted }}>Nothing due today.</div>
        ) : (
          choreList.map((row) => (
            <Hold key={row.rowKey} onHold={() => actions.askUndo(row.c, isDone(logs, row.c, T, row.who), row.who)}>
            <PhoneToggle
              label={row.c.title}
              sub={subFor(row)}
              done={isDone(logs, row.c, T, row.who)}
              color={scope === 'family' ? C.meals : meColor}
              onToggle={() => actions.tick(row.c, isDone(logs, row.c, T, row.who), row.who)}
            />
            </Hold>
          ))
        )}
        {choreList.length > 0 && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Press and hold a ticked chore to undo it.</div>}
        {actions.ui}
      </PhoneCard>

      <PhoneCard style={{ gap: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Reminders</div>
        {reminderList.map((r) => (
          <PhoneToggle key={r.id} label={r.text} done={r.done} color={meColor} onToggle={(next) => toggleReminder(r.id, next)} />
        ))}
        <form onSubmit={submitReminder} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input aria-label="New reminder" placeholder="Add a reminder" value={newReminder} onChange={(e) => setNewReminder(e.target.value)} style={{ flexGrow: 1, font: 'inherit', fontSize: 15, padding: '8px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card }} />
          <button type="submit" style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 10, padding: '8px 14px', fontSize: 14, fontWeight: 700 }}>Add</button>
        </form>
      </PhoneCard>


      {/* Quick ways to put something on the wall (settings live under Settings). */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[['/app/notes', 'Write a note', 'Short message on the wall'], ['/app/ink', 'Draw on the wall', 'Ink board']].map(([to, title, sub]) => (
          <Link key={to} to={to} style={{ flex: 1, textDecoration: 'none', background: C.tealTint, borderRadius: 16, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.tealText }}>{title} ›</span>
            <span style={{ fontSize: 12, color: C.muted }}>{sub}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
