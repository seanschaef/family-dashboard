import { useFamilyTable, insertRow, deleteRow } from './db.js'
import { birthdayCountdown } from './time.js'

// Important dates (birthdays outside the roster, the pet's birthday,
// anniversaries, other dates) plus the household's own birthdays, merged into
// one soonest-first countdown list for the hub.

export const DATE_KINDS = [
  { key: 'birthday', label: 'Birthday' },
  { key: 'anniversary', label: 'Anniversary' },
  { key: 'other', label: 'Other date' },
]

export const SAMPLE_DATES = [
  { id: 'd1', title: 'Grandma', kind: 'birthday', date: '1952-01-20', year_known: true, repeats: true, color: null },
  { id: 'd2', title: 'Anniversary', kind: 'anniversary', date: '2008-06-14', year_known: true, repeats: true, color: null },
]

export const useImportantDates = () => useFamilyTable('important_dates', { order: { column: 'date' }, sample: SAMPLE_DATES })
export const addImportantDate = (v) => insertRow('important_dates', v)
export const removeImportantDate = (id) => deleteRow('important_dates', id)

// Days until a date (and the count it reaches). Yearly dates roll to next
// year once past; one-off dates return null once past.
export function dateCountdown(d, from = new Date()) {
  if (d.repeats === false) {
    const [y, m, day] = d.date.split('-').map(Number)
    const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
    const when = new Date(y, m - 1, day)
    const days = Math.round((when - today) / 86400000)
    return days < 0 ? null : { days, turning: null }
  }
  const c = birthdayCountdown(d.date, from)
  return c && { days: c.days, turning: d.year_known === false ? null : c.turning }
}

// One line of text after the name: "today!", "3 days · turns 10", "12 days · 18 years".
export function countdownText({ days, turning, kind }) {
  const when = days === 0 ? 'today!' : days === 1 ? 'tomorrow' : `${days} days`
  if (turning == null || turning <= 0) return when
  if (kind === 'anniversary') return `${when} · ${turning} ${turning === 1 ? 'year' : 'years'}`
  if (kind === 'birthday') return `${when} · turns ${turning}`
  return when
}

// Roster birthdays + important dates, soonest first.
export function upcomingCountdowns(members, dates, from = new Date()) {
  const people = members
    .filter((m) => m.birthday)
    .map((m) => ({ id: `m-${m.id}`, title: m.name, color: m.color, kind: 'birthday', ...birthdayCountdown(m.birthday, from) }))
  const others = dates
    .map((d) => {
      const c = dateCountdown(d, from)
      return c && { id: d.id, title: d.title, color: d.color, kind: d.kind, ...c }
    })
    .filter(Boolean)
  return [...people, ...others].sort((a, b) => a.days - b.days)
}
