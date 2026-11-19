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
    const get = () => fetch(url)
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
    get()
    // The wall stays open for days: refresh every 30 minutes.
    const id = setInterval(get, 30 * 60 * 1000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  return { data, forecast, error }
}

export { conditions }

// Fetch JSON now and every `everyMs`; returns { data, error }.
function usePolled(url, everyMs, parse) {
  const [state, setState] = useState({ data: null, error: false })
  useEffect(() => {
    let active = true
    const get = () =>
      fetch(url)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .then((j) => active && setState({ data: parse(j), error: false }))
        .catch(() => active && setState((s) => ({ data: s.data, error: !s.data })))
    get()
    const id = setInterval(get, everyMs)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps
  return state
}

const hourFmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', timeZone: TZ })

// Hourly (next 12 h) and daily (5 days) forecast with feels-like and the
// chance of precipitation, from Open-Meteo (no key needed).
export function useForecast() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&forecast_days=6&timezone=${encodeURIComponent(TZ)}`
  return usePolled(url, 30 * 60 * 1000, (j) => {
    const now = Date.now()
    const h = j.hourly
    const hours = (h.time || [])
      .map((t, i) => ({ t: new Date(t + ':00'), temp: Math.round(h.temperature_2m[i]), feels: Math.round(h.apparent_temperature[i]), pop: h.precipitation_probability?.[i] ?? 0, code: h.weather_code[i] }))
      .filter((x) => x.t.getTime() > now - 3600000)
      .slice(0, 12)
      .map((x) => ({ ...x, label: hourFmt.format(x.t).replace(/\s?([ap])\.?m\.?/i, (m, a) => a.toLowerCase()) }))
    const d = j.daily
    const days = (d.time || []).slice(0, 6).map((iso, i) => ({
      label: i === 0 ? 'Today' : dayFmt.format(new Date(iso + 'T12:00:00')),
      high: Math.round(d.temperature_2m_max[i]),
      low: Math.round(d.temperature_2m_min[i]),
      code: d.weather_code[i],
      pop: d.precipitation_probability_max?.[i] ?? 0,
    }))
    return {
      now: { temp: Math.round(j.current.temperature_2m), feels: Math.round(j.current.apparent_temperature), code: j.current.weather_code, wind: Math.round(j.current.wind_speed_10m), conditions: conditions(j.current.weather_code) },
      hours,
      days,
    }
  })
}

// What to wear, from the coldest feels-like in the next 12 hours plus rain or
// snow chances.
export function wearHint(f) {
  if (!f?.hours?.length) return ''
  const feels = Math.min(...f.hours.map((h) => h.feels))
  const wet = f.hours.some((h) => h.pop >= 50)
  const snow = f.hours.some((h) => (h.code >= 71 && h.code <= 77) || h.code === 85 || h.code === 86)
  let base
  if (feels <= -30) base = 'Extreme cold: cover all skin, keep time outside short'
  else if (feels <= -20) base = 'Parka, toque, mitts, scarf and warm boots'
  else if (feels <= -10) base = 'Winter coat, toque and mitts'
  else if (feels <= 0) base = 'Warm jacket and a toque'
  else if (feels <= 10) base = 'Jacket or a warm hoodie'
  else if (feels <= 18) base = 'Light jacket or sweater'
  else base = 'T-shirt weather'
  const extra = snow ? ' · snow boots' : wet ? ' · umbrella or rain jacket' : ''
  return base + extra
}

// Air Quality Health Index for Edmonton from Environment Canada (official,
// no key, CORS open). Current reading plus today's highest forecast.
const AQHI_LOCATION = import.meta.env.VITE_AQHI_LOCATION || 'IACMP' // Edmonton
export function useAqhi() {
  const base = 'https://api.weather.gc.ca/collections'
  const obs = usePolled(`${base}/aqhi-observations-realtime/items?f=json&location_id=${AQHI_LOCATION}&latest=true&limit=1`, 30 * 60 * 1000, (j) => {
    const p = j.features?.[0]?.properties
    return p ? { aqhi: p.aqhi, at: p.observation_datetime } : null
  })
  const fc = usePolled(`${base}/aqhi-forecasts-realtime/items?f=json&location_id=${AQHI_LOCATION}&sortby=-publication_datetime&limit=12`, 60 * 60 * 1000, (j) => {
    const feats = (j.features || []).map((f) => f.properties)
    if (!feats.length) return null
    const latestPub = feats[0].publication_datetime
    const next = feats.filter((p) => p.publication_datetime === latestPub && new Date(p.forecast_datetime) > new Date())
    if (!next.length) return null
    return { max: Math.max(...next.map((p) => p.aqhi)), periods: next.length }
  })
  return { current: obs.data, forecast: fc.data, error: obs.error && fc.error }
}

export function aqhiRisk(v) {
  if (v == null) return { label: '—', color: '#888888' }
  if (v <= 3) return { label: 'Low risk', color: '#2E8B57' }
  if (v <= 6) return { label: 'Moderate risk', color: '#D9A441' }
  if (v <= 10) return { label: 'High risk', color: '#D2691E' }
  return { label: 'Very high risk', color: '#B22222' }
}
