import { supabase, isSupabaseConfigured } from './supabase.js'

export const DEFAULT_WALL_SETTINGS = {
  display_enabled: true,
  mode: 'power',
  on_time: '06:30',
  off_time: '22:00',
  weekend_on_time: '08:00',
  weekend_off_time: '22:30',
  dark_enabled: true,
  dark_start: '19:30',
  dark_end: '07:00',
  dark_follow_sun: true,
}

export async function getWallSettings() {
  if (!isSupabaseConfigured) return { ...DEFAULT_WALL_SETTINGS }
  const { data, error } = await supabase
    .from('wall_settings')
    .select('display_enabled, mode, on_time, off_time, weekend_on_time, weekend_off_time, dark_enabled, dark_start, dark_end, dark_follow_sun')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ? { ...DEFAULT_WALL_SETTINGS, ...data } : { ...DEFAULT_WALL_SETTINGS }
}

// Upsert the single per-family row. family_id defaults to auth_family_id().
export async function saveWallSettings(patch) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data: existing } = await supabase.from('wall_settings').select('id').limit(1).maybeSingle()
  if (existing) {
    const { error } = await supabase
      .from('wall_settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('wall_settings').insert(patch)
    if (error) throw error
  }
}
