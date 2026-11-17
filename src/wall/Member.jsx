import { useParams } from 'react-router-dom'
import { C, card } from '../theme.js'
import Icon, { StarIcon } from '../components/Icon.jsx'
import { Clock, LiveCheck } from './parts.jsx'
import CalendarBlock from './CalendarBlock.jsx'
import MemberWidget from './MemberWidget.jsx'
import PhotoFrame from './PhotoFrame.jsx'
import { formatLongDate, birthdayCountdown, useNow } from '../lib/time.js'
import { useMembers } from '../lib/members.jsx'
import { todayISO } from '../lib/db.js'
import { useChores, useChoreLogs, dueChores, isDone, toggleChore, pointsThisWeek } from '../lib/chores.js'
import { useReminders } from '../lib/household.js'
import { usePhotoCollections, activeCollectionsFor } from '../lib/photos.js'

function Header({ person }) {
  const now = useNow()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 140 }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        <div style={{ width: 124, height: 124, borderRadius: 62, background: person.color, color: '#FFFFFF', fontSize: 58, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(person.name[0] || '?').toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05 }}>{person.name}'s day</div>
          <div style={{ fontSize: 26, color: C.muted }}>{formatLongDate(now)}</div>
        </div>
      </div>
      <Clock />
    </div>
  )
}

function ChoresCard({ person, due, logs, T, points }) {
  const done = due.filter((c) => isDone(logs, c.id, T)).length
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>My chores</div>
        <div style={{ fontSize: 20, color: C.muted }}>{done} of {due.length}</div>
      </div>
      {due.length ? (
        due.map((c) => (
          <LiveCheck key={c.id} label={c.title} done={isDone(logs, c.id, T)} color={person.color} onToggle={() => toggleChore(c, T, isDone(logs, c.id, T))} />
        ))
      ) : (
        <div style={{ fontSize: 22, color: C.muted }}>Nothing due today</div>
      )}
      {points != null && (
        <div style={{ marginTop: 'auto', background: C.track, borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', fontSize: 22 }}>
          <div style={{ fontWeight: 600 }}>Points this week</div>
          <div style={{ fontWeight: 800, color: person.color }}>{points}</div>
        </div>
      )}
    </div>
  )
}

function ReminderCard({ title, reminders }) {
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 })}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{title}</div>
      {reminders.length ? (
        reminders.map((r) => <div key={r.id} style={{ fontSize: 23, textDecoration: r.done ? 'line-through' : 'none', color: r.done ? C.muted : C.ink }}>{r.text}</div>)
      ) : (
        <div style={{ fontSize: 22, color: C.muted }}>Nothing right now</div>
      )}
    </div>
  )
}

function BirthdayCountdown({ person, big }) {
  const bc = birthdayCountdown(person.birthday)
  if (!bc) return null
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', ...(big ? {} : { flexGrow: 1 }) })}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>Birthday countdown</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{ fontSize: big ? 96 : 80, fontWeight: 800, color: person.color, lineHeight: 1 }}>{bc.days}</div>
        <div style={{ fontSize: 28, color: C.muted }}>days until {person.name} turns {bc.turning}</div>
      </div>
    </div>
  )
}

function JobTile({ chore, done, color, onToggle }) {
  return (
    <button type="button" aria-label={`Mark ${chore.title} ${done ? 'not done' : 'done'}`} aria-pressed={done} onClick={onToggle}
      style={{ all: 'unset', cursor: 'pointer', background: done ? color : '#FFFFFF', color: done ? '#FFFFFF' : C.ink, border: done ? 'none' : `3px dashed ${color}`, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 150, boxSizing: 'border-box' }}>
      {done ? <Icon name="check" size={44} color="#FFFFFF" strokeWidth={3} /> : <span style={{ width: 44, height: 44, borderRadius: 22, border: `3px solid ${color}`, boxSizing: 'border-box' }} />}
      <span style={{ fontSize: 28, fontWeight: 700 }}>{chore.title}</span>
    </button>
  )
}

export default function Member() {
  const { memberKey } = useParams()
  const { byKey } = useMembers()
  const T = todayISO()
  const { rows: chores } = useChores()
  const { rows: logs } = useChoreLogs()
  const { rows: reminders } = useReminders()
  const { rows: photoCollections } = usePhotoCollections()
  const person = byKey(memberKey)
  if (!person) return null

  const due = dueChores(chores, logs, person.key, T).sort((a, b) => a.title.localeCompare(b.title))
  const myReminders = reminders.filter((r) => r.member_key === person.key)
  const points = pointsThisWeek(logs, person.key)
  const hasPhotos = activeCollectionsFor(photoCollections, { memberKey: person.key }).length > 0

  // ---- Child layout: big tiles + stars ----
  if (person.role === 'child') {
    return (
      <>
        <Header person={person} />
        <CalendarBlock personKey={person.key} includeWork todaySummary title="Calendar" height={430} />
        <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, height: 560 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>My jobs</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 30, fontWeight: 800 }}>
              <StarIcon size={44} />
              <span>{points} stars</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {due.slice(0, 6).map((c) => (
              <JobTile key={c.id} chore={c} done={isDone(logs, c.id, T)} color={person.color} onToggle={() => toggleChore(c, T, isDone(logs, c.id, T))} />
            ))}
            {due.length === 0 && <div style={{ fontSize: 24, color: C.muted }}>No jobs today</div>}
          </div>
        </div>
        <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
          <ReminderCard title="Reminders" reminders={myReminders} />
          <BirthdayCountdown person={person} big />
        </div>
      </>
    )
  }

  // ---- Teen layout ----
  if (person.role === 'teen') {
    return (
      <>
        <Header person={person} />
        <CalendarBlock personKey={person.key} includeWork todaySummary title="Calendar" height={630} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, height: 400 }}>
          <ChoresCard person={person} due={due} logs={logs} T={T} points={points} />
          <ReminderCard title="Homework and reminders" reminders={myReminders} />
        </div>
        <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: hasPhotos ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: 24 }}>
          <BirthdayCountdown person={person} />
          {hasPhotos && <PhotoFrame memberKey={person.key} height="100%" radius={28} />}
        </div>
      </>
    )
  }

  // ---- Adult layout (parents) ----
  return (
    <>
      <Header person={person} />
      <CalendarBlock personKey={person.key} includeWork todaySummary title="Calendar" height={640} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, height: 380 }}>
        <ChoresCard person={person} due={due} logs={logs} T={T} />
        <ReminderCard title="My reminders" reminders={myReminders} />
      </div>
      <MemberWidget member={person} />
      {hasPhotos && (
        <div style={{ flexGrow: 1, display: 'flex' }}>
          <PhotoFrame memberKey={person.key} height="100%" radius={28} />
        </div>
      )}
    </>
  )
}
