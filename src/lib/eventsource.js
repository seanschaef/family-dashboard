import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from './supabase.js'
import { listEvents } from './calendars.js'
import { sampleEvents } from '../data/sampleEvents.js'

// Event colours come from the members roster via useMembers().colorFor.

// Events for a date range. Live from Supabase when configured, otherwise the
// sample set so the calendar is reviewable now.
export function useEvents(from, to) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const fromMs = from.getTime()
  const toMs = to.getTime()

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      if (isSupabaseConfigured) {
        try {
          const rows = await listEvents({ from: from.toISOString(), to: to.toISOString() })
          if (active) setEvents(rows)
        } catch {
          if (active) setEvents([])
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
    }
    // from/to are compared by timestamp; see fromMs/toMs below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromMs, toMs])

  return { events, loading }
}
