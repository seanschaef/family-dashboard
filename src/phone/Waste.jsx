import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { PageHeader } from './ui.jsx'
import { useMembers } from '../lib/members.jsx'
import { streamsOf, upcomingPickups, dayWord } from '../lib/waste.js'

// Garbage and recycling days for the wall's Collection day window. Enter any
// one pickup date you know per stream (from the City's collection calendar or
// the Waste Wise app) and how often it comes; the wall works out the rest.
const EVERY = [
  { v: 1, label: 'Every week' },
  { v: 2, label: 'Every 2 weeks' },
  { v: 4, label: 'Every 4 weeks' },
]

export default function Waste() {
  const { wasteSchedule, updateFamily, isAdmin } = useMembers()
  const [streams, setStreams] = useState(() => streamsOf(wasteSchedule))
  const [saved, setSaved] = useState(false)
  useEffect(() => setStreams(streamsOf(wasteSchedule)), [wasteSchedule])
  const patch = (i, p) => {
    setStreams((s) => s.map((x, k) => (k === i ? { ...x, ...p } : x)))
    setSaved(false)
  }
  const save = async () => {
    await updateFamily({ waste_schedule: { streams } })
    setSaved(true)
  }
  const preview = upcomingPickups({ streams }, new Date(), 3)
  const input = { font: 'inherit', fontSize: 15, padding: '8px 10px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.cream, color: C.ink }

  return (
    <>
      <PageHeader title="Garbage and Recycling" subtitle="Pickup days for the wall" />
      <div style={{ fontSize: 13, color: C.muted }}>
        For each one, enter any pickup date you know (from the City&apos;s collection calendar or the Waste Wise app) and how often it comes. Nothing is looked up online.
      </div>
      {!isAdmin && <div style={{ fontSize: 13, color: C.muted }}>Only an admin can change these.</div>}
      {streams.map((s, i) => (
        <div key={s.name} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, opacity: s.on ? 1 : 0.6 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800 }}>
            <input type="checkbox" checked={s.on} disabled={!isAdmin} onChange={(e) => patch(i, { on: e.target.checked })} />
            {s.name}
          </label>
          {s.on && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="date" aria-label={`${s.name} pickup date`} value={s.next || ''} disabled={!isAdmin} onChange={(e) => patch(i, { next: e.target.value || null })} style={input} />
              <select aria-label={`${s.name} how often`} value={s.every} disabled={!isAdmin} onChange={(e) => patch(i, { every: Number(e.target.value) })} style={input}>
                {EVERY.map((x) => (
                  <option key={x.v} value={x.v}>{x.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
      {preview.length > 0 && (
        <div style={{ fontSize: 14 }}>
          <b>Coming up:</b> {preview.map((d) => `${dayWord(d.date)}: ${d.names.join(' + ')}`).join(' · ')}
        </div>
      )}
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={save} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 12, padding: '10px 20px', fontSize: 15, fontWeight: 700 }}>Save</button>
          {saved && <span style={{ fontSize: 14, color: C.tealText }}>Saved</span>}
        </div>
      )}
      <div style={{ fontSize: 12, color: C.muted }}>Show it on the wall with the Garbage and recycling window in Settings › Arrange the wall.</div>
    </>
  )
}
