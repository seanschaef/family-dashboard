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

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: TZ,
})

// Wall clock, 12-hour: { time: "9:04", ap: "am" } (shown with a smaller am/pm).
export function clockParts(date = new Date()) {
  const parts = Object.fromEntries(timeFmt.formatToParts(date).map((p) => [p.type, p.value]))
  return { time: `${parts.hour}:${parts.minute}`, ap: /p/i.test(parts.dayPeriod || '') ? 'pm' : 'am' }
}

// "9:04 am" as plain text.
export function formatClock(date = new Date()) {
  const { time, ap } = clockParts(date)
  return `${time} ${ap}`
}

export function formatLongDate(date = new Date()) {
  return dateFmt.format(date)
}

export function greeting(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: TZ }).format(date),
  )
  if (hour < 5) return 'Good Night'
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 21) return 'Good Evening'
  return 'Good Night'
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

// Event times ("6:30 pm"). Uses the device's local zone so it agrees with
// the local day-grouping helpers above (startOfDay/isSameDay). For the family
// in Edmonton the device zone is Mountain Time; the wall clock itself stays
// pinned to Edmonton via formatClock().
const hmFmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
// Event times with am/pm so 9:00 can't be misread: "9 am", "2:15 pm".
export const timeOfDay = (d) => {
  const parts = Object.fromEntries(hmFmt.formatToParts(new Date(d)).map((p) => [p.type, p.value]))
  const ap = /p/i.test(parts.dayPeriod || '') ? 'pm' : 'am'
  return parts.minute === '00' ? `${parts.hour} ${ap}` : `${parts.hour}:${parts.minute} ${ap}`
}

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

// Household birthdays, soonest first. Each row carries the member plus the
// countdown (days until, age turning).
export function upcomingBirthdays(members, from = new Date()) {
  return members
    .filter((m) => m.birthday)
    .map((m) => ({ member: m, ...birthdayCountdown(m.birthday, from) }))
    .sort((a, b) => a.days - b.days)
}
