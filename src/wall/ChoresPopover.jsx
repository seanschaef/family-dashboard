import { C } from '../theme.js'
import { LiveCheck } from './parts.jsx'
import { todayISO } from '../lib/db.js'
import { dueChores, isDone, toggleChore, assigneesOf, ANYONE } from '../lib/chores.js'
import { useMembers } from '../lib/members.jsx'

// Tap a person in the hub's Chores card: a pop-up with today's chores for that
// person, tickable right there. Same look as the calendar's tap-a-day pop-up.
export default function ChoresPopover({ person, chores, logs, onClose }) {
  const { nameFor } = useMembers()
  if (!person) return null
  const T = todayISO()
  const due = dueChores(chores, logs, person.key, T).sort((a, b) => a.title.localeCompare(b.title))
  const doneCount = due.filter((c) => isDone(logs, c, T, person.key)).length
  // An 'Anyone' tick from the wall isn't credited to a particular person.
  const who = person.key === ANYONE ? null : person.key
  const heading = person.key === ANYONE ? 'Chores for anyone' : `${person.name}'s chores`

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 40 }}
    >
      <div
        role="dialog"
        aria-label={heading}
        onClick={(e) => e.stopPropagation()}
        style={{ background: C.card, borderRadius: 28, border: `2px solid ${C.border}`, width: 'min(680px, 92%)', maxHeight: '80%', overflowY: 'auto', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 56, height: 56, borderRadius: 28, background: person.color, color: '#FFFFFF', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(person.name[0] || '?').toUpperCase()}
            </span>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{heading}</div>
              <div style={{ fontSize: 20, color: C.muted }}>{doneCount} of {due.length} done today</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{ all: 'unset', cursor: 'pointer', width: 56, height: 56, borderRadius: 28, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        {due.length ? (
          due.map((c) => {
            const others = assigneesOf(c).filter((k) => k !== person.key)
            return (
              <div key={c.id} style={{ background: C.cream, borderRadius: 16, padding: '12px 18px' }}>
                <LiveCheck
                  label={c.title}
                  sub={[others.length ? `with ${others.map(nameFor).join(', ')}` : '', c.points ? `${c.points} pts` : ''].filter(Boolean).join(' · ') || undefined}
                  done={isDone(logs, c, T, person.key)}
                  color={person.color}
                  onToggle={() => toggleChore(c, T, isDone(logs, c, T, person.key), who)}
                />
              </div>
            )
          })
        ) : (
          <div style={{ fontSize: 24, color: C.muted }}>Nothing due today.</div>
        )}
      </div>
    </div>
  )
}
