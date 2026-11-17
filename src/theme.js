// Shared palette + tiny style helpers. Keeps component inline styles (which
// mirror the approved mockups closely) readable and consistent.

export const C = {
  cream: '#FBF5EC',
  card: '#FFFFFF',
  border: '#EFE3D2',
  ink: '#2B2420',
  muted: '#6E625A',
  track: '#F3EADC',
  tealTint: '#E3EFEE',
  tealText: '#2F605E',
  lightOn: '#FFF4DD',
  toggleOff: '#D8CDBE',
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
