// Garbage / recycling collection days. The family enters, per stream, one
// known pickup date and how many weeks apart pickups are (Settings ›
// Collection day); nothing is looked up online and no address is stored.
// Stored in families.waste_schedule as { streams: [{ name, next, every, on }] }.

export const DEFAULT_STREAMS = [
  { name: 'Garbage', next: null, every: 2, on: true },
  { name: 'Food scraps', next: null, every: 1, on: true },
  { name: 'Recycling', next: null, every: 2, on: true },
  { name: 'Yard waste', next: null, every: 2, on: false },
]

export function streamsOf(schedule) {
  const saved = schedule?.streams || []
  const byName = Object.fromEntries(saved.map((s) => [s.name, s]))
  return DEFAULT_STREAMS.map((d) => ({ ...d, ...(byName[d.name] || {}) }))
}

const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const at = (s) => new Date(s + 'T12:00:00')
const DAY = 86400000

// The next pickup on or after `from` for one stream, as a Date (local noon).
export function nextPickup(stream, from = new Date()) {
  if (!stream.on || !stream.next || !stream.every) return null
  const start = at(iso(from))
  const ref = at(stream.next)
  const period = stream.every * 7
  const diff = Math.round((start - ref) / DAY)
  const k = Math.ceil(diff / period)
  return new Date(ref.getTime() + k * period * DAY)
}

// Upcoming pickup days, soonest first: [{ date: Date, names: [..] }]
export function upcomingPickups(schedule, from = new Date(), count = 3) {
  const days = {}
  for (const s of streamsOf(schedule)) {
    let d = nextPickup(s, from)
    for (let i = 0; d && i < 4; i++) {
      const key = iso(d)
      ;(days[key] ||= []).push(s.name)
      d = new Date(d.getTime() + s.every * 7 * DAY)
    }
  }
  return Object.keys(days)
    .sort()
    .slice(0, count)
    .map((k) => ({ date: at(k), names: days[k] }))
}

export function dayWord(date, now = new Date()) {
  const diff = Math.round((at(iso(date)) - at(iso(now))) / DAY)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 7) return date.toLocaleDateString('en-CA', { weekday: 'long' })
  return date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
}
