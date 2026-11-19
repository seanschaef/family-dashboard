import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import { checkPin } from '../lib/pin.js'
import {
  useChoreLogs, pointsThisWeek, pointsBalance, useRewards, addReward, removeReward,
  useRedemptions, redeemReward, undoRedemption,
} from '../lib/chores.js'

// Points and rewards. Everyone (parents included) has a running balance:
// every point earned minus rewards redeemed. Redeeming needs a parent: a
// parent's own login approves it directly, anyone else enters the parent PIN.
// Only parents add or remove rewards and undo a redemption.

const btn = (bg = C.meals) => ({ all: 'unset', cursor: 'pointer', background: bg, color: '#FFFFFF', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, textAlign: 'center' })

function RedeemSheet({ reward, members, balanceOf, onClose }) {
  const { me, isAdmin, familyId, parentPinHash } = useMembers()
  const [who, setWho] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const person = members.find((m) => m.key === who)
  const enough = person ? balanceOf(person.key) >= (reward.cost || 0) : false

  async function confirm() {
    setError('')
    let approvedBy = null
    if (isAdmin) approvedBy = me?.key || null
    else if (parentPinHash && (await checkPin(familyId, pin, parentPinHash))) approvedBy = 'pin'
    else {
      setError(parentPinHash ? 'Wrong parent PIN' : 'A parent needs to approve this (or set a parent PIN in Settings).')
      setPin('')
      return
    }
    setBusy(true)
    try {
      await redeemReward({ member_key: who, reward, approved_by: approvedBy })
      onClose(`${person.name} redeemed ${reward.title}`)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div onClick={() => onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 120 }}>
      <div role="dialog" aria-label={`Redeem ${reward.title}`} onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: '20px 20px 0 0', padding: 20, width: '100%', maxWidth: 560, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Redeem “{reward.title}” · {reward.cost} pts</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Who is spending their points?</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {members.map((m) => {
            const bal = balanceOf(m.key)
            const ok = bal >= (reward.cost || 0)
            const active = who === m.key
            return (
              <button key={m.key} type="button" disabled={!ok} aria-pressed={active} onClick={() => setWho(m.key)} style={{ all: 'unset', cursor: ok ? 'pointer' : 'default', opacity: ok ? 1 : 0.4, background: active ? m.color : C.card, color: active ? '#FFFFFF' : C.ink, border: `2px solid ${active ? m.color : C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 14, fontWeight: 700 }}>
                {m.name} · {bal}
              </button>
            )
          })}
        </div>
        {person && (
          <div style={{ fontSize: 14 }}>
            {person.name}: {balanceOf(person.key)} → <b>{balanceOf(person.key) - (reward.cost || 0)}</b> pts
          </div>
        )}
        {person && !isAdmin && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Parent PIN to approve</div>
            <input aria-label="Parent PIN" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ font: 'inherit', fontSize: 18, letterSpacing: 6, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: 140 }} />
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: C.danger, fontWeight: 700 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => onClose()} style={{ all: 'unset', cursor: 'pointer', padding: '10px 16px', borderRadius: 10, border: `2px solid ${C.border}`, fontSize: 14, fontWeight: 700 }}>Cancel</button>
          <button type="button" disabled={!person || !enough || busy || (!isAdmin && pin.length < 4)} onClick={confirm} style={{ ...btn(), opacity: !person || !enough || busy || (!isAdmin && pin.length < 4) ? 0.5 : 1 }}>
            {isAdmin ? 'Approve' : 'Redeem'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Rewards() {
  const { configured } = useAuth()
  const { members, nameFor, isAdmin } = useMembers()
  const { rows: logs } = useChoreLogs()
  const { rows: rewards } = useRewards()
  const { rows: redemptions } = useRedemptions()
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('')
  const [redeeming, setRedeeming] = useState(null)
  const [msg, setMsg] = useState('')

  const balanceOf = (key) => pointsBalance(logs, redemptions, key)

  async function add(e) {
    e.preventDefault()
    if (!title.trim()) return
    await addReward({ title: title.trim(), cost: Math.max(0, Number(cost) || 0) })
    setTitle('')
    setCost('')
  }

  return (
    <>
      <PhoneHeader title="Rewards & points" subtitle="Earn points with chores, spend them on rewards" />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {members.map((m) => (
          <div key={m.key} style={{ flex: 1, minWidth: 130, background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 13, background: m.color, color: '#FFFFFF', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(m.name[0] || '?').toUpperCase()}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{m.name}</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: m.color }}>{balanceOf(m.key)}</div>
            <div style={{ fontSize: 13, color: C.muted }}>points to spend · {pointsThisWeek(logs, m.key)} this week</div>
          </div>
        ))}
      </div>

      {msg && <div role="status" style={{ background: C.tealTint, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 700 }}>{msg}</div>}

      <div style={{ fontSize: 18, fontWeight: 800, paddingTop: 4 }}>Rewards</div>
      {rewards.length === 0 && <div style={{ fontSize: 14, color: C.muted }}>No rewards yet.{isAdmin ? ' Add one below.' : ' A parent can add some.'}</div>}
      {rewards.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12 }}>
          <div style={{ flexGrow: 1, fontSize: 16, fontWeight: 600 }}>{r.title}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.meals }}>{r.cost} pts</div>
          <button type="button" disabled={!configured} onClick={() => { setMsg(''); setRedeeming(r) }} style={btn()}>Redeem</button>
          {isAdmin && <button type="button" onClick={() => { if (window.confirm(`Remove the reward “${r.title}”?`)) removeReward(r.id) }} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.danger }}>Delete</button>}
        </div>
      ))}

      {isAdmin && (
        <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input aria-label="Reward" placeholder="New reward" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flexGrow: 1, minWidth: 0, font: 'inherit', fontSize: 15, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink }} />
          <input aria-label="Cost" type="number" inputMode="numeric" min="0" placeholder="pts" value={cost} onChange={(e) => setCost(e.target.value)} style={{ width: 70, font: 'inherit', fontSize: 15, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink }} />
          <button type="submit" disabled={!configured} style={{ ...btn(), opacity: configured ? 1 : 0.6 }}>Add</button>
        </form>
      )}

      <div style={{ fontSize: 18, fontWeight: 800, paddingTop: 8 }}>Spent</div>
      {redemptions.length === 0 ? (
        <div style={{ fontSize: 14, color: C.muted }}>Nothing redeemed yet.</div>
      ) : (
        redemptions.slice(0, 25).map((x) => (
          <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, padding: '6px 2px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ flexGrow: 1 }}>
              <b>{nameFor(x.member_key)}</b> · {x.title}
              <div style={{ fontSize: 12, color: C.muted }}>
                {new Date(x.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                {x.approved_by ? ` · approved by ${x.approved_by === 'pin' ? 'parent PIN' : nameFor(x.approved_by)}` : ''}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: C.danger }}>−{x.cost}</div>
            {isAdmin && <button type="button" onClick={() => { if (window.confirm(`Undo ${nameFor(x.member_key)}'s “${x.title}”? The ${x.cost} points go back.`)) undoRedemption(x.id) }} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.tealText }}>Undo</button>}
          </div>
        ))
      )}

      {redeeming && <RedeemSheet reward={redeeming} members={members} balanceOf={balanceOf} onClose={(m) => { setRedeeming(null); if (m) setMsg(m) }} />}
    </>
  )
}
