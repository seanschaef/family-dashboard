import { Outlet } from 'react-router-dom'
import PhoneNav from '../components/PhoneNav.jsx'
import ForcePasswordChange from './ForcePasswordChange.jsx'
import { useMembers } from '../lib/members.jsx'
import { C } from '../theme.js'

// Phone / computer app shell. Fills the device; centred with a max width on
// larger screens so it still looks right on a laptop.
export default function PhoneLayout() {
  const { mustChangePassword } = useMembers()
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 560,
        margin: '0 auto',
        background: C.cream,
      }}
    >
      <main
        className="no-scrollbar"
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '28px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          paddingTop: 'max(28px, env(safe-area-inset-top))',
        }}
      >
        {mustChangePassword ? <ForcePasswordChange /> : <Outlet />}
      </main>
      {!mustChangePassword && <PhoneNav />}
    </div>
  )
}
