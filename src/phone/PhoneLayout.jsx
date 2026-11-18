import { Outlet } from 'react-router-dom'
import PhoneNav from '../components/PhoneNav.jsx'
import ForcePasswordChange from './ForcePasswordChange.jsx'
import { useMembers } from '../lib/members.jsx'
import { C } from '../theme.js'

// Phone / computer app shell. Fills the device; centred with a max width on
// larger screens so it still looks right on a laptop.
//
// The whole window is the scroll area (not just the centred column), so
// scrolling works anywhere on the screen, including the side margins on a
// tablet or laptop. The tab bar sticks to the bottom.
export default function PhoneLayout() {
  const { mustChangePassword } = useMembers()
  return (
    <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto', background: C.cream }}>
      <div
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 560,
          margin: '0 auto',
          background: C.cream,
        }}
      >
        <main
          style={{
            flexGrow: 1,
            padding: '28px 20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            paddingTop: 'max(28px, env(safe-area-inset-top))',
          }}
        >
          {mustChangePassword ? <ForcePasswordChange /> : <Outlet />}
        </main>
        {!mustChangePassword && (
          <div style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
            <PhoneNav />
          </div>
        )}
      </div>
    </div>
  )
}
