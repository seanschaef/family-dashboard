import { useState } from 'react'
import { C, card } from '../theme.js'
import Icon from '../components/Icon.jsx'
import Hold from '../components/Hold.jsx'
import { LiveCheck } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { todayISO } from '../lib/db.js'
import { dueChores, isDone, assigneesOf, doneByText } from '../lib/chores.js'
import { useChoreActions } from '../lib/choreActions.jsx'

// The pet's window on the hub: today's chores tagged 'pet' (walks, meals...).
// They're ordinary chores, so ticking one here is the same tick as on anyone's
// list, earns its points, and shows "Done by ...". The hub is shared, so a
// tick asks who did it (unless only one person is assigned).
export default function PetBlock({ chores, logs }) {
  const { members, petName, nameFor } = useMembers()
  const T = todayISO()
  const actions = useChoreActions({ logs, pageKey: null, onWall: true, scale: 2 })
  const [asking, setAsking] = useState(null) // chore waiting for "who did it?"
  const list = dueChores(chores, logs, null, T)
    .filter((c) => c.tag === 'pet')
    .sort((a, b) => a.title.localeCompare(b.title))

  const tap = (c) => {
    if (isDone(logs, c, T)) return
    const keys = assigneesOf(c)
    if (keys.length === 1) actions.tick(c, false, keys[0])
    else setAsking(c)
  }

  return (
    <div style={card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' })}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Icon name="paw" size={32} color={C.ink} />
        <div style={{ fontSize: 26, fontWeight: 800 }}>{petName || 'Pet'}</div>
      </div>
      {list.length ? (
        list.map((c) => {
          const done = isDone(logs, c, T)
          return (
            <Hold key={c.id} onHold={() => actions.askUndo(c, done)}>
              <LiveCheck
                label={c.title}
                sub={doneByText(logs, c, T, nameFor) || (c.points ? `${c.points} pts` : undefined)}
                done={done}
                color={C.home}
                size={40}
                fontSize={21}
                onToggle={() => tap(c)}
              />
            </Hold>
          )
        })
      ) : (
        <div style={{ fontSize: 20, color: C.muted }}>No {petName || 'pet'} chores today. Add some on the phone: Chores › tag as Pet.</div>
      )}
      {actions.ui}

      {asking && (
        <div onClick={() => setAsking(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130, padding: 40 }}>
          <div role="dialog" aria-label="Who did it?" onClick={(e) => e.stopPropagation()} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 32, padding: 36, width: 'min(760px, 92%)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>Who did “{asking.title}”?</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {(assigneesOf(asking).length ? members.filter((m) => assigneesOf(asking).includes(m.key)) : members).map((m) => (
                <button key={m.key} type="button" onClick={() => { const c = asking; setAsking(null); actions.tick(c, false, m.key) }} style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 110, height: 110, borderRadius: 55, background: m.color, color: '#FFFFFF', fontSize: 52, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(m.name[0] || '?').toUpperCase()}</span>
                  <span style={{ fontSize: 24, fontWeight: 700 }}>{m.name}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAsking(null)} style={{ all: 'unset', cursor: 'pointer', alignSelf: 'center', fontSize: 22, fontWeight: 700, color: C.muted, padding: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
