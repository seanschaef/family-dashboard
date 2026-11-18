import { supabase, isSupabaseConfigured } from './supabase.js'

// Calendars are private ICS feed links (Google / Outlook), read-only. Events
// are still created in Google/Outlook; a Supabase Edge Function fetches each
// feed server-side (browsers can't fetch arbitrary ICS: CORS) and caches
// parsed events in `calendar_events`, which the app then reads.

export async function listCalendars() {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('calendars')
    .select('id, name, ics_url, person_key, person_keys, kind, show_on_hub, color, last_synced_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addCalendar({ name, ics_url, person_keys, kind, show_on_hub, color }) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const keys = person_keys || []
  const { data, error } = await supabase
    .from('calendars')
    .insert({ name, ics_url, person_key: keys[0] || null, person_keys: keys, kind, show_on_hub, color })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeCalendar(id) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { error } = await supabase.from('calendars').delete().eq('id', id)
  if (error) throw error
}

// Ask the Edge Function to pull all feeds now. Returns a summary.
export async function syncCalendars() {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.functions.invoke('sync-calendars')
  if (error) throw error
  return data
}

// Read cached events in a date range (used by hub/member pages later).
// A work calendar (kind='work') is filtered out of the hub by the caller,
// never shown on the family hub (confidentiality).
export async function listEvents({ from, to } = {}) {
  if (!isSupabaseConfigured) return []
  let q = supabase
    .from('calendar_events')
    .select('id, calendar_id, title, starts_at, ends_at, all_day, location, person_key, kind, calendar:calendars(person_keys, color, show_on_hub)')
    .order('starts_at', { ascending: true })
  if (from) q = q.gte('starts_at', from)
  if (to) q = q.lte('starts_at', to)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(withCalendarInfo)
}

// Flatten the joined calendar onto the event: who it belongs to (a calendar
// can have several owners), its own colour, and whether it shows on the hub.
function withCalendarInfo(e) {
  const cal = e.calendar || {}
  const owners = cal.person_keys?.length ? cal.person_keys : e.person_key ? [e.person_key] : []
  return { ...e, calendar: undefined, owners, color: cal.color || null, show_on_hub: cal.show_on_hub !== false }
}

// Does this event belong on a person's page? Their own calendars plus the
// family calendar.
export function ownsEvent(e, personKey) {
  const owners = e.owners || (e.person_key ? [e.person_key] : [])
  return owners.includes(personKey) || owners.includes('family')
}

export async function updateCalendar(id, patch) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { error } = await supabase.from('calendars').update(patch).eq('id', id)
  if (error) throw error
}
