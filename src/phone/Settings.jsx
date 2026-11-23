import { useEffect, useState } from 'react'
import { C } from '../theme.js'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import { useTheme } from '../lib/theme.jsx'
import { listCalendars } from '../lib/calendars.js'
import { usePhotoCollections } from '../lib/photos.js'
import { useImportantDates } from '../lib/dates.js'
import { streamsOf } from '../lib/waste.js'
import { getWallSettings } from '../lib/wallSettings.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { ALL_CELEBRATION_STYLES } from '../lib/celebrationStyles.js'
import { PageHeader, Section, RowList, NavRow } from './ui.jsx'

// Settings home. Four groups, each row showing where things stand:
//   Me                    who you are on this phone, light/dark, sign out
//   Family                people, family details, logins (parents)
//   The Wall              layout, screen schedule, celebrations
//   What the Wall Shows   calendars, photos, important dates, garbage days
// Everyday things (notes, ink, reminders) live on Today, not here.

const clock = (hhmm) => {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const ap = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return m ? `${h12}:${String(m).padStart(2, '0')} ${ap}` : `${h12} ${ap}`
}
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={{ all: 'unset', cursor: 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: `2px solid ${active ? color : C.border}`, borderRadius: 999, padding: '7px 13px', fontSize: 14, fontWeight: 600 }}>
      {children}
    </button>
  )
}

export default function Settings() {
  const { user, signOut, configured } = useAuth()
  const { members, familyName, petName, me, setMe, isAdmin, wasteSchedule, parentPinHash } = useMembers()
  const { pref, setPref } = useTheme()
  const { rows: collections } = usePhotoCollections()
  const { rows: dates } = useImportantDates()
  const [calCount, setCalCount] = useState(null)
  const [wall, setWall] = useState(null)
  const [celeb, setCeleb] = useState(null)

  useEffect(() => {
    let live = true
    listCalendars().then((l) => live && setCalCount(l.length)).catch(() => {})
    getWallSettings().then((w) => live && setWall(w)).catch(() => {})
    if (isSupabaseConfigured) {
      supabase.from('wall_settings').select('celebrations_on, celebration_styles_off').limit(1).maybeSingle().then(({ data }) => live && setCeleb(data || {}))
    }
    return () => { live = false }
  }, [])

  const screen = wall
    ? !wall.display_enabled
      ? 'Always on'
      : wall.on_time === wall.weekend_on_time && wall.off_time === wall.weekend_off_time
        ? `On ${clock(wall.on_time)} to ${clock(wall.off_time)}`
        : `Weekdays ${clock(wall.on_time)} to ${clock(wall.off_time)} · weekends ${clock(wall.weekend_on_time)} to ${clock(wall.weekend_off_time)}`
    : ''
  const celebSummary = celeb
    ? celeb.celebrations_on === false
      ? 'Off'
      : `On · ${ALL_CELEBRATION_STYLES.length - (celeb.celebration_styles_off || []).length} of ${ALL_CELEBRATION_STYLES.length} styles`
    : ''
  const streams = streamsOf(wasteSchedule).filter((s) => s.on && s.next)
  const activeCollections = collections.filter((c) => c.active !== false)

  return (
    <>
      <PageHeader title="Settings" subtitle={familyName && familyName !== 'family' ? `The ${familyName} family` : 'Family Dashboard'} back={false} />

      <Section title="Me">
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 6 }}>On this phone I am</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {members.map((m) => (
              <Chip key={m.id} active={me?.id === m.id} color={m.color} onClick={() => setMe(m.id)}>{m.name}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Dark mode on this phone</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['sun', 'Sunset to sunrise'], ['auto', 'Match phone'], ['light', 'Always light'], ['dark', 'Always dark']].map(([v, l]) => (
              <Chip key={v} active={pref === v} onClick={() => setPref(v)}>{l}</Chip>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <span style={{ fontSize: 13, color: C.muted, overflowWrap: 'anywhere' }}>{user?.email}{isAdmin ? ' · Parent' : ''}</span>
          <button type="button" onClick={signOut} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.tealText, flexShrink: 0 }}>Sign out</button>
        </div>
      </Section>

      <Section title="Family">
        <RowList>
          <NavRow to="/app/settings/people" title="People" summary={`${plural(members.length, 'person', 'people')} · names, colours, photos, birthdays, houses`} />
          <NavRow to="/app/settings/family" title="Family Details" summary={[familyName && familyName !== 'family' ? familyName : null, petName ? `Pet: ${petName}` : null, isAdmin ? (parentPinHash ? 'PIN set' : 'No PIN') : null].filter(Boolean).join(' · ')} />
          {isAdmin && <NavRow to="/app/accounts" title="Logins" summary="Who can sign in, passwords, parents" locked />}
        </RowList>
      </Section>

      <Section title="The Wall">
        <RowList>
          <NavRow to="/app/arrange" title="Layout" summary="The hub and each person’s page: windows, sizes, live view" />
          <NavRow to="/app/wall-display" title="Screen" summary={screen || 'On and off times, night colours'} />
          <NavRow to="/app/settings/celebrations" title="Celebrations" summary={celebSummary || 'When a chore is ticked'} />
        </RowList>
      </Section>

      <Section title="What the Wall Shows">
        <RowList>
          <NavRow to="/app/calendars" title="Calendars" summary={calCount == null ? 'Linked calendars and colours' : calCount ? `${plural(calCount, 'calendar')} linked` : 'None linked yet'} />
          <NavRow to="/app/photos" title="Photos" summary={activeCollections.length ? `${plural(activeCollections.length, 'collection')} from the NAS` : 'Choose folders from the NAS'} />
          <NavRow to="/app/dates" title="Important Dates" summary={dates.length ? `${plural(dates.length, 'date')} plus everyone’s birthdays` : 'Birthdays, anniversaries and more'} />
          <NavRow to="/app/waste" title="Garbage and Recycling" summary={streams.length ? streams.map((s) => s.name).join(', ') : 'Pickup days'} />
        </RowList>
      </Section>

      {!configured && <div style={{ fontSize: 13, color: C.muted }}>Demo mode: changes are not saved.</div>}
    </>
  )
}
