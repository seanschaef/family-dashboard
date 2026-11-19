import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChoresPopover from './ChoresPopover.jsx'
import { C, card } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { LiveCheck, ProgressRow } from './parts.jsx'
import CalendarBlock from './CalendarBlock.jsx'
import TodayBlock from './TodayBlock.jsx'
import Rotator from './Rotator.jsx'
import LegendBlock from './LegendBlock.jsx'
import PhotoFrame from './PhotoFrame.jsx'
import WeatherCard from './WeatherCard.jsx'
import { formatClock, formatLongDate, useNow } from '../lib/time.js'
import { hubGreeting } from '../lib/greetings.js'
import { useImportantDates, upcomingCountdowns, countdownText } from '../lib/dates.js'
import { useMembers } from '../lib/members.jsx'
import { todayISO } from '../lib/db.js'
import { useChores, useChoreLogs, dueChores, isDone } from '../lib/chores.js'
import { useReminders } from '../lib/household.js'
import PetBlock from './PetBlock.jsx'
import { useMeals, mealFor } from '../lib/kitchen.js'
import { normalizeHubLayout, blockHeight, WIDTH_SPAN, MIN_HEIGHT } from './hubLayout.js'

export default function Hub() {
  const now = useNow()
  const navigate = useNavigate()
  const [choresFor, setChoresFor] = useState(null) // member whose chore pop-up is open
  const { members, familyName, petName, wallLayout } = useMembers()
  const T = todayISO()
  const { rows: chores } = useChores()
  const { rows: logs } = useChoreLogs()
  const { rows: reminders } = useReminders()
  const { rows: meals } = useMeals()

  const familyReminders = reminders.filter((r) => r.member_key === null && !r.done)
  const dinner = mealFor(meals, T)?.title
  const { rows: importantDates } = useImportantDates()
  const coming = upcomingCountdowns(members, importantDates, now).slice(0, 3)

  // Block content by id. Rendered in the order/size the layout specifies.
  const blocks = {
    header: (size) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', height: blockHeight('header', size) }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.rust }}>{hubGreeting({ now, familyName, petName, members, dates: importantDates })}</div>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1 }}>{formatClock(now)}</div>
          <div style={{ fontSize: 26, color: C.muted }}>{formatLongDate(now)}</div>
        </div>
        <WeatherCard />
      </div>
    ),
    photo: (size, opts) => <PhotoFrame height={blockHeight('photo', size)} fit={opts?.fit} />,
    calendar: (size) => <CalendarBlock title="Family calendar" height={blockHeight('calendar', size)} />,
    today: (size) => <TodayBlock height={blockHeight('today', size)} />,
    legend: () => <LegendBlock />,
    dinner: () => (
      <button type="button" onClick={() => navigate('/wall/meals')} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.tealTint, borderRadius: 16, padding: '16px 22px', color: C.ink }}>
        <span style={{ fontSize: 24 }}>
          <span style={{ fontWeight: 800 }}>Dinner tonight:</span> {dinner || 'Not planned yet'}
        </span>
        <span style={{ fontSize: 20, color: C.tealText, fontWeight: 700 }}>Meals ›</span>
      </button>
    ),
    chores: () => (
      <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16, height: '100%' })}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Chores today</div>
        {members.map((m) => {
          const due = dueChores(chores, logs, m.key, T)
          const done = due.filter((c) => isDone(logs, c, T, m.key)).length
          return (
            <button key={m.key} type="button" aria-label={`Show ${m.name}'s chores`} onClick={() => setChoresFor(m)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
              <ProgressRow name={m.name} done={done} total={due.length} color={m.color} />
            </button>
          )
        })}
      </div>
    ),
    pet: () => <PetBlock chores={chores} logs={logs} />,
    reminders: () => (
      <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' })}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Reminders</div>
        {familyReminders.length ? (
          familyReminders.map((r) => <div key={r.id} style={{ fontSize: 22 }}>{r.text}</div>)
        ) : (
          <div style={{ fontSize: 22, color: C.muted }}>All clear</div>
        )}
      </div>
    ),
    birthdays: () => (
      <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' })}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Coming up</div>
        {coming.length ? (
          coming.map((b) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, minWidth: 0 }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: b.color || C.muted, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{b.title}</span>
              <span style={{ color: C.muted, marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>{countdownText(b)}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 22, color: C.muted }}>None soon</div>
        )}
      </div>
    ),
  }

  const layout = normalizeHubLayout(wallLayout).filter((b) => b.visible && (b.group || blocks[b.id]))

  return (
    <>
      {/* 4-column grid: full = 4, half = 2, quarter = 1 (see hubLayout.js). */}
      <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoFlow: 'row dense', gap: 24, alignContent: 'start' }}>
        {layout.map((b) => (
          <div key={b.id} style={{ gridColumn: `span ${WIDTH_SPAN[b.width] || 4}`, minHeight: MIN_HEIGHT[b.size], minWidth: 0 }}>
            {b.group ? (
              <Rotator items={b.group.filter((id) => blocks[id]).map((id) => blocks[id](b.size, b))} interval={b.interval} transition={b.transition} />
            ) : (
              blocks[b.id](b.size, b)
            )}
          </div>
        ))}
      </div>
      <ChoresPopover person={choresFor} chores={chores} logs={logs} onClose={() => setChoresFor(null)} />
    </>
  )
}
