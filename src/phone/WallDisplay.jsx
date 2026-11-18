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
      <PhoneHeader title="Wall display" subtitle="Screen off at night, dark colours" />

      <div style={{ fontSize: 14, color: C.muted }}>
        Outside these hours the wall&apos;s monitor powers off, and it comes back
        on by itself at the &quot;Screen on&quot; time. The touchscreen is off
        while the monitor sleeps, so tapping won&apos;t wake it. Changes reach the
        wall within a minute.
      </div>

      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 16, fontWeight: 600 }}>
        <input type="checkbox" checked={s.display_enabled} onChange={(e) => set('display_enabled')(e.target.checked)} />
        Turn the screen off outside these hours
      </label>

      <div style={{ opacity: s.display_enabled ? 1 : 0.5, pointerEvents: s.display_enabled ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={card}>
          <div style={sect}>Weekdays</div>
          <TimeField label="Screen on" value={s.on_time} onChange={set('on_time')} />
          <TimeField label="Screen off" value={s.off_time} onChange={set('off_time')} />
        </div>

        <div style={card}>
          <div style={sect}>Weekends</div>
          <TimeField label="Screen on" value={s.weekend_on_time} onChange={set('weekend_on_time')} />
          <TimeField label="Screen off" value={s.weekend_off_time} onChange={set('weekend_off_time')} />
        </div>
      </div>

      <div style={card}>
        <div style={sect}>DARK MODE AT NIGHT</div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 16, fontWeight: 600 }}>
          <input type="checkbox" checked={s.dark_enabled} onChange={(e) => set('dark_enabled')(e.target.checked)} />
          Switch the wall to dark colours
        </label>
        <div style={{ opacity: s.dark_enabled ? 1 : 0.5, pointerEvents: s.dark_enabled ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TimeField label="Dark from" value={s.dark_start} onChange={set('dark_start')} />
          <TimeField label="Light again at" value={s.dark_end} onChange={set('dark_end')} />
        </div>
      </div>

      {!configured && (
        <div style={{ background: C.dangerTint, color: C.danger, borderRadius: 12, padding: 14, fontSize: 14 }}>
          Connect Supabase to save this from your phone. Until then the Pi uses
          its local schedule file (see pi/README.md).
        </div>
      )}

      {status && <div style={{ fontSize: 14, color: status.kind === 'error' ? C.danger : C.tealText }}>{status.text}</div>}

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
