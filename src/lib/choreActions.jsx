import { useState } from 'react'
import { C } from '../theme.js'
import { useMembers } from './members.jsx'
import { todayISO } from './db.js'
import { toggleChore, isEachChore } from './chores.js'
import { checkPin } from './pin.js'

// Ticking and un-ticking chores, with protection against "undo someone
// else's chore and tick it for my own stars".
//
// - A tap only ticks. A done chore is undone with a press and hold.
// - Who may undo:
//     on a phone: the person who did it, or a parent (admin);
//     on the wall: the person who did it, on their own page (or the hub's
//       Anyone row for wall ticks), within UNDO_GRACE of ticking it (to fix
//       a mis-tap). Anything else needs the parent PIN (Settings).
//
// Usage:
//   const actions = useChoreActions({ logs, pageKey, onWall })
//   tap: actions.tick(chore, done, who)   hold: actions.askUndo(chore, done, who)
//   render {actions.ui} once in the component.

const UNDO_GRACE_MS = 5 * 60 * 1000

function findLog(logs, chore, iso, who) {
  return logs.find((l) => l.chore_id === chore.id && l.log_date === iso && (!isEachChore(chore) || l.member_key === who))
}

export function useChoreActions({ logs, pageKey = null, onWall = false, scale = 1 }) {
  const { me, isAdmin, nameFor, familyId, parentPinHash } = useMembers()
  const [pending, setPending] = useState(null) // { chore, who, by, needsPin, blocked }
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const T = todayISO()

  const tick = (chore, done, who) => {
    if (!done) toggleChore(chore, T, false, who)
  }

  const askUndo = (chore, done, who) => {
    if (!done) return
    const log = findLog(logs, chore, T, who)
    const by = log ? log.member_key ?? null : null
    const recent = log?.created_at ? Date.now() - new Date(log.created_at).getTime() < UNDO_GRACE_MS : false
    let allowed
    if (onWall) allowed = recent && by === (pageKey ?? null)
    else allowed = isAdmin || (me && by === me.key)
    const needsPin = !allowed && onWall && !!parentPinHash
    const blocked = !allowed && !needsPin
    setPin('')
    setError('')
    setPending({ chore, who, by, needsPin, blocked })
  }

  const close = () => setPending(null)
  const doUndo = async () => {
    const { chore, who } = pending
    if (pending.needsPin) {
      if (!(await checkPin(familyId, pin, parentPinHash))) {
        setError('Wrong PIN')
        setPin('')
        return
      }
    }
    close()
    await toggleChore(chore, T, true, who)
  }

  const f = (n) => n * scale
  const byName = pending ? (pending.by ? nameFor(pending.by) : 'the wall') : ''
  const ui = pending ? (
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130, padding: 24 }}>
      <div role="alertdialog" aria-label="Undo chore" onClick={(e) => e.stopPropagation()} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: f(20), padding: f(20), width: `min(${f(380)}px, 100%)`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: f(14) }}>
        <div style={{ fontSize: f(18), fontWeight: 800 }}>Undo “{pending.chore.title}”?</div>
        <div style={{ fontSize: f(14), color: C.muted }}>
          Done by {byName}.
          {pending.blocked && (onWall
            ? ' Only they can undo it, right after ticking it. A parent can set a PIN in Settings to allow undoing here.'
            : ` Only ${byName === 'the wall' ? 'a parent' : `${byName} or a parent`} can undo it.`)}
          {pending.needsPin && ' A parent PIN is needed to undo it here.'}
        </div>
        {pending.needsPin && (
          <>
            <div aria-live="polite" style={{ textAlign: 'center', fontSize: f(26), letterSpacing: f(8), minHeight: f(32) }}>{pin.replace(/./g, '•') || ' '}</div>
            {error && <div style={{ textAlign: 'center', color: C.danger, fontSize: f(14), fontWeight: 700 }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: f(8) }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
                k === '' ? <span key={i} /> : (
                  <button key={i} type="button" onClick={() => setPin((p) => (k === '⌫' ? p.slice(0, -1) : p.length < 6 ? p + k : p))} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', padding: `${f(12)}px 0`, borderRadius: f(12), background: C.cream, fontSize: f(20), fontWeight: 700 }}>{k}</button>
                )
              ))}
            </div>
          </>
        )}
        <div style={{ display: 'flex', gap: f(10), justifyContent: 'flex-end' }}>
          <button type="button" onClick={close} style={{ all: 'unset', cursor: 'pointer', padding: `${f(10)}px ${f(16)}px`, borderRadius: f(12), border: `2px solid ${C.border}`, fontSize: f(15), fontWeight: 700 }}>{pending.blocked ? 'OK' : 'Cancel'}</button>
          {!pending.blocked && (
            <button type="button" disabled={pending.needsPin && pin.length < 4} onClick={doUndo} style={{ all: 'unset', cursor: 'pointer', padding: `${f(10)}px ${f(16)}px`, borderRadius: f(12), background: '#B4532A', color: '#FFFFFF', fontSize: f(15), fontWeight: 700, opacity: pending.needsPin && pin.length < 4 ? 0.5 : 1 }}>Undo</button>
          )}
        </div>
      </div>
    </div>
  ) : null

  return { tick, askUndo, ui }
}
