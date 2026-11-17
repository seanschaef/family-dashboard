import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { formatLongDate, useNow } from '../lib/time.js'
import { useAuth } from '../lib/auth.jsx'
import { PhoneHeader, Pill, PhoneCard, PhoneCheck } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { memberData, petLog, petName } from '../data/sample.js'

function firstName(user) {
  const n = user?.user_metadata?.name
  if (n) return n.split(' ')[0]
  const email = user?.email || ''
  const local = email.split('@')[0]
  if (!local) return 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export default function Today() {
  const now = useNow()
  const { user, signOut } = useAuth()
  const { nameFor } = useMembers()
  const [scope, setScope] = useState('me') // 'me' | 'family'
  const me = memberData.m2 // sample "me" until profiles are linked to members

  return (
    <>
      <PhoneHeader
        title={`Hi ${firstName(user)}`}
        subtitle={formatLongDate(now)}
        action={
          <button type="button" style={addBtn}>
            + Add
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <Pill active={scope === 'me'} color={C.rust} onClick={() => setScope('me')}>
          Me
        </Pill>
        <Pill active={scope === 'family'} color={C.rust} onClick={() => setScope('family')}>
          Family
        </Pill>
      </div>

      <PhoneCard style={{ gap: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Today</div>
        {me.today.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 16 }}>
            <span style={{ color: C.muted, width: 52 }}>{e.time}</span>
            <span>{e.title}</span>
          </div>
        ))}
      </PhoneCard>

      <PhoneCard style={{ gap: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>My chores</div>
        {me.chores.map((c, i) => (
          <PhoneCheck key={i} label={c.label} done={c.done} color={C.rust} />
        ))}
      </PhoneCard>

      <PhoneCard style={{ gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Reminders</div>
          <button type="button" style={linkBtn}>+ Add</button>
        </div>
        {me.reminders.map((r, i) => (
          <PhoneCheck key={i} label={r} color={C.rust} />
        ))}
      </PhoneCard>

      <PhoneCard style={{ gap: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{petName}</div>
        {petLog.map((r) => (
          <PhoneCheck key={r.key} label={r.label} sub={r.byKey ? `${nameFor(r.byKey)} · ${r.at}` : undefined} done={r.done} color={C.home} />
        ))}
      </PhoneCard>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 14, paddingTop: 4 }}>
        <Link to="/app/calendars" style={{ color: C.tealText, fontWeight: 700 }}>
          Calendar links
        </Link>
        <Link to="/app/wall-display" style={{ color: C.tealText, fontWeight: 700 }}>
          Wall display
        </Link>
        <button type="button" onClick={() => signOut()} style={{ ...linkBtn, color: C.muted, marginLeft: 'auto' }}>
          Sign out
        </button>
      </div>
    </>
  )
}

const addBtn = {
  all: 'unset',
  cursor: 'pointer',
  background: C.meals,
  color: '#FFFFFF',
  borderRadius: 999,
  padding: '10px 16px',
  fontSize: 15,
  fontWeight: 700,
}
const linkBtn = { all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: C.tealText }
