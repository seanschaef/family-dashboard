// The hub's arrangeable windows, including the clock/weather header;
// all of it is laid out from this list (order + size + width +
// visibility), stored per family in families.wall_layout and edited from the
// phone (Settings › Arrange the hub).

export const HUB_BLOCK_LABELS = {
  header: 'Clock and Weather',
  photo: 'Photos',
  calendar: 'Calendar',
  legend: 'Calendar Key (colours)',
  dinner: 'Dinner Tonight',
  chores: 'Chores',
  pet: 'Pet',
  today: 'Today (schedule)',
  reminders: 'Reminders',
  birthdays: 'Coming Up (birthdays and dates)',
  points: 'Points (everyone’s totals)',
  goals: 'Saving For (reward goals)',
  leaderboard: 'Chore Leaderboard (this week)',
  mealsweek: 'This Week’s Meals',
  groceries: 'Grocery List',
  notes: 'Family Notes',
  nextup: 'Next Up (whole family)',
  forecast: 'Weather Forecast',
  air: 'Air Quality (AQHI)',
  waste: 'Garbage and Recycling',
  onthisday: 'On This Day (photos)',
  ink: 'Ink (draw or write)',
  joke: 'Giggle Break',
}

// Size (S, M, L, XL) is a window's height; width (quarter, half, full) is
// separate, so any window can be any size at any width. The hub is a
// 4-column grid: full = 4 columns, half = 2, quarter = 1. Windows flow left to
// right in order, so narrower ones sit side by side.
export const SIZES = [
  { v: 's', label: 'S' },
  { v: 'm', label: 'M' },
  { v: 'l', label: 'L' },
  { v: 'xl', label: 'XL' },
]
export const WIDTHS = ['quarter', 'half', 'full']
export const WIDTH_LABELS = { full: 'Full', half: 'Half', quarter: 'Quarter' }
export const WIDTH_SPAN = { full: 4, half: 2, quarter: 1 }
// How long each photo shows, in seconds (Arrange › Photos).
export const PHOTO_SECONDS = [5, 8, 15, 30, 60, 120, 300]

export const DEFAULT_HUB_LAYOUT = [
  { id: 'header', size: 's', width: 'full', visible: true },
  { id: 'photo', size: 'm', width: 'full', visible: true, fit: 'cover' },
  { id: 'calendar', size: 'l', width: 'full', visible: true },
  { id: 'legend', size: 's', width: 'full', visible: false },
  { id: 'dinner', size: 's', width: 'full', visible: true },
  { id: 'chores', size: 'm', width: 'half', visible: true },
  { id: 'pet', size: 'm', width: 'half', visible: true },
  { id: 'today', size: 'm', width: 'half', visible: true },
  { id: 'reminders', size: 'm', width: 'half', visible: false },
  { id: 'birthdays', size: 'm', width: 'half', visible: true },
  { id: 'points', size: 'l', width: 'half', visible: false },
  { id: 'goals', size: 'm', width: 'half', visible: false },
  { id: 'leaderboard', size: 'm', width: 'half', visible: false },
  { id: 'mealsweek', size: 'l', width: 'half', visible: false },
  { id: 'groceries', size: 'l', width: 'half', visible: false },
  { id: 'notes', size: 'm', width: 'half', visible: false },
  { id: 'nextup', size: 'm', width: 'half', visible: false },
  { id: 'forecast', size: 'l', width: 'half', visible: false },
  { id: 'air', size: 'm', width: 'quarter', visible: false },
  { id: 'waste', size: 'm', width: 'half', visible: false },
  { id: 'onthisday', size: 'm', width: 'half', visible: false },
  { id: 'ink', size: 'l', width: 'half', visible: false },
  { id: 'joke', size: 'm', width: 'half', visible: false },
]

// Layouts saved before widths existed: 'l' meant full width, 's'/'m' half.
// Map them onto the new sizes so the wall looks the same as before.
function fromOldSize(id, size) {
  if (size === 'l') {
    if (id === 'dinner') return { size: 's', width: 'full' }
    return { size: 'm', width: 'full' }
  }
  return { size: 'l', width: 'half' }
}

// Merge a stored layout with the defaults so new blocks always appear and any
// unknown/removed ids are dropped. Returns a full, ordered list.
//
// An entry is either one window ({ id, size, width, visible }) or a combined
// window that rotates between several ({ id: 'group-…', group: [ids],
// interval: seconds, transition: 'fade'|'slide'|'none', size, width, visible }).
// The photo window also has fit: 'cover' (fill, cropped) | 'contain' (whole photo).
export function normalizeHubLayout(stored) {
  if (!Array.isArray(stored) || !stored.length) return DEFAULT_HUB_LAYOUT
  // Today replaced Reminders on the hub: a saved layout without Today takes
  // over Reminders' spot and size (Reminders stays available, hidden).
  const hasToday = stored.some((b) => b?.id === 'today' || b?.group?.includes('today'))
  if (!hasToday) {
    stored = stored.flatMap((b) => (b?.id === 'reminders' ? [{ ...b, id: 'today' }, { ...b, visible: false }] : [b]))
  }
  // The header (clock/weather) used to be fixed at the top: keep it there.
  if (!stored.some((b) => b?.id === 'header' || b?.group?.includes('header'))) {
    stored = [{ ...DEFAULT_HUB_LAYOUT[0] }, ...stored]
  }
  return normalizeLayout(stored, { labels: HUB_BLOCK_LABELS, defaults: DEFAULT_HUB_LAYOUT, legacy: fromOldSize })
}

// The shared part, used by the hub and by each person's page.
export function normalizeLayout(stored, { labels, defaults, legacy }) {
  if (!Array.isArray(stored) || !stored.length) return defaults
  const known = new Set(Object.keys(labels))
  const seen = new Set()
  const out = []
  const sized = (b) => {
    let { size, width } = b
    if (!width && legacy) ({ size, width } = legacy(b.id, size))
    if (!SIZES.some((s) => s.v === size)) size = 'm'
    if (!WIDTHS.includes(width)) width = 'full'
    return { size, width, visible: b.visible !== false }
  }
  for (const b of stored) {
    if (!b) continue
    if (Array.isArray(b.group)) {
      const members = b.group.filter((id) => known.has(id) && !seen.has(id))
      members.forEach((id) => seen.add(id))
      if (members.length >= 2) {
        out.push({
          id: b.id || `group-${members.join('-')}`,
          group: members,
          // 0 = manual: only changes when someone swipes or taps a dot/arrow.
          interval: [0, 5, 10, 15, 20, 30, 60].includes(b.interval) ? b.interval : 10,
          transition: ['fade', 'slide', 'none'].includes(b.transition) ? b.transition : 'fade',
          ...sized(b),
        })
      } else if (members.length === 1) {
        out.push({ id: members[0], ...sized(b) })
      }
      continue
    }
    if (!known.has(b.id) || seen.has(b.id)) continue
    seen.add(b.id)
    const entry = { id: b.id, ...sized(b) }
    if (b.id === 'photo') {
      entry.fit = b.fit === 'contain' ? 'contain' : 'cover'
      entry.seconds = PHOTO_SECONDS.includes(b.seconds) ? b.seconds : 8
    }
    out.push(entry)
  }
  // Append any block missing from the stored layout (e.g. a newly added feature).
  for (const d of defaults) if (!seen.has(d.id)) out.push({ ...d })
  return out
}

// A readable name for an entry (combined windows list their parts).
export function entryLabel(b, labels = HUB_BLOCK_LABELS) {
  const short = (id) => labels[id].replace(/ \(.*\)$/, '')
  return b.group ? b.group.map(short).join(' + ') : labels[b.id]
}

// Combine entry j into entry i (both may already be combined windows).
export function combineEntries(items, i, j) {
  const a = items[i]
  const b = items[j]
  const members = [...(a.group || [a.id]), ...(b.group || [b.id])]
  const merged = {
    id: a.group ? a.id : `group-${Date.now().toString(36)}`,
    group: members,
    interval: a.interval ?? 10,
    transition: a.transition || 'fade',
    size: a.size,
    width: a.width,
    visible: true,
  }
  return items.flatMap((x, k) => (k === i ? [merged] : k === j ? [] : [x]))
}

// Take one window out of a combined window. It's removed from the screen
// (moved to Hidden windows, where it can be added back); a group left with
// one member becomes a plain window again.
export function separateEntry(items, i, memberId) {
  const g = items[i]
  const rest = g.group.filter((id) => id !== memberId)
  const out = { id: memberId, size: g.size, width: g.width, visible: false }
  const kept = rest.length >= 2 ? { ...g, group: rest } : { id: rest[0], size: g.size, width: g.width, visible: g.visible }
  return [...items.map((x, k) => (k === i ? kept : x)), out]
}


// One height per size for every window (px on the wall), so two windows of
// the same size always line up. Windows pack like widgets: each one slots into
// the first space it fits, in order, including gaps beside a taller
// neighbour. The phone's preview uses the same numbers, scaled down.
// The one exception is Dinner tonight, a single-line strip.
export const GENERIC_HEIGHT = { s: 160, m: 280, l: 400, xl: 520 }
const FIXED = {
  dinner: { s: 80, m: 120, l: 160, xl: 220 },
}
export function approxHeight(id, size) {
  return FIXED[id]?.[size] ?? GENERIC_HEIGHT[size] ?? 280
}
export const blockHeight = approxHeight
// A combined window is as tall as its tallest member.
export function entryHeight(b, heightOf = approxHeight) {
  return Math.max(...(b.group || [b.id]).map((id) => heightOf(id, b.size)))
}

// The packing grid: tiny rows, each window spans enough of them for its
// height plus the gap below it. Grid auto-placement (not "dense") then puts
// each window in the first free spot after the one before it.
export const ROW_UNIT = 4
export function packedStyle(span, height, gap, unit = ROW_UNIT) {
  return { gridColumn: `span ${span}`, gridRow: `span ${Math.ceil((height + gap) / unit)}`, height, alignSelf: 'start', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }
}

