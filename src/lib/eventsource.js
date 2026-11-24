import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from './supabase.js'
import { useMembers } from './members.jsx'
import { listEvents } from './calendars.js'
import { readCacheGroup, writeCacheLimited } from './offlineCache.js'
import { sampleEvents } from '../data/sampleEvents.js'

// Event colours come from the members roster via useMembers().colorFor.

// The saved events (wall only) that fall in a range, from any saved range.
function savedEvents(fromMs, toMs) {
  const seen = new Set()
  return readCacheGroup('events')
    .flat()
    .filter((e) => {
      const t = new Date(e.starts_at).getTime()
      if (seen.has(e.id) || t < fromMs || t > toMs) return false
      seen.add(e.id)
      return true
    })
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
}

// Events for a date range. Live from Supabase when configured, otherwise the
// sample set so the calendar is reviewable now.
export function useEvents(from, to) {
  const fromMs = from.getTime()
  const toMs = to.getTime()
  const cacheKey = `events|${fromMs}|${toMs}`
  const [events, setEvents] = useState(() => savedEvents(fromMs, toMs))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let retry = null
    async function load() {
      setLoading(true)
      if (isSupabaseConfigured) {
        try {
          const rows = await listEvents({ from: from.toISOString(), to: to.toISOString() })
          if (active) setEvents(rows)
          writeCacheLimited('events', cacheKey, rows, 10)
        } catch {
          // Database not answering: show the saved copy for this range (if
          // any) and try again in a minute.
          if (active) {
            setEvents(savedEvents(fromMs, toMs))
            retry = setTimeout(load, 60000)
          }
        }
      } else {
        const all = sampleEvents().filter((e) => {
          const s = new Date(e.starts_at)
          return s >= from && s <= to
        })
        if (active) setEvents(all)
      }
      if (active) setLoading(false)
    }
    load()
    return () => {
      active = false
      clearTimeout(retry)
    }
    // from/to are compared by timestamp; see fromMs/toMs below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromMs, toMs])

  // Confidentiality: a work calendar's details (titles, locations) show only to
  // its owner on their own phone, unless its owner turned on show_details. The wall (a shared screen, including the
  // phone's Wall preview) and everyone else see "Busy" at the same times.
  const { me } = useMembers()
  const { pathname } = useLocation()
  const onWall = pathname.startsWith('/wall')
  const shown = useMemo(
    () =>
      events.map((e) =>
        e.kind === 'work' && !e.show_details && (onWall || !(e.owners || [e.person_key]).includes(me?.key))
          ? { ...e, title: 'Busy', location: null }
          : e,
      ),
    [events, onWall, me?.key],
  )

  return { events: shown, loading }
}
