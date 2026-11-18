// The hub's arrangeable windows, including the clock/weather header;
// all of it is laid out from this list (order + size + width +
// visibility), stored per family in families.wall_layout and edited from the
// phone (Settings › Arrange the hub).

export const HUB_BLOCK_LABELS = {
  header: 'Clock and weather',
  photo: 'Photos',
  calendar: 'Calendar',
  legend: 'Calendar key (colours)',
  dinner: 'Dinner tonight',
  chores: 'Chores',
  pet: 'Pet',
  today: 'Today (schedule)',
  reminders: 'Reminders',
  birthdays: 'Coming up (birthdays and dates)',
}

// Sizes, shortest to tallest, and the widths each one can take. The hub is a
// 4-column grid: full = 4 columns, half = 2, quarter = 1.
export const SIZES = [
  { v: 's', label: 'S', widths: ['full', 'quarter'] },
  { v: 'm', label: 'M', widths: ['full', 'quarter'] },
  { v: 'l', label: 'L', widths: ['half'] },
  { v: 'xl', label: 'XL', widths: ['full', 'half'] },
]
export const WIDTH_LABELS = { full: 'Full', half: 'Half', quarter: 'Quarter' }
export const WIDTH_SPAN = { full: 4, half: 2, quarter: 1 }

const widthsFor = (size) => SIZES.find((s) => s.v === size)?.widths || ['full']

export const DEFAULT_HUB_LAYOUT = [
  { id: 'header', size: 's', width: 'full', visible: true },
  { id: 'photo', size: 'm', width: 'full', visible: true, fit: 'cover' },
  { id: 'calendar', size: 'm', width: 'full', visible: true },
  { id: 'legend', size: 's', width: 'full', visible: false },
  { id: 'dinner', size: 's', width: 'full', visible: true },
  { id: 'chores', size: 'l', width: 'half', visible: true },
  { id: 'pet', size: 'l', width: 'half', visible: true },
  { id: 'today', size: 'l', width: 'half', visible: true },
  { id: 'reminders', size: 'l', width: 'half', visible: false },
  { id: 'birthdays', size: 'l', width: 'half', visible: true },
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
  const known = new Set(Object.keys(HUB_BLOCK_LABELS))
  const seen = new Set()
  const out = []
  const sized = (b) => {
    let { size, width } = b
    if (!width) ({ size, width } = fromOldSize(b.id, size))
    if (!SIZES.some((s) => s.v === size)) size = 'm'
    if (!widthsFor(size).includes(width)) width = widthsFor(size)[0]
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
          interval: [5, 10, 15, 20, 30, 60].includes(b.interval) ? b.interval : 10,
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
    if (b.id === 'photo') entry.fit = b.fit === 'contain' ? 'contain' : 'cover'
    out.push(entry)
  }
  // The header (clock/weather) used to be fixed at the top: keep it there.
  if (!seen.has('header')) {
    out.unshift({ ...DEFAULT_HUB_LAYOUT[0] })
    seen.add('header')
  }
  // Append any block missing from the stored layout (e.g. a newly added feature).
  for (const d of DEFAULT_HUB_LAYOUT) if (!seen.has(d.id)) out.push({ ...d })
  return out
}

// A readable name for an entry (combined windows list their parts).
export function entryLabel(b) {
  const short = (id) => HUB_BLOCK_LABELS[id].replace(/ \(.*\)$/, '')
  return b.group ? b.group.map(short).join(' + ') : HUB_BLOCK_LABELS[b.id]
}

// Combine entry j into entry i (both may already be combined windows).
export function combineEntries(items, i, j) {
  const a = items[i]
  const b = items[j]
  const members = [...(a.group || [a.id]), ...(b.group || [b.id])]
  const merged = {
    id: a.group ? a.id : `group-${Date.now().toString(36)}`,
    group: members,
    interval: a.interval || 10,
    transition: a.transition || 'fade',
    size: a.size,
    width: a.width,
    visible: true,
  }
  return items.flatMap((x, k) => (k === i ? [merged] : k === j ? [] : [x]))
}

// Take one window out of a combined window (it goes right after it). A group
// left with one member becomes a plain window again.
export function separateEntry(items, i, memberId) {
  const g = items[i]
  const rest = g.group.filter((id) => id !== memberId)
  const out = { id: memberId, size: g.size, width: g.width, visible: true }
  const kept = rest.length >= 2 ? { ...g, group: rest } : { id: rest[0], size: g.size, width: g.width, visible: g.visible }
  return items.flatMap((x, k) => (k === i ? [kept, out] : [x]))
}

// Change a block's size, keeping its width if the new size allows it.
export function withSize(block, size) {
  const widths = widthsFor(size)
  return { ...block, size, width: widths.includes(block.width) ? block.width : widths[0] }
}
export const widthOptions = widthsFor

// Fixed heights (px) for blocks that need one, within the 1080x1920 wall.
const FIXED = {
  header: { s: 160, m: 200, l: 240, xl: 300 },
  photo: { s: 200, m: 320, l: 300, xl: 440 },
  calendar: { s: 260, m: 430, l: 430, xl: 560 },
  today: { s: 160, m: 240, l: 300, xl: 440 },
}
export function blockHeight(id, size) {
  return FIXED[id]?.[size]
}

// Everything else is content-sized, with a minimum per size.
export const MIN_HEIGHT = { s: undefined, m: 200, l: 240, xl: 440 }
