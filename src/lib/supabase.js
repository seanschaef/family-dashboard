import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Surfaces a clear message during local dev instead of a cryptic network error
// when .env.local has not been filled in yet.
export const isSupabaseConfigured = Boolean(url && anon)

if (!isSupabaseConfigured) {
  console.warn(
    '[family-dashboard] Supabase is not configured. Copy .env.example to ' +
      '.env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

// Send database (REST) requests at most two at a time. Supabase's API
// (PostgREST 14.18) can break its database connection when a burst of requests
// arrives at once (PostgREST issue #5386) and then jams until the project is
// restarted. The wall used to reload ~14 tables in the same instant every 30
// seconds, which matches the jams we saw; queueing them avoids the burst.
const MAX_AT_ONCE = 2
let running = 0
const waiting = []
function next() {
  while (running < MAX_AT_ONCE && waiting.length) {
    running++
    const job = waiting.shift()
    job().finally(() => {
      running--
      next()
    })
  }
}
function queuedFetch(input, init) {
  const target = typeof input === 'string' ? input : input?.url || String(input)
  if (!target.includes('/rest/v1/')) return fetch(input, init)
  return new Promise((resolve, reject) => {
    waiting.push(() => fetch(input, init).then(resolve, reject))
    next()
  })
}

// A harmless placeholder client when env is missing keeps the UI mountable
// (login screen will show a "not configured" notice) rather than crashing.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anon || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: { fetch: queuedFetch },
  },
)
