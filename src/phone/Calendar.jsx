import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { Pill } from './parts.jsx'
import { useEvents } from '../lib/eventsource.js'
import { useMembers } from '../lib/members.jsx'
import { addDays, startOfWeek, isSameDay, timeOfDay } from '../lib/time.js'
import { VIEWS, DOW, rangeFor, eventsOn, stepAnchor, periodTitle } from '../lib/calendar.js'
import DayPopover from '../wall/DayPopover.jsx'

function AgendaRow({ ev }) {
  const { colorFor } = useMembers()
  const color = colorFor(ev.person_key)
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 6, alignSelf: 'stretch', minHeight: 40, borderRadius: 3, background: color, flexShrink: 0 }} />
      <div style={{ width: 62, flexShrink: 0, fontSize: 14, color: C.muted, paddingTop: 2 }}>
        {ev.all_day ? 'All day' : timeOfDay(ev.starts_at)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {ev.title}
          {ev.kind === 'work' && <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}> · work</span>}
        </div>
        {ev.location && <div style={{ fontSize: 13, color: C.muted }}>{ev.location}</div>}
      </div>
    </div>
  )
}

function DayView({ events, anchor }) {
  const list = eventsOn(events, anchor)
  if (!list.length) return <div style={{ fontSize: 15, color: C.muted, padding: 8 }}>Nothing scheduled.</div>
  return <div style={cardCol}>{list.map((ev) => <AgendaRow key={ev.id} ev={ev} />)}</div>
}

function WeekView({ events, anchor }) {
  const { colorFor } = useMembers()
  const start = startOfWeek(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const today = new Date()
  return (
    <>
      {days.map((day, i) => {
        const list = eventsOn(events, day)
        const isToday = isSameDay(day, today)
        return (
          <div key={i} style={{ ...cardCol, gap: 8, borderColor: isToday ? C.rust : C.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {DOW[i]} {day.getDate()}
              </div>
              {isToday && <div style={{ fontSize: 12, fontWeight: 700, color: C.rust }}>Today</div>}
            </div>
            {list.length ? (
              list.map((ev) => (
                <div key={ev.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 15 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: colorFor(ev.person_key), flexShrink: 0 }} />
                  <span style={{ color: C.muted, width: 52, flexShrink: 0 }}>{ev.all_day ? '—' : timeOfDay(ev.starts_at)}</span>
                  <span>{ev.title}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 14, color: C.muted }}>Free</div>
            )}
          </div>
        )
      })}
    </>
  )
}

function MonthView({ events, anchor, onDayClick }) {
  const { colorFor } = useMembers()
  const { from, monthFirst } = rangeFor('month', anchor)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(from, i))
  const today = new Date()
  const curMonth = monthFirst.getMonth()
  return (
    <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {DOW.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: C.muted, padding: '2px 0' }}>
            {d[0]}
          </div>
        ))}
        {cells.map((day, i) => {
          const list = eventsOn(events, day)
          const inMonth = day.getMonth() === curMonth
          const isToday = isSameDay(day, today)
          return (
            <button key={i} type="button" onClick={() => onDayClick(day)} style={{ all: 'unset', cursor: 'pointer', minHeight: 62, borderRadius: 8, padding: 4, background: isToday ? C.tealTint : 'transparent', opacity: inMonth ? 1 : 0.35, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, textAlign: 'right' }}>{day.getDate()}</div>
              {list.slice(0, 3).map((ev) => (
                <div key={ev.id} title={ev.title} style={{ fontSize: 10, lineHeight: 1.2, padding: '1px 4px', borderRadius: 4, background: colorFor(ev.person_key), color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ev.title}
                </div>
              ))}
              {list.length > 3 && <div style={{ fontSize: 10, color: C.muted }}>+{list.length - 3}</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Calendar() {
  const [view, setView] = useState('week')
  const [anchor, setAnchor] = useState(() => new Date())
  const range = useMemo(() => rangeFor(view, anchor), [view, anchor])
  const { events, loading } = useEvents(range.from, range.to)
  const { members } = useMembers()
  const [selectedDay, setSelectedDay] = useState(null)
  const legend = [...members.map((m) => [m.name, m.color]), ['Family', C.ink]]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{periodTitle(view, anchor)}</div>
        <Link to="/app/calendars" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>
          Feeds
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {VIEWS.map((v) => (
          <Pill key={v.key} active={view === v.key} onClick={() => setView(v.key)}>
            {v.label}
          </Pill>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={() => setAnchor((a) => stepAnchor(view, a, -1))} style={navBtn} aria-label="Previous">‹</button>
        <button type="button" onClick={() => setAnchor(new Date())} style={{ ...navBtn, width: 'auto', padding: '0 14px', fontSize: 14, fontWeight: 700 }}>
          Today
        </button>
        <button type="button" onClick={() => setAnchor((a) => stepAnchor(view, a, 1))} style={navBtn} aria-label="Next">›</button>
        {loading && <span style={{ fontSize: 13, color: C.muted }}>loading…</span>}
      </div>

      {view === 'day' && <DayView events={events} anchor={anchor} />}
      {view === 'week' && <WeekView events={events} anchor={anchor} />}
      {view === 'month' && <MonthView events={events} anchor={anchor} onDayClick={setSelectedDay} />}

      <DayPopover day={selectedDay} events={events} onClose={() => setSelectedDay(null)} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: C.muted, paddingTop: 4 }}>
        {legend.map(([name, color]) => (
          <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: color }} />
            {name}
          </span>
        ))}
      </div>
    </>
  )
}

const cardCol = { background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box' }
const navBtn = { all: 'unset', cursor: 'pointer', width: 40, height: 40, borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }
