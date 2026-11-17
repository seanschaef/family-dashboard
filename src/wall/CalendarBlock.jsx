import { useMemo, useState } from 'react'
import { C, card } from '../theme.js'
import { useEvents } from '../lib/eventsource.js'
import { useMembers } from '../lib/members.jsx'
import { addDays, startOfWeek, isSameDay, timeOfDay } from '../lib/time.js'
import { rangeFor, eventsOn, stepAnchor, periodTitle } from '../lib/calendar.js'
import DayPopover from './DayPopover.jsx'

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

export default function CalendarBlock({ personKey = null, includeWork = false, title = 'Family calendar', height = 500, todaySummary = false }) {
  const { colorFor } = useMembers()
  const [view, setView] = useState('week')
  const [anchor, setAnchor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  // Fetch a wide enough window that the Today summary works in any view.
  const range = useMemo(() => rangeFor(view, anchor), [view, anchor])
  const { events } = useEvents(range.from, range.to)
  const today = new Date()
  const todayRange = useMemo(() => rangeFor('day', today), [today.toDateString()])
  const { events: todayEvents } = useEvents(todayRange.from, todayRange.to)

  const scopeFilter = (e) => {
    if (!includeWork && e.kind === 'work') return false
    if (!personKey) return true
    return e.person_key === personKey || e.person_key === 'family'
  }
  const scoped = events.filter(scopeFilter)
  const todayList = eventsOn(todayEvents.filter(scopeFilter), today)

  return (
    <div style={card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{title}</div>
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

      {todaySummary && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.muted, letterSpacing: 1 }}>TODAY</span>
          {todayList.length ? (
            todayList.map((ev) => (
              <span key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.cream, borderRadius: 999, padding: '6px 14px' }}>
                <span style={{ width: 9, height: 9, borderRadius: 5, background: colorFor(ev.person_key) }} />
                <span style={{ fontSize: 19 }}>
                  <span style={{ color: C.muted }}>{ev.all_day ? '' : timeOfDay(ev.starts_at) + ' '}</span>
                  {ev.title}
                </span>
              </span>
            ))
          ) : (
            <span style={{ fontSize: 19, color: C.muted }}>Nothing scheduled.</span>
          )}
        </div>
      )}

      <div style={{ fontSize: 20, color: C.muted }}>{periodTitle(view, anchor)}</div>

      {view === 'day' && <DayView events={scoped} anchor={anchor} colorFor={colorFor} />}
      {view === 'week' && <WeekView events={scoped} anchor={anchor} colorFor={colorFor} today={today} />}
      {view === 'month' && <MonthView events={scoped} anchor={anchor} colorFor={colorFor} today={today} onDayClick={setSelectedDay} />}

      <DayPopover day={selectedDay} events={scoped} onClose={() => setSelectedDay(null)} />
    </div>
  )
}

function DayView({ events, anchor, colorFor }) {
  const list = eventsOn(events, anchor)
  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
      {list.length ? (
        list.map((ev) => (
          <div key={ev.id} style={{ display: 'flex', gap: 16, alignItems: 'center', background: C.cream, borderRadius: 14, padding: '12px 16px' }}>
            <div style={{ width: 8, height: 40, borderRadius: 4, background: colorFor(ev.person_key) }} />
            <div style={{ width: 90, fontSize: 22, color: C.muted }}>{ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{ev.title}</div>
          </div>
        ))
      ) : (
        <div style={{ fontSize: 22, color: C.muted }}>Nothing scheduled.</div>
      )}
    </div>
  )
}

function WeekView({ events, anchor, colorFor, today }) {
  const start = startOfWeek(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  return (
    <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, overflow: 'hidden' }}>
      {days.map((day, i) => {
        const list = eventsOn(events, day)
        const isToday = isSameDay(day, today)
        return (
          <div key={i} style={{ background: isToday ? C.tealTint : C.cream, borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: isToday ? C.tealText : C.ink }}>{DOW[i]} {day.getDate()}</div>
            {list.slice(0, 5).map((ev) => (
              <div key={ev.id} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: colorFor(ev.person_key), flexShrink: 0, alignSelf: 'center' }} />
                <span style={{ fontSize: 15, lineHeight: 1.2 }}>
                  <span style={{ color: C.muted }}>{ev.all_day ? '' : timeOfDay(ev.starts_at) + ' '}</span>
                  {ev.title}
                </span>
              </div>
            ))}
            {list.length > 5 && <div style={{ fontSize: 14, color: C.muted }}>+{list.length - 5}</div>}
          </div>
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
    <div style={{ flexGrow: 1, display: 'grid', gridTemplateRows: 'auto repeat(6, 1fr)', gap: 4, overflow: 'hidden' }}>
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
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {list.slice(0, 4).map((ev) => (
                    <span key={ev.id} title={ev.title} style={{ width: 9, height: 9, borderRadius: 5, background: colorFor(ev.person_key) }} />
                  ))}
                </div>
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
