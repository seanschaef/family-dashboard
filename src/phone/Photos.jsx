import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader, Pill } from './parts.jsx'

// Photos (step 4). Placeholder grid + add actions. Google Photos uses the
// Picker API (no album auto-sync since Google's 2025 change); direct upload
// resizes to screen size. Wiring arrives in step 4.
export default function Photos() {
  const [filter, setFilter] = useState('all')
  return (
    <>
      <PhoneHeader
        title="Photos"
        subtitle="On the wall: [###] photos"
        action={
          <button type="button" style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 999, padding: '10px 16px', fontSize: 15, fontWeight: 700 }}>
            + Upload
          </button>
        }
      />

      <div style={{ background: C.tealTint, borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Add photos</div>
        <div style={{ fontSize: 14, color: C.muted }}>Pick one or many. Each is resized for the screen automatically.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button type="button" style={{ all: 'unset', cursor: 'pointer', flexGrow: 1, textAlign: 'center', background: C.meals, color: '#FFFFFF', borderRadius: 12, padding: '12px 8px', fontSize: 15, fontWeight: 700 }}>
            From Google Photos
          </button>
          <button type="button" style={{ all: 'unset', cursor: 'pointer', flexGrow: 1, textAlign: 'center', background: C.card, color: C.ink, border: `2px solid ${C.border}`, borderRadius: 12, padding: '12px 8px', fontSize: 15, fontWeight: 700 }}>
            From camera roll
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Pill active={filter === 'all'} onClick={() => setFilter('all')}>All</Pill>
        <Pill active={filter === 'fav'} onClick={() => setFilter('fav')}>Favourites</Pill>
        <Pill active={filter === 'hidden'} onClick={() => setFilter('hidden')}>Hidden</Pill>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: C.border }} />
        ))}
      </div>

      <div style={{ fontSize: 13, color: C.muted }}>Tap a photo to favourite it, hide it from the wall, or delete it.</div>
    </>
  )
}
