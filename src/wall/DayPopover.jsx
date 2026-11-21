import { useState } from 'react'
import { popIn, fadeIn } from '../lib/popIn.js'
import { C, eventBlock } from '../theme.js'
import EventPopover from './EventPopover.jsx'
import { useMembers } from '../lib/members.jsx'
import { eventsOn } from '../lib/calendar.js'
import { timeOfDay } from '../lib/time.js'

// Tap-a-day detail: a modal listing one day's events. Used from month views.
// Rendered as a full-frame overlay; tap the backdrop or the close button to
// dismiss. `events` is the already-scoped list for the current range.
export default function DayPopover({ day, events, onClose }) {
  const { colorFor, nameFor } = useMembers()
  const [open, setOpen] = useState(null)
  if (!day) return null
  const list = eventsOn(events, day)
  const heading = day.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div
      ref={fadeIn}
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
        ref={popIn}
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
            <button key={ev.id} type="button" onClick={() => setOpen(ev)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', gap: 18, alignItems: 'center', ...eventBlock(colorFor(ev), { borderLeftWidth: 8, borderRadius: 12, padding: '16px 20px' }) }}>
              <div style={{ width: 130, fontSize: 24, color: C.muted }}>{ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 600 }}>
                  {ev.title}
                  {ev.kind === 'work' && <span style={{ fontSize: 18, color: C.muted, fontWeight: 500 }}> · work</span>}
                </div>
                <div style={{ fontSize: 19, color: C.muted }}>
                  {[(ev.owners || [ev.person_key]).map(nameFor).join(' & '), ev.location].filter(Boolean).join(' · ')}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div style={{ fontSize: 24, color: C.muted }}>Nothing scheduled.</div>
        )}
      </div>
      <EventPopover event={open} onClose={() => setOpen(null)} />
    </div>
  )
}
