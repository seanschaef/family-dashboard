import { useState } from 'react'
import { C } from '../theme.js'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'

// Shown on the phone app when the signed-in account still has the temporary
// password (profiles.must_change_password). Blocks the app until a new password
// is set. Supabase enforces a 6-character minimum on the new password.
export default function ForcePasswordChange() {
  const { updatePassword, signOut } = useAuth()
  const { clearMustChangePassword } = useMembers()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function save(e) {
    e.preventDefault()
    setError(null)
    if (pw.length < 6) return setError('Use at least 6 characters.')
    if (pw !== confirm) return setError('The two passwords do not match.')
    setBusy(true)
    const { error: upErr } = await updatePassword(pw)
    if (upErr) {
      setBusy(false)
      return setError(upErr.message)
    }
    await clearMustChangePassword()
    // clearMustChangePassword flips the gate; the app renders normally next.
  }

  const input = { font: 'inherit', fontSize: 17, padding: '12px 14px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink }

  return (
    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={save} style={{ width: '100%', maxWidth: 420, background: C.card, border: `2px solid ${C.border}`, borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Set your password</div>
        <div style={{ fontSize: 15, color: C.muted }}>Replace the temporary password with one only you know. At least 6 characters.</div>
        <input aria-label="New password" type="password" autoComplete="new-password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} style={input} />
        <input aria-label="Confirm password" type="password" autoComplete="new-password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={input} />
        {error && <div style={{ fontSize: 14, color: '#8A3E1F' }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ all: 'unset', cursor: busy ? 'default' : 'pointer', textAlign: 'center', background: C.rust, color: '#FFFFFF', borderRadius: 14, padding: '14px 24px', fontSize: 16, fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
        <button type="button" onClick={signOut} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', fontSize: 14, fontWeight: 700, color: C.tealText }}>Sign out</button>
      </form>
    </div>
  )
}
