import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { C } from '../theme.js'

// Gate for authenticated areas. The wall kiosk logs in once and the session
// persists, so after first setup the Pi lands straight on the hub.
export default function Protected({ children }) {
  const { session, loading, configured } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: C.cream,
          color: C.muted,
          fontSize: 22,
        }}
      >
        Loading…
      </div>
    )
  }

  if (!configured || !session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
