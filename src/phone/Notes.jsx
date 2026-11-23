import { useState } from 'react'
import { C } from '../theme.js'
import { PageHeader } from './ui.jsx'
import { useMembers } from '../lib/members.jsx'
import { useNow } from '../lib/time.js'
import { useNotes, addNote, removeNote, liveNotes, noteAge } from '../lib/notes.js'

// Family notes: type a short message here and it shows on the wall's Notes
// window (Arrange › + Family notes) until it expires or someone removes it.
const KEEP = [
  { v: 'day', label: 'Today' },
  { v: '3d', label: '3 days' },
  { v: 'week', label: 'A week' },
  { v: 'always', label: 'Until removed' },
]

export default function Notes() {
  const { me, byKey } = useMembers()
  const { rows } = useNotes()
  const now = useNow(60000)
  const [text, setText] = useState('')
  const [keep, setKeep] = useState('3d')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const notes = liveNotes(rows, now)
  const old = rows.filter((n) => !notes.includes(n))

  async function post(e) {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      await addNote({ text, member_key: me?.key, keep })
      setText('')
    } catch {
      setError('Couldn’t post that. Try again.')
    }
    setBusy(false)
  }

  const row = (n, faded) => {
    const who = byKey(n.member_key)
    const until = n.expires_at
      ? `${faded ? 'expired' : 'until'} ${new Date(n.expires_at).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}`
      : 'until removed'
    return (
      <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12, opacity: faded ? 0.55 : 1 }}>
        <div style={{ width: 5, alignSelf: 'stretch', borderRadius: 3, background: who?.color || C.muted }} />
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, overflowWrap: 'anywhere' }}>{n.text}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{[who?.name, noteAge(n.created_at, now), until].filter(Boolean).join(' · ')}</div>
        </div>
        <button type="button" onClick={() => removeNote(n.id)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.danger }}>Remove</button>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Family Notes" subtitle="Short messages for the wall" backTo="/app/today" backLabel="Back" />
      <form onSubmit={post} style={{ display: 'flex', flexDirection: 'column', gap: 10, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 14 }}>
        <textarea aria-label="Note" value={text} maxLength={280} rows={3} placeholder="e.g. Practice moved to 6:30 tonight" onChange={(e) => setText(e.target.value)} style={{ font: 'inherit', fontSize: 16, padding: 10, borderRadius: 10, border: `2px solid ${C.border}`, background: C.cream, color: C.ink, resize: 'vertical' }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Show on the wall for</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {KEEP.map((k) => (
            <button key={k.v} type="button" aria-pressed={keep === k.v} onClick={() => setKeep(k.v)} style={{ all: 'unset', cursor: 'pointer', padding: '6px 12px', borderRadius: 999, fontSize: 14, fontWeight: 700, background: keep === k.v ? C.meals : C.cream, color: keep === k.v ? '#FFFFFF' : C.ink, border: `2px solid ${keep === k.v ? C.meals : C.border}` }}>
              {k.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" disabled={!text.trim() || busy} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 12, padding: '10px 20px', fontSize: 15, fontWeight: 700, opacity: text.trim() ? 1 : 0.5 }}>
            Post to the wall
          </button>
          <span style={{ fontSize: 12, color: C.muted }}>{280 - text.length} left</span>
          {error && <span style={{ fontSize: 13, color: C.danger }}>{error}</span>}
        </div>
      </form>
      {notes.length === 0 && <div style={{ fontSize: 14, color: C.muted }}>No notes on the wall right now.</div>}
      {notes.map((n) => row(n, false))}
      {old.length > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, paddingTop: 6 }}>Expired (not on the wall)</div>}
      {old.slice(0, 10).map((n) => row(n, true))}
      <div style={{ fontSize: 12, color: C.muted }}>To show notes on the wall, add the Family notes window in Settings › Arrange the wall.</div>
    </>
  )
}
