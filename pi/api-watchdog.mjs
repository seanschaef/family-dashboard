// Backup for a known Supabase API jam: PostgREST 14.18 can lose its database
// connection and then answer every request with "Timed out acquiring
// connection from connection pool" (PGRST003) until the project is restarted.
// If the API has answered like that for 5 minutes straight, this restarts the
// project through Supabase's Management API, at most once an hour.
//
// Needs SUPABASE_ACCESS_TOKEN in the Pi's .env.local (a personal access token
// from supabase.com/dashboard/account/tokens). Without it, it only logs.
// The token is never logged or sent anywhere except api.supabase.com.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const JAM_MS = 5 * 60 * 1000
const GAP_MS = 60 * 60 * 1000

// The decision logic, separate from the network so it can be tested.
// check() -> 'ok' | 'jam' | 'unknown' (couldn't tell, e.g. home internet down).
export function createWatchdog({ check, restart, now = () => Date.now(), readLast, writeLast, log = console.log, jamMs = JAM_MS, gapMs = GAP_MS }) {
  let jamSince = null
  return async function tick() {
    const state = await check()
    if (state === 'ok') {
      if (jamSince) log('[api-watchdog] Supabase API answering again')
      jamSince = null
      return 'ok'
    }
    if (state !== 'jam') return 'unknown'
    if (jamSince === null) {
      jamSince = now()
      log('[api-watchdog] Supabase API is jammed (connection pool); watching')
    }
    if (now() - jamSince < jamMs) return 'waiting'
    const last = readLast()
    if (last && now() - last < gapMs) return 'cooldown'
    writeLast(now())
    jamSince = null
    return (await restart()) ? 'restarted' : 'restart-failed'
  }
}

// Is the API answering? A 503/504 carrying a PGRST00x code is the jam. Any
// other answer (even "not allowed") means PostgREST reached the database.
export async function checkApi(url, anonKey) {
  try {
    const r = await fetch(`${url}/rest/v1/wall_settings?select=id&limit=1`, {
      headers: { apikey: anonKey },
      signal: AbortSignal.timeout(20000),
    })
    if (r.status !== 503 && r.status !== 504) return 'ok'
    const body = await r.json().catch(() => ({}))
    return /^PGRST00[0-3]$/.test(body?.code || '') ? 'jam' : 'unknown'
  } catch {
    return 'unknown'
  }
}

// getEnv() is read again at restart time, so a token added later works
// without restarting the agent.
export function startApiWatchdog({ getEnv, stateFile, everyMs = 60000 }) {
  const env = getEnv()
  const url = env.VITE_SUPABASE_URL
  const anon = env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) return
  const ref = new URL(url).hostname.split('.')[0]
  const tick = createWatchdog({
    check: () => checkApi(url, anon),
    readLast: () => {
      try {
        return Number(readFileSync(stateFile, 'utf8')) || 0
      } catch {
        return 0
      }
    },
    writeLast: (t) => {
      mkdirSync(dirname(stateFile), { recursive: true })
      writeFileSync(stateFile, String(t))
    },
    restart: async () => {
      const token = getEnv().SUPABASE_ACCESS_TOKEN
      if (!token) {
        console.log('[api-watchdog] would restart Supabase now, but SUPABASE_ACCESS_TOKEN is not set in .env.local')
        return false
      }
      try {
        const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/restart`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(30000),
        })
        console.log(`[api-watchdog] asked Supabase to restart the project: HTTP ${r.status}`)
        return r.ok
      } catch (e) {
        console.log('[api-watchdog] restart request failed:', e.message)
        return false
      }
    },
  })
  setInterval(() => tick().catch(() => {}), everyMs)
}
