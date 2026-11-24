import { useEffect, useState } from 'react'

// When Supabase's API stops answering (it has jammed for hours at a time), the
// wall keeps showing the last data it saw instead of going blank. Only the
// wall keeps this copy (in its own browser storage); phones always read live.
const ON = import.meta.env.VITE_DEVICE_MODE === 'wall'
const PREFIX = 'fd-cache:'

export function readCache(key) {
  if (!ON) return undefined
  try {
    const v = localStorage.getItem(PREFIX + key)
    return v ? JSON.parse(v) : undefined
  } catch {
    return undefined
  }
}

export function writeCache(key, value) {
  if (!ON) return
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: carry on live-only */
  }
}

// Like writeCache, but keeps only the newest `keep` keys starting with
// `group` (e.g. one per calendar date range), so old ranges don't pile up.
export function writeCacheLimited(group, key, value, keep = 8) {
  if (!ON) return
  writeCache(key, value)
  try {
    const listKey = PREFIX + group + '|recent'
    const recent = [key, ...(JSON.parse(localStorage.getItem(listKey) || '[]').filter((k) => k !== key))]
    recent.slice(keep).forEach((k) => localStorage.removeItem(PREFIX + k))
    localStorage.setItem(listKey, JSON.stringify(recent.slice(0, keep)))
  } catch {
    /* ignore */
  }
}

// Every saved value in a group (newest first).
export function readCacheGroup(group) {
  if (!ON) return []
  try {
    return JSON.parse(localStorage.getItem(PREFIX + group + '|recent') || '[]').map(readCache).filter(Boolean)
  } catch {
    return []
  }
}

// Is the database answering? A failed request with no status or a 5xx means
// the service is down (not a permissions problem). Screens can show a small
// "saved copy" note while it is.
let offline = false
const subs = new Set()
export function isOutage(res) {
  return !!res?.error && (!res.status || res.status >= 500)
}
export function reportDb(ok) {
  if (offline === !ok) return
  offline = !ok
  subs.forEach((fn) => fn(offline))
}
export function useDbOffline() {
  const [o, setO] = useState(offline)
  useEffect(() => {
    subs.add(setO)
    return () => subs.delete(setO)
  }, [])
  return o
}
