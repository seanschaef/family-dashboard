import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import { useChoreLogs, pointsThisWeek, useRewards, addReward, removeReward } from '../lib/chores.js'

export default function Rewards() {
  const { configured } = useAuth()
  const { members } = useMembers()
  const { rows: logs } = useChoreLogs()
  const { rows: rewards } = useRewards()
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('')

  const kids = members.filter((m) => m.role === 'teen' || m.role === 'child')

  async function add(e) {
    e.preventDefault()
    if (!title.trim()) return
    await addReward({ title: title.trim(), cost: Number(cost) || 0 })
    setTitle('')
    setCost('')
  }

  return (
    <>
      <PhoneHeader title="Rewards & points" subtitle="Points earned this week" />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {kids.map((m) => (
          <div key={m.key} style={{ flex: 1, minWidth: 130, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 13, background: m.color, color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(m.name[0] || '?').toUpperCase()}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{m.name}</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: m.color }}>{pointsThisWeek(logs, m.key)}</div>
            <div style={{ fontSize: 13, color: C.muted }}>points this week</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 18, fontWeight: 800, paddingTop: 4 }}>Rewards</div>
      {rewards.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12 }}>
          <div style={{ flexGrow: 1, fontSize: 16, fontWeight: 600 }}>{r.title}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.meals }}>{r.cost} pts</div>
          <button type="button" onClick={() => removeReward(r.id)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.danger }}>Delete</button>
        </div>
      ))}

      <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input aria-label="Reward" placeholder="New reward" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flexGrow: 1, minWidth: 0, font: 'inherit', fontSize: 15, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card }} />
        <input aria-label="Cost" type="number" placeholder="pts" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 70, font: 'inherit', fontSize: 15, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card }} />
        <button type="submit" disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', background: C.meals, color: '#FFFFFF', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>Add</button>
      </form>
    </>
  )
}
