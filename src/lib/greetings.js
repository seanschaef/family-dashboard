// The hub's greeting line. In order of priority:
//   1. birthdays today (family members and important dates marked Birthday,
//      e.g. the dog): "Happy Birthday, Lewis!"
//   2. anniversaries today: "Happy Anniversary!" / "Happy Anniversary, <title>!"
//   3. a holiday or an odd little observance: "Happy Pi Day, Schaefers!"
//   4. otherwise a rotating everyday greeting: plain ("Good Morning,
//      Schaefers!") or a bit of whimsy that fits the time of day, the
//      weekday, the weather or the dog. It changes every three hours and
//      never flickers in between.
// Dates are Edmonton local dates.

const TZ = 'America/Edmonton'

function localParts(now) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return { y: +parts.year, m: +parts.month, d: +parts.day, hour: +parts.hour % 24, weekday: parts.weekday }
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

// ---------- everyday whimsy ----------
// {family} and {pet} are filled in. Lines that mention the pet are skipped
// when there's no pet name.
const BY_TIME = {
  morning: [
    'Rise and shine, {family}!',
    'Top of the morning, {family}!',
    'Morning, {family}. Coffee first, questions later.',
    'Good morning, sunshines!',
    'Up and at ’em, {family}!',
    'Fresh day, fresh socks, {family}.',
    '{pet} says good morning. Loudly.',
    'Breakfast is the most important meal. Says {pet}.',
  ],
  afternoon: [
    'Afternoon, {family}. Snack o’clock approaches.',
    'Halfway there, {family}!',
    'Hope the day’s treating you well, {family}.',
    '{pet} is guarding the house. Mostly napping.',
    'Hydrate, {family}! Water counts.',
  ],
  evening: [
    'Evening, {family}. What’s for dinner?',
    'Home sweet home, {family}.',
    'Shoes off, feet up, {family}.',
    'Has {pet} been walked? Just asking.',
    'Golden hour, {family}.',
  ],
  night: [
    'Good night, {family}. Sleep tight.',
    'Lights out soon, {family}.',
    'The house is sleepy, {family}.',
    'Night owls, {family}?',
    '{pet} is dreaming of squirrels.',
  ],
}
const BY_DAY = {
  Mon: ['Happy Monday, {family}. You’ve got this.', 'Fresh week, {family}!'],
  Wed: ['Happy Hump Day, {family}!', 'Halfway through the week, {family}!'],
  Thu: ['Happy Friday Eve, {family}!'],
  Fri: ['Happy Friday, {family}!', 'TGIF, {family}!', 'Weekend loading, {family}…'],
  Sat: ['Happy Saturday, {family}!', 'Weekend mode: on, {family}.'],
  Sun: ['Happy Sunday, {family}!', 'Slow Sunday, {family}.'],
}
function byWeather(temp) {
  if (temp == null) return []
  if (temp <= -30) return ['It’s −30ish. Stay in, {family}. Seriously.', 'Too cold for {pet}’s walk. Maybe.']
  if (temp <= -20) return ['It’s frosty out, {family}. Toques are not optional.', 'Plug in the car, {family}!', 'Brrr, {family}! Mitts on.']
  if (temp <= -10) return ['Bundle up, {family}!', 'Toque weather, {family}.']
  if (temp >= 28) return ['Scorcher today, {family}! Sunscreen up.', 'Hot one, {family}. Freezies in the freezer?']
  if (temp >= 20) return ['Beautiful day out there, {family}!', 'Patio weather, {family}!']
  return []
}

function partOfDay(hour) {
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

// Small stable hash so the choice holds for a three-hour block.
function pickIndex(seed, n) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return Math.abs(h) % n
}

function everyday({ y, m, d, hour, weekday }, familyName, petName, temp) {
  const part = partOfDay(hour)
  const plain = `${{ morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening', night: 'Good Night' }[part]}, {family}!`
  const pool = [
    plain,
    plain, // plain stays the most common line
    ...BY_TIME[part],
    ...(part === 'morning' || part === 'afternoon' ? BY_DAY[weekday] || [] : []),
    ...byWeather(temp),
  ].filter((line) => petName || !line.includes('{pet}'))
  const line = pool[pickIndex(`${y}-${m}-${d}-${Math.floor(hour / 3)}`, pool.length)]
  return line.replaceAll('{family}', familyName).replaceAll('{pet}', petName)
}

// Same day and month, ignoring the year (YYYY-MM-DD strings).
const sameDay = (iso, m, d) => {
  if (!iso) return false
  const [, mm, dd] = iso.split('-').map(Number)
  return mm === m && dd === d
}

const joinNames = (names) => (names.length <= 1 ? names[0] : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`)

export function hubGreeting({ now = new Date(), familyName = 'family', petName = '', members = [], dates = [], temp = null } = {}) {
  const parts = localParts(now)
  const { y, m, d } = parts

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

  return everyday(parts, familyName, petName, temp)
}
