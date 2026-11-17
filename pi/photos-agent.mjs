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
