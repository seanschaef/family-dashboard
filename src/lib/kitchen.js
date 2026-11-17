import { useFamilyTable, insertRow, updateRow, deleteRow, deleteWhere } from './db.js'

// Monday of the current week as YYYY-MM-DD, and the 7 day ISO strings.
export function weekDates(from = new Date()) {
  const d = new Date(from)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return x.toISOString().slice(0, 10)
  })
}

const W = weekDates()
export const SAMPLE_MEALS = [
  { id: 'me1', meal_date: W[0], title: 'Butter chicken', ingredients: 'onions, cream, rice' },
  { id: 'me2', meal_date: W[1], title: 'Tacos', ingredients: 'tortillas, beef, salsa' },
  { id: 'me4', meal_date: W[4], title: 'Pizza night', ingredients: '' },
]

export const useMeals = () => useFamilyTable('meals', { order: { column: 'meal_date' }, sample: SAMPLE_MEALS })
export const mealFor = (meals, iso) => meals.find((m) => m.meal_date === iso)

export async function setMeal(existingId, meal_date, title, ingredients) {
  const patch = { title, ingredients: ingredients || null }
  if (existingId) await updateRow('meals', existingId, patch)
  else await insertRow('meals', { meal_date, ...patch })
}
export const removeMeal = (id) => deleteRow('meals', id)

// ---------- groceries ----------
export const SAMPLE_GROCERIES = [
  { id: 'g1', label: 'Apples', section: 'Produce', added_by_member_key: 'm4', source: 'manual', done: false },
  { id: 'g2', label: 'Spinach', section: 'Produce', added_by_member_key: null, source: 'meal', done: false },
  { id: 'g3', label: 'Onions', section: 'Produce', added_by_member_key: null, source: 'meal', done: true },
  { id: 'g4', label: 'Pasta', section: 'Pantry', added_by_member_key: null, source: 'meal', done: false },
  { id: 'g5', label: 'Granola bars', section: 'Pantry', added_by_member_key: 'm3', source: 'manual', done: false },
  { id: 'g6', label: 'Dog food', section: 'Pantry', added_by_member_key: 'm1', source: 'manual', done: false },
]

export const useGroceries = () => useFamilyTable('grocery_items', { order: { column: 'created_at' }, sample: SAMPLE_GROCERIES })
export const addGrocery = ({ label, section, added_by_member_key, source }) =>
  insertRow('grocery_items', { label, section: section || 'Other', added_by_member_key: added_by_member_key || null, source: source || 'manual' })
export const toggleGrocery = (id, done) => updateRow('grocery_items', id, { done })
export const clearCheckedGroceries = () => deleteWhere('grocery_items', { done: true })

// Push a meal's comma-separated ingredients onto the grocery list.
export async function addIngredientsToGroceries(ingredients, memberKey) {
  const items = String(ingredients || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const label of items) {
    await insertRow('grocery_items', { label, section: 'Other', added_by_member_key: memberKey || null, source: 'meal' })
  }
  return items.length
}
