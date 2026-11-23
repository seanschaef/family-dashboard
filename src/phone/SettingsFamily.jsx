import { useEffect, useState } from 'react'
import { C } from '../theme.js'
import { useMembers } from '../lib/members.jsx'
import { hashPin } from '../lib/pin.js'
import { PageHeader, Section, SaveToast, useSaved, textInput } from './ui.jsx'

// Settings › Family › Family Details: the family name (hub greeting), the
// pet's name, and the parent PIN the wall asks for to undo someone's chore.
const input = textInput
const label = { fontSize: 13, fontWeight: 700, color: C.muted }

// Admins set a parent PIN. The wall asks for it to undo a chore that someone
// else completed (so kids can't un-tick a parent's chore and claim the stars).
function ParentPin({ familyId, hasPin, onSave }) {
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState('')
  const valid = /^\d{4,6}$/.test(pin)
  return (
    <Section title="Parent PIN">
      <div style={{ fontSize: 13, color: C.muted }}>
        The wall asks for it to undo a chore someone else completed. {hasPin ? 'A PIN is set.' : 'No PIN yet: until there is one, only the person who did a chore can undo it, right after ticking it.'}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input aria-label="New parent PIN" type="password" inputMode="numeric" autoComplete="new-password" placeholder="4 to 6 digits" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setMsg('') }} style={{ ...input, width: 'auto', flexGrow: 1 }} />
        <button type="button" disabled={!valid} onClick={async () => { await onSave(await hashPin(familyId, pin)); setPin(''); setMsg('PIN saved') }} style={{ all: 'unset', cursor: valid ? 'pointer' : 'default', background: C.meals, color: '#FFF', borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 700, opacity: valid ? 1 : 0.5 }}>{hasPin ? 'Change' : 'Set'}</button>
      </div>
      {hasPin && <button type="button" onClick={async () => { await onSave(null); setMsg('PIN removed') }} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.danger, alignSelf: 'flex-start' }}>Remove PIN</button>}
      {msg && <div style={{ fontSize: 13, color: C.tealText }}>{msg}</div>}
    </Section>
  )
}

export default function SettingsFamily() {
  const { familyName, familyId, petName, isAdmin, updateFamily, parentPinHash } = useMembers()
  const [fam, setFam] = useState(familyName)
  const [pet, setPet] = useState(petName)
  const { savedAt, flash } = useSaved()
  useEffect(() => setFam(familyName), [familyName])
  useEffect(() => setPet(petName), [petName])
  const save = async (p) => { await updateFamily(p); flash() }
  return (
    <>
      <PageHeader title="Family Details" subtitle="Family name, pet and parent PIN" />
      <SaveToast at={savedAt} />
      <Section title="Names" note={isAdmin ? 'Changes save when you leave the box.' : 'Only a parent can change these.'}>
        <div>
          <div style={label}>Family name</div>
          <input aria-label="Family name" value={fam} disabled={!isAdmin} onChange={(e) => setFam(e.target.value)} onBlur={() => fam.trim() && fam !== familyName && save({ name: fam.trim() })} style={{ ...input, marginTop: 6, opacity: isAdmin ? 1 : 0.6 }} />
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Shown in the hub greeting: “Good morning, {fam || 'family'}!”</div>
        </div>
        <div>
          <div style={label}>Pet name</div>
          <input aria-label="Pet name" value={pet} disabled={!isAdmin} onChange={(e) => setPet(e.target.value)} onBlur={() => pet !== petName && save({ pet_name: pet.trim() })} style={{ ...input, marginTop: 6, opacity: isAdmin ? 1 : 0.6 }} />
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Names the pet window and pet chores.</div>
        </div>
      </Section>
      {isAdmin && <ParentPin familyId={familyId} hasPin={!!parentPinHash} onSave={(h) => save({ parent_pin_hash: h })} />}
    </>
  )
}
