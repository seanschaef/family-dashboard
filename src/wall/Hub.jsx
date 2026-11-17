import { Link } from 'react-router-dom'
import { C, card } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { Clock, CheckItem, ProgressRow } from './parts.jsx'
import CalendarBlock from './CalendarBlock.jsx'
import { formatClock, formatLongDate, greeting, useNow } from '../lib/time.js'
import { useMembers } from '../lib/members.jsx'
import {
  weather,
  dinnerTonight,
  choreProgress,
  petLog,
  petName,
  familyReminders,
} from '../data/sample.js'

export default function Hub() {
  const now = useNow()
  const { colorFor, nameFor, familyName } = useMembers()
  return (
    <>
      {/* Header: greeting + clock + date, and the weather card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 160 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.rust }}>{greeting(now)}, {familyName}</div>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1 }}>{formatClock(now)}</div>
          <div style={{ fontSize: 26, color: C.muted }}>{formatLongDate(now)}</div>
        </div>
        <div
          style={card({
            borderRadius: 28,
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          })}
        >
          <div style={{ fontSize: 60, fontWeight: 800 }}>{weather.temp}°</div>
          <div style={{ fontSize: 22, color: C.muted }}>{weather.conditions}</div>
        </div>
      </div>

      {/* Photo (step 4; crossfade placeholder for now) */}
      <div
        style={{
          height: 430,
          borderRadius: 36,
          background: C.border,
          border: '10px solid #FFFFFF',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 26, color: C.muted }}>Photo · full-HD crossfade</div>
      </div>

      {/* Family calendar: everyone's calendars combined, Day/Week/Month switch */}
      <CalendarBlock title="Family calendar" height={430} />

      {/* Dinner tonight */}
      <Link
        to="/wall/meals"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: C.tealTint,
          borderRadius: 16,
          padding: '16px 22px',
          color: C.ink,
        }}
      >
        <span style={{ fontSize: 24 }}>
          <span style={{ fontWeight: 800 }}>Dinner tonight:</span> {dinnerTonight}
        </span>
        <span style={{ fontSize: 20, color: C.tealText, fontWeight: 700 }}>Meals ›</span>
      </Link>

      {/* Bottom grid: chores | (pet + reminders) */}
      <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
        <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 })}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Chores today</div>
          {choreProgress.map((p) => (
            <ProgressRow key={p.key} name={nameFor(p.key)} done={p.done} total={p.total} color={colorFor(p.key)} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 })}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Icon name="paw" size={32} color={C.ink} />
              <div style={{ fontSize: 26, fontWeight: 800 }}>{petName}</div>
            </div>
            {petLog.map((r) => (
              <CheckItem
                key={r.key}
                label={r.byKey ? `${r.label} · ${nameFor(r.byKey)} ${r.at}` : r.label}
                done={r.done}
                color={C.home}
                size={40}
                fontSize={21}
              />
            ))}
          </div>

          <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 })}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>Reminders</div>
            {familyReminders.map((r, i) => (
              <div key={i} style={{ fontSize: 22 }}>
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
