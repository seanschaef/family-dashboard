import { useFamilyTable, insertRow, updateRow, deleteRow } from './db.js'

// The wall talks to a small agent running on the Pi, which reads the mounted
// NAS folder and serves the images on the local network. Set on the Pi build
// only (e.g. VITE_PHOTO_AGENT_URL=http://localhost:8787). Empty everywhere else
// (phone, Vercel, dev), so no device without the NAS tries to load from it.
const AGENT_URL = import.meta.env.VITE_PHOTO_AGENT_URL || ''

// A collection = a name + a NAS subfolder, optionally routed to a member
// (per-user), certain months (seasonal/theme) and/or an hour window (time of
// day). Sample rows for the unconfigured demo.
export const SAMPLE_COLLECTIONS = [
  { id: 'pc1', name: 'Everyone', folder: 'Family', member_key: null, active: true, months: [], start_hour: null, end_hour: null, sort_order: 1 },
  { id: 'pc2', name: 'Jordan', folder: 'Kids/Jordan', member_key: 'm3', active: true, months: [], start_hour: null, end_hour: null, sort_order: 2 },
  { id: 'pc3', name: 'Mornings', folder: 'Calm', member_key: null, active: true, months: [], start_hour: 6, end_hour: 11, sort_order: 3 },
  { id: 'pc4', name: 'Holidays', folder: 'Christmas', member_key: null, active: true, months: [12], start_hour: null, end_hour: null, sort_order: 4 },
]

export const usePhotoCollections = () =>
  useFamilyTable('photo_collections', { order: { column: 'sort_order' }, sample: SAMPLE_COLLECTIONS })

export const addCollection = (values) => insertRow('photo_collections', values)
export const updateCollection = (id, values) => updateRow('photo_collections', id, values)
export const removeCollection = (id) => deleteRow('photo_collections', id)

export const photoAgentConfigured = () => Boolean(AGENT_URL)

// Which collections belong on screen right now for a context (hub = null member,
// or a specific member page). Applies the active flag, member routing, month
// theme and hour window (windows may wrap past midnight, e.g. 20 to 6).
export function activeCollectionsFor(collections, { memberKey = null, now = new Date() } = {}) {
  const month = now.getMonth() + 1
  const hour = now.getHours()
  return collections
    .filter((c) => c.active)
    .filter((c) => (c.member_key ?? null) === (memberKey ?? null))
    .filter((c) => !c.months?.length || c.months.includes(month))
    .filter((c) => {
      if (c.start_hour == null || c.end_hour == null) return true
      return c.start_hour <= c.end_hour
        ? hour >= c.start_hour && hour < c.end_hour
        : hour >= c.start_hour || hour < c.end_hour
    })
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

// Ask the Pi agent for the image file names in a folder, as absolute URLs the
// kiosk can load. Off the Pi (no agent) this returns [].
export async function fetchFolderImages(folder) {
  if (!AGENT_URL) return []
  try {
    const res = await fetch(`${AGENT_URL}/list?folder=${encodeURIComponent(folder)}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.images || []).map(
      (name) => `${AGENT_URL}/img?folder=${encodeURIComponent(folder)}&name=${encodeURIComponent(name)}`,
    )
  } catch {
    return []
  }
}

// Photos taken on today's date in earlier years (from the Pi agent's index).
// If none, widens to 3 days either side. Returns [{ url, year, month, day }].
export async function fetchOnThisDay(now = new Date()) {
  if (!AGENT_URL) return []
  const q = (spread) =>
    fetch(`${AGENT_URL}/onthisday?month=${now.getMonth() + 1}&day=${now.getDate()}&year=${now.getFullYear()}&spread=${spread}`)
      .then((r) => (r.ok ? r.json() : { photos: [] }))
      .then((j) => j.photos || [])
  try {
    let photos = await q(0)
    let exact = true
    if (!photos.length) {
      photos = await q(3)
      exact = false
    }
    return photos.map((p) => ({
      url: `${AGENT_URL}/img?folder=${encodeURIComponent(p.folder)}&name=${encodeURIComponent(p.name)}`,
      year: p.year,
      month: p.month,
      day: p.day,
      exact,
    }))
  } catch {
    return []
  }
}

const sampleSvg = (a, b) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><text x='50%' y='50%' fill='rgba(255,255,255,0.8)' font-family='sans-serif' font-size='52' font-weight='700' text-anchor='middle' dominant-baseline='middle'>Sample photo</text></svg>`,
  )}`

// Stand-in frames for the unconfigured demo only, so the crossfade is visible
// without a NAS. Never shown on a real deployment.
export const SAMPLE_IMAGES = [
  sampleSvg('#7B4B8A', '#B4532A'),
  sampleSvg('#2F6A9E', '#4F7A5A'),
  sampleSvg('#B4532A', '#D9A441'),
  sampleSvg('#4F7A5A', '#2F605E'),
]

export const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
export const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function scheduleSummary(c) {
  const parts = []
  if (c.months?.length) parts.push(c.months.sort((a, b) => a - b).map((m) => MONTH_NAMES[m - 1]).join(', '))
  if (c.start_hour != null && c.end_hour != null) parts.push(`${c.start_hour}:00–${c.end_hour}:00`)
  return parts.join(' · ')
}

// Folders under the NAS mount, published by the Pi's photo agent, so the phone
// can browse and pick instead of typing a path. Empty until the Pi publishes.
export const usePhotoFolders = () => useFamilyTable('photo_folders', { order: { column: 'path' }, sample: [] })
