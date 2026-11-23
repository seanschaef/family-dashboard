import { useEffect, useState } from 'react'
import { C } from '../theme.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { saveWallSettings } from '../lib/wallSettings.js'
import { useMembers } from '../lib/members.jsx'
import { CELEBRATION_GROUPS, ALL_CELEBRATION_STYLES } from '../lib/celebrationStyles.js'
import { PageHeader, Section, Toggle, SaveToast, useSaved } from './ui.jsx'

// Settings › The Wall › Celebrations: whether the wall celebrates ticked
// chores, whether no-points chores count, which styles can come up, and a
// Play button that shows any style on the wall right now (no points given).
const DEFAULTS = { celebrations_on: true, celebrate_no_points: true, celebration_styles_off: [] }

export default function Celebrations() {
  const { isAdmin } = useMembers()
  const [s, setS] = useState(DEFAULTS)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [played, setPlayed] = useState('')
  const { savedAt, flash } = useSaved()

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('wall_settings').select('celebrations_on, celebrate_no_points, celebration_styles_off').limit(1).maybeSingle()
      .then(({ data }) => { if (data) setS({ ...DEFAULTS, ...data }); setLoading(false) })
  }, [])

  const save = async (patch) => {
    setS((prev) => ({ ...prev, ...patch }))
    try { await saveWallSettings(patch); flash() } catch { /* shown by nothing changing */ }
  }
  const off = new Set(s.celebration_styles_off || [])
  const toggleStyle = (id) => {
    const next = new Set(off)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    if (next.size >= ALL_CELEBRATION_STYLES.length) return // keep at least one
    save({ celebration_styles_off: [...next] })
  }
  const play = async (id) => {
    setPlayed(id)
    try {
      await saveWallSettings({ celebration_preview: id, celebration_preview_at: new Date().toISOString() })
    } catch { setPlayed('') }
    setTimeout(() => setPlayed(''), 4000)
  }

  const onCount = ALL_CELEBRATION_STYLES.length - off.size
  const locked = !isAdmin

  if (loading) return <div style={{ fontSize: 15, color: C.muted }}>Loading…</div>

  return (
    <>
      <PageHeader title="Celebrations" subtitle="The wall’s big moment when a chore is ticked" />
      <SaveToast at={savedAt} />

      <Section note={locked ? 'Only a parent can change these. Anyone can play one on the wall.' : undefined}>
        <Toggle label="Celebrate ticked chores" sub="A full-screen show in the person’s house colours." on={s.celebrations_on} disabled={locked} onChange={(v) => save({ celebrations_on: v })} />
        <Toggle label="Chores with no points too" sub="Shows a cheer (“YAY!”, “Keep trying!”) instead of a score." on={s.celebrate_no_points} disabled={locked || !s.celebrations_on} onChange={(v) => save({ celebrate_no_points: v })} />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Styles</div>
        <div style={{ fontSize: 13, color: C.muted }}>{onCount} of {ALL_CELEBRATION_STYLES.length} in the mix</div>
      </div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: -8 }}>Each celebration picks one of the ticked styles at random. Play shows it on the wall now.</div>

      {CELEBRATION_GROUPS.map((g) => (
        <Section key={g.title} title={g.title} action={!locked && (
          <button type="button" onClick={() => {
            const ids = g.styles.map(([id]) => id)
            const allOn = ids.every((id) => !off.has(id))
            const next = new Set(off)
            ids.forEach((id) => (allOn ? next.add(id) : next.delete(id)))
            if (next.size < ALL_CELEBRATION_STYLES.length) save({ celebration_styles_off: [...next] })
          }} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: C.tealText }}>
            {g.styles.every(([id]) => !off.has(id)) ? 'Turn all off' : 'Turn all on'}
          </button>
        )}>
          <div style={{ display: 'flex', flexDirection: 'column', margin: '-4px 0' }}>
            {g.styles.map(([id, name, blurb]) => {
              const on = !off.has(id)
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${C.border}` }}>
                  <button type="button" role="checkbox" aria-checked={on} disabled={locked} onClick={() => toggleStyle(id)} style={{ all: 'unset', cursor: locked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, boxSizing: 'border-box', border: on ? 'none' : `2px solid ${C.border}`, background: on ? C.meals : 'transparent', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>{on ? '✓' : ''}</span>
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: on ? C.ink : C.muted }}>{name}</span>
                      <span style={{ fontSize: 13, color: C.muted }}>{blurb}</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => play(id)} disabled={!isSupabaseConfigured} aria-label={`Play ${name} on the wall`} style={{ all: 'unset', cursor: 'pointer', flexShrink: 0, fontSize: 13, fontWeight: 700, color: played === id ? '#FFF' : C.tealText, background: played === id ? C.meals : 'transparent', border: `2px solid ${played === id ? C.meals : C.border}`, borderRadius: 999, padding: '6px 12px' }}>
                    {played === id ? 'Playing' : '▶ Play'}
                  </button>
                </div>
              )
            })}
          </div>
        </Section>
      ))}
    </>
  )
}
