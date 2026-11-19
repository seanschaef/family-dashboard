import { C, card } from '../theme.js'
import WeatherIcon from '../components/WeatherIcon.jsx'
import { useState } from 'react'
import { useWeather } from '../lib/weather.js'
import WeatherPopover from './WeatherPopover.jsx'

// Hub weather: current conditions plus a short forecast. Sits in the header row,
// so it stays compact.
export default function WeatherCard() {
  const { data, forecast, error } = useWeather()
  const [open, setOpen] = useState(false)
  // Tap for the full forecast.
  const wrap = (el) => (
    <>
      <button type="button" aria-label="More weather" onClick={() => setOpen(true)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>{el}</button>
      <WeatherPopover open={open} onClose={() => setOpen(false)} />
    </>
  )

  if (error || !data) {
    return wrap(
      <div style={card({ borderRadius: 28, padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 })}>
        <div style={{ fontSize: 60, fontWeight: 800 }}>—</div>
        <div style={{ fontSize: 22, color: C.muted }}>{error ? 'Weather off' : 'Edmonton'}</div>
      </div>
    )
  }

  const next = forecast.slice(1, 4) // tomorrow + 2

  return wrap(
    <div style={card({ borderRadius: 28, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 28 })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <WeatherIcon code={data.code} size={58} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1 }}>{data.temp}°</div>
          <div style={{ fontSize: 20, color: C.muted }}>{data.conditions}</div>
          <div style={{ fontSize: 18, color: C.muted }}>H {data.high}° · L {data.low}°</div>
        </div>
      </div>
      {next.length > 0 && (
        <div style={{ display: 'flex', gap: 22, borderLeft: `2px solid ${C.border}`, paddingLeft: 26 }}>
          {next.map((d) => (
            <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.muted }}>{d.label}</div>
              <WeatherIcon code={d.code} size={30} />
              <div style={{ fontSize: 17 }}>
                <span style={{ fontWeight: 700 }}>{d.high}°</span>{' '}
                <span style={{ color: C.muted }}>{d.low}°</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
