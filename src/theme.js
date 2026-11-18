// Shared palette + tiny style helpers. Keeps component inline styles (which
// mirror the approved mockups closely) readable and consistent.
//
// Surface colours (page, cards, text, tints) are CSS variables so the light and
// dark themes swap in index.css without touching components. Accent and member
// colours stay fixed hex values: they are saved to the database, fed to colour
// inputs, and always sit behind white text, so they read the same in both
// themes.

export const C = {
  // Surfaces (themed; see index.css)
  cream: 'var(--cream)',
  card: 'var(--card)',
  border: 'var(--border)',
  ink: 'var(--ink)',
  muted: 'var(--muted)',
  track: 'var(--track)',
  tealTint: 'var(--teal-tint)',
  tealText: 'var(--teal-text)',
  lightOn: 'var(--light-on)',
  toggleOff: 'var(--toggle-off)',
  danger: 'var(--danger)',
  dangerTint: 'var(--danger-tint)',
  family: 'var(--family)', // "Family" chip / nav background (white text on it)
  // Member accent palette (assigned to people from the database, not here).
  violet: '#7B4B8A',
  rust: '#B4532A',
  green: '#4F7A5A',
  blue: '#2F6A9E',
  meals: '#3E7C7A',
  home: '#8A6A2E',
  starFill: '#D9A441',
  starStroke: '#8A6A2E',
}

// Fixed colours offered when picking a person's or a calendar's colour. All
// dark enough for white text (4.5:1+) and readable on the dark theme too.
// A custom colour is still available beside these.
export const MEMBER_PALETTE = [
  C.violet, C.rust, C.green, C.blue, C.meals, C.home,
  '#A63D6B', // raspberry
  '#4A4FA3', // indigo
  '#8E2F3C', // burgundy
  '#2F6B4F', // forest
  '#B05A12', // pumpkin
  '#5B6B2A', // olive
  '#2C5C7A', // ocean
  '#6B4A9E', // grape
  '#7A5230', // walnut
  '#4E5D6C', // slate
]
// The "Family" calendar colour as stored in the database (a real hex value).
export const FAMILY_COLOR = '#2B2420'

// White card with the warm border, used everywhere on the wall and phone.
export const card = (extra = {}) => ({
  background: C.card,
  borderRadius: 28,
  border: `2px solid ${C.border}`,
  boxSizing: 'border-box',
  ...extra,
})

export const resetButton = {
  all: 'unset',
  cursor: 'pointer',
}
