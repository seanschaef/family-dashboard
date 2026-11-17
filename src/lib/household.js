import { useFamilyTable, insertRow, updateRow, deleteRow, deleteWhere, todayISO } from './db.js'

// ---------- reminders / to-dos ----------
export const SAMPLE_REMINDERS = [
  { id: 'r1', member_key: null, text: 'Sign field trip form', done: false },
  { id: 'r2', member_key: null, text: 'Recycling day', done: false },
  { id: 'r3', member_key: 'm2', text: 'Book winter tire swap', done: false },
  { id: 'r4', member_key: 'm1', text: 'Call the dentist', done: false },
]

export const useReminders = () => useFamilyTable('reminders', { order: { column: 'created_at' }, sample: SAMPLE_REMINDERS })
export const addReminder = ({ member_key, text }) => insertRow('reminders', { member_key: member_key || null, text })
export const toggleReminder = (id, done) => updateRow('reminders', id, { done })
export const removeReminder = (id) => deleteRow('reminders', id)

// ---------- pet care log ----------
export const PET_TASKS = ['breakfast', 'walk', 'dinner']
const T = todayISO()
export const SAMPLE_PET_LOGS = [{ id: 'p1', task: 'breakfast', log_date: T, by_member_key: 'm2' }]

export const usePetLog = () => useFamilyTable('pet_logs', { sample: SAMPLE_PET_LOGS })
export const petDone = (logs, task, iso = todayISO()) => logs.some((l) => l.task === task && l.log_date === iso)
export const petBy = (logs, task, iso = todayISO()) => logs.find((l) => l.task === task && l.log_date === iso)?.by_member_key

export async function togglePet(task, iso, done, byMemberKey) {
  if (done) await deleteWhere('pet_logs', { task, log_date: iso })
  else await insertRow('pet_logs', { task, log_date: iso, by_member_key: byMemberKey || null })
}
