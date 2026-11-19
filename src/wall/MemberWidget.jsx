import { useMemo } from 'react'
import { C, card } from '../theme.js'
import WeatherIcon from '../components/WeatherIcon.jsx'
import { useWeather } from '../lib/weather.js'
import { useEvents } from '../lib/eventsource.js'
import { ownsEvent } from '../lib/calendars.js'
import { startOfDay, addDays, timeOfDay } from '../lib/time.js'
import { eventsOn } from '../lib/calendar.js'

// Renders a member's chosen wall widget (the open slot on their page).
// Type + settings come from the database (members.widget_type/widget_config),
// set by that person from the phone app.
export default function MemberWidget({ member }) {
  const type = member.widget_type || 'none'
  const cfg = member.widget_config || {}
  const shell = (children) => (
    <div style={card({ flexGrow: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' })}>
      {children}
    </div>
  )

  if (type === 'weather') return <WeatherWidget shell={shell} />
  if (type === 'countdown') return <CountdownWidget shell={shell} cfg={cfg} color={member.color} />
  if (type === 'next') return <NextWidget shell={shell} personKey={member.key} />
  if (type === 'note') return <NoteWidget shell={shell} cfg={cfg} name={member.name} />

  // none
  return (
    <div
      style={card({ flexGrow: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' })}
    >
      <div style={{ fontSize: 26, fontWeight: 800 }}>{member.name}'s widget</div>
      <div style={{ fontSize: 22, color: C.muted }}>Pick one in the app (Today → Wall widgets)</div>
    </div>
  )
}

function Title({ children }) {
  return <div style={{ fontSize: 26, fontWeight: 800 }}>{children}</div>
}

function WeatherWidget({ shell }) {
  const { data, forecast, error } = useWeather()
  const next = forecast.slice(1, 4)
  return shell(
    <>
      <Title>Weather</Title>
      {error || !data ? (
        <div style={{ fontSize: 24, color: C.muted }}>{error ? 'Weather unavailable' : 'Loading…'}</div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <WeatherIcon code={data.code} size={72} />
            <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1 }}>{data.temp}°</div>
            <div style={{ fontSize: 28, color: C.muted }}>{data.conditions}</div>
          </div>
          <div style={{ fontSize: 22, color: C.muted }}>
            High {data.high}° · Low {data.low}° · Edmonton
          </div>
          {next.length > 0 && (
            <div style={{ display: 'flex', gap: 26, marginTop: 6 }}>
              {next.map((d) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: C.muted }}>{d.label}</span>
                  <WeatherIcon code={d.code} size={28} />
                  <span style={{ fontSize: 20 }}><span style={{ fontWeight: 700 }}>{d.high}°</span> <span style={{ color: C.muted }}>{d.low}°</span></span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>,
  )
}

function CountdownWidget({ shell, cfg, color }) {
  const days = useMemo(() => {
    if (!cfg.date) return null
    const target = startOfDay(new Date(cfg.date + 'T00:00:00'))
    return Math.round((target - startOfDay(new Date())) / 86400000)
  }, [cfg.date])

  return shell(
    <>
      <Title>Countdown</Title>
      {days == null ? (
        <div style={{ fontSize: 24, color: C.muted }}>Set a date in the app</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <div style={{ fontSize: 88, fontWeight: 800, color, lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: 28, color: C.muted }}>
            {days === 0 ? `${cfg.label || 'the day'} is today!` : `days until ${cfg.label || 'the day'}`}
          </div>
        </div>
      )}
    </>,
  )
}

function NextWidget({ shell, personKey }) {
  const now = new Date()
  const from = useMemo(() => startOfDay(now), [now.toDateString()])
  const to = useMemo(() => addDays(from, 30), [from])
  const { events } = useEvents(from, to)
  const next = events
    .filter((e) => ownsEvent(e, personKey))
    .map((e) => ({ ...e, _d: new Date(e.starts_at) }))
    .filter((e) => e._d >= now || eventsOn([e], now).length)
    .sort((a, b) => a._d - b._d)[0]

  return shell(
    <>
      <Title>Next Up</Title>
      {next ? (
        <>
          <div style={{ fontSize: 30, fontWeight: 600 }}>{next.title}</div>
          <div style={{ fontSize: 24, color: C.muted }}>
            {next._d.toLocaleDateString('en-CA', { weekday: 'long', month: 'short', day: 'numeric' })}
            {!next.all_day && ` · ${timeOfDay(next.starts_at)}`}
          </div>
          {next.location && <div style={{ fontSize: 22, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{next.location}</div>}
        </>
      ) : (
        <div style={{ fontSize: 24, color: C.muted }}>Nothing coming up</div>
      )}
    </>,
  )
}

function NoteWidget({ shell, cfg, name }) {
  return shell(
    <>
      <Title>{cfg.title || `${name}'s Note`}</Title>
      <div style={{ fontSize: 30, lineHeight: 1.3 }}>{cfg.text || 'Add a note in the app'}</div>
    </>,
  )
}
