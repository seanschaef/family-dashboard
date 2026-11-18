import { greeting } from './time.js'

// The hub's greeting line. In order of priority:
//   1. birthdays today (family members and important dates marked Birthday,
//      e.g. the dog): "Happy Birthday, Lewis!"
//   2. anniversaries today: "Happy Anniversary!" / "Happy Anniversary, <title>!"
//   3. a holiday or an odd little observance: "Happy Pi Day, Schaefers!"
//   4. otherwise the time of day: "Good Morning, Schaefers!"
// Dates are Edmonton local dates.

const TZ = 'America/Edmonton'

function localParts(now) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return { y: +parts.year, m: +parts.month, d: +parts.day }
}

// nth weekday (0=Sun) of a month; n = -1 for the last one.
function nthWeekday(y, m, weekday, n) {
  if (n > 0) {
    const first = new Date(y, m - 1, 1).getDay()
    return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7
  }
  const lastDate = new Date(y, m, 0).getDate()
  const last = new Date(y, m - 1, lastDate).getDay()
  return lastDate - ((last - weekday + 7) % 7)
}

// Easter Sunday (Anonymous Gregorian algorithm) -> [month, day].
function easter(y) {
  const a = y % 19
  const b = Math.floor(y / 100)
  const c = y % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return [month, day]
}

const md = (m, d) => `${m}-${d}`

// Fixed-date days. {family} is replaced with the family name, {pet} with the
// pet's name. A string without "{family}" is used as-is.
const FIXED = {
  [md(1, 1)]: 'Happy New Year, {family}!',
  [md(1, 4)]: 'Happy Trivia Day, {family}!',
  [md(1, 21)]: 'Happy Squirrel Appreciation Day!',
  [md(1, 24)]: 'Happy Compliment Day, {family}! You all look great.',
  [md(2, 2)]: 'Happy Groundhog Day, {family}!',
  [md(2, 9)]: 'Happy Pizza Day, {family}!',
  [md(2, 14)]: "Happy Valentine's Day, {family}!",
  [md(2, 27)]: 'Happy Polar Bear Day!',
  [md(3, 14)]: 'Happy Pi Day, {family}! (3.14159…)',
  [md(3, 17)]: "Happy St. Patrick's Day, {family}!",
  [md(3, 20)]: 'Happy First Day of Spring, {family}!',
  [md(4, 1)]: "Happy April Fools' Day! (Trust no one.)",
  [md(4, 22)]: 'Happy Earth Day, {family}!',
  [md(4, 25)]: 'Happy World Penguin Day!',
  [md(5, 4)]: 'May the Fourth Be With You, {family}!',
  [md(5, 25)]: "Happy Towel Day! Don't panic.",
  [md(6, 21)]: 'Happy Summer Solstice, {family}!',
  [md(7, 1)]: 'Happy Canada Day, {family}!',
  [md(7, 2)]: 'Happy World UFO Day! Keep watching the skies.',
  [md(7, 17)]: 'Happy World Emoji Day!',
  [md(8, 8)]: 'Happy International Cat Day!',
  [md(8, 10)]: 'Happy Lazy Day, {family}. Take it easy.',
  [md(8, 26)]: 'Happy National Dog Day, {pet}!',
  [md(9, 19)]: 'Ahoy, {family}! Happy Talk Like a Pirate Day!',
  [md(9, 22)]: 'Happy First Day of Fall, {family}!',
  [md(10, 31)]: 'Happy Halloween, {family}!',
  [md(11, 11)]: 'Remembrance Day. Lest we forget.',
  [md(11, 13)]: 'Happy World Kindness Day, {family}!',
  [md(11, 17)]: 'Happy Take a Hike Day, {family}!',
  [md(11, 21)]: 'Happy World Hello Day! Hello, {family}!',
  [md(12, 4)]: 'Happy Cookie Day, {family}!',
  [md(12, 21)]: 'Happy Winter Solstice, {family}! Longest night of the year.',
  [md(12, 24)]: 'Merry Christmas Eve, {family}!',
  [md(12, 25)]: 'Merry Christmas, {family}!',
  [md(12, 26)]: 'Happy Boxing Day, {family}!',
  [md(12, 31)]: "Happy New Year's Eve, {family}!",
}

// Days that move each year (Canada / Alberta).
function moving(y) {
  const out = {}
  const [em, ed] = easter(y)
  const easterDate = new Date(y, em - 1, ed)
  const shift = (days) => {
    const x = new Date(easterDate)
    x.setDate(x.getDate() + days)
    return md(x.getMonth() + 1, x.getDate())
  }
  out[shift(-47)] = 'Happy Pancake Tuesday, {family}!'
  out[shift(-2)] = 'Good Friday, {family}.'
  out[shift(0)] = 'Happy Easter, {family}!'
  out[md(2, nthWeekday(y, 2, 1, 3))] = 'Happy Family Day, {family}!'
  out[md(5, nthWeekday(y, 5, 0, 2))] = "Happy Mother's Day!"
  // Victoria Day: the Monday before May 25.
  const may24 = new Date(y, 4, 24).getDay()
  out[md(5, 24 - ((may24 + 6) % 7))] = 'Happy Victoria Day, {family}!'
  out[md(6, nthWeekday(y, 6, 0, 3))] = "Happy Father's Day!"
  out[md(9, nthWeekday(y, 9, 1, 1))] = 'Happy Labour Day, {family}!'
  out[md(10, nthWeekday(y, 10, 1, 2))] = 'Happy Thanksgiving, {family}!'
  return out
}

// Same day and month, ignoring the year (YYYY-MM-DD strings).
const sameDay = (iso, m, d) => {
  if (!iso) return false
  const [, mm, dd] = iso.split('-').map(Number)
  return mm === m && dd === d
}

const joinNames = (names) => (names.length <= 1 ? names[0] : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`)

export function hubGreeting({ now = new Date(), familyName = 'family', petName = '', members = [], dates = [] } = {}) {
  const { y, m, d } = localParts(now)

  const birthdays = [
    ...members.filter((x) => sameDay(x.birthday, m, d)).map((x) => x.name),
    ...dates.filter((x) => x.kind === 'birthday' && sameDay(x.date, m, d)).map((x) => x.title),
  ]
  if (birthdays.length) return `Happy Birthday, ${joinNames(birthdays)}!`

  const anniversaries = dates.filter((x) => x.kind === 'anniversary' && sameDay(x.date, m, d))
  if (anniversaries.length) {
    // "Happy Anniversary, Mom & Dad!" (a title that already says anniversary is left off)
    const named = anniversaries.map((x) => x.title).filter((t) => !/anniversary/i.test(t))
    return named.length ? `Happy Anniversary, ${joinNames(named)}!` : 'Happy Anniversary!'
  }

  const special = moving(y)[md(m, d)] || FIXED[md(m, d)]
  if (special) {
    return special.replace('{family}', familyName).replace('{pet}', petName || 'pup')
  }

  return `${greeting(now)}, ${familyName}!`
}
