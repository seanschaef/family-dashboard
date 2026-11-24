import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { readCache, writeCache, isOutage, reportDb } from './offlineCache.js'

// Generic family-scoped table hook. RLS already limits rows to the signed-in
// user's family. When Supabase is not configured (public demo / local dev
// without keys), it returns the provided sample array unchanged.
//
// Keeping every screen current, three ways (live updates alone proved
// unreliable on the always-on wall: when they stopped, a tick saved but the
// screen never changed):
//   1. this screen's own writes (insertRow / updateRow / deleteRow /
//      deleteWhere) reload that table straight away;
//   2. live database updates, one shared channel per table (not one per
//      hook), so other phones' changes arrive within a second or two;
//   3. a fallback re-check every 30 seconds and whenever the screen wakes or
//      comes back online.

const listeners = new Map() // table -> Set(reload fn)
const channels = new Map() // table -> realtime channel
const POLL_MS = 30 * 1000

function notify(table) {
  for (const fn of listeners.get(table) || []) fn()
}

function subscribe(table, fn) {
  if (!listeners.has(table)) listeners.set(table, new Set())
  listeners.get(table).add(fn)
  if (!channels.has(table)) {
    const ch = supabase
      .channel(`rt-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => notify(table))
      .subscribe()
    channels.set(table, ch)
  }
  return () => {
    const set = listeners.get(table)
    set?.delete(fn)
    if (set && !set.size) {
      listeners.delete(table)
      const ch = channels.get(table)
      channels.delete(table)
      if (ch) supabase.removeChannel(ch)
    }
  }
}

// Wake-ups and reconnects: reload everything that's on screen.
if (typeof window !== 'undefined') {
  const all = () => listeners.forEach((_, t) => notify(t))
  window.addEventListener('online', all)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && all())
  setInterval(() => document.visibilityState === 'visible' && all(), POLL_MS)
}

export function useFamilyTable(table, { select = '*', order, sample = [] } = {}) {
  const orderCol = order?.column
  const orderAsc = order?.ascending ?? true
  const cacheKey = `${table}|${select}|${orderCol || ''}|${orderAsc}`
  const [rows, setRows] = useState(() => (isSupabaseConfigured ? readCache(cacheKey) ?? [] : sample))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return
    let q = supabase.from(table).select(select)
    if (orderCol) q = q.order(orderCol, { ascending: orderAsc })
    const res = await q
    // On an error, keep what's on screen (or the saved copy) and try again on
    // the next 30-second check.
    if (!res.error) {
      setRows(res.data ?? [])
      writeCache(cacheKey, res.data ?? [])
      reportDb(true)
    } else if (isOutage(res)) reportDb(false)
    setLoading(false)
  }, [table, select, orderCol, orderAsc, cacheKey])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return undefined
    }
    load()
    return subscribe(table, load)
  }, [table, load])

  return { rows, loading, reload: load }
}

export async function insertRow(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  notify(table) // refresh even on a duplicate, so the screen catches up
  if (error) throw error
  return data
}
export async function updateRow(table, id, values) {
  const { error } = await supabase.from(table).update(values).eq('id', id)
  notify(table)
  if (error) throw error
}
export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  notify(table)
  if (error) throw error
}
export async function deleteWhere(table, match) {
  const { error } = await supabase.from(table).delete().match(match)
  notify(table)
  if (error) throw error
}

// Edmonton "today" as a YYYY-MM-DD string (matches the DB date defaults).
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton' }).format(new Date())
}
