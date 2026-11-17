import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { C } from '../theme.js'

// The household roster lives in the database (public.members). This provider
// loads it once per session. When Supabase is not configured (local dev, or
// the public demo), it falls back to a generic placeholder family so the UI
// still renders — no real people in the source.
export const SAMPLE_MEMBERS = [
  { key: 'm1', name: 'Alex', color: C.violet, role: 'parent', birthday: null, sort_order: 1, widget_type: 'weather', widget_config: {} },
  { key: 'm2', name: 'Sam', color: C.rust, role: 'parent', birthday: null, sort_order: 2, widget_type: 'countdown', widget_config: { label: 'Trip to the mountains', date: '2027-03-14' } },
  { key: 'm3', name: 'Jordan', color: C.green, role: 'teen', birthday: '2012-05-14', sort_order: 3, widget_type: 'none', widget_config: {} },
  { key: 'm4', name: 'Riley', color: C.blue, role: 'child', birthday: '2016-10-02', sort_order: 4, widget_type: 'none', widget_config: {} },
]

const MembersContext = createContext(null)

export function MembersProvider({ children }) {
  const [members, setMembers] = useState(isSupabaseConfigured ? [] : SAMPLE_MEMBERS)
  const [familyName, setFamilyName] = useState('family') // generic until loaded
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    async function load() {
      const [{ data, error }, fam] = await Promise.all([
        supabase.from('members').select('key, name, color, role, birthday, sort_order, widget_type, widget_config').order('sort_order', { ascending: true }),
        supabase.from('families').select('name').limit(1).maybeSingle(),
      ])
      if (!active) return
      // Fall back to placeholders only if the query failed (e.g. signed out).
      if (error || !data) setMembers(SAMPLE_MEMBERS)
      else if (data.length) setMembers(data)
      if (fam?.data?.name) setFamilyName(fam.data.name)
      setLoading(false)
    }
    load()
    const channel = supabase
      .channel('members-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, load)
      .subscribe()
    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  const byKey = (key) => members.find((m) => m.key === key)
  const colorFor = (key) => (key === 'family' ? C.ink : byKey(key)?.color || C.muted)
  const nameFor = (key) => (key === 'family' ? 'Family' : byKey(key)?.name || '')

  return (
    <MembersContext.Provider value={{ members, familyName, loading, byKey, colorFor, nameFor }}>
      {children}
    </MembersContext.Provider>
  )
}

export function useMembers() {
  const ctx = useContext(MembersContext)
  if (!ctx) throw new Error('useMembers must be used within MembersProvider')
  return ctx
}

// Save a member's wall widget. Realtime updates the roster for everyone.
export async function updateMemberWidget(key, widget_type, widget_config) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('members')
    .update({ widget_type, widget_config })
    .eq('key', key)
  if (error) throw error
}
