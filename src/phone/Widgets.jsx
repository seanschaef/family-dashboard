import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers, updateMemberWidget } from '../lib/members.jsx'

const TYPES = [
  { key: 'none', label: 'None' },
  { key: 'weather', label: 'Weather' },
  { key: 'countdown', label: 'Countdown' },
  { key: 'next', label: 'Next up' },
  { key: 'note', label: 'Note' },
]

const input = { font: 'inherit', fontSize: 16, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }

function Editor({ member, configured }) {
  const [type, setType] = useState(member.widget_type || 'none')
  const [cfg, setCfg] = useState(member.widget_config || {})
  const [status, setStatus] = useState(null)
  const set = (k) => (v) => setCfg((c) => ({ ...c, [k]: v }))

  async function save() {
    setStatus(null)
    try {
      await updateMemberWidget(member.key, type, cfg)
      setStatus('Saved')
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 15, background: member.color, color: '#FFFFFF', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(member.name[0] || '?').toUpperCase()}
        </span>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{member.name}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            style={{ all: 'unset', cursor: 'pointer', background: type === t.key ? member.color : C.card, color: type === t.key ? '#FFFFFF' : C.ink, border: type === t.key ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === 'countdown' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input aria-label="Countdown label" placeholder="What are you counting down to?" value={cfg.label || ''} onChange={(e) => set('label')(e.target.value)} style={input} />
          <input aria-label="Countdown date" type="date" value={cfg.date || ''} onChange={(e) => set('date')(e.target.value)} style={input} />
        </div>
      )}
      {type === 'note' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input aria-label="Note title" placeholder="Title (optional)" value={cfg.title || ''} onChange={(e) => set('title')(e.target.value)} style={input} />
          <textarea aria-label="Note text" placeholder="Your note…" value={cfg.text || ''} onChange={(e) => set('text')(e.target.value)} rows={3} style={{ ...input, resize: 'vertical' }} />
        </div>
      )}
      {type === 'weather' && <div style={{ fontSize: 14, color: C.muted }}>Current weather for Edmonton.</div>}
      {type === 'next' && <div style={{ fontSize: 14, color: C.muted }}>Your next calendar event.</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={save} disabled={!configured} style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', background: C.meals, color: '#FFFFFF', borderRadius: 12, padding: '10px 20px', fontSize: 15, fontWeight: 700, opacity: configured ? 1 : 0.6 }}>
          Save
        </button>
        {status && <span style={{ fontSize: 14, color: status === 'Saved' ? C.tealText : C.danger }}>{status}</span>}
      </div>
    </div>
  )
}

export default function Widgets() {
  const { members } = useMembers()
  const { configured } = useAuth()
  return (
    <>
      <PhoneHeader title="Wall widgets" subtitle="Each person's wall-page widget" />
      <div style={{ fontSize: 14, color: C.muted }}>
        Pick what shows in the open slot on each person's wall page. Changes
        appear on the wall right away.
      </div>
      {!configured && (
        <div style={{ background: C.dangerTint, color: C.danger, borderRadius: 12, padding: 14, fontSize: 14 }}>
          Connect Supabase to save widgets.
        </div>
      )}
      {members.map((m) => (
        <Editor key={m.key} member={m} configured={configured} />
      ))}
    </>
  )
}
