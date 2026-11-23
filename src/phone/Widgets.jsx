import { useEffect, useState } from 'react'
import { C } from '../theme.js'
import { updateMemberWidget } from '../lib/members.jsx'
import { isSupabaseConfigured } from '../lib/supabase.js'

// The open "Widget" window on a person's wall page: weather, a countdown, their
// next event, or a note. Edited from Layout (Arrange) when that window is
// selected on a person's page.
const TYPES = [
  { key: 'none', label: 'None' },
  { key: 'weather', label: 'Weather' },
  { key: 'countdown', label: 'Countdown' },
  { key: 'next', label: 'Next up' },
  { key: 'note', label: 'Note' },
]

const input = { font: 'inherit', fontSize: 15, padding: '9px 11px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }

export function WidgetEditor({ member, disabled }) {
  const [type, setType] = useState(member.widget_type || 'none')
  const [cfg, setCfg] = useState(member.widget_config || {})
  const [status, setStatus] = useState(null)
  useEffect(() => {
    setType(member.widget_type || 'none')
    setCfg(member.widget_config || {})
  }, [member.key, member.widget_type, member.widget_config])
  const set = (k) => (v) => { setCfg((c) => ({ ...c, [k]: v })); setStatus(null) }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TYPES.map((t) => (
          <button key={t.key} type="button" disabled={disabled} aria-pressed={type === t.key} onClick={() => { setType(t.key); setStatus(null) }} style={{ all: 'unset', cursor: disabled ? 'default' : 'pointer', background: type === t.key ? member.color : C.cream, color: type === t.key ? '#FFFFFF' : C.ink, border: `2px solid ${type === t.key ? member.color : C.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 14, fontWeight: 700 }}>
            {t.label}
          </button>
        ))}
      </div>
      {type === 'countdown' && (
        <>
          <input aria-label="Countdown label" disabled={disabled} placeholder="What are you counting down to?" value={cfg.label || ''} onChange={(e) => set('label')(e.target.value)} style={input} />
          <input aria-label="Countdown date" disabled={disabled} type="date" value={cfg.date || ''} onChange={(e) => set('date')(e.target.value)} style={input} />
        </>
      )}
      {type === 'note' && (
        <>
          <input aria-label="Note title" disabled={disabled} placeholder="Title (optional)" value={cfg.title || ''} onChange={(e) => set('title')(e.target.value)} style={input} />
          <textarea aria-label="Note text" disabled={disabled} placeholder="Your note…" value={cfg.text || ''} onChange={(e) => set('text')(e.target.value)} rows={3} style={{ ...input, resize: 'vertical' }} />
        </>
      )}
      {type === 'weather' && <div style={{ fontSize: 13, color: C.muted }}>Current weather for Edmonton.</div>}
      {type === 'next' && <div style={{ fontSize: 13, color: C.muted }}>{member.name}’s next calendar event.</div>}
      {!disabled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={save} disabled={!isSupabaseConfigured} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 700 }}>Save widget</button>
          {status && <span style={{ fontSize: 13, color: status === 'Saved' ? C.tealText : C.danger }}>{status === 'Saved' ? 'Saved, shows on the wall now' : status}</span>}
        </div>
      )}
    </div>
  )
}
