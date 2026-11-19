import { useEffect, useMemo, useRef, useState } from 'react'
import { C, card, eventBlock } from '../theme.js'
import { useEvents } from '../lib/eventsource.js'
import { ownsEvent } from '../lib/calendars.js'
import { useMembers } from '../lib/members.jsx'
import { addDays, startOfWeek, isSameDay, timeOfDay } from '../lib/time.js'
import { rangeFor, eventsOn, stepAnchor, periodTitle } from '../lib/calendar.js'
import DayPopover from './DayPopover.jsx'
import EventPopover from './EventPopover.jsx'
import { useDragScroll } from './dragScroll.js'

// An embeddable calendar that combines everyone's calendars (colour-coded) with
// a Day / Week / Month switch. Used in the hub's calendar block. Pass
// personKey to scope it to one member (for member pages), or leave it out for
// the whole family. Work calendars are excluded unless includeWork is set.
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Seg({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        background: active ? C.meals : 'transparent',
        color: active ? '#FFFFFF' : C.muted,
        borderRadius: 999,
        padding: '8px 18px',
        fontSize: 20,
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  )
}

export default function CalendarBlock({ personKey = null, includeWork = false, title = 'Family calendar', height = 500 }) {
  const { colorFor } = useMembers()
  const [view, setView] = useState('week')
  const [anchor, setAnchor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const drag = useDragScroll({ onSwipeX: (dir) => setAnchor((a) => stepAnchor(view, a, dir)) })

  // Fetch a wide enough window that the Today summary works in any view.
  const range = useMemo(() => rangeFor(view, anchor), [view, anchor])
  const { events } = useEvents(range.from, range.to)
  const today = new Date()

  const scopeFilter = (e) => {
    if (!includeWork && e.kind === 'work') return false
    if (!personKey) return e.show_on_hub !== false
    return ownsEvent(e, personKey)
  }
  const scoped = events.filter(scopeFilter)

  return (
    <div style={card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Title with the period beside it (saves a whole row for events). */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 800, whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ fontSize: 20, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{periodTitle(view, anchor)}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: C.cream, borderRadius: 999, padding: 3 }}>
            <Seg active={view === 'day'} onClick={() => setView('day')}>Day</Seg>
            <Seg active={view === 'week'} onClick={() => setView('week')}>Week</Seg>
            <Seg active={view === 'month'} onClick={() => setView('month')}>Month</Seg>
          </div>
          <button type="button" aria-label="Previous" onClick={() => setAnchor((a) => stepAnchor(view, a, -1))} style={arrowBtn}>‹</button>
          <button type="button" aria-label="Next" onClick={() => setAnchor((a) => stepAnchor(view, a, 1))} style={arrowBtn}>›</button>
        </div>
      </div>

      {/* Drag to scroll (the wall's touch is mouse-like); swipe sideways for prev/next. */}
      <div ref={drag.ref} {...drag.handlers} className={drag.className} style={{ ...drag.style, flex: '1 1 0', minHeight: 0 }}>
        {view === 'day' && <DayView events={scoped} anchor={anchor} colorFor={colorFor} onEventClick={setSelectedEvent} />}
        {view === 'week' && <WeekView events={scoped} anchor={anchor} colorFor={colorFor} today={today} onDayClick={setSelectedDay} />}
        {view === 'month' && <MonthView events={scoped} anchor={anchor} colorFor={colorFor} today={today} onDayClick={setSelectedDay} />}
      </div>

      <DayPopover day={selectedDay} events={scoped} onClose={() => setSelectedDay(null)} />
      <EventPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  )
}

function DayView({ events, anchor, colorFor, onEventClick }) {
  const list = eventsOn(events, anchor)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {list.length ? (
        list.map((ev) => (
          <button key={ev.id} type="button" onClick={() => onEventClick(ev)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', gap: 16, alignItems: 'center', ...eventBlock(colorFor(ev), { padding: '12px 16px' }) }}>
            <div style={{ width: 90, fontSize: 22, color: C.muted }}>{ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{ev.title}</div>
              {ev.location && <div style={{ fontSize: 19, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.location}</div>}
            </div>
          </button>
        ))
      ) : (
        <div style={{ fontSize: 22, color: C.muted }}>Nothing scheduled.</div>
      )}
    </div>
  )
}

// Week view with a focus day: today's column is wider and easier to read, the
// other days shrink. Tap another day and it grows instead (animated); tap the
// focused day again to open it. Goes back to today after 30 s without a tap.
const FOCUS_RESET_MS = 30 * 1000

function WeekView({ events, anchor, colorFor, today, onDayClick }) {
  const start = startOfWeek(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const todayIdx = days.findIndex((d) => isSameDay(d, today))
  const [focus, setFocus] = useState(todayIdx)
  const timer = useRef(null)

  // New week shown, or back to today: focus today (or nothing if not in it).
  useEffect(() => setFocus(todayIdx), [todayIdx, start.getTime()]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), [])

  const pick = (i) => {
    if (i === focus) return onDayClick(days[i])
    setFocus(i)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setFocus(todayIdx), FOCUS_RESET_MS)
  }

  const cols = days.map((_, i) => (focus < 0 ? '1fr' : i === focus ? '2.6fr' : '1fr')).join(' ')
  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: cols, gap: 8, transition: 'grid-template-columns 450ms ease' }}>
      {days.map((day, i) => {
        const list = eventsOn(events, day)
        const isToday = i === todayIdx
        const big = focus < 0 || i === focus
        return (
          <button key={i} type="button" aria-label={`${day.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}, ${list.length} events`} onClick={() => pick(i)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', background: i === focus ? C.tealTint : isToday ? C.tealTint : C.cream, outline: i === focus ? `3px solid ${C.tealText}` : 'none', outlineOffset: -3, borderRadius: 12, padding: big ? 12 : 8, display: 'flex', flexDirection: 'column', gap: big ? 8 : 5, minWidth: 0, overflow: 'hidden', transition: 'padding 450ms ease' }}>
            <div style={{ fontSize: big ? 19 : 14, fontWeight: 800, color: isToday ? C.tealText : C.ink, whiteSpace: 'nowrap', transition: 'font-size 450ms ease' }}>
              {DOW[i]} {day.getDate()}
            </div>
            {list.map((ev) => (
              <div key={ev.id} style={{ display: 'flex', minWidth: 0, ...eventBlock(colorFor(ev), { borderLeftWidth: big ? 5 : 3, borderRadius: 6, padding: big ? '4px 8px' : '2px 4px' }) }}>
                <span style={{ fontSize: big ? 17 : 12, lineHeight: 1.2, minWidth: 0, transition: 'font-size 450ms ease', overflowWrap: 'break-word', hyphens: 'auto' }}>
                  <span style={{ color: C.muted }}>{ev.all_day ? '' : timeOfDay(ev.starts_at) + ' '}</span>
                  {ev.title}
                  {big && ev.location && (
                    <span style={{ display: 'block', fontSize: 14, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.location}</span>
                  )}
                </span>
              </div>
            ))}
          </button>
        )
      })}
    </div>
  )
}

function MonthView({ events, anchor, colorFor, today, onDayClick }) {
  const { from, monthFirst } = rangeFor('month', anchor)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(from, i))
  const curMonth = monthFirst.getMonth()
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto', gridAutoRows: 'minmax(64px, auto)', gap: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DOW.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: C.muted }}>{d[0]}</div>
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, w) => (
        <div key={w} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
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
                style={{ all: 'unset', cursor: 'pointer', borderRadius: 8, padding: '4px 6px', background: isToday ? C.tealTint : C.cream, opacity: inMonth ? 1 : 0.4, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', boxSizing: 'border-box' }}
              >
                <div style={{ fontSize: 15, fontWeight: isToday ? 800 : 600 }}>{day.getDate()}</div>
                {list.map((ev) => (
                  <span key={ev.id} style={{ fontSize: 11, lineHeight: 1.2, padding: '1px 5px', borderRadius: 5, background: colorFor(ev), color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.title}
                  </span>
                ))}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

const arrowBtn = {
  all: 'unset',
  cursor: 'pointer',
  width: 48,
  height: 48,
  borderRadius: 24,
  border: `2px solid ${C.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 26,
  fontWeight: 700,
}
