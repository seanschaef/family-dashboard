import { C } from '../theme.js'
import { popIn, fadeIn } from '../lib/popIn.js'
import Avatar from '../components/Avatar.jsx'
import { LiveCheck } from './parts.jsx'
import { todayISO } from '../lib/db.js'
import { dueChores, isDone, assigneesOf, doneByText, ANYONE } from '../lib/chores.js'
import { useMembers } from '../lib/members.jsx'
import { useChoreActions } from '../lib/choreActions.jsx'
import Hold from '../components/Hold.jsx'
import { useDragScroll } from './dragScroll.js'

// Tap a person in the hub's Chores card: a pop-up with today's chores for that
// person, tickable right there. Same look as the calendar's tap-a-day pop-up.
export default function ChoresPopover({ person, chores, logs, onClose }) {
  const { nameFor } = useMembers()
  const actions = useChoreActions({ logs, pageKey: person?.key === ANYONE ? null : person?.key, onWall: true, scale: 2 })
  // The wall's touch screen acts as a mouse, so a long list needs drag-to-scroll.
  const drag = useDragScroll()
  if (!person) return null
  const T = todayISO()
  const due = dueChores(chores, logs, person.key, T).sort((a, b) => a.title.localeCompare(b.title))
  const doneCount = due.filter((c) => isDone(logs, c, T, person.key)).length
  // An 'Anyone' tick from the wall isn't credited to a particular person.
  const who = person.key === ANYONE ? null : person.key
  const heading = person.key === ANYONE ? 'Chores for Anyone' : `${person.name}'s Chores`

  return (
    <div
      ref={fadeIn}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 40 }}
    >
      <div
        ref={(el) => { popIn(el); drag.ref.current = el }}
        {...drag.handlers}
        role="dialog"
        aria-label={heading}
        onClick={(e) => e.stopPropagation()}
        style={{ ...drag.style, background: C.card, borderRadius: 28, border: `2px solid ${C.border}`, width: 'min(680px, 92%)', maxHeight: '80%', overflowY: 'auto', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar member={person} size={56} />
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
                <Hold onHold={() => actions.askUndo(c, isDone(logs, c, T, person.key), who)}>
                <LiveCheck
                  label={c.title}
                  sub={[doneByText(logs, c, T, nameFor), others.length ? `with ${others.map(nameFor).join(', ')}` : '', c.points ? `${c.points} pts` : ''].filter(Boolean).join(' · ') || undefined}
                  done={isDone(logs, c, T, person.key)}
                  color={person.color}
                  onToggle={() => actions.tick(c, isDone(logs, c, T, person.key), who)}
                />
                </Hold>
              </div>
            )
          })
        ) : (
          <div style={{ fontSize: 24, color: C.muted }}>Nothing due today.</div>
        )}
        <div style={{ fontSize: 16, color: C.muted }}>Tap to tick. Press and hold a ticked chore to undo it.</div>
        {actions.ui}
      </div>
    </div>
  )
}
