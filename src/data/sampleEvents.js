// SAMPLE calendar events with real dates, anchored around "today", so the
// day/week/month views render meaningfully before live ICS data exists.
// Replaced by Supabase `calendar_events` once feeds are synced.

function at(date, h, m) {
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}
const iso = (d) => d.toISOString()

// Build a flat list of events across a wide window around today.
export function sampleEvents() {
  const out = []
  let id = 1
  const push = (start, end, title, person_key, kind = 'personal', { allDay = false, location = null } = {}) => {
    out.push({
      id: `s${id++}`,
      title,
      person_key,
      kind,
      all_day: allDay,
      location,
      starts_at: iso(start),
      ends_at: end ? iso(end) : null,
    })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let offset = -35; offset <= 45; offset++) {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    const dow = d.getDay() // 0 Sun .. 6 Sat

    // Weekday school + a work meeting
    if (dow >= 1 && dow <= 5) {
      push(at(d, 8, 20), at(d, 15, 20), 'School', 'm3', 'personal', { location: 'School' })
      push(at(d, 8, 20), at(d, 15, 20), 'School', 'm4', 'personal', { location: 'School' })
      push(at(d, 8, 30), at(d, 9, 0), 'Team meeting', 'm2', 'work')
    }
    // Soccer practice Mon + Wed
    if (dow === 1 || dow === 3) {
      push(at(d, 18, 30), at(d, 19, 30), 'Soccer practice', 'm3', 'personal', { location: 'ManageSoccer' })
    }
    // Soccer game some Wednesdays
    if (dow === 3 && (offset % 14 === 2 || offset === 1)) {
      push(at(d, 19, 0), at(d, 20, 30), 'Soccer game', 'm3', 'personal', { location: 'Field' })
    }
    // Pizza night Friday (family)
    if (dow === 5) push(at(d, 17, 30), at(d, 18, 30), 'Pizza night', 'family')
    // Groceries Saturday
    if (dow === 6) push(at(d, 10, 0), at(d, 11, 0), 'Groceries', 'm1')
  }

  // A few one-offs near today
  const plus = (n) => {
    const d = new Date(today)
    d.setDate(today.getDate() + n)
    return d
  }
  push(at(plus(1), 16, 0), at(plus(1), 16, 45), 'Dentist', 'm4', 'personal', { location: 'Dental clinic' })
  push(at(plus(3), 9, 0), at(plus(3), 10, 0), 'Parent-teacher', 'm1')
  push(plus(7), null, 'Playoff game', 'm3', 'personal', { allDay: true })

  return out
}
