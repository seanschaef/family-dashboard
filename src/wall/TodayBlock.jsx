import { useMemo, useState } from 'react'
import { C, card } from '../theme.js'
import { useEvents } from '../lib/eventsource.js'
import { useMembers } from '../lib/members.jsx'
import { rangeFor, eventsOn } from '../lib/calendar.js'
import { timeOfDay } from '../lib/time.js'
import { useDragScroll } from './dragScroll.js'
import EventPopover from './EventPopover.jsx'

// Hub block: today's schedule for the whole family (what the calendar block's
// old "TODAY" strip showed), as a scrollable list. Work calendars and ones
// hidden from the hub stay off it.
export default function TodayBlock({ height }) {
  const { colorFor, nameFor } = useMembers()
  const today = new Date()
  const range = useMemo(() => rangeFor('day', today), [today.toDateString()]) // eslint-disable-line react-hooks/exhaustive-deps
  const { events } = useEvents(range.from, range.to)
  const list = eventsOn(events.filter((e) => e.kind !== 'work' && e.show_on_hub !== false), today)
  const drag = useDragScroll()
  const [open, setOpen] = useState(null)

  return (
    <div style={card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: height || '100%' })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Today</div>
        <div style={{ fontSize: 18, color: C.muted }}>{list.length ? `${list.length} ${list.length === 1 ? 'event' : 'events'}` : ''}</div>
      </div>
      <div ref={drag.ref} {...drag.handlers} className={drag.className} style={{ ...drag.style, flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.length ? (
          list.map((ev) => (
            <button key={ev.id} type="button" onClick={() => setOpen(ev)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', gap: 12, alignItems: 'center', background: C.cream, borderRadius: 14, padding: '10px 14px', flexShrink: 0 }}>
              <div style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, background: colorFor(ev), flexShrink: 0 }} />
              <div style={{ width: 64, fontSize: 18, color: C.muted, flexShrink: 0 }}>{ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>{ev.title}</div>
                <div style={{ fontSize: 15, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {[(ev.owners || [ev.person_key]).map(nameFor).filter(Boolean).join(' & '), ev.location].filter(Boolean).join(' · ')}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div style={{ fontSize: 22, color: C.muted }}>Nothing scheduled.</div>
        )}
      </div>
      <EventPopover event={open} onClose={() => setOpen(null)} />
    </div>
  )
}
