import { Link } from 'react-router-dom'
import { C, card } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { Clock, LiveCheck, ProgressRow } from './parts.jsx'
import CalendarBlock from './CalendarBlock.jsx'
import PhotoFrame from './PhotoFrame.jsx'
import WeatherCard from './WeatherCard.jsx'
import { formatClock, formatLongDate, greeting, useNow, upcomingBirthdays } from '../lib/time.js'
import { useMembers } from '../lib/members.jsx'
import { todayISO } from '../lib/db.js'
import { useChores, useChoreLogs, dueChores, isDone } from '../lib/chores.js'
import { useReminders, usePetLog, PET_TASKS, petDone, petBy, togglePet } from '../lib/household.js'
import { useMeals, mealFor } from '../lib/kitchen.js'
import { petName } from '../data/sample.js'

export default function Hub() {
  const now = useNow()
  const { members, nameFor, familyName } = useMembers()
  const T = todayISO()
  const { rows: chores } = useChores()
  const { rows: logs } = useChoreLogs()
  const { rows: reminders } = useReminders()
  const { rows: petLogs } = usePetLog()
  const { rows: meals } = useMeals()

  const familyReminders = reminders.filter((r) => r.member_key === null && !r.done)
  const dinner = mealFor(meals, T)?.title
  const birthdays = upcomingBirthdays(members).slice(0, 3)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 160 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.rust }}>{greeting(now)}, {familyName}!</div>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1 }}>{formatClock(now)}</div>
          <div style={{ fontSize: 26, color: C.muted }}>{formatLongDate(now)}</div>
        </div>
        <WeatherCard />
      </div>

      <PhotoFrame height={380} />

      <CalendarBlock title="Family calendar" height={470} todaySummary />

      <Link to="/wall/meals" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.tealTint, borderRadius: 16, padding: '16px 22px', color: C.ink }}>
        <span style={{ fontSize: 24 }}>
          <span style={{ fontWeight: 800 }}>Dinner tonight:</span> {dinner || 'Not planned yet'}
        </span>
        <span style={{ fontSize: 20, color: C.tealText, fontWeight: 700 }}>Meals ›</span>
      </Link>

      <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
        <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 })}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Chores today</div>
          {members.map((m) => {
            const due = dueChores(chores, logs, m.key, T)
            const done = due.filter((c) => isDone(logs, c.id, T)).length
            return <ProgressRow key={m.key} name={m.name} done={done} total={due.length} color={m.color} />
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 })}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Icon name="paw" size={32} color={C.ink} />
              <div style={{ fontSize: 26, fontWeight: 800 }}>{petName}</div>
            </div>
            {PET_TASKS.map((task) => {
              const done = petDone(petLogs, task, T)
              const by = petBy(petLogs, task, T)
              return (
                <LiveCheck
                  key={task}
                  label={done && by ? `${task[0].toUpperCase() + task.slice(1)} · ${nameFor(by)}` : task[0].toUpperCase() + task.slice(1)}
                  done={done}
                  color={C.home}
                  size={40}
                  fontSize={21}
                  onToggle={() => togglePet(task, T, done, null)}
                />
              )
            })}
          </div>

          {birthdays.length > 0 && (
            <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 })}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>Birthdays</div>
              {birthdays.map((b) => (
                <div key={b.member.key} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 8, background: b.member.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{b.member.name}</span>
                  <span style={{ color: C.muted, marginLeft: 'auto' }}>
                    {b.days === 0 ? `turns ${b.turning} today!` : `${b.days} ${b.days === 1 ? 'day' : 'days'} · turns ${b.turning}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 })}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>Reminders</div>
            {familyReminders.length ? (
              familyReminders.map((r) => <div key={r.id} style={{ fontSize: 22 }}>{r.text}</div>)
            ) : (
              <div style={{ fontSize: 22, color: C.muted }}>All clear</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
