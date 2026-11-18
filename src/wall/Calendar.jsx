import { useMemo, useState } from 'react'
import { C, card } from '../theme.js'
import { Clock } from './parts.jsx'
import { useEvents } from '../lib/eventsource.js'
import { useMembers } from '../lib/members.jsx'
import { addDays, startOfWeek, isSameDay, timeOfDay } from '../lib/time.js'
import { VIEWS, DOW, rangeFor, eventsOn, stepAnchor, periodTitle } from '../lib/calendar.js'
import DayPopover from './DayPopover.jsx'
import { useDragScroll } from './dragScroll.js'

function WallPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        background: active ? C.meals : C.card,
        color: active ? '#FFFFFF' : C.ink,
        border: active ? 'none' : `2px solid ${C.border}`,
        borderRadius: 999,
        padding: '14px 28px',
        fontSize: 26,
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  )
}

function RoundBtn({ children, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ all: 'unset', cursor: 'pointer', width: 72, height: 72, borderRadius: 36, border: `2px solid ${C.border}`, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 700 }}
    >
      {children}
    </button>
  )
}

function MonthView({ events, anchor, onDayClick }) {
  const { colorFor } = useMembers()
  const { from, monthFirst } = rangeFor('month', anchor)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(from, i))
  const today = new Date()
  const curMonth = monthFirst.getMonth()
  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateRows: 'auto', gridAutoRows: 'minmax(190px, auto)', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {DOW.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, color: C.muted }}>{d}</div>
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, w) => (
        <div key={w} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {cells.slice(w * 7, w * 7 + 7).map((day, i) => {
            const list = eventsOn(events, day)
            const inMonth = day.getMonth() === curMonth
            const isToday = isSameDay(day, today)
            return (
              <button
                key={i}
                type="button"
                aria-label={`${day.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}, ${list.length} events`}
                onClick={() => onDayClick(day)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  borderRadius: 16,
                  padding: 10,
                  background: isToday ? C.tealTint : C.card,
                  border: `2px solid ${isToday ? C.meals : C.border}`,
                  opacity: inMonth ? 1 : 0.4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: isToday ? 800 : 600, textAlign: 'right' }}>{day.getDate()}</div>
                {list.map((ev) => (
                  <div key={ev.id} style={{ fontSize: 16, lineHeight: 1.15, padding: '2px 8px', borderRadius: 7, background: colorFor(ev), color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.title}
                  </div>
                ))}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function WeekView({ events, anchor }) {
  const { colorFor } = useMembers()
  const start = startOfWeek(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const today = new Date()
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {days.map((day, i) => {
        const list = eventsOn(events, day)
        const isToday = isSameDay(day, today)
        return (
          <div key={i} style={card({ flex: '1 0 auto', minHeight: 120, padding: '16px 24px', display: 'flex', gap: 20, alignItems: 'center', borderColor: isToday ? C.meals : C.border, background: isToday ? C.tealTint : C.card })}>
            <div style={{ width: 150, flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{DOW[i]}</div>
              <div style={{ fontSize: 22, color: C.muted }}>{day.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flexGrow: 1 }}>
              {list.length ? (
                list.map((ev) => (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.cream, borderRadius: 12, padding: '8px 14px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: colorFor(ev) }} />
                    <span style={{ fontSize: 22, color: C.muted }}>{ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}</span>
                    <span style={{ fontSize: 22, fontWeight: 600 }}>{ev.title}</span>
                    {ev.location && <span style={{ fontSize: 20, color: C.muted }}>· {ev.location}</span>}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: 22, color: C.muted }}>Free</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DayView({ events, anchor }) {
  const { colorFor } = useMembers()
  const list = eventsOn(events, anchor)
  return (
    <div style={card({ minHeight: '100%', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 })}>
      {list.length ? (
        list.map((ev) => (
          <div key={ev.id} style={{ display: 'flex', gap: 24, alignItems: 'center', background: C.cream, borderRadius: 18, padding: '18px 24px' }}>
            <div style={{ width: 10, height: 56, borderRadius: 5, background: colorFor(ev) }} />
            <div style={{ width: 160, fontSize: 28, color: C.muted }}>{ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}</div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 600 }}>{ev.title}</div>
              {ev.location && <div style={{ fontSize: 22, color: C.muted }}>{ev.location}</div>}
            </div>
          </div>
        ))
      ) : (
        <div style={{ fontSize: 28, color: C.muted }}>Nothing scheduled.</div>
      )}
    </div>
  )
}

export default function Calendar() {
  const [view, setView] = useState('month')
  const [anchor, setAnchor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const range = useMemo(() => rangeFor(view, anchor), [view, anchor])
  const { events: allEvents } = useEvents(range.from, range.to)
  // Shared screen: never show work calendars, and respect "show on hub".
  const events = allEvents.filter((e) => e.kind !== 'work' && e.show_on_hub !== false)

  // Drag up/down to scroll (the wall's touch is mouse-like); swipe sideways for
  // the previous/next period. The wall's page-swipe is kept out of it.
  const drag = useDragScroll({ onSwipeX: (dir) => setAnchor((a) => stepAnchor(view, a, dir)) })

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 100 }}>
        <div style={{ fontSize: 56, fontWeight: 800 }}>{periodTitle(view, anchor)}</div>
        <Clock />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {VIEWS.map((v) => (
            <WallPill key={v.key} active={view === v.key} onClick={() => setView(v.key)}>
              {v.label}
            </WallPill>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <RoundBtn label="Previous" onClick={() => setAnchor((a) => stepAnchor(view, a, -1))}>‹</RoundBtn>
          <button type="button" onClick={() => setAnchor(new Date())} style={{ all: 'unset', cursor: 'pointer', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', border: `2px solid ${C.border}`, borderRadius: 36, fontSize: 24, fontWeight: 700 }}>
            Today
          </button>
          <RoundBtn label="Next" onClick={() => setAnchor((a) => stepAnchor(view, a, 1))}>›</RoundBtn>
        </div>
      </div>

      <div ref={drag.ref} {...drag.handlers} className={drag.className} style={{ ...drag.style, flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {view === 'month' && <MonthView events={events} anchor={anchor} onDayClick={setSelectedDay} />}
        {view === 'week' && <WeekView events={events} anchor={anchor} />}
        {view === 'day' && <DayView events={events} anchor={anchor} />}
      </div>

      <DayPopover day={selectedDay} events={events} onClose={() => setSelectedDay(null)} />
    </>
  )
}
