// Photo agent for the wall. Reads a folder mounted from the home NAS and serves
// its images to the kiosk on the local machine. The wall build points at it with
// VITE_PHOTO_AGENT_URL (e.g. http://localhost:8787). Images never leave the Pi:
// this only serves them to the local Chromium.
//
// Source folder, in order:
//   1. PHOTO_DIR env var
//   2. ~/.config/family-wall/photos.conf  (a single line: the mount path)
//   3. default /mnt/wallphotos
//
// Run from anywhere: `node pi/photos-agent.mjs`  (default port 8787)
// No external dependencies.

import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { readdirSync, existsSync, readFileSync, statSync, createReadStream } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve, sep, extname } from 'node:path'

const HOME = homedir()
const PORT = Number(process.env.PHOTO_AGENT_PORT || 8787)

function photoRoot() {
  if (process.env.PHOTO_DIR) return process.env.PHOTO_DIR
  const conf = join(HOME, '.config', 'family-wall', 'photos.conf')
  if (existsSync(conf)) {
    const line = readFileSync(conf, 'utf8').split('\n').map((s) => s.trim()).find(Boolean)
    if (line) return line
  }
  return '/mnt/wallphotos'
}

const ROOT = resolve(photoRoot())

// Chromium can render these; HEIC is skipped (the kiosk can't show it).
const TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

// Resolve a client-supplied relative path and refuse anything outside ROOT.
function safeJoin(rel) {
  const full = resolve(ROOT, rel || '.')
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null
  return full
}

function listImages(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => TYPES[extname(f).toLowerCase()])
      .sort()
  } catch {
    return []
  }
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    res.end()
    return
  }
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const folder = url.searchParams.get('folder') || ''

  if (url.pathname === '/list') {
    const dir = safeJoin(folder)
    const images = dir ? listImages(dir) : []
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ folder, images }))
    return
  }

  if (url.pathname === '/img') {
    const name = url.searchParams.get('name') || ''
    const dir = safeJoin(folder)
    const file = dir && name ? safeJoin(join(folder, name)) : null
    if (!file || !existsSync(file) || !statSync(file).isFile() || !TYPES[extname(file).toLowerCase()]) {
      res.writeHead(404, cors)
      res.end('not found')
      return
    }
    res.writeHead(200, { ...cors, 'Content-Type': TYPES[extname(file).toLowerCase()], 'Cache-Control': 'public, max-age=3600' })
    createReadStream(file).pipe(res)
    return
  }

  if (url.pathname === '/health') {
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, root: ROOT, exists: existsSync(ROOT) }))
    return
  }

  res.writeHead(404, cors)
  res.end('not found')
})

server.listen(PORT, () => {
  console.log(`photo agent on http://localhost:${PORT}  (root: ${ROOT}${existsSync(ROOT) ? '' : ' — NOT MOUNTED'})`)
})

// ---------- publish the folder list so the phone can pick a folder ----------
// Every 10 minutes, list the folders under ROOT (a few levels deep) with how
// many images each holds, and write them to the photo_folders table, signed in
// as the wall account (WALL_EMAIL / WALL_PASSWORD in family-dashboard/.env.local,
// the same login the display agent uses). Folder names only; no images leave
// the Pi. Skipped quietly if those settings aren't there.

const REPO = join(HOME, 'family-dashboard')
const MAX_DEPTH = 3
const MAX_FOLDERS = 500
const PUBLISH_EVERY_MS = 10 * 60 * 1000

function parseEnvFile(path) {
  const out = {}
  if (!existsSync(path)) return out
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

function scanFolders() {
  const out = []
  const walk = (rel, depth) => {
    if (out.length >= MAX_FOLDERS) return
    let entries
    try {
      entries = readdirSync(join(ROOT, rel), { withFileTypes: true })
    } catch {
      return
    }
    const images = entries.filter((e) => e.isFile() && TYPES[extname(e.name).toLowerCase()]).length
    if (rel) out.push({ path: rel.split(sep).join('/'), image_count: images })
    if (depth >= MAX_DEPTH) return
    for (const e of entries) {
      // Skip hidden and Synology system folders (@eaDir, #recycle).
      if (e.isDirectory() && !/^[.@#]/.test(e.name)) walk(rel ? join(rel, e.name) : e.name, depth + 1)
    }
  }
  walk('', 0)
  return out
}

let client = null
async function supabaseClient(env) {
  if (client) return client
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key, WALL_EMAIL: email, WALL_PASSWORD: password } = env
  if (!url || !key || !email || !password) return null
  // Load supabase-js from the app's node_modules (its CommonJS build; the ESM
  // build uses extensionless imports that plain Node can't resolve).
  const { createClient } = createRequire(join(REPO, 'package.json'))('@supabase/supabase-js')
  const c = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: true } })
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw new Error('wall login failed: ' + error.message)
  client = c
  return c
}

async function publishFolders() {
  if (!existsSync(ROOT)) return
  const env = { ...process.env, ...parseEnvFile(join(REPO, '.env.local')) }
  const sb = await supabaseClient(env)
  if (!sb) return
  const folders = scanFolders()
  const now = new Date().toISOString()
  if (folders.length) {
    const { error } = await sb.from('photo_folders').upsert(
      folders.map((f) => ({ ...f, updated_at: now })),
      { onConflict: 'family_id,path' },
    )
    if (error) throw error
  }
  // Drop folders that no longer exist (not refreshed this round).
  await sb.from('photo_folders').delete().lt('updated_at', now)
  console.log(`[photos-agent] published ${folders.length} folders`)
}

const publish = () =>
  publishFolders().catch((e) => {
    client = null // force a fresh sign-in next time
    console.error('[photos-agent] folder publish failed:', e.message)
  })
publish()
setInterval(publish, PUBLISH_EVERY_MS)
