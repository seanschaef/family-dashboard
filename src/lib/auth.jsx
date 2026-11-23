import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'

const AuthContext = createContext(null)

// The wall (Pi kiosk) can't type a password. If it ever finds itself signed
// out, it asks the Pi's local agent for a fresh session (the agent signs in
// with the wall account from the Pi's .env.local and only answers requests
// from the Pi itself). Tried at most once a minute.
const IS_WALL = import.meta.env.VITE_DEVICE_MODE === 'wall'
const AGENT_URL = import.meta.env.VITE_PHOTO_AGENT_URL || ''
let lastWallSignIn = 0
async function wallSignIn() {
  if (!IS_WALL || !AGENT_URL || Date.now() - lastWallSignIn < 60000) return
  lastWallSignIn = Date.now()
  try {
    const r = await fetch(`${AGENT_URL}/wall-session`, { cache: 'no-store' })
    if (!r.ok) return
    const t = await r.json()
    if (t.access_token && t.refresh_token) await supabase.auth.setSession({ access_token: t.access_token, refresh_token: t.refresh_token })
  } catch {
    /* agent not running: stays signed out, tries again later */
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
      if (!data.session) wallSignIn()
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      // Deferred: awaiting Supabase calls inside this callback deadlocks its lock.
      if (event === 'SIGNED_OUT' || !s) setTimeout(wallSignIn, 5000)
    })
    // And a slow safety net, in case a sign-out happened while asleep.
    const retry = IS_WALL ? setInterval(() => supabase.auth.getSession().then(({ data }) => { if (!data.session) wallSignIn() }), 5 * 60000) : null
    return () => {
      active = false
      sub.subscription.unsubscribe()
      if (retry) clearInterval(retry)
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    configured: isSupabaseConfigured,
    signInWithPassword: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signInWithMagicLink: (email) =>
      supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      }),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    // Only this device: a global sign-out would also sign the wall out (it
    // uses the same account).
    signOut: () => supabase.auth.signOut({ scope: 'local' }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
