import { useFamilyTable, insertRow, deleteRow } from './db.js'

// Family notes: short messages typed on a phone, shown on the wall's Notes
// window. A note can expire (gone from the wall after that) or stay until
// someone removes it.
export const SAMPLE_NOTES = [
  { id: 'n1', text: 'Practice moved to 6:30 tonight', member_key: 'm3', expires_at: null, created_at: new Date().toISOString() },
]
export const useNotes = () => useFamilyTable('notes', { order: { column: 'created_at', ascending: false }, sample: SAMPLE_NOTES })

// keep: 'day' (until midnight), '3d', 'week', or 'always'.
export function expiryFor(keep, now = new Date()) {
  if (keep === 'always') return null
  const d = new Date(now)
  if (keep === 'day') {
    d.setHours(23, 59, 59, 0)
    return d.toISOString()
  }
  d.setDate(d.getDate() + (keep === '3d' ? 3 : 7))
  return d.toISOString()
}
export const addNote = ({ text, member_key, keep }) =>
  insertRow('notes', { text: String(text).trim().slice(0, 280), member_key: member_key || null, expires_at: expiryFor(keep) })
export const removeNote = (id) => deleteRow('notes', id)

export const liveNotes = (rows, now = new Date()) => rows.filter((n) => !n.expires_at || new Date(n.expires_at) > now)

// "5 min ago", "3 h ago", "Tue"
export function noteAge(iso, now = new Date()) {
  const mins = Math.round((now - new Date(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h} h ago`
  return new Date(iso).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
}
