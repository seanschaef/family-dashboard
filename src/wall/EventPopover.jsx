import { C } from '../theme.js'
import { useMembers } from '../lib/members.jsx'

// Tap an event: everything about it in one card. Full title and location (no
// "…"), the date, start and end time, which calendar it came from and whose it
// is. Work events arrive already masked as "Busy" (see eventsource.js).
export default function EventPopover({ event: ev, onClose }) {
  const { colorFor, nameFor } = useMembers()
  if (!ev) return null
  const start = new Date(ev.starts_at)
  const end = ev.ends_at ? new Date(ev.ends_at) : null
  const date = start.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
  const ampm = (d) => d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).replace(/\./g, '')
  let when = 'All day'
  if (!ev.all_day) {
    const sameDay = end && end.toDateString() === start.toDateString()
    when = sameDay ? `${ampm(start)} – ${ampm(end)}` : ampm(start)
    if (end && !sameDay) when += ` – ${end.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} ${ampm(end)}`
  }
  const who = (ev.owners || [ev.person_key]).map(nameFor).filter(Boolean).join(' & ')
  const row = { display: 'flex', gap: 14, alignItems: 'baseline', fontSize: 24 }
  const label = { width: 120, flexShrink: 0, color: C.muted, fontSize: 20 }

  return (
    // stopPropagation: when opened from the day pop-up, closing this card
    // shouldn't also close the pop-up underneath.
    <div onClick={(e) => { e.stopPropagation(); onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 40 }}>
      <div
        role="dialog"
        aria-label={ev.title}
        onClick={(e) => e.stopPropagation()}
        style={{ background: C.card, borderRadius: 28, border: `2px solid ${C.border}`, borderTop: `12px solid ${colorFor(ev)}`, width: 'min(680px, 92%)', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15 }}>{ev.title}</div>
          <button type="button" aria-label="Close" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', width: 56, height: 56, borderRadius: 28, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, flexShrink: 0 }}>
            ×
          </button>
        </div>
        <div style={row}><span style={label}>When</span><span><b>{date}</b><br />{when}</span></div>
        {ev.location && <div style={row}><span style={label}>Where</span><span>{ev.location}</span></div>}
        {who && <div style={row}><span style={label}>Who</span><span>{who}</span></div>}
        {ev.calendarName && (
          <div style={row}>
            <span style={label}>Calendar</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: colorFor(ev) }} />
              {ev.calendarName}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
