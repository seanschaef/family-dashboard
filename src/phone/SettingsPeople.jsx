import { useEffect, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import { squareImage } from '../lib/images.js'
import { C, MEMBER_PALETTE } from '../theme.js'
import { useMembers } from '../lib/members.jsx'
import { PageHeader, Section, ColorField, SaveToast, useSaved, textInput } from './ui.jsx'

// Settings › Family › People: everyone in the family, their photo, colour,
// role, birthday (counted down on the hub) and house (for celebrations).
const ROLES = [
  { label: 'Parent', value: 'parent' },
  { label: 'Teen', value: 'teen' },
  { label: 'Child', value: 'child' },
]
const input = textInput
const label = { fontSize: 13, fontWeight: 700, color: C.muted }

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '7px 13px', fontSize: 14, fontWeight: 600 }}>
      {children}
    </button>
  )
}

// Tap the circle to choose a photo (camera or library); it's cropped square
// and shrunk on the phone before saving. "Remove photo" goes back to the initial.
function PhotoPicker({ m, canEdit, onPatch }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setErr('')
    try {
      await onPatch({ avatar: await squareImage(file) })
    } catch (x) {
      setErr(x.message || 'Couldn’t use that picture.')
    }
    setBusy(false)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      <label style={{ cursor: canEdit ? 'pointer' : 'default', position: 'relative', display: 'block', opacity: busy ? 0.5 : 1 }} title={canEdit ? 'Change photo' : undefined}>
        <Avatar member={m} size={48} />
        {canEdit && <span style={{ position: 'absolute', right: -4, bottom: -4, width: 20, height: 20, borderRadius: 10, background: C.card, border: `2px solid ${C.border}`, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink }}>+</span>}
        {canEdit && <input type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />}
      </label>
      {canEdit && m.avatar && <button type="button" onClick={() => onPatch({ avatar: null })} style={{ all: 'unset', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: C.muted }}>Remove</button>}
      {err && <span style={{ fontSize: 11, color: C.danger, maxWidth: 90 }}>{err}</span>}
    </div>
  )
}

function MemberRow({ m, canEdit, isAdmin, onPatch, onRemove, used }) {
  const [name, setName] = useState(m.name)
  useEffect(() => setName(m.name), [m.name])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <PhotoPicker m={m} canEdit={canEdit} onPatch={onPatch} />
        <input aria-label="Name" value={name} disabled={!canEdit} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name !== m.name && onPatch({ name: name.trim() })} style={{ ...input, opacity: canEdit ? 1 : 0.6 }} />
        {isAdmin && (
          <button type="button" onClick={() => { if (window.confirm(`Remove ${m.name} from the family? Their chores and points history stay.`)) onRemove() }} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.danger, flexShrink: 0 }}>Remove</button>
        )}
      </div>
      {canEdit && (
        <>
          <div>
            <div style={label}>Colour</div>
            <div style={{ marginTop: 6 }}>
              <ColorField value={m.color} used={used} onChange={(color) => color && onPatch({ color })} />
            </div>
          </div>
          <div style={label}>Role</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROLES.map((r) => (
              <Chip key={r.value} active={m.role === r.value} color={m.color} onClick={() => onPatch({ role: r.value })}>{r.label}</Chip>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={label}>Birthday</span>
            <input type="date" aria-label="Birthday" value={m.birthday || ''} onChange={(e) => onPatch({ birthday: e.target.value || null })} style={{ ...input, width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={label}>House</span>
            <select aria-label="House" value={m.house || ''} onChange={(e) => onPatch({ house: e.target.value || null })} style={{ ...input, width: 'auto' }}>
              <option value="">None (uses their name)</option>
              <option value="gryffindor">Gryffindor</option>
              <option value="hufflepuff">Hufflepuff</option>
              <option value="ravenclaw">Ravenclaw</option>
              <option value="slytherin">Slytherin</option>
            </select>
          </div>
        </>
      )}
    </div>
  )
}

export default function SettingsPeople() {
  const { members, me, isAdmin, addMember, updateMember, removeMember } = useMembers()
  const { savedAt, flash } = useSaved()
  const canEdit = (m) => isAdmin || m.id === me?.id
  const used = members.map((m) => m.color)
  return (
    <>
      <PageHeader title="People" subtitle="Names, colours, photos, birthdays and houses" />
      <SaveToast at={savedAt} />
      <Section
        title="Family Members"
        note={isAdmin ? 'Changes save as you go.' : 'You can edit your own details. A parent edits everyone.'}
        action={isAdmin && (
          <button type="button" onClick={async () => { await addMember({ name: 'New person', color: MEMBER_PALETTE[members.length % MEMBER_PALETTE.length], role: 'child' }); flash() }} style={{ all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: C.tealText }}>+ Add</button>
        )}
      >
        {members.map((m) => (
          <MemberRow key={m.id} m={m} used={used} canEdit={canEdit(m)} isAdmin={isAdmin} onPatch={async (p) => { await updateMember(m.id, p); flash() }} onRemove={async () => { await removeMember(m.id); flash() }} />
        ))}
      </Section>
    </>
  )
}
