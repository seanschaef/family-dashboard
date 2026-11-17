import { useEffect, useState } from 'react'
import { TZ } from './time.js'

const LAT = import.meta.env.VITE_WEATHER_LAT || '53.5461'
const LON = import.meta.env.VITE_WEATHER_LON || '-113.4938'

// WMO weather codes → short conditions text.
function conditions(code) {
  if (code === 0) return 'Clear'
  if (code <= 2) return 'Mostly sunny'
  if (code === 3) return 'Cloudy'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Showers'
  if (code >= 85 && code <= 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return '—'
}

// Current weather for the configured location (Edmonton). Open-Meteo needs no
// API key and allows CORS, so it is fetched directly from the browser.
const dayFmt = new Intl.DateTimeFormat('en-CA', { weekday: 'short', timeZone: TZ })

export function useWeather() {
  const [data, setData] = useState(null)
  const [forecast, setForecast] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=4&timezone=${encodeURIComponent(TZ)}`
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (!active) return
        const d = j.daily
        setData({
          temp: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          conditions: conditions(j.current.weather_code),
          high: Math.round(d.temperature_2m_max?.[0]),
          low: Math.round(d.temperature_2m_min?.[0]),
        })
        const days = (d.time || []).map((iso, i) => ({
          label: i === 0 ? 'Today' : dayFmt.format(new Date(iso + 'T12:00:00')),
          high: Math.round(d.temperature_2m_max[i]),
          low: Math.round(d.temperature_2m_min[i]),
          code: d.weather_code[i],
        }))
        setForecast(days)
      })
      .catch(() => active && setError(true))
    return () => {
      active = false
    }
  }, [])

  return { data, forecast, error }
}
