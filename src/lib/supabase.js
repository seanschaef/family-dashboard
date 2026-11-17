import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Surfaces a clear message during local dev instead of a cryptic network error
// when .env.local has not been filled in yet.
export const isSupabaseConfigured = Boolean(url && anon)

if (!isSupabaseConfigured) {
  console.warn(
    '[family-dashboard] Supabase is not configured. Copy .env.example to ' +
      '.env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

// A harmless placeholder client when env is missing keeps the UI mountable
// (login screen will show a "not configured" notice) rather than crashing.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anon || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
