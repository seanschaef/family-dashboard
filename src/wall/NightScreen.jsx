import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { inWindow } from '../lib/theme.jsx'
import { DEFAULT_WALL_SETTINGS } from '../lib/wallSettings.js'

// "Monitor off" for the wall, done in software: outside the on-hours set under
// Wall display, the whole screen goes black. Tap anywhere to wake it for a
// couple of minutes. (This monitor drops its HDMI link when powered down and
// the Pi wakes it again within seconds, so a real power-off doesn't stick.)

const WAKE_MS = 2 * 60 * 1000

function onHoursNow(s, now = new Date()) {
  const weekend = now.getDay() === 0 || now.getDay() === 6
  const on = weekend ? s.weekend_on_time : s.on_time
  const off = weekend ? s.weekend_off_time : s.off_time
  if (on === off) return true
  return inWindow(on, off, now)
}

export default function NightScreen() {
  const [s, setS] = useState(DEFAULT_WALL_SETTINGS)
  const [now, setNow] = useState(() => new Date())
  const [wakeUntil, setWakeUntil] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    const load = async () => {
      const { data } = await supabase
        .from('wall_settings')
        .select('display_enabled, on_time, off_time, weekend_on_time, weekend_off_time')
        .limit(1)
        .maybeSingle()
      if (active && data) setS({ ...DEFAULT_WALL_SETTINGS, ...data })
    }
    load()
    const ch = supabase
      .channel('wall-night-screen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wall_settings' }, load)
      .subscribe()
    return () => {
      active = false
      supabase.removeChannel(ch)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])

  // Not inside the phone's Wall preview (an iframe): that should show the page.
  const embedded = typeof window !== 'undefined' && window.self !== window.top
  const asleep = !embedded && s.display_enabled && !onHoursNow(s, now) && now.getTime() > wakeUntil
  if (!asleep) return null

  // Wake on click (after the finger lifts), so the tap that wakes the screen
  // can't also land on whatever is underneath once the black layer is gone.
  const wake = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setWakeUntil(Date.now() + WAKE_MS)
    setNow(new Date())
  }

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Screen asleep. Tap to wake."
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={wake}
      style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 1000, cursor: 'none', touchAction: 'none' }}
    />
  )
}
