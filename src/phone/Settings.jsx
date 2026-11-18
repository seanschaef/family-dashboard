import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C, MEMBER_PALETTE } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import { useTheme } from '../lib/theme.jsx'

const PALETTE = MEMBER_PALETTE
const ROLES = [
  { label: 'Parent', value: 'parent' },
  { label: 'Teen', value: 'teen' },
  { label: 'Child', value: 'child' },
]
const input = { font: 'inherit', fontSize: 16, padding: '10px 12px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }
const card = { background: C.card, border: `2px solid ${C.border}`, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }
const label = { fontSize: 13, fontWeight: 700, color: C.muted }

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '7px 13px', fontSize: 14, fontWeight: 600 }}>
      {children}
    </button>
  )
}

function MemberRow({ m, canEdit, isAdmin, onPatch, onRemove }) {
  const [name, setName] = useState(m.name)
  useEffect(() => setName(m.name), [m.name])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 15, background: m.color, color: '#FFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{(name[0] || '?').toUpperCase()}</span>
        <input aria-label="Name" value={name} disabled={!canEdit} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name !== m.name && onPatch({ name: name.trim() })} style={{ ...input, opacity: canEdit ? 1 : 0.6 }} />
        {isAdmin && (
          <button type="button" onClick={onRemove} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.danger, flexShrink: 0 }}>Remove</button>
        )}
      </div>
      {canEdit && (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {PALETTE.map((col) => (
              <button key={col} type="button" aria-label={`colour ${col}`} onClick={() => onPatch({ color: col })} style={{ all: 'unset', cursor: 'pointer', width: 26, height: 26, borderRadius: 13, background: col, boxShadow: m.color === col ? `0 0 0 3px ${C.cream}, 0 0 0 5px ${col}` : 'none' }} />
            ))}
            <label style={{ cursor: 'pointer', width: 26, height: 26, borderRadius: 13, border: `2px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }} title="Custom colour">
              <span aria-hidden="true" style={{ fontSize: 16, color: C.muted, lineHeight: 1 }}>+</span>
              <input type="color" aria-label="Custom colour" value={m.color || '#7B4B8A'} onChange={(e) => onPatch({ color: e.target.value })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </label>
            {!PALETTE.includes(m.color) && <span style={{ width: 26, height: 26, borderRadius: 13, background: m.color, boxShadow: `0 0 0 3px ${C.cream}, 0 0 0 5px ${m.color}` }} />}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROLES.map((r) => (
              <Chip key={r.value} active={m.role === r.value} color={m.color} onClick={() => onPatch({ role: r.value })}>{r.label}</Chip>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={label}>Birthday</span>
            <input type="date" aria-label="Birthday" value={m.birthday || ''} onChange={(e) => onPatch({ birthday: e.target.value || null })} style={{ ...input, width: 'auto' }} />
          </div>
        </>
      )}
    </div>
  )
}

function SaveToast({ at }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!at) return undefined
    setShow(true)
    const t = setTimeout(() => setShow(false), 1800)
    return () => clearTimeout(t)
  }, [at])
  if (!show) return null
  return (
    <div style={{ position: 'sticky', top: 0, alignSelf: 'center', background: C.tealText, color: '#FFFFFF', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 700, zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>Saved ✓</div>
  )
}

export default function Settings() {
  const { user, signOut, configured } = useAuth()
  const { members, familyName, petName, me, setMe, isAdmin, updateFamily, addMember, updateMember, removeMember } = useMembers()
  const [fam, setFam] = useState(familyName)
  const [pet, setPet] = useState(petName)
  const [savedAt, setSavedAt] = useState(0)
  useEffect(() => setFam(familyName), [familyName])
  useEffect(() => setPet(petName), [petName])

  const flash = () => setSavedAt(Date.now())
  const saveFamily = async (p) => { await updateFamily(p); flash() }
  const saveMember = async (id, p) => { await updateMember(id, p); flash() }
  const canEdit = (m) => isAdmin || m.id === me?.id
  const { pref, setPref } = useTheme()

  return (
    <>
      <PhoneHeader title="Settings" subtitle={isAdmin ? 'You are an admin' : 'Your account'} />
      <SaveToast at={savedAt} />

      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>You</div>
        <div style={label}>Which person are you?</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {members.map((m) => (
            <Chip key={m.id} active={me?.id === m.id} color={m.color} onClick={() => setMe(m.id)}>{m.name}</Chip>
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>{user?.email}</div>
        <button type="button" onClick={signOut} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.tealText }}>Sign out</button>
      </div>

      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Appearance</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['auto', 'Match device'],
            ['light', 'Light'],
            ['dark', 'Dark'],
          ].map(([v, l]) => (
            <Chip key={v} active={pref === v} onClick={() => setPref(v)}>{l}</Chip>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>Just this device. The wall has its own night-time schedule under Wall display.</div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Important dates</div>
        <Link to="/app/dates" style={{ fontSize: 15, fontWeight: 700, color: C.tealText }}>Birthdays, anniversaries and other dates ›</Link>
        <div style={{ fontSize: 12, color: C.muted }}>Counted down on the hub with the family&apos;s birthdays.</div>
      </div>

      {isAdmin && (
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Accounts</div>
          <Link to="/app/accounts" style={{ fontSize: 15, fontWeight: 700, color: C.tealText }}>Manage logins ›</Link>
          <div style={{ fontSize: 12, color: C.muted }}>Create logins, reset passwords, link a login to a person, make someone an admin.</div>
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Family</div>
        {!isAdmin && <div style={{ fontSize: 13, color: C.muted }}>Only an admin can change these.</div>}
        <div>
          <div style={label}>Family name</div>
          <input aria-label="Family name" value={fam} disabled={!isAdmin} onChange={(e) => setFam(e.target.value)} onBlur={() => fam.trim() && fam !== familyName && saveFamily({ name: fam.trim() })} style={{ ...input, opacity: isAdmin ? 1 : 0.6 }} />
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Shown on the hub greeting: “Good morning, {fam || 'family'}!”</div>
        </div>
        <div>
          <div style={label}>Pet name</div>
          <input aria-label="Pet name" value={pet} disabled={!isAdmin} onChange={(e) => setPet(e.target.value)} onBlur={() => pet !== petName && saveFamily({ pet_name: pet.trim() })} style={{ ...input, opacity: isAdmin ? 1 : 0.6 }} />
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>People</div>
          {isAdmin && (
            <button type="button" onClick={async () => { await addMember({ name: 'New person', color: PALETTE[members.length % PALETTE.length], role: 'child' }); flash() }} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.tealText }}>+ Add</button>
          )}
        </div>
        {!isAdmin && <div style={{ fontSize: 13, color: C.muted }}>You can edit your own details. An admin edits everyone.</div>}
        {members.map((m) => (
          <MemberRow key={m.id} m={m} canEdit={canEdit(m)} isAdmin={isAdmin} onPatch={(p) => saveMember(m.id, p)} onRemove={async () => { await removeMember(m.id); flash() }} />
        ))}
      </div>

      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Wall display</div>
        <Link to="/app/wall-preview" style={{ fontSize: 15, fontWeight: 700, color: C.tealText }}>See how the wall looks ›</Link>
        <Link to="/app/arrange" style={{ fontSize: 15, fontWeight: 700, color: C.tealText }}>Arrange the hub windows ›</Link>
        <Link to="/app/wall-display" style={{ fontSize: 15, fontWeight: 700, color: C.tealText }}>Monitor schedule and night colours ›</Link>
      </div>

      {!configured && <div style={{ fontSize: 13, color: C.muted }}>Demo mode: changes are not saved.</div>}
    </>
  )
}
