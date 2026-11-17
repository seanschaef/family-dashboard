// Wall display schedule agent. Decides whether the monitor should be on right
// now and calls pi/display.sh to match. Run every minute (systemd timer/cron).
//
// Schedule source, in order:
//   1. Supabase `wall_settings` (set from the phone app) — if WALL_EMAIL /
//      WALL_PASSWORD and the VITE_SUPABASE_* vars are in family-dashboard/.env.local
//   2. Local file ~/.config/family-wall/display.conf (KEY=VALUE), or built-in
//      defaults, so it still works with no backend.
//
// Run from the repo root: `node pi/display-agent.mjs`

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'

const HOME = homedir()
const REPO = join(HOME, 'family-dashboard')
const STATE = join(HOME, '.config', 'family-wall', 'display.state')

const DEFAULTS = {
  display_enabled: true,
  mode: 'power',
  on_time: '06:30',
  off_time: '22:00',
  weekend_on_time: '08:00',
  weekend_off_time: '22:30',
}

function parseEnvFile(path) {
  const out = {}
  if (!existsSync(path)) return out
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

function readLocalConf() {
  const conf = { ...DEFAULTS }
  const p = join(HOME, '.config', 'family-wall', 'display.conf')
  Object.assign(conf, parseEnvFile(p))
  if (typeof conf.display_enabled === 'string') conf.display_enabled = conf.display_enabled !== 'false'
  return conf
}

async function fetchSupabaseSettings(env) {
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  const email = env.WALL_EMAIL
  const password = env.WALL_PASSWORD
  if (!url || !key || !email || !password) return null
  const { createClient } = await import(join(REPO, 'node_modules', '@supabase', 'supabase-js', 'dist', 'module', 'index.js'))
  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
  if (authErr) throw new Error('wall login failed: ' + authErr.message)
  const { data, error } = await supabase
    .from('wall_settings')
    .select('display_enabled, mode, on_time, off_time, weekend_on_time, weekend_off_time')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

const toMin = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number)
  return h * 60 + m
}

function desiredOn(conf, now = new Date()) {
  if (!conf.display_enabled) return null // null => leave alone
  const weekend = now.getDay() === 0 || now.getDay() === 6
  const on = toMin(weekend ? conf.weekend_on_time : conf.on_time)
  const off = toMin(weekend ? conf.weekend_off_time : conf.off_time)
  const cur = now.getHours() * 60 + now.getMinutes()
  if (on === off) return true
  return on < off ? cur >= on && cur < off : cur >= on || cur < off // handle wrap past midnight
}

function apply(state, mode) {
  let last = ''
  try { last = readFileSync(STATE, 'utf8').trim() } catch { /* first run */ }
  if (last === state) return // no change; don't fight a manual override every minute
  mkdirSync(dirname(STATE), { recursive: true })
  execFileSync('bash', [join(REPO, 'pi', 'display.sh'), state], { env: { ...process.env, MODE: mode }, stdio: 'inherit' })
}

async function main() {
  const env = { ...process.env, ...parseEnvFile(join(REPO, '.env.local')) }
  let conf = readLocalConf()
  try {
    const remote = await fetchSupabaseSettings(env)
    if (remote) conf = remote
  } catch (e) {
    console.error('[display-agent] remote settings unavailable, using local:', e.message)
  }
  const want = desiredOn(conf)
  if (want === null) {
    console.log('[display-agent] auto on/off disabled; leaving display as-is')
    return
  }
  apply(want ? 'on' : 'off', conf.mode || 'power')
}

main().catch((e) => {
  console.error('[display-agent] error:', e)
  process.exit(1)
})
