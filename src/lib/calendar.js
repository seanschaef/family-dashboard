import { startOfDay, addDays, startOfWeek, startOfMonth, endOfMonth, isSameDay } from './time.js'

// Shared calendar model used by both the phone and wall calendar screens.
export const VIEWS = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]
export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// The [from, to] window to fetch for a view, plus month bounds for the grid.
export function rangeFor(view, anchor) {
  if (view === 'day') {
    const from = startOfDay(anchor)
    return { from, to: addDays(from, 1) }
  }
  if (view === 'week') {
    const from = startOfWeek(anchor)
    return { from, to: addDays(from, 7) }
  }
  const first = startOfMonth(anchor)
  const gridStart = startOfWeek(first)
  return { from: gridStart, to: addDays(gridStart, 42), monthFirst: first, monthLast: endOfMonth(anchor) }
}

export function eventsOn(events, day) {
  return events
    .filter((e) => isSameDay(new Date(e.starts_at), day))
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
}

// Step the anchor for prev/next. Month steps by calendar month; day/week by days.
export function stepAnchor(view, anchor, dir) {
  if (view === 'month') return new Date(anchor.getFullYear(), anchor.getMonth() + dir, 1)
  return addDays(anchor, dir * (view === 'day' ? 1 : 7))
}

// Cycle views for vertical swipe. dir +1 = zoom in (month->week->day).
export function cycleView(view, dir) {
  const order = ['month', 'week', 'day']
  const i = order.indexOf(view)
  const next = Math.min(order.length - 1, Math.max(0, i + dir))
  return order[next]
}

export function periodTitle(view, anchor) {
  if (view === 'month') return anchor.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
  if (view === 'week') {
    const s = startOfWeek(anchor)
    const e = addDays(s, 6)
    return `${s.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`
  }
  return anchor.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
}
