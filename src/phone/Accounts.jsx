import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../theme.js'
import { PageHeader } from './ui.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useMembers } from '../lib/members.jsx'
import { listAccounts, createAccount, resetPassword, setAccountAdmin, setAccountMember, deleteAccount } from '../lib/adminUsers.js'

// Admin-only: manage the family's logins. Everything runs through the
// admin-users Edge Function, which checks the caller is an admin and that every
// account touched is in the same family. The service key never reaches here.

const input = { font: 'inherit', fontSize: 16, padding: '10px 12px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }
const cardStyle = { background: C.card, border: `2px solid ${C.border}`, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }
const label = { fontSize: 13, fontWeight: 700, color: C.muted }
const linkBtn = (color = C.tealText) => ({ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color })

function Chip({ active, color = C.meals, children, onClick, disabled }) {
  return (
    <button type="button" disabled={disabled} aria-pressed={active} onClick={onClick} style={{ all: 'unset', cursor: disabled ? 'default' : 'pointer', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? '2px solid transparent' : `2px solid ${C.border}`, borderRadius: 999, padding: '6px 12px', fontSize: 14, fontWeight: 600, opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  )
}

// A readable temporary password: three short words + two digits. The person is
// made to choose their own on first sign-in (must_change_password).
function tempPassword() {
  const words = ['maple', 'river', 'cedar', 'otter', 'prairie', 'aspen', 'comet', 'harbor', 'meadow', 'pebble', 'willow', 'bison', 'spruce', 'falcon', 'lantern']
  const pick = () => words[crypto.getRandomValues(new Uint32Array(1))[0] % words.length]
  const n = String(crypto.getRandomValues(new Uint32Array(1))[0] % 90 + 10)
  return `${pick()}-${pick()}-${pick()}-${n}`
}

function PasswordNotice({ email, password, onClose }) {
  return (
    <div role="status" style={{ background: C.tealTint, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 15, fontWeight: 700 }}>Temporary password for {email}</div>
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 18, userSelect: 'all' }}>{password}</div>
      <div style={{ fontSize: 13, color: C.muted }}>Share it with them privately. They&apos;ll be asked to pick their own when they first sign in. It won&apos;t be shown again.</div>
      <button type="button" onClick={onClose} style={{ ...linkBtn(), alignSelf: 'flex-start' }}>Done</button>
    </div>
  )
}

function AccountRow({ acct, members, isSelf, onChanged, onError }) {
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn) => {
    setBusy(true)
    try {
      await fn()
      await onChanged()
    } catch (e) {
      onError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const person = members.find((m) => m.id === acct.member_id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 15, background: person?.color || C.toggleOff, color: '#FFFFFF', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {(person?.name?.[0] || acct.email[0] || '?').toUpperCase()}
        </span>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{acct.email}{isSelf ? ' (you)' : ''}</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {[person ? person.name : 'Not linked to a person', acct.is_admin ? 'Admin' : null, acct.must_change_password ? 'Temporary password' : null].filter(Boolean).join(' · ')}
          </div>
        </div>
        <button type="button" onClick={() => setOpen((v) => !v)} style={linkBtn()}>{open ? 'Done' : 'Edit'}</button>
      </div>

      {notice && <PasswordNotice email={acct.email} password={notice} onClose={() => setNotice(null)} />}

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: busy ? 0.6 : 1 }}>
          <div style={label}>Linked person</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {members.map((m) => (
              <Chip key={m.id} active={acct.member_id === m.id} color={m.color} disabled={busy} onClick={() => run(() => setAccountMember(acct.user_id, m.id))}>{m.name}</Chip>
            ))}
            <Chip active={!acct.member_id} disabled={busy} onClick={() => run(() => setAccountMember(acct.user_id, null))}>Nobody (e.g. the wall)</Chip>
          </div>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15, opacity: isSelf ? 0.6 : 1 }}>
            <input type="checkbox" checked={acct.is_admin} disabled={busy || isSelf} onChange={(e) => run(() => setAccountAdmin(acct.user_id, e.target.checked))} />
            Admin (can manage people, settings and logins)
          </label>
          {isSelf && <div style={{ fontSize: 12, color: C.muted }}>You can&apos;t remove your own admin.</div>}

          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const pw = tempPassword()
                run(async () => {
                  await resetPassword(acct.user_id, pw)
                  setNotice(pw)
                })
              }}
              style={linkBtn()}
            >
              Reset password
            </button>
            {!isSelf && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Delete the login ${acct.email}? They won't be able to sign in. Their person, chores and history stay.`)) {
                    run(() => deleteAccount(acct.user_id))
                  }
                }}
                style={linkBtn(C.danger)}
              >
                Delete login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Accounts() {
  const { configured, user } = useAuth()
  const { members, isAdmin } = useMembers()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [email, setEmail] = useState('')
  const [memberId, setMemberId] = useState(null)
  const [makeAdmin, setMakeAdmin] = useState(false)
  const [created, setCreated] = useState(null)
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await listAccounts()
      setAccounts(data.users || [])
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (configured && isAdmin) refresh()
    else setLoading(false)
  }, [configured, isAdmin, refresh])

  async function onCreate(e) {
    e.preventDefault()
    const addr = email.trim().toLowerCase()
    if (!addr) return
    setCreating(true)
    setError(null)
    const pw = tempPassword()
    try {
      await createAccount(addr, pw, memberId, makeAdmin)
      setCreated({ email: addr, password: pw })
      setEmail('')
      setMemberId(null)
      setMakeAdmin(false)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Logins" />
        <div style={{ fontSize: 15, color: C.muted }}>Only an admin can manage logins.</div>
        <Link to="/app/settings" style={{ fontSize: 15, fontWeight: 700, color: C.tealText }}>‹ Back to Settings</Link>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Logins" subtitle="Who can sign in, passwords and parents" />

      {error && <div style={{ background: C.dangerTint, color: C.danger, borderRadius: 12, padding: 12, fontSize: 14 }}>{error}</div>}

      <form onSubmit={onCreate} style={cardStyle}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>New Login</div>
        <div>
          <div style={label}>Email</div>
          <input aria-label="Email" type="email" required autoComplete="off" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
        </div>
        <div>
          <div style={label}>Which person is this?</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {members.map((m) => (
              <Chip key={m.id} active={memberId === m.id} color={m.color} onClick={() => setMemberId(m.id)}>{m.name}</Chip>
            ))}
            <Chip active={!memberId} onClick={() => setMemberId(null)}>Nobody (e.g. the wall)</Chip>
          </div>
        </div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15 }}>
          <input type="checkbox" checked={makeAdmin} onChange={(e) => setMakeAdmin(e.target.checked)} />
          Make them an admin
        </label>
        <button type="submit" disabled={!configured || creating} style={{ all: 'unset', cursor: 'pointer', textAlign: 'center', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: 12, fontSize: 16, fontWeight: 700, opacity: configured && !creating ? 1 : 0.6 }}>
          {creating ? 'Creating…' : 'Create login'}
        </button>
        <div style={{ fontSize: 12, color: C.muted }}>A temporary password is made for them; they choose their own at first sign-in.</div>
      </form>

      {created && <PasswordNotice email={created.email} password={created.password} onClose={() => setCreated(null)} />}

      <div style={cardStyle}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Logins</div>
        {loading ? (
          <div style={{ fontSize: 15, color: C.muted }}>Loading…</div>
        ) : accounts.length === 0 ? (
          <div style={{ fontSize: 15, color: C.muted }}>No logins found.</div>
        ) : (
          accounts.map((a) => (
            <AccountRow key={a.user_id} acct={a} members={members} isSelf={a.user_id === user?.id} onChanged={refresh} onError={setError} />
          ))
        )}
      </div>
    </>
  )
}
