// The hub's arrangeable windows. The greeting/clock/weather header is fixed;
// everything below is laid out from this list (order + size + visibility),
// stored per family in families.wall_layout and edited from the phone.

export const HUB_BLOCK_LABELS = {
  photo: 'Photos',
  calendar: 'Calendar',
  dinner: 'Dinner tonight',
  chores: 'Chores',
  pet: 'Pet',
  reminders: 'Reminders',
  birthdays: 'Coming up (birthdays and dates)',
}

// size: 'l' = full width, 's'/'m' = half width (m is taller than s).
export const DEFAULT_HUB_LAYOUT = [
  { id: 'photo', size: 'l', visible: true },
  { id: 'calendar', size: 'l', visible: true },
  { id: 'dinner', size: 'l', visible: true },
  { id: 'chores', size: 'm', visible: true },
  { id: 'pet', size: 'm', visible: true },
  { id: 'reminders', size: 'm', visible: true },
  { id: 'birthdays', size: 's', visible: true },
]

// Merge a stored layout with the defaults so new blocks always appear and any
// unknown/removed ids are dropped. Returns a full, ordered list.
export function normalizeHubLayout(stored) {
  if (!Array.isArray(stored) || !stored.length) return DEFAULT_HUB_LAYOUT
  const known = new Set(Object.keys(HUB_BLOCK_LABELS))
  const seen = new Set()
  const out = []
  for (const b of stored) {
    if (!b || !known.has(b.id) || seen.has(b.id)) continue
    seen.add(b.id)
    out.push({ id: b.id, size: ['s', 'm', 'l'].includes(b.size) ? b.size : 'm', visible: b.visible !== false })
  }
  // Append any block missing from the stored layout (e.g. a newly added feature).
  for (const d of DEFAULT_HUB_LAYOUT) if (!seen.has(d.id)) out.push({ ...d })
  return out
}

// Heights (px) for a block at a given size, within the 1080x1920 wall.
export function blockHeight(id, size) {
  if (id === 'photo') return size === 'l' ? 320 : size === 'm' ? 260 : 200
  if (id === 'calendar') return size === 'l' ? 430 : size === 'm' ? 340 : 250
  return undefined // content-sized (cards grow to fit)
}
