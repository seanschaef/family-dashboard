import { useEffect, useState } from 'react'

// We are in Edmonton, Alberta (Mountain Time). Pin formatting to that zone so
// the wall shows the right time even if a device's clock/zone drifts.
export const TZ = 'America/Edmonton'

const timeFmt = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TZ,
})

const timeFmt24 = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TZ,
})

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: TZ,
})

// "7:42" style. The mockups drop the am/pm, so strip it.
export function formatClock(date = new Date(), { ampm = false } = {}) {
  if (ampm) return timeFmt.format(date).replace(/\s?[ap]\.?m\.?/i, '').trim()
  return timeFmt24.format(date)
}

export function formatLongDate(date = new Date()) {
  return dateFmt.format(date)
}

export function greeting(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: TZ }).format(date),
  )
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Ticking clock hook. Updates every 15s (enough for a minute display) to keep
// the Pi idle. Returns a Date.
export function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

// ---- calendar date helpers (local time) ----
export const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
// Monday-based start of week.
export const startOfWeek = (d) => {
  const x = startOfDay(d)
  const day = (x.getDay() + 6) % 7
  return addDays(x, -day)
}
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
export const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0)
export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// "6:30" without the am/pm tag. Uses the device's local zone so it agrees with
// the local day-grouping helpers above (startOfDay/isSameDay). For the family
// in Edmonton the device zone is Mountain Time; the wall clock itself stays
// pinned to Edmonton via formatClock().
const hmFmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
export const timeOfDay = (d) => hmFmt.format(new Date(d)).replace(/\s?[ap]\.?m\.?/i, '').trim()

export const monthTitle = (d) => d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })

// Days until the next birthday, and the age they will turn.
export function birthdayCountdown(isoBirthday, from = new Date()) {
  if (!isoBirthday) return null
  const [by, bm, bd] = isoBirthday.split('-').map(Number)
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  let next = new Date(today.getFullYear(), bm - 1, bd)
  if (next < today) next = new Date(today.getFullYear() + 1, bm - 1, bd)
  const days = Math.round((next - today) / 86400000)
  const turning = next.getFullYear() - by
  return { days, turning }
}
