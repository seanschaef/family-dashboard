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
import { useChores, useChoreLogs, dueChores, isDone, pointsThisWeek, pointsBalance, useRedemptions, doneByText, assigneesOf } from '../lib/chores.js'
import { useReminders } from '../lib/household.js'
import { usePhotoCollections, activeCollectionsFor } from '../lib/photos.js'
import { normalizePersonLayout, personBlockHeight, personApproxHeight } from './personLayout.js'
import { WIDTH_SPAN, ROW_UNIT, packedStyle, entryHeight } from './hubLayout.js'
import Rotator from './Rotator.jsx'
import { useDragScroll } from './dragScroll.js'
import { useChoreActions } from '../lib/choreActions.jsx'
import Hold from '../components/Hold.jsx'

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

function ChoresCard({ person, due, logs, T, points, actions }) {
  const { nameFor } = useMembers()
  const done = due.filter((c) => isDone(logs, c, T, person.key)).length
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>My chores</div>
        <div style={{ fontSize: 20, color: C.muted }}>{done} of {due.length}</div>
      </div>
      {due.length ? (
        due.map((c) => (
          <Hold key={c.id} onHold={() => actions.askUndo(c, isDone(logs, c, T, person.key), person.key)}>
            <LiveCheck label={c.title} sub={doneByText(logs, c, T, nameFor) || (assigneesOf(c).length ? undefined : 'Anyone')} done={isDone(logs, c, T, person.key)} color={person.color} onToggle={() => actions.tick(c, isDone(logs, c, T, person.key), person.key)} />
          </Hold>
        ))
      ) : (
        <div style={{ fontSize: 22, color: C.muted }}>Nothing due today</div>
      )}
      {points != null && (
        <div style={{ marginTop: 'auto', background: C.track, borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 22 }}>
          <div style={{ fontWeight: 600 }}>Points <span style={{ fontWeight: 400, color: C.muted, fontSize: 18 }}>· {points.week} this week</span></div>
          <div style={{ fontWeight: 800, color: person.color }}>{points.balance}</div>
        </div>
      )}
    </div>
  )
}

function ReminderCard({ title, reminders }) {
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1 })}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{title}</div>
      {reminders.length ? (
        reminders.map((r) => <div key={r.id} style={{ fontSize: 23, textDecoration: r.done ? 'line-through' : 'none', color: r.done ? C.muted : C.ink }}>{r.text}</div>)
      ) : (
        <div style={{ fontSize: 22, color: C.muted }}>Nothing right now</div>
      )}
    </div>
  )
}

function BirthdayCountdown({ person, big = true }) {
  const bc = birthdayCountdown(person.birthday)
  if (!bc) return null
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', flexGrow: 1 })}>
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
      style={{ all: 'unset', flex: 1, cursor: 'pointer', background: done ? color : C.card, color: done ? '#FFFFFF' : C.ink, border: done ? 'none' : `3px dashed ${color}`, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 150, boxSizing: 'border-box' }}>
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
  const jobsDrag = useDragScroll()
  const { rows: redemptions } = useRedemptions()
  const actions = useChoreActions({ logs, pageKey: memberKey, onWall: true, scale: 2 })
  if (!person) return null

  const due = dueChores(chores, logs, person.key, T).sort((a, b) => a.title.localeCompare(b.title))
  const myReminders = reminders.filter((r) => r.member_key === person.key)
  const points = { week: pointsThisWeek(logs, person.key), balance: pointsBalance(logs, redemptions, person.key) }
  const hasPhotos = activeCollectionsFor(photoCollections, { memberKey: person.key }).length > 0
  const reminderTitle = person.role === 'teen' ? 'Homework and reminders' : person.role === 'child' ? 'Reminders' : 'My reminders'

  // Each window, by id (see personLayout.js). The page is arranged from the
  // phone (Settings › Arrange); the defaults match the old fixed layouts.
  const blocks = {
    header: () => <Header person={person} />,
    calendar: (size) => <CalendarBlock personKey={person.key} includeWork title="Calendar" height={personBlockHeight('calendar', size)} />,
    chores: () => <ChoresCard person={person} due={due} logs={logs} T={T} points={points} actions={actions} />,
    jobs: (size) => (
      <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, height: personBlockHeight('jobs', size) })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>My jobs</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 30, fontWeight: 800 }}>
            <StarIcon size={44} />
            <span>{points.balance} stars</span>
          </div>
        </div>
        <div ref={jobsDrag.ref} {...jobsDrag.handlers} className={jobsDrag.className} style={{ ...jobsDrag.style, flex: '1 1 0', minHeight: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {due.map((c) => (
              <Hold key={c.id} onHold={() => actions.askUndo(c, isDone(logs, c, T, person.key), person.key)} style={{ display: 'flex' }}>
                <JobTile chore={c} done={isDone(logs, c, T, person.key)} color={person.color} onToggle={() => actions.tick(c, isDone(logs, c, T, person.key), person.key)} />
              </Hold>
            ))}
            {due.length === 0 && <div style={{ fontSize: 24, color: C.muted }}>No jobs today</div>}
          </div>
        </div>
      </div>
    ),
    reminders: () => <ReminderCard title={reminderTitle} reminders={myReminders} />,
    birthday: () => <BirthdayCountdown person={person} big />,
    widget: () => <MemberWidget member={person} />,
    photo: (size, opts) => (hasPhotos ? <PhotoFrame memberKey={person.key} height={personBlockHeight('photo', size)} radius={28} fit={opts?.fit} /> : null),
  }

  const layout = normalizePersonLayout(person.page_layout, person.role).filter((b) => b.visible && (b.group || blocks[b.id]))

  return (
    <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoRows: ROW_UNIT, columnGap: 24, rowGap: 0, alignContent: 'start' }}>
      {layout.map((b) => (
        <div key={b.id} style={packedStyle(WIDTH_SPAN[b.width] || 4, entryHeight(b, personApproxHeight), 24)}>
          {b.group ? (
            <Rotator items={b.group.filter((id) => blocks[id]).map((id) => blocks[id](b.size, b))} interval={b.interval} transition={b.transition} />
          ) : (
            blocks[b.id](b.size, b)
          )}
        </div>
      ))}
      {actions.ui}
    </div>
  )
}
