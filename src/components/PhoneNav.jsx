import { NavLink } from 'react-router-dom'
import { PHONE_NAV } from '../config/people.js'
import { C } from '../theme.js'
import Icon from './Icon.jsx'

// Bottom tab bar for the phone app. Active tab uses the teal section colour.
export default function PhoneNav() {
  return (
    <nav
      aria-label="App sections"
      style={{
        height: 84,
        background: C.card,
        borderTop: `2px solid ${C.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {PHONE_NAV.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}
        >
          {({ isActive }) => {
            const color = isActive ? C.meals : C.muted
            const iconName = tab.key === 'chores' ? 'checkThin' : tab.icon
            return (
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  color,
                  fontSize: 12,
                  fontWeight: isActive ? 800 : 500,
                }}
              >
                <Icon name={iconName} size={24} color={color} />
                {tab.label}
              </span>
            )
          }}
        </NavLink>
      ))}
    </nav>
  )
}
