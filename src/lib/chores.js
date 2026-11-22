import { useFamilyTable, insertRow, updateRow, deleteRow, deleteWhere, todayISO } from './db.js'

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
  // once: due until it has been completed; on the day it's done it stays on
  // the list (ticked) and drops off from the next day.
  return !logs.some((l) => l.chore_id === chore.id && l.log_date < iso)
}

// Everyone a chore is assigned to. Older rows only have member_key.
export function assigneesOf(chore) {
  if (chore.member_keys?.length) return chore.member_keys
  return chore.member_key ? [chore.member_key] : []
}

// Sharing modes:
//   'each'     every assignee ticks their own copy
//   'any'      one tick clears it for all (points to whoever ticked)
//   'together' one job, anyone can pitch in: everyone who ticks it gets the
//              points (e.g. shovelling the driveway)
// A chore with one (or no) assignee behaves like 'any', unless it's 'together'.
export const isTogetherChore = (chore) => chore.shared_mode === 'together'
export const isEachChore = (chore) => !isTogetherChore(chore) && chore.shared_mode !== 'any' && assigneesOf(chore).length > 1
// Chores where each person's tick is their own (each, together).
const perPerson = (chore) => isEachChore(chore) || isTogetherChore(chore)

// Is the chore done on a date, from a given person's point of view?
// For 'each' and 'together' chores that means *their* tick; otherwise (or
// with no person given) any tick counts.
export function isDone(logs, chore, iso, memberKey = null) {
  return logs.some(
    (l) => l.chore_id === chore.id && l.log_date === iso && (!perPerson(chore) || !memberKey || l.member_key === memberKey),
  )
}

// Everyone who ticked a 'together' chore on a date (member keys).
export function helpersOf(logs, chore, iso) {
  return logs.filter((l) => l.chore_id === chore.id && l.log_date === iso && l.member_key).map((l) => l.member_key)
}
const names = (keys, nameFor) => {
  const n = keys.map((k) => nameFor(k) || 'Someone')
  return n.length <= 1 ? n[0] : `${n.slice(0, -1).join(', ')} & ${n[n.length - 1]}`
}

// Pass as memberKey to get the chores nobody is assigned to ("Anyone").
export const ANYONE = '__anyone'

// Chores due today for a member (or all members when memberKey is null, or
// the unassigned ones for ANYONE).
export function dueChores(chores, logs, memberKey, iso = todayISO()) {
  // An unassigned ("Anyone") chore is on everyone's list as well as the Anyone
  // row; one tick by anybody completes it everywhere (see isDone / doneBy).
  const forWho = (c) => {
    const keys = assigneesOf(c)
    if (memberKey === ANYONE) return keys.length === 0
    return memberKey ? keys.length === 0 || keys.includes(memberKey) : true
  }
  return chores.filter((c) => forWho(c) && isDueOn(c, iso, logs))
}

// "Done by Sean" for a chore that more than one person could tick (unassigned,
// or shared 'any one of them'); null when not done or only one person does it.
export function doneByText(logs, chore, iso, nameFor) {
  if (isTogetherChore(chore)) {
    const h = helpersOf(logs, chore, iso)
    return h.length ? `${names(h, nameFor)} helped` : null
  }
  const keys = assigneesOf(chore)
  const shared = keys.length === 0 || (keys.length > 1 && !isEachChore(chore))
  if (!shared) return null
  const by = doneBy(logs, chore, iso)
  if (by === undefined) return null
  return by ? `Done by ${nameFor(by)}` : 'Done'
}

// For a shared chore that someone ELSE did today: their name (or 'Someone'),
// so a person's own list can show "Lewis did it" instead of looking like
// they did it. Null if not done, done by this person, or not a shared chore.
export function doneByOther(logs, chore, iso, memberKey, nameFor) {
  // 'together': others pitching in doesn't tick it off for you (you can still
  // help), so this is only for 'any' / unassigned chores.
  if (isTogetherChore(chore)) return null
  const keys = assigneesOf(chore)
  const shared = keys.length === 0 || (keys.length > 1 && !isEachChore(chore))
  if (!shared) return null
  const by = doneBy(logs, chore, iso)
  if (by === undefined || by === memberKey) return null
  return by ? nameFor(by) || 'Someone' : 'Someone'
}

// Who ticked a shared/unassigned chore on a date (member key, or null if it
// was ticked from the wall's Anyone row). Undefined when it isn't done.
export function doneBy(logs, chore, iso) {
  const log = logs.find((l) => l.chore_id === chore.id && l.log_date === iso)
  return log ? log.member_key : undefined
}

function choreFields({ member_keys, shared_mode, title, repeat, days, points, tag }) {
  const keys = member_keys || []
  return {
    member_key: keys[0] || null,
    member_keys: keys,
    shared_mode: ['any', 'together'].includes(shared_mode) ? shared_mode : 'each',
    title,
    repeat,
    days: repeat === 'weekly' ? days || [] : [],
    points: Math.max(0, Math.min(1000, Math.round(Number(points) || 0))),
    tag: tag === 'pet' ? 'pet' : null,
  }
}
export const addChore = (fields) => insertRow('chores', choreFields(fields))
// Edits apply from now on; past ticks keep the points they were worth.
export const updateChore = (id, fields) => updateRow('chores', id, choreFields(fields))
export const removeChore = (id) => deleteRow('chores', id)

// Toggle a chore's completion for a date. memberKey is who is ticking it: for
// an 'each' chore only their own tick changes; otherwise the single shared
// tick is set (credited to whoever tapped) or cleared for everyone.
export async function toggleChore(chore, iso, done, memberKey = null) {
  const who = memberKey || (assigneesOf(chore).length === 1 ? assigneesOf(chore)[0] : null)
  if (perPerson(chore)) {
    if (!who) return // needs to know whose tick this is
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

// ---------- spending points ----------
// A person's balance = every point they've earned minus what they've spent on
// rewards. Spending is approved by a parent (see phone/Rewards.jsx).
export const useRedemptions = () => useFamilyTable('reward_redemptions', { order: { column: 'created_at', ascending: false }, sample: [] })
export const redeemReward = ({ member_key, reward, approved_by }) =>
  insertRow('reward_redemptions', { member_key, reward_id: reward.id, title: reward.title, cost: reward.cost || 0, approved_by: approved_by || null })
export const undoRedemption = (id) => deleteRow('reward_redemptions', id)

export const pointsEarned = (logs, memberKey) =>
  logs.filter((l) => l.member_key === memberKey).reduce((sum, l) => sum + (l.points || 0), 0)
export const pointsSpent = (redemptions, memberKey) =>
  redemptions.filter((r) => r.member_key === memberKey).reduce((sum, r) => sum + (r.cost || 0), 0)
export const pointsBalance = (logs, redemptions, memberKey) => pointsEarned(logs, memberKey) - pointsSpent(redemptions, memberKey)

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
