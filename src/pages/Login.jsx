import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { C, card } from '../theme.js'

const DEVICE_MODE = import.meta.env.VITE_DEVICE_MODE
const HOME_ROUTE = DEVICE_MODE === 'wall' ? '/wall/hub' : '/app/today'

export default function Login() {
  const { session, configured, signInWithPassword, signInWithMagicLink } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('password') // 'password' | 'magic'
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  if (session) {
    const to = location.state?.from || HOME_ROUTE
    return <Navigate to={to} replace />
  }

  async function submit(e) {
    e.preventDefault()
    setStatus(null)
    setBusy(true)
    try {
      if (mode === 'password') {
        const { error } = await signInWithPassword(email.trim(), password)
        if (error) setStatus({ kind: 'error', text: error.message })
      } else {
        const { error } = await signInWithMagicLink(email.trim())
        if (error) setStatus({ kind: 'error', text: error.message })
        else setStatus({ kind: 'ok', text: 'Check your email for a sign-in link.' })
      }
    } finally {
      setBusy(false)
    }
  }

  const input = {
    font: 'inherit',
    fontSize: 17,
    padding: '14px 16px',
    borderRadius: 14,
    border: `2px solid ${C.border}`,
    background: C.card,
    color: C.ink,
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: C.cream,
      }}
    >
      <div style={card({ padding: 32, width: 'min(420px, 100%)', display: 'flex', flexDirection: 'column', gap: 18 })}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>Family Dashboard</div>
          <div style={{ fontSize: 16, color: C.muted, marginTop: 4 }}>Sign in to your account</div>
        </div>

        {!configured && (
          <div style={{ background: C.dangerTint, color: C.danger, borderRadius: 12, padding: 14, fontSize: 15 }}>
            Supabase is not configured yet. Set VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY in <code>.env.local</code> (see
            <code> .env.example</code>), then restart.
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
            />
          </label>

          {mode === 'password' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={input}
              />
            </label>
          )}

          {status && (
            <div
              style={{
                fontSize: 15,
                color: status.kind === 'error' ? C.danger : C.tealText,
              }}
            >
              {status.text}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !configured}
            style={{
              all: 'unset',
              cursor: busy || !configured ? 'default' : 'pointer',
              textAlign: 'center',
              background: C.rust,
              color: '#FFFFFF',
              borderRadius: 14,
              padding: 16,
              fontSize: 17,
              fontWeight: 700,
              opacity: busy || !configured ? 0.6 : 1,
            }}
          >
            {busy ? 'Working…' : mode === 'password' ? 'Sign in' : 'Send sign-in link'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'password' ? 'magic' : 'password')
            setStatus(null)
          }}
          style={{ all: 'unset', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: C.tealText, textAlign: 'center' }}
        >
          {mode === 'password' ? 'Use an email sign-in link instead' : 'Use a password instead'}
        </button>
      </div>
    </div>
  )
}
