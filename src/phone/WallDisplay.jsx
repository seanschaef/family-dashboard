import { useEffect, useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getWallSettings, saveWallSettings, DEFAULT_WALL_SETTINGS } from '../lib/wallSettings.js'

function TimeField({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 16 }}>{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ font: 'inherit', fontSize: 16, padding: '8px 10px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink }}
      />
    </label>
  )
}

export default function WallDisplay() {
  const { configured } = useAuth()
  const [s, setS] = useState(DEFAULT_WALL_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let active = true
    getWallSettings()
      .then((v) => active && setS(v))
      .catch((e) => active && setStatus({ kind: 'error', text: e.message }))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const set = (k) => (v) => setS((prev) => ({ ...prev, [k]: v }))

  async function save() {
    setStatus(null)
    try {
      await saveWallSettings(s)
      setStatus({ kind: 'ok', text: 'Saved. The wall applies it within a minute.' })
    } catch (e) {
      setStatus({ kind: 'error', text: e.message })
    }
  }

  if (loading) return <div style={{ fontSize: 15, color: C.muted }}>Loading…</div>

  return (
    <>
      <PhoneHeader title="Wall display" subtitle="Auto turn the monitor on and off" />

      <div style={{ fontSize: 14, color: C.muted }}>
        The wall screen turns itself off and on at these times (the Raspberry Pi
        applies the schedule). Use "Blank" if your monitor is slow to wake from a
        full power-off.
      </div>

      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 16, fontWeight: 600 }}>
        <input type="checkbox" checked={s.display_enabled} onChange={(e) => set('display_enabled')(e.target.checked)} />
        Auto on/off enabled
      </label>

      <div style={{ opacity: s.display_enabled ? 1 : 0.5, pointerEvents: s.display_enabled ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            ['power', 'Power off'],
            ['blank', 'Blank screen'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => set('mode')(key)}
              style={{ all: 'unset', cursor: 'pointer', background: s.mode === key ? C.home : C.card, color: s.mode === key ? '#FFFFFF' : C.ink, border: s.mode === key ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 15, fontWeight: 600 }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={card}>
          <div style={sect}>Weekdays</div>
          <TimeField label="Turn on" value={s.on_time} onChange={set('on_time')} />
          <TimeField label="Turn off" value={s.off_time} onChange={set('off_time')} />
        </div>

        <div style={card}>
          <div style={sect}>Weekends</div>
          <TimeField label="Turn on" value={s.weekend_on_time} onChange={set('weekend_on_time')} />
          <TimeField label="Turn off" value={s.weekend_off_time} onChange={set('weekend_off_time')} />
        </div>
      </div>

      {!configured && (
        <div style={{ background: '#FBE9E3', color: '#8A3E1F', borderRadius: 12, padding: 14, fontSize: 14 }}>
          Connect Supabase to save this from your phone. Until then the Pi uses
          its local schedule file (see pi/README.md).
        </div>
      )}

      {status && <div style={{ fontSize: 14, color: status.kind === 'error' ? '#8A3E1F' : C.tealText }}>{status.text}</div>}

      <button
        type="button"
        onClick={save}
        disabled={!configured}
        style={{ all: 'unset', cursor: configured ? 'pointer' : 'default', textAlign: 'center', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, opacity: configured ? 1 : 0.6 }}
      >
        Save schedule
      </button>
    </>
  )
}

const card = { background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }
const sect = { fontSize: 14, fontWeight: 800, color: C.muted, letterSpacing: 1 }
