import { normalizeLayout, GENERIC_HEIGHT } from './hubLayout.js'

// The windows on a person's wall page, arranged like the hub (same sizes,
// widths, combined windows). Stored per person in members.page_layout; null
// means the default for their role, which matches the original fixed pages.

export const PERSON_BLOCK_LABELS = {
  header: 'Name, Date and Clock',
  calendar: 'Calendar',
  chores: 'Chores (list)',
  jobs: 'Jobs (big tiles and stars)',
  reminders: 'Reminders',
  birthday: 'Birthday Countdown',
  widget: 'Widget (weather, countdown, note…)',
  photo: 'Photos',
}

const ALL = ['header', 'calendar', 'chores', 'jobs', 'reminders', 'birthday', 'widget', 'photo']

// role -> visible windows in order, with sizes (others are added hidden).
const ROLE_DEFAULTS = {
  child: [
    { id: 'header', size: 's', width: 'full' },
    { id: 'calendar', size: 'l', width: 'full' },
    { id: 'jobs', size: 'xl', width: 'full' },
    { id: 'reminders', size: 'l', width: 'half' },
    { id: 'birthday', size: 'l', width: 'half' },
  ],
  teen: [
    { id: 'header', size: 's', width: 'full' },
    { id: 'calendar', size: 'xl', width: 'full' },
    { id: 'chores', size: 'l', width: 'half' },
    { id: 'reminders', size: 'l', width: 'half' },
    { id: 'birthday', size: 'l', width: 'half' },
    { id: 'photo', size: 'l', width: 'half' },
  ],
  parent: [
    { id: 'header', size: 's', width: 'full' },
    { id: 'calendar', size: 'xl', width: 'full' },
    { id: 'chores', size: 'l', width: 'half' },
    { id: 'reminders', size: 'l', width: 'half' },
    { id: 'widget', size: 's', width: 'full' },
    { id: 'photo', size: 'm', width: 'full' },
  ],
}

export function personDefaults(role) {
  const shown = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.parent
  const ids = new Set(shown.map((b) => b.id))
  return [
    ...shown.map((b) => ({ ...b, visible: true, ...(b.id === 'photo' ? { fit: 'cover' } : {}) })),
    ...ALL.filter((id) => !ids.has(id)).map((id) => ({ id, size: 'l', width: 'half', visible: false })),
  ]
}

export function normalizePersonLayout(stored, role) {
  return normalizeLayout(stored, { labels: PERSON_BLOCK_LABELS, defaults: personDefaults(role) })
}

// One height per size for every window, the same as the hub (see hubLayout.js).
export function personApproxHeight(id, size) {
  return GENERIC_HEIGHT[size] ?? 280
}
export const personBlockHeight = personApproxHeight
