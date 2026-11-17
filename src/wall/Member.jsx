import { useState } from 'react'
import { C, card } from '../theme.js'
import Icon, { StarIcon } from '../components/Icon.jsx'
import { Clock, EventRow, CheckItem } from './parts.jsx'
import { formatLongDate, birthdayCountdown, useNow } from '../lib/time.js'
import { useParams } from 'react-router-dom'
import { useMembers } from '../lib/members.jsx'
import { memberData, nextDays } from '../data/sample.js'

function Header({ person }) {
  const now = useNow()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 140 }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: 62,
            background: person.color,
            color: '#FFFFFF',
            fontSize: 58,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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

function TodayCard({ person, events, height, big }) {
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: big ? 14 : 12, height })}>
      <div style={{ fontSize: big ? 30 : 26, fontWeight: 800 }}>Today</div>
      {events.map((e, i) => (
        <EventRow key={i} time={e.time} title={e.title} sub={e.sub} color={person.color} />
      ))}
    </div>
  )
}

function NextDays() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, height: 230 }}>
      {nextDays.map((d, i) => (
        <div key={i} style={card({ borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 })}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{d.label}</div>
          {d.lines.map((l, j) => (
            <div key={j} style={{ fontSize: j === 0 ? 20 : 18, color: j === 0 ? C.ink : C.muted }}>
              {l}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function ChoresCard({ person, chores, pointsFooter }) {
  const done = chores.filter((c) => c.done).length
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>My chores</div>
        <div style={{ fontSize: 20, color: C.muted }}>
          {done} of {chores.length}
        </div>
      </div>
      {chores.map((c, i) => (
        <CheckItem key={i} label={c.label} done={c.done} color={person.color} />
      ))}
      {pointsFooter && (
        <div
          style={{
            marginTop: 'auto',
            background: C.track,
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
          }}
        >
          <div style={{ fontWeight: 600 }}>Points this week</div>
          <div style={{ fontWeight: 800, color: person.color }}>[##]</div>
        </div>
      )}
    </div>
  )
}

function ListCard({ title, items }) {
  return (
    <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 })}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{title}</div>
      {items.map((t, i) => (
        <div key={i} style={{ fontSize: 23 }}>
          {t}
        </div>
      ))}
    </div>
  )
}

function WidgetSlot({ person }) {
  return (
    <div
      style={card({
        flexGrow: 1,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
      })}
    >
      <div style={{ fontSize: 26, fontWeight: 800 }}>{person.name}'s pick</div>
      <div style={{ fontSize: 22, color: C.muted }}>[Widget of their choice]</div>
    </div>
  )
}

function BirthdayCountdown({ person, big }) {
  const bc = birthdayCountdown(person.birthday)
  if (!bc) return null
  return (
    <div
      style={card({
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        justifyContent: 'center',
        ...(big ? {} : { flexGrow: 1 }),
      })}
    >
      <div style={{ fontSize: 26, fontWeight: 800 }}>Birthday countdown</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{ fontSize: big ? 96 : 80, fontWeight: 800, color: person.color, lineHeight: 1 }}>{bc.days}</div>
        <div style={{ fontSize: 28, color: C.muted }}>
          days until {person.name} turns {bc.turning}
        </div>
      </div>
    </div>
  )
}

function JobTile({ label, done, color }) {
  const [checked, setChecked] = useState(done)
  return (
    <button
      type="button"
      aria-label={`Mark ${label} ${checked ? 'not done' : 'done'}`}
      aria-pressed={checked}
      onClick={() => setChecked((v) => !v)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        background: checked ? color : '#FFFFFF',
        color: checked ? '#FFFFFF' : C.ink,
        border: checked ? 'none' : `3px dashed ${color}`,
        borderRadius: 24,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 150,
        boxSizing: 'border-box',
      }}
    >
      {checked ? (
        <Icon name="check" size={44} color="#FFFFFF" strokeWidth={3} />
      ) : (
        <span style={{ width: 44, height: 44, borderRadius: 22, border: `3px solid ${color}`, boxSizing: 'border-box' }} />
      )}
      <span style={{ fontSize: 28, fontWeight: 700 }}>{label}</span>
    </button>
  )
}

export default function Member() {
  const { memberKey } = useParams()
  const { byKey } = useMembers()
  const person = byKey(memberKey)
  const data = memberData[memberKey]
  if (!person || !data) return null

  // ---- Child layout: big tiles + stars ----
  if (person.role === 'child') {
    return (
      <>
        <Header person={person} />
        <TodayCard person={person} events={data.today} height={380} big />
        <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, height: 560 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>My jobs</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 30, fontWeight: 800 }}>
              <StarIcon size={44} />
              <span>[##] stars</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {data.jobs.map((j, i) => (
              <JobTile key={i} label={j.label} done={j.done} color={person.color} />
            ))}
          </div>
        </div>
        <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
          <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' })}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>Tomorrow</div>
            <div style={{ fontSize: 26 }}>{data.tomorrow}</div>
          </div>
          <BirthdayCountdown person={person} big />
        </div>
      </>
    )
  }

  // ---- Teen layout: chores with points + homework + countdown ----
  if (person.role === 'teen') {
    return (
      <>
        <Header person={person} />
        <TodayCard person={person} events={data.today} height={400} />
        <NextDays />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, height: 400 }}>
          <ChoresCard person={person} chores={data.chores} pointsFooter />
          <ListCard title="Homework and reminders" items={data.homework} />
        </div>
        <div style={{ flexGrow: 1, display: 'flex' }}>
          <BirthdayCountdown person={person} />
        </div>
      </>
    )
  }

  // ---- Adult layout (parents) ----
  return (
    <>
      <Header person={person} />
      <TodayCard person={person} events={data.today} height={420} />
      <NextDays />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, height: 380 }}>
        <ChoresCard person={person} chores={data.chores} />
        <ListCard title="My reminders" items={data.reminders} />
      </div>
      <WidgetSlot person={person} />
    </>
  )
}
