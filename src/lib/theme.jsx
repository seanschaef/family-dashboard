import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { isDaylight } from './sun.js'

// Light / dark theme. The colours themselves live in index.css; this only sets
// <html data-theme="light|dark">.
//
// Phones and computers: by default dark from sunset to sunrise in Edmonton
// ("sun"); or follow the device ("auto"), or always light / dark. The choice is
// per device (localStorage).
// The wall: dark from sunset to sunrise too (wall_settings.dark_follow_sun), or
// between fixed times set from the phone. WallLayout turns this on while the
// wall is showing.

const PREF_KEY = 'theme-pref' // 'sun' | 'auto' | 'light' | 'dark'
const THEME_COLOR = { light: '#B4532A', dark: '#1B1714' }

function readPref() {
  try {
    const v = localStorage.getItem(PREF_KEY)
    return v === 'light' || v === 'dark' || v === 'auto' ? v : 'sun'
  } catch {
    return 'sun'
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[theme])
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(readPref)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)
  const [wallTheme, setWallTheme] = useState(null) // set by the wall; overrides the phone logic

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return undefined
    const on = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // Re-check the sun every minute.
  const [daylight, setDaylight] = useState(() => isDaylight())
  useEffect(() => {
    const id = setInterval(() => setDaylight(isDaylight()), 60000)
    return () => clearInterval(id)
  }, [])

  const deviceTheme = pref === 'sun' ? (daylight ? 'light' : 'dark') : pref === 'auto' ? (systemDark ? 'dark' : 'light') : pref
  const theme = wallTheme || deviceTheme

  useEffect(() => applyTheme(theme), [theme])

  function setPref(next) {
    setPrefState(next)
    try {
      localStorage.setItem(PREF_KEY, next)
    } catch {
      /* private mode: still applies for this session */
    }
  }

  return <ThemeContext.Provider value={{ theme, pref, setPref, setWallTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

const toMin = (hhmm) => {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

// Is `now` inside the [start, end) window? Windows may wrap past midnight.
export function inWindow(start, end, now = new Date()) {
  const s = toMin(start)
  const e = toMin(end)
  const cur = now.getHours() * 60 + now.getMinutes()
  if (s === e) return false
  return s < e ? cur >= s && cur < e : cur >= s || cur < e
}

// Used by WallLayout: keeps the wall dark at night per wall_settings, checking
// every minute and re-reading the schedule when it changes on a phone.
export function useWallNightTheme() {
  const { setWallTheme } = useTheme()
  const [sched, setSched] = useState({ dark_enabled: true, dark_follow_sun: true, dark_start: '19:30', dark_end: '07:00' })

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    const load = async () => {
      const { data } = await supabase.from('wall_settings').select('dark_enabled, dark_follow_sun, dark_start, dark_end').limit(1).maybeSingle()
      if (active && data) setSched(data)
    }
    load()
    const ch = supabase
      .channel('wall-theme')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wall_settings' }, load)
      .subscribe()
    return () => {
      active = false
      supabase.removeChannel(ch)
    }
  }, [])

  useEffect(() => {
    const night = () => (sched.dark_follow_sun !== false ? !isDaylight() : inWindow(sched.dark_start, sched.dark_end))
    const tick = () => setWallTheme(sched.dark_enabled && night() ? 'dark' : 'light')
    tick()
    const id = setInterval(tick, 30000)
    return () => {
      clearInterval(id)
      setWallTheme(null) // leaving the wall: back to the device theme
    }
  }, [sched, setWallTheme])
}
