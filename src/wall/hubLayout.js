// The hub's arrangeable windows. The greeting/clock/weather header is fixed;
// everything below is laid out from this list (order + size + width +
// visibility), stored per family in families.wall_layout and edited from the
// phone (Settings › Arrange the hub).

export const HUB_BLOCK_LABELS = {
  photo: 'Photos',
  calendar: 'Calendar',
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
  { id: 'photo', size: 'm', width: 'full', visible: true },
  { id: 'calendar', size: 'm', width: 'full', visible: true },
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
export function normalizeHubLayout(stored) {
  if (!Array.isArray(stored) || !stored.length) return DEFAULT_HUB_LAYOUT
  // Today replaced Reminders on the hub: a saved layout without Today takes
  // over Reminders' spot and size (Reminders stays available, hidden).
  if (!stored.some((b) => b?.id === 'today')) {
    stored = stored.flatMap((b) => (b?.id === 'reminders' ? [{ ...b, id: 'today' }, { ...b, visible: false }] : [b]))
  }
  const known = new Set(Object.keys(HUB_BLOCK_LABELS))
  const seen = new Set()
  const out = []
  for (const b of stored) {
    if (!b || !known.has(b.id) || seen.has(b.id)) continue
    seen.add(b.id)
    let { size, width } = b
    if (!width) ({ size, width } = fromOldSize(b.id, size))
    if (!SIZES.some((s) => s.v === size)) size = 'm'
    if (!widthsFor(size).includes(width)) width = widthsFor(size)[0]
    out.push({ id: b.id, size, width, visible: b.visible !== false })
  }
  // Append any block missing from the stored layout (e.g. a newly added feature).
  for (const d of DEFAULT_HUB_LAYOUT) if (!seen.has(d.id)) out.push({ ...d })
  return out
}

// Change a block's size, keeping its width if the new size allows it.
export function withSize(block, size) {
  const widths = widthsFor(size)
  return { ...block, size, width: widths.includes(block.width) ? block.width : widths[0] }
}
export const widthOptions = widthsFor

// Fixed heights (px) for blocks that need one, within the 1080x1920 wall.
const FIXED = {
  photo: { s: 200, m: 320, l: 300, xl: 440 },
  calendar: { s: 260, m: 430, l: 430, xl: 560 },
  today: { s: 160, m: 240, l: 300, xl: 440 },
}
export function blockHeight(id, size) {
  return FIXED[id]?.[size]
}

// Everything else is content-sized, with a minimum per size.
export const MIN_HEIGHT = { s: undefined, m: 200, l: 240, xl: 440 }
