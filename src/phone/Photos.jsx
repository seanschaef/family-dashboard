import { useState } from 'react'
import { C } from '../theme.js'
import { PageHeader } from './ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import {
  usePhotoCollections,
  usePhotoFolders,
  addCollection,
  updateCollection,
  removeCollection,
  scheduleSummary,
  MONTH_FULL,
} from '../lib/photos.js'

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}>
      {children}
    </button>
  )
}
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{label}</div>
      {children}
    </div>
  )
}
const inputStyle = { font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }

// Browse the folders the Pi published from the NAS: tap a folder to open it,
// tap "Use" to pick it. Falls back to typing when the Pi hasn't published yet.
function FolderBrowser({ folders, value, onChange }) {
  const [at, setAt] = useState('') // folder currently open ('' = top level)
  if (!folders.length) {
    return (
      <div style={{ fontSize: 13, color: C.muted }}>
        The wall hasn&apos;t shared its NAS folders yet (it does once the NAS is mounted and the wall login is set on the Pi). Type the path below for now.
      </div>
    )
  }
  const depth = at ? at.split('/').length : 0
  const children = folders
    .filter((f) => (at ? f.path.startsWith(at + '/') : true) && f.path.split('/').length === depth + 1)
    .sort((a, b) => a.path.localeCompare(b.path))
  const hasKids = (p) => folders.some((f) => f.path.startsWith(p + '/'))
  const crumbs = at ? at.split('/') : []
  const row = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderTop: `1px solid ${C.border}` }
  return (
    <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', padding: '10px 12px', fontSize: 14, fontWeight: 700 }}>
        <button type="button" onClick={() => setAt('')} style={{ all: 'unset', cursor: 'pointer', color: C.tealText }}>NAS</button>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: C.muted }}>/</span>
            <button type="button" onClick={() => setAt(crumbs.slice(0, i + 1).join('/'))} style={{ all: 'unset', cursor: 'pointer', color: C.tealText }}>{c}</button>
          </span>
        ))}
      </div>
      {children.length === 0 && <div style={{ ...row, fontSize: 14, color: C.muted }}>No folders inside.</div>}
      {children.map((f) => {
        const leaf = f.path.split('/').pop()
        const picked = value === f.path
        return (
          <div key={f.path} style={{ ...row, background: picked ? C.tealTint : 'transparent' }}>
            <button type="button" onClick={() => hasKids(f.path) && setAt(f.path)} style={{ all: 'unset', cursor: hasKids(f.path) ? 'pointer' : 'default', flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leaf}{hasKids(f.path) ? ' ›' : ''}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{f.image_count} {f.image_count === 1 ? 'photo' : 'photos'}</div>
            </button>
            <button type="button" onClick={() => onChange(f.path)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: picked ? C.ink : C.tealText }}>{picked ? 'Picked ✓' : 'Use'}</button>
          </div>
        )
      })}
    </div>
  )
}

export default function Photos() {
  const { configured } = useAuth()
  const { members, nameFor } = useMembers()
  const { rows: collections } = usePhotoCollections()
  const { rows: folders } = usePhotoFolders()

  const [name, setName] = useState('')
  const [folder, setFolder] = useState('')
  const [who, setWho] = useState('family')
  const [months, setMonths] = useState([])
  const [useHours, setUseHours] = useState(false)
  const [startHour, setStartHour] = useState(6)
  const [endHour, setEndHour] = useState(11)
  const [status, setStatus] = useState(null)

  const toggleMonth = (m) => setMonths((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]))

  async function save() {
    if (!name.trim() || !folder.trim()) return
    setStatus(null)
    try {
      await addCollection({
        name: name.trim(),
        folder: folder.trim(),
        member_key: who === 'family' ? null : who,
        months,
        start_hour: useHours ? Number(startHour) : null,
        end_hour: useHours ? Number(endHour) : null,
        sort_order: collections.length + 1,
      })
      setName('')
      setFolder('')
      setMonths([])
      setUseHours(false)
      setStatus('Saved')
    } catch (e) {
      setStatus(e.message)
    }
  }

  const whoLabel = (c) => (c.member_key ? nameFor(c.member_key) : 'Everyone')

  return (
    <>
      <PageHeader title="Photos" subtitle="Collections from your home NAS, and where they show" />

      <div style={{ background: C.tealTint, borderRadius: 16, padding: 14, fontSize: 14, color: C.ink }}>
        Each collection points at a folder on your NAS. Route it to a person, a season, or a time of day. Photos stay on the NAS and only show on the wall.
      </div>

      <div style={{ fontSize: 16, fontWeight: 800 }}>New Collection</div>
      <Field label="Name">
        <input aria-label="Collection name" type="text" placeholder="Holidays" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="NAS folder">
        <FolderBrowser folders={folders} value={folder} onChange={(f) => { setFolder(f); if (!name.trim()) setName(f.split('/').pop()) }} />
        <input aria-label="NAS folder" type="text" placeholder="or type a path, e.g. Family/Christmas" value={folder} onChange={(e) => setFolder(e.target.value)} style={{ ...inputStyle, fontFamily: 'ui-monospace, monospace', fontSize: 15 }} />
      </Field>
      <Field label="Show on">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip active={who === 'family'} onClick={() => setWho('family')}>Hub (everyone)</Chip>
          {members.map((p) => (
            <Chip key={p.key} active={who === p.key} color={p.color} onClick={() => setWho(p.key)}>{p.name}&apos;s page</Chip>
          ))}
        </div>
      </Field>
      <Field label="Only these months (optional)">
        {/* Two columns, read down: January–June on the left, July–December on the right. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: 'repeat(6, auto)', gridAutoFlow: 'column', gap: 8 }}>
          {MONTH_FULL.map((d, i) => (
            <Chip key={i} active={months.includes(i + 1)} onClick={() => toggleMonth(i + 1)}>
              <span style={{ display: 'block', textAlign: 'center' }}>{d}</span>
            </Chip>
          ))}
        </div>
      </Field>
      <Field label="Only certain hours (optional)">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip active={useHours} onClick={() => setUseHours((v) => !v)}>{useHours ? 'On' : 'Off'}</Chip>
          {useHours && (
            <>
              <input aria-label="Start hour" type="number" min="0" max="23" value={startHour} onChange={(e) => setStartHour(e.target.value)} style={{ ...inputStyle, width: 70, fontSize: 15 }} />
              <span style={{ color: C.muted }}>to</span>
              <input aria-label="End hour" type="number" min="0" max="23" value={endHour} onChange={(e) => setEndHour(e.target.value)} style={{ ...inputStyle, width: 70, fontSize: 15 }} />
              <span style={{ color: C.muted, fontSize: 14 }}>24h</span>
            </>
          )}
        </div>
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={save} disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: '14px 24px', fontSize: 16, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>Save collection</button>
        {status && <span style={{ fontSize: 14, color: status === 'Saved' ? C.tealText : C.danger }}>{status}</span>}
      </div>
      {!configured && <div style={{ fontSize: 13, color: C.muted }}>Connect Supabase to save collections.</div>}

      <div style={{ fontSize: 18, fontWeight: 800, paddingTop: 8 }}>Collections</div>
      {collections.length === 0 ? (
        <div style={{ fontSize: 15, color: C.muted }}>No collections yet.</div>
      ) : (
        collections.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, padding: 12, opacity: c.active ? 1 : 0.55 }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: C.muted, fontFamily: 'ui-monospace, monospace' }}>{c.folder}</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {whoLabel(c)}{scheduleSummary(c) ? ` · ${scheduleSummary(c)}` : ''}
              </div>
            </div>
            <button type="button" onClick={() => updateCollection(c.id, { active: !c.active })} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.tealText }}>{c.active ? 'Hide' : 'Show'}</button>
            <button type="button" onClick={() => removeCollection(c.id)} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.danger }}>Delete</button>
          </div>
        ))
      )}
    </>
  )
}
