import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { C } from '../theme.js'

// The household roster lives in the database (public.members). This provider
// loads it once per session. When Supabase is not configured (local dev, or
// the public demo), it falls back to a generic placeholder family so the UI
// still renders — no real people in the source.
export const SAMPLE_MEMBERS = [
  { id: 'sm1', key: 'm1', name: 'Alex', color: C.violet, role: 'parent', birthday: null, sort_order: 1, widget_type: 'weather', widget_config: {} },
  { id: 'sm2', key: 'm2', name: 'Sam', color: C.rust, role: 'parent', birthday: null, sort_order: 2, widget_type: 'countdown', widget_config: { label: 'Trip to the mountains', date: '2027-03-14' } },
  { id: 'sm3', key: 'm3', name: 'Jordan', color: C.green, role: 'teen', birthday: '2012-05-14', sort_order: 3, widget_type: 'none', widget_config: {} },
  { id: 'sm4', key: 'm4', name: 'Riley', color: C.blue, role: 'child', birthday: '2016-10-02', sort_order: 4, widget_type: 'none', widget_config: {} },
]

const MembersContext = createContext(null)
const SAMPLE_PET = 'Buddy' // generic placeholder for the public demo only

export function MembersProvider({ children }) {
  const [members, setMembers] = useState(isSupabaseConfigured ? [] : SAMPLE_MEMBERS)
  const [familyName, setFamilyName] = useState('family') // generic until loaded
  const [familyId, setFamilyId] = useState(null)
  const [petName, setPetName] = useState(isSupabaseConfigured ? '' : SAMPLE_PET)
  const [wallLayout, setWallLayout] = useState(null)
  const [parentPinHash, setParentPinHash] = useState(null)
  const [wasteSchedule, setWasteSchedule] = useState(null)
  const [myMemberId, setMyMemberId] = useState(isSupabaseConfigured ? null : 'sm2')
  const [isAdmin, setIsAdmin] = useState(!isSupabaseConfigured)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    async function load() {
      const [{ data, error }, fam, { data: userData }] = await Promise.all([
        supabase.from('members').select('id, key, name, color, role, birthday, sort_order, widget_type, widget_config, page_layout, goal_reward_id').order('sort_order', { ascending: true }),
        supabase.from('families').select('id, name, pet_name, wall_layout, parent_pin_hash, waste_schedule').limit(1).maybeSingle(),
        supabase.auth.getUser(),
      ])
      if (!active) return
      // Fall back to placeholders only if the query failed (e.g. signed out).
      if (error || !data) setMembers(SAMPLE_MEMBERS)
      else if (data.length) setMembers(data)
      if (fam?.data) {
        setFamilyId(fam.data.id)
        if (fam.data.name) setFamilyName(fam.data.name)
        setPetName(fam.data.pet_name || '')
        setWallLayout(fam.data.wall_layout || null)
        setParentPinHash(fam.data.parent_pin_hash || null)
        setWasteSchedule(fam.data.waste_schedule || null)
      }
      if (userData?.user) {
        const { data: prof } = await supabase.from('profiles').select('member_id, is_admin, must_change_password').eq('id', userData.user.id).maybeSingle()
        if (active) {
          setMyMemberId(prof?.member_id ?? null)
          setIsAdmin(prof?.is_admin ?? false)
          setMustChangePassword(prof?.must_change_password ?? false)
        }
      }
      setLoading(false)
    }
    load()
    const channel = supabase
      .channel('family-roster')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'families' }, load)
      .subscribe()
    // Re-fetch once auth is ready. The first load() on mount can race ahead of
    // the persisted session being restored (so it runs unauthenticated and gets
    // nothing); this re-runs it with the real session, and on later sign-in.
    // Deferred with setTimeout: load() calls supabase.auth.getUser() and runs
    // queries, and awaiting Supabase calls *inside* this callback deadlocks the
    // auth lock (the app then sticks on "Loading…" forever; seen on the wall).
    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      setTimeout(load, 0)
    })
    return () => {
      active = false
      supabase.removeChannel(channel)
      authSub.subscription.unsubscribe()
    }
  }, [])

  const byKey = (key) => members.find((m) => m.key === key)
  // colorFor(key) for a person; colorFor(event) uses the event's calendar
  // colour when one is set, else the (first) owner's colour.
  const colorFor = (keyOrEvent) => {
    if (keyOrEvent && typeof keyOrEvent === 'object') return keyOrEvent.color || colorFor(keyOrEvent.person_key)
    return keyOrEvent === 'family' ? C.family : byKey(keyOrEvent)?.color || C.muted
  }
  const nameFor = (key) => (key === 'family' ? 'Family' : byKey(key)?.name || '')
  const me = members.find((m) => m.id === myMemberId) ?? null

  // Link the signed-in account to a household member (one-time "who are you").
  async function setMe(memberId) {
    if (!isSupabaseConfigured) {
      setMyMemberId(memberId)
      return
    }
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return
    await supabase.from('profiles').update({ member_id: memberId }).eq('id', userData.user.id)
    setMyMemberId(memberId)
  }

  // Clear the "must change password" flag after the user sets a new one.
  async function clearMustChangePassword() {
    setMustChangePassword(false)
    if (!isSupabaseConfigured) return
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return
    await supabase.from('profiles').update({ must_change_password: false }).eq('id', userData.user.id)
  }

  // Family settings (name, pet, hub layout). Admin-only at the DB level.
  async function updateFamily(patch) {
    if (patch.name !== undefined) setFamilyName(patch.name)
    if (patch.pet_name !== undefined) setPetName(patch.pet_name)
    if (patch.wall_layout !== undefined) setWallLayout(patch.wall_layout)
    if (patch.parent_pin_hash !== undefined) setParentPinHash(patch.parent_pin_hash)
    if (patch.waste_schedule !== undefined) setWasteSchedule(patch.waste_schedule)
    if (!isSupabaseConfigured || !familyId) return
    await supabase.from('families').update(patch).eq('id', familyId)
  }

  // Roster editing. Realtime reloads the list after a live write.
  async function addMember(patch) {
    if (!isSupabaseConfigured) {
      setMembers((ms) => [...ms, { id: 'sm' + Date.now(), key: 'm' + Date.now(), birthday: null, widget_type: 'none', widget_config: {}, sort_order: ms.length + 1, ...patch }])
      return
    }
    await supabase.from('members').insert({ key: 'm' + Date.now().toString(36), sort_order: members.length + 1, ...patch })
  }
  async function updateMember(id, patch) {
    if (!isSupabaseConfigured) {
      setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)))
      return
    }
    const { error } = await supabase.from('members').update(patch).eq('id', id)
    if (error) throw error
    // Show the change straight away (don't wait for the live update, which
    // doesn't always arrive for this table).
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }
  async function removeMember(id) {
    if (!isSupabaseConfigured) {
      setMembers((ms) => ms.filter((m) => m.id !== id))
      return
    }
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) throw error
  }

  return (
    <MembersContext.Provider value={{ members, familyName, familyId, petName, wallLayout, parentPinHash, wasteSchedule, loading, byKey, colorFor, nameFor, me, setMe, isAdmin, mustChangePassword, clearMustChangePassword, updateFamily, addMember, updateMember, removeMember }}>
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
