import { C } from '../theme.js'
import { useMembers } from '../lib/members.jsx'
import { eventsOn } from '../lib/calendar.js'
import { timeOfDay } from '../lib/time.js'

// Tap-a-day detail: a modal listing one day's events. Used from month views.
// Rendered as a full-frame overlay; tap the backdrop or the close button to
// dismiss. `events` is the already-scoped list for the current range.
export default function DayPopover({ day, events, onClose }) {
  const { colorFor, nameFor } = useMembers()
  if (!day) return null
  const list = eventsOn(events, day)
  const heading = day.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(43, 36, 32, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 40,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 28,
          border: `2px solid ${C.border}`,
          width: 'min(680px, 92%)',
          maxHeight: '80%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{heading}</div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{ all: 'unset', cursor: 'pointer', width: 56, height: 56, borderRadius: 28, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700 }}
          >
            ×
          </button>
        </div>

        {list.length ? (
          list.map((ev) => (
            <div key={ev.id} style={{ display: 'flex', gap: 18, alignItems: 'center', background: C.cream, borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ width: 8, height: 48, borderRadius: 4, background: colorFor(ev.person_key) }} />
              <div style={{ width: 130, fontSize: 24, color: C.muted }}>{ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 600 }}>
                  {ev.title}
                  {ev.kind === 'work' && <span style={{ fontSize: 18, color: C.muted, fontWeight: 500 }}> · work</span>}
                </div>
                <div style={{ fontSize: 19, color: C.muted }}>
                  {[nameFor(ev.person_key), ev.location].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 24, color: C.muted }}>Nothing scheduled.</div>
        )}
      </div>
    </div>
  )
}
