import { C } from '../theme.js'

// Navigation structure. The person entries are built from the database roster
// at runtime (see buildWallNav); only the fixed, non-person pages live here.

const WALL_HEAD = [
  { key: 'hub', label: 'Family', to: '/wall/hub', color: C.family, icon: 'home' },
  { key: 'calendar', label: 'Calendar', to: '/wall/calendar', color: C.meals, icon: 'calendarGrid' },
]
const WALL_TAIL = [
  { key: 'meals', label: 'Meals', to: '/wall/meals', color: C.meals, icon: 'utensils' },
  { key: 'home', label: 'Home', to: '/wall/home', color: C.home, icon: 'bulb' },
]

// Full wall nav: fixed pages with the member pages inserted in the middle.
export function buildWallNav(members) {
  const people = members.map((m) => ({
    key: m.key,
    label: m.name,
    to: `/wall/member/${m.key}`,
    color: m.color,
    letter: (m.name[0] || '?').toUpperCase(),
  }))
  return [...WALL_HEAD, ...people, ...WALL_TAIL]
}

// Phone tabs (no person entries).
export const PHONE_NAV = [
  { key: 'today', label: 'Today', to: '/app/today', icon: 'calendar' },
  { key: 'calendar', label: 'Calendar', to: '/app/calendar', icon: 'calendarGrid' },
  { key: 'groceries', label: 'Groceries', to: '/app/groceries', icon: 'cart' },
  { key: 'meals', label: 'Meals', to: '/app/meals', icon: 'utensils' },
  { key: 'chores', label: 'Chores', to: '/app/chores', icon: 'check' },
  { key: 'photos', label: 'Photos', to: '/app/photos', icon: 'photos' },
  { key: 'settings', label: 'Settings', to: '/app/settings', icon: 'gear' },
]

// Generic placeholder pet for the public demo only. The real pet name lives in
// the database (families.pet_name) and is loaded at runtime.
export const PET_NAME = 'Buddy'
