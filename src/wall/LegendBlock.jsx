import { C, card } from '../theme.js'
import { useFamilyTable } from '../lib/db.js'
import { useMembers } from '../lib/members.jsx'

// Hub window: a key to the calendar colours. One dot per calendar that shows
// on the hub, in the same colour its events use (the calendar's own colour, or
// its first owner's). Work calendars and ones hidden from the hub are left out,
// as on the rest of the wall.
export default function LegendBlock() {
  const { colorFor, nameFor } = useMembers()
  // Only the columns the key needs (never the private feed links).
  const { rows } = useFamilyTable('calendars', { select: 'id, name, color, person_key, person_keys, kind, show_on_hub', order: { column: 'name' } })
  const shown = rows.filter((c) => c.kind !== 'work' && c.show_on_hub !== false)

  return (
    <div style={card({ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 12, height: '100%' })}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>Calendar key</div>
      {shown.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }}>
          {shown.map((c) => {
            const owners = c.person_keys?.length ? c.person_keys : c.person_key ? [c.person_key] : []
            const color = c.color || colorFor(owners[0])
            const who = owners.map(nameFor).filter(Boolean).join(' & ')
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ width: 18, height: 18, borderRadius: 9, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>{c.name}</span>
                {who && who !== c.name && <span style={{ fontSize: 17, color: C.muted, whiteSpace: 'nowrap' }}>{who}</span>}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ fontSize: 20, color: C.muted }}>No calendars on the hub yet.</div>
      )}
    </div>
  )
}
