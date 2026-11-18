import { useFamilyTable, insertRow, deleteRow, deleteWhere, todayISO } from './db.js'

// Sample chores + today's completion logs (unconfigured demo). Shaped like DB
// rows so the same render code serves both live and sample.
const T = todayISO()
export const SAMPLE_CHORES = [
  { id: 'c1', member_key: 'm1', title: 'Walk the dog', repeat: 'daily', days: [], points: 0, active: true },
  { id: 'c2', member_key: 'm1', title: 'Laundry', repeat: 'weekly', days: [1, 4], points: 0, active: true },
  { id: 'c3', member_key: 'm1', title: 'Groceries', repeat: 'weekly', days: [6], points: 0, active: true },
  { id: 'c4', member_key: 'm2', title: 'Load dishwasher', repeat: 'daily', days: [], points: 0, active: true },
  { id: 'c5', member_key: 'm2', title: 'Make lunches', repeat: 'daily', days: [], points: 0, active: true },
  { id: 'c6', member_key: 'm2', title: 'Take out garbage', repeat: 'weekly', days: [2], points: 0, active: true },
  { id: 'c7', member_key: 'm3', title: 'Empty dishwasher', repeat: 'daily', days: [], points: 5, active: true },
  { id: 'c8', member_key: 'm3', title: 'Take out recycling', repeat: 'weekly', days: [3], points: 5, active: true },
  { id: 'c9', member_key: 'm4', title: 'Make bed', repeat: 'daily', days: [], points: 5, active: true },
  { id: 'c10', member_key: 'm4', title: 'Read 20 minutes', repeat: 'daily', days: [], points: 10, active: true },
]
export const SAMPLE_LOGS = [
  { id: 'l1', chore_id: 'c1', member_key: 'm1', log_date: T, points: 0 },
  { id: 'l4', chore_id: 'c4', member_key: 'm2', log_date: T, points: 0 },
  { id: 'l5', chore_id: 'c5', member_key: 'm2', log_date: T, points: 0 },
  { id: 'l7', chore_id: 'c7', member_key: 'm3', log_date: T, points: 5 },
  { id: 'l9', chore_id: 'c9', member_key: 'm4', log_date: T, points: 5 },
]

export const useChores = () => useFamilyTable('chores', { order: { column: 'created_at' }, sample: SAMPLE_CHORES })
export const useChoreLogs = () => useFamilyTable('chore_logs', { sample: SAMPLE_LOGS })

const weekdayOf = (iso) => new Date(iso + 'T00:00:00').getDay() // 0=Sun..6=Sat

export function isDueOn(chore, iso, logs) {
  if (!chore.active) return false
  if (chore.repeat === 'daily') return true
  if (chore.repeat === 'weekly') return (chore.days || []).includes(weekdayOf(iso))
  // once: due until it has ever been completed
  return !logs.some((l) => l.chore_id === chore.id)
}

// Everyone a chore is assigned to. Older rows only have member_key.
export function assigneesOf(chore) {
  if (chore.member_keys?.length) return chore.member_keys
  return chore.member_key ? [chore.member_key] : []
}

// 'each' = every assignee ticks their own; 'any' = one tick clears it for all.
// A chore with one (or no) assignee behaves the same either way.
export const isEachChore = (chore) => chore.shared_mode !== 'any' && assigneesOf(chore).length > 1

// Is the chore done on a date, from a given person's point of view?
// For an 'each' chore that means *their* tick; otherwise any tick counts.
export function isDone(logs, chore, iso, memberKey = null) {
  return logs.some(
    (l) => l.chore_id === chore.id && l.log_date === iso && (!isEachChore(chore) || !memberKey || l.member_key === memberKey),
  )
}

// Pass as memberKey to get the chores nobody is assigned to ("Anyone").
export const ANYONE = '__anyone'

// Chores due today for a member (or all members when memberKey is null, or
// the unassigned ones for ANYONE).
export function dueChores(chores, logs, memberKey, iso = todayISO()) {
  const forWho = (c) => {
    if (memberKey === ANYONE) return assigneesOf(c).length === 0
    return memberKey ? assigneesOf(c).includes(memberKey) : true
  }
  return chores.filter((c) => forWho(c) && isDueOn(c, iso, logs))
}

export async function addChore({ member_keys, shared_mode, title, repeat, days, points }) {
  const keys = member_keys || []
  return insertRow('chores', {
    member_key: keys[0] || null,
    member_keys: keys,
    shared_mode: shared_mode === 'any' ? 'any' : 'each',
    title,
    repeat,
    days: days || [],
    points: points || 0,
  })
}
export const removeChore = (id) => deleteRow('chores', id)

// Toggle a chore's completion for a date. memberKey is who is ticking it: for
// an 'each' chore only their own tick changes; otherwise the single shared
// tick is set (credited to whoever tapped) or cleared for everyone.
export async function toggleChore(chore, iso, done, memberKey = null) {
  const who = memberKey || (assigneesOf(chore).length === 1 ? assigneesOf(chore)[0] : null)
  if (isEachChore(chore)) {
    if (!who) return // an 'each' chore needs to know whose tick this is
    if (done) await deleteWhere('chore_logs', { chore_id: chore.id, log_date: iso, member_key: who })
    else await insertRow('chore_logs', { chore_id: chore.id, member_key: who, log_date: iso, points: chore.points || 0 })
    return
  }
  if (done) {
    await deleteWhere('chore_logs', { chore_id: chore.id, log_date: iso })
  } else {
    await insertRow('chore_logs', { chore_id: chore.id, member_key: who, log_date: iso, points: chore.points || 0 })
  }
}

// ---------- rewards ----------
export const SAMPLE_REWARDS = [
  { id: 'rw1', title: 'Pick movie night', cost: 20 },
  { id: 'rw2', title: 'Extra screen time', cost: 30 },
  { id: 'rw3', title: 'Ice cream trip', cost: 50 },
]
export const useRewards = () => useFamilyTable('rewards', { order: { column: 'cost' }, sample: SAMPLE_REWARDS })
export const addReward = ({ title, cost }) => insertRow('rewards', { title, cost: cost || 0 })
export const removeReward = (id) => deleteRow('rewards', id)

// Points a member has earned this week (Mon..Sun containing today).
export function pointsThisWeek(logs, memberKey) {
  const now = new Date()
  const day = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day)
  monday.setHours(0, 0, 0, 0)
  return logs
    .filter((l) => l.member_key === memberKey && new Date(l.log_date + 'T00:00:00') >= monday)
    .reduce((sum, l) => sum + (l.points || 0), 0)
}
