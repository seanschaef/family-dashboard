import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'

// Generic family-scoped table hook with realtime. RLS already limits rows to
// the signed-in user's family. When Supabase is not configured (public demo /
// local dev without keys), it returns the provided sample array unchanged.
//
// The wall runs for days, so realtime alone is not trusted: it refetches when
// the channel (re)subscribes, when the screen wakes or the network comes back,
// and every pollMs if given. Only the newest fetch may set rows, so a slow
// older response can never overwrite a newer one.
export function useFamilyTable(table, { select = '*', order, sample = [], pollMs = 0 } = {}) {
  const [rows, setRows] = useState(isSupabaseConfigured ? [] : sample)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const orderCol = order?.column
  const orderAsc = order?.ascending ?? true

  const seq = useRef(0)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const mine = ++seq.current
    let q = supabase.from(table).select(select)
    if (orderCol) q = q.order(orderCol, { ascending: orderAsc })
    const { data, error } = await q
    if (mine !== seq.current) return // a newer fetch has started; drop this one
    if (!error) setRows(data ?? [])
    setLoading(false)
  }, [table, select, orderCol, orderAsc])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    load()
    const ch = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, load)
      // SUBSCRIBED also fires after a dropped socket rejoins: catch up on
      // anything that changed while it was down.
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') load()
      })
    const onWake = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('online', load)
    const poll = pollMs > 0 ? setInterval(load, pollMs) : null
    return () => {
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('online', load)
      if (poll) clearInterval(poll)
      supabase.removeChannel(ch)
    }
  }, [table, load, pollMs])

  return { rows, loading, reload: load }
}

export async function insertRow(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw error
  return data
}
export async function updateRow(table, id, values) {
  const { error } = await supabase.from(table).update(values).eq('id', id)
  if (error) throw error
}
export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}
export async function deleteWhere(table, match) {
  const { error } = await supabase.from(table).delete().match(match)
  if (error) throw error
}

// Edmonton "today" as a YYYY-MM-DD string (matches the DB date defaults).
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton' }).format(new Date())
}
