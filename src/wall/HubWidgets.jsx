import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, card } from '../theme.js'
import WeatherIcon from '../components/WeatherIcon.jsx'
import { useMembers } from '../lib/members.jsx'
import { useNow, timeOfDay } from '../lib/time.js'
import { todayISO } from '../lib/db.js'
import { useEvents } from '../lib/eventsource.js'
import { useChoreLogs, useRewards, useRedemptions, pointsBalance, pointsThisWeek } from '../lib/chores.js'
import { useMeals, mealFor, weekDates, useGroceries, toggleGrocery } from '../lib/kitchen.js'
import { useNotes, liveNotes, noteAge } from '../lib/notes.js'
import { upcomingPickups, dayWord } from '../lib/waste.js'
import { useForecast, wearHint, useAqhi, aqhiRisk } from '../lib/weather.js'
import { fetchOnThisDay, photoAgentConfigured } from '../lib/photos.js'
import { useDragScroll } from './dragScroll.js'
import EventPopover from './EventPopover.jsx'

// The newer hub windows. Each fills the fixed height its size gives it
// (see hubLayout.js) and scrolls inside if it has more to show.

const box = (extra = {}) => card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', minHeight: 0, boxSizing: 'border-box', ...extra })
const Title = ({ children, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexShrink: 0 }}>
    <div style={{ fontSize: 26, fontWeight: 800 }}>{children}</div>
    {right && <div style={{ fontSize: 17, color: C.muted, whiteSpace: 'nowrap' }}>{right}</div>}
  </div>
)
const Muted = ({ children }) => <div style={{ fontSize: 20, color: C.muted }}>{children}</div>

function Scroll({ children, gap = 8 }) {
  const drag = useDragScroll()
  return (
    <div ref={drag.ref} {...drag.handlers} className={drag.className} style={{ ...drag.style, flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', gap }}>
      {children}
    </div>
  )
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div style={{ height: 10, borderRadius: 5, background: C.border, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: color, transition: 'width 600ms ease' }} />
    </div>
  )
}

// ---------- Reward goals ----------
// What each person is saving for (picked on the phone's Rewards screen), or
// else the next reward they can't afford yet.
export function GoalsBlock() {
  const { members } = useMembers()
  const { rows: logs } = useChoreLogs()
  const { rows: rewards } = useRewards()
  const { rows: redemptions } = useRedemptions()
  const rows = members.map((m) => {
    const balance = pointsBalance(logs, redemptions, m.key)
    const chosen = rewards.find((r) => r.id === m.goal_reward_id)
    const goal = chosen || [...rewards].sort((a, b) => (a.cost || 0) - (b.cost || 0)).find((r) => (r.cost || 0) > balance)
    return { m, balance, goal, chosen: !!chosen }
  })
  return (
    <div style={box()}>
      <Title>Saving for</Title>
      {!rewards.length && <Muted>Add rewards on the phone (Rewards) to set goals.</Muted>}
      <Scroll gap={8}>
        {rewards.length > 0 &&
          rows.map(({ m, balance, goal }) => (
            <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 19, minWidth: 0 }}>
                <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{m.name}</span>
                <span style={{ color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{goal ? goal.title : 'Every reward unlocked'}</span>
                {goal && (
                  <span style={{ marginLeft: 'auto', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {balance >= goal.cost ? 'Ready!' : `${goal.cost - balance} to go`}
                  </span>
                )}
              </div>
              {goal && <Bar value={balance} max={goal.cost} color={m.color} />}
            </div>
          ))}
      </Scroll>
    </div>
  )
}

// ---------- Chore leaderboard (this week) ----------
export function LeaderboardBlock() {
  const { members } = useMembers()
  const { rows: logs } = useChoreLogs()
  const monday = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const rows = members
    .map((m) => ({
      m,
      pts: pointsThisWeek(logs, m.key),
      done: logs.filter((l) => l.member_key === m.key && new Date(l.log_date + 'T00:00:00') >= monday).length,
    }))
    .sort((a, b) => b.pts - a.pts || b.done - a.done)
  const top = Math.max(1, ...rows.map((r) => r.pts))
  return (
    <div style={box()}>
      <Title right="This week · resets Monday">Leaderboard</Title>
      <Scroll gap={8}>
        {rows.map(({ m, pts, done }, i) => (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 15, background: i === 0 && pts > 0 ? C.rust : C.cream, color: i === 0 && pts > 0 ? '#FFFFFF' : C.ink, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 18 }}>
                <span style={{ fontWeight: 800 }}>{m.name}</span>
                <span style={{ color: C.muted, fontSize: 16 }}>{done} {done === 1 ? 'chore' : 'chores'}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{pts} pts</span>
              </div>
              <Bar value={pts} max={top} color={m.color} />
            </div>
          </div>
        ))}
      </Scroll>
    </div>
  )
}

// ---------- This week's meals ----------
export function MealsWeekBlock() {
  const navigate = useNavigate()
  const { rows: meals } = useMeals()
  const T = todayISO()
  const days = weekDates()
  return (
    <button type="button" onClick={() => navigate('/wall/meals')} style={{ all: 'unset', cursor: 'pointer', display: 'block', height: '100%' }}>
      <div style={box({ gap: 6 })}>
        <Title right="Meals ›">This week&apos;s meals</Title>
        {days.map((iso) => {
          const d = new Date(iso + 'T12:00:00')
          const isToday = iso === T
          const meal = mealFor(meals, iso)?.title
          return (
            <div key={iso} style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 19, padding: '3px 10px', borderRadius: 10, background: isToday ? C.tealTint : 'transparent', opacity: iso < T ? 0.5 : 1, minWidth: 0 }}>
              <span style={{ width: 44, fontWeight: 800, flexShrink: 0 }}>{d.toLocaleDateString('en-CA', { weekday: 'short' })}</span>
              <span style={{ color: meal ? C.ink : C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{meal || '—'}</span>
            </div>
          )
        })}
      </div>
    </button>
  )
}

// ---------- Grocery list ----------
// Tap an item to mark it bought (tap again to undo). Adding and clearing
// happen on the phone.
export function GroceriesBlock() {
  const { rows } = useGroceries()
  const todo = rows.filter((g) => !g.done)
  const got = rows.filter((g) => g.done)
  const item = (g) => (
    <button key={g.id} type="button" onClick={() => toggleGrocery(g.id, !g.done)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, padding: '6px 4px', flexShrink: 0, opacity: g.done ? 0.45 : 1 }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, border: `3px solid ${g.done ? C.tealText : C.border}`, background: g.done ? C.tealText : 'transparent', flexShrink: 0 }} />
      <span style={{ textDecoration: g.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
        {g.label}
        {g.qty > 1 && <span style={{ color: C.muted }}> × {g.qty}</span>}
      </span>
    </button>
  )
  return (
    <div style={box({ gap: 6 })}>
      <Title right={todo.length ? `${todo.length} to buy` : ''}>Groceries</Title>
      {!rows.length && <Muted>The list is empty.</Muted>}
      <Scroll gap={0}>
        {todo.map(item)}
        {got.map(item)}
      </Scroll>
    </div>
  )
}

// ---------- Family notes ----------
export function NotesBlock() {
  const { rows } = useNotes()
  const { byKey } = useMembers()
  const now = useNow(60000)
  const notes = liveNotes(rows, now)
  return (
    <div style={box()}>
      <Title>Notes</Title>
      {!notes.length && <Muted>No notes. Add one from the phone (Today › Notes).</Muted>}
      <Scroll gap={10}>
        {notes.map((n) => {
          const who = byKey(n.member_key)
          return (
            <div key={n.id} style={{ display: 'flex', gap: 12, background: C.cream, borderRadius: 14, padding: '10px 14px', flexShrink: 0 }}>
              <div style={{ width: 6, borderRadius: 3, background: who?.color || C.muted, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{n.text}</div>
                <div style={{ fontSize: 15, color: C.muted }}>{[who?.name, noteAge(n.created_at, now)].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
          )
        })}
      </Scroll>
    </div>
  )
}

// ---------- Next up (whole family) ----------
function untilText(ms) {
  const mins = Math.round(ms / 60000)
  if (mins <= 0) return 'now'
  if (mins < 60) return `in ${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h < 24) return `in ${h} h${m ? ` ${m} min` : ''}`
  const d = Math.round(h / 24)
  return `in ${d} ${d === 1 ? 'day' : 'days'}`
}
export function NextUpBlock() {
  const { colorFor, nameFor } = useMembers()
  const now = useNow(30000)
  const hour = Math.floor(now.getTime() / 3600000)
  const from = useMemo(() => new Date(hour * 3600000 - 3600000), [hour])
  const to = useMemo(() => new Date(hour * 3600000 + 8 * 86400000), [hour])
  const { events } = useEvents(from, to)
  const [open, setOpen] = useState(null)
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const upcoming = events
    .filter((e) => e.kind !== 'work' && e.show_on_hub !== false)
    .filter((e) => (e.all_day ? new Date(e.starts_at) > startOfToday : new Date(e.starts_at) > now))
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
  const [next, ...rest] = upcoming
  const who = (e) => (e.owners || [e.person_key]).map(nameFor).filter(Boolean).join(' & ')
  const when = (e) => {
    const d = new Date(e.starts_at)
    const day = d.toDateString() === now.toDateString() ? '' : d.toLocaleDateString('en-CA', { weekday: 'short' }) + ' '
    return e.all_day ? `${day || 'Today '}all day` : `${day}${timeOfDay(e.starts_at)}`
  }
  return (
    <div style={box()}>
      <Title>Next up</Title>
      {!next && <Muted>Nothing in the next week.</Muted>}
      {next && (
        <button type="button" onClick={() => setOpen(next)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 8, borderRadius: 4, background: colorFor(next), flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15 }}>{next.title}</div>
            <div style={{ fontSize: 21, color: C.rust, fontWeight: 700 }}>
              {when(next)}
              {!next.all_day && ` · ${untilText(new Date(next.starts_at) - now)}`}
            </div>
            <div style={{ fontSize: 17, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{[who(next), next.location].filter(Boolean).join(' · ')}</div>
          </div>
        </button>
      )}
      {rest.length > 0 && (
        <Scroll gap={6}>
          {rest.slice(0, 6).map((e) => (
            <button key={e.id} type="button" onClick={() => setOpen(e)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 18, flexShrink: 0, minWidth: 0 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: colorFor(e), flexShrink: 0 }} />
              <span style={{ color: C.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{when(e)}</span>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{e.title}</span>
            </button>
          ))}
        </Scroll>
      )}
      <EventPopover event={open} onClose={() => setOpen(null)} />
    </div>
  )
}

// ---------- Weather forecast ----------
export function ForecastBlock() {
  const { data: f, error } = useForecast()
  if (!f) {
    return (
      <div style={box()}>
        <Title>Forecast</Title>
        <Muted>{error ? 'Weather unavailable right now.' : 'Loading…'}</Muted>
      </div>
    )
  }
  return (
    <div style={box({ gap: 14 })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <WeatherIcon code={f.now.code} size={52} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {f.now.temp}° <span style={{ color: C.muted, fontWeight: 600 }}>feels {f.now.feels}°</span>
          </div>
          <div style={{ fontSize: 17, color: C.muted }}>
            {f.now.conditions} · wind {f.now.wind} km/h
          </div>
        </div>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: C.rust, flexShrink: 0 }}>{wearHint(f)}</div>
      <div style={{ display: 'flex', gap: 4, overflow: 'hidden', flexShrink: 0 }}>
        {f.hours.filter((_, i) => i % 2 === 0).map((h) => (
          <div key={h.t.toISOString()} style={{ flex: '1 1 0', minWidth: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 15 }}>
            <span style={{ color: C.muted, fontWeight: 700 }}>{h.label}</span>
            <WeatherIcon code={h.code} size={26} />
            <span style={{ fontWeight: 700 }}>{h.temp}°</span>
            {h.pop >= 20 && <span style={{ color: C.tealText, fontSize: 13 }}>{h.pop}%</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 0', minHeight: 0, overflow: 'hidden', borderTop: `2px solid ${C.border}`, paddingTop: 10 }}>
        {f.days.slice(1, 6).map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, flexShrink: 0 }}>
            <span style={{ width: 48, fontWeight: 800 }}>{d.label}</span>
            <WeatherIcon code={d.code} size={24} />
            <span style={{ color: C.tealText, width: 50, fontSize: 15 }}>{d.pop >= 20 ? `${d.pop}%` : ''}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{d.high}°</span>
            <span style={{ color: C.muted, width: 46, textAlign: 'right' }}>{d.low}°</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Air quality (AQHI) ----------
export function AirBlock() {
  const { current, forecast, error } = useAqhi()
  const v = current?.aqhi != null ? Math.round(current.aqhi) : null
  const risk = aqhiRisk(v)
  const later = forecast?.max != null ? aqhiRisk(forecast.max) : null
  return (
    <div style={box()}>
      <Title>Air quality</Title>
      {v == null ? (
        <Muted>{error ? 'Air quality unavailable right now.' : 'Loading…'}</Muted>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: risk.color, color: '#FFFFFF', fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{v}</div>
          <div style={{ minWidth: 0, flex: '1 1 120px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: risk.color }}>{risk.label}</div>
            {later && <div style={{ fontSize: 16, color: C.muted }}>Forecast up to {forecast.max}</div>}
            {v >= 7 && <div style={{ fontSize: 18, fontWeight: 700 }}>Cut back outdoor activity; kids especially</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Garbage / recycling ----------
export function WasteBlock() {
  const { wasteSchedule } = useMembers()
  const now = useNow(10 * 60000)
  const days = upcomingPickups(wasteSchedule, now, 3)
  return (
    <div style={box()}>
      <Title>Collection day</Title>
      {!days.length && <Muted>Set your pickup days on the phone (Settings › Garbage and recycling).</Muted>}
      {days.map((d, i) => {
        const word = dayWord(d.date, now)
        const soon = word === 'Today' || word === 'Tomorrow'
        return (
          <div key={d.date.toISOString()} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: i === 0 ? '10px 14px' : '0 14px', borderRadius: 14, background: i === 0 && soon ? C.tealTint : 'transparent', flexShrink: 0 }}>
            <div style={{ fontSize: i === 0 ? 24 : 19, fontWeight: 800 }}>
              {word}
              {word === 'Tomorrow' && <span style={{ color: C.rust }}> · put the bins out tonight</span>}
            </div>
            <div style={{ fontSize: i === 0 ? 21 : 18, color: i === 0 ? C.ink : C.muted }}>{d.names.join(' + ')}</div>
          </div>
        )
      })}
    </div>
  )
}

// ---------- On this day (NAS photos from past years) ----------
export function OnThisDayBlock() {
  const now = useNow(60 * 60000)
  const dayKey = now.toDateString()
  const [photos, setPhotos] = useState([])
  const [i, setI] = useState(0)
  useEffect(() => {
    let active = true
    fetchOnThisDay(new Date()).then((p) => active && setPhotos(p))
    return () => {
      active = false
    }
  }, [dayKey])
  useEffect(() => {
    if (photos.length < 2) return undefined
    const id = setInterval(() => setI((x) => (x + 1) % photos.length), 12000)
    return () => clearInterval(id)
  }, [photos.length])
  const p = photos[i % Math.max(photos.length, 1)]
  if (!p) {
    return (
      <div style={box()}>
        <Title>On this day</Title>
        <Muted>{photoAgentConfigured() ? 'No photos from this time of year in past years yet. They show up as older photos are added to the NAS.' : 'Shows on the wall (photos come from the NAS).'}</Muted>
      </div>
    )
  }
  const ago = now.getFullYear() - p.year
  return (
    <div style={{ position: 'relative', height: '100%', borderRadius: 28, overflow: 'hidden', background: C.ink }}>
      <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '28px 22px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', color: '#FFFFFF' }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          {p.exact ? 'On this day' : 'This week'} · {ago} {ago === 1 ? 'year' : 'years'} ago
        </div>
        <div style={{ fontSize: 16, opacity: 0.85 }}>{new Date(p.year, p.month - 1, p.day).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
    </div>
  )
}
