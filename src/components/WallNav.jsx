import { NavLink } from 'react-router-dom'
import { buildWallNav } from '../config/people.js'
import { useMembers } from '../lib/members.jsx'
import { C } from '../theme.js'
import Icon from './Icon.jsx'

// Bottom page bar shown on every wall screen. Tap to jump; the active page
// gets the ringed avatar + bold label (as in the mockups). Member entries come
// from the database roster.
export default function WallNav() {
  const { members } = useMembers()
  const items = buildWallNav(members)
  return (
    <nav
      aria-label="Pages"
      style={{
        height: 128,
        boxSizing: 'border-box',
        background: C.card,
        borderRadius: 36,
        border: `2px solid ${C.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 12px',
        flexShrink: 0,
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: C.ink,
          }}
        >
          {({ isActive }) => (
            <>
              <span
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: item.color,
                  color: '#FFFFFF',
                  fontSize: 28,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: isActive ? `4px solid ${C.ink}` : 'none',
                  outlineOffset: 3,
                }}
              >
                {item.icon ? <Icon name={item.icon} size={30} color="#FFFFFF" /> : item.letter}
              </span>
              <span style={{ fontSize: 19, fontWeight: isActive ? 800 : 500 }}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
