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
// Store sections in a shelf-friendly order.
export const GROCERY_SECTIONS = ['Produce', 'Dairy & eggs', 'Meat & fish', 'Bakery', 'Frozen', 'Pantry', 'Drinks', 'Household', 'Other']

// Keyword → section, checked in this order so specific beats generic
// (e.g. "dog food" is Household before "food" could fall to Pantry).
const SECTION_KEYWORDS = [
  ['Household', ['paper towel', 'toilet', 'detergent', 'soap', 'dish soap', 'cleaner', 'garbage', 'trash bag', 'foil', 'wrap', 'ziploc', 'diaper', 'wipes', 'shampoo', 'toothpaste', 'dog food', 'cat food', 'litter', 'batteries', 'napkin', 'tissue']],
  ['Produce', ['apple', 'banana', 'lettuce', 'spinach', 'onion', 'tomato', 'potato', 'carrot', 'pepper', 'cucumber', 'berry', 'berries', 'strawberr', 'blueberr', 'grape', 'orange', 'lemon', 'lime', 'avocado', 'broccoli', 'celery', 'mushroom', 'garlic', 'kale', 'salad', 'lettuce', 'fruit', 'veg', 'cilantro', 'herb', 'corn', 'pea', 'bean sprout']],
  ['Dairy & eggs', ['milk', 'cheese', 'butter', 'yogurt', 'yoghurt', 'cream', 'egg', 'sour cream', 'cottage']],
  ['Meat & fish', ['chicken', 'beef', 'pork', 'bacon', 'sausage', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp', 'ham', 'ground', 'steak', 'meat']],
  ['Bakery', ['bread', 'bun', 'bagel', 'tortilla', 'croissant', 'muffin', 'roll', 'pita', 'naan']],
  ['Frozen', ['frozen', 'ice cream', 'popsicle', 'frozen pizza']],
  ['Drinks', ['juice', 'soda', 'pop', 'coffee', 'tea', 'sparkling', 'water', 'wine', 'beer', 'cola']],
  ['Pantry', ['pasta', 'rice', 'flour', 'sugar', 'salt', 'oil', 'sauce', 'bean', 'soup', 'cereal', 'cracker', 'granola', 'snack', 'chip', 'cookie', 'spice', 'can', 'peanut', 'jam', 'honey', 'oat', 'noodle', 'ketchup', 'mustard', 'vinegar', 'broth', 'stock', 'tortilla chip']],
]

// Best-guess section for a label; 'Other' when nothing matches.
export function guessSection(label) {
  const t = String(label || '').toLowerCase()
  for (const [section, words] of SECTION_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return section
  }
  return 'Other'
}

export const SAMPLE_GROCERIES = [
  { id: 'g1', label: 'Apples', section: 'Produce', added_by_member_key: 'm4', source: 'manual', done: false },
  { id: 'g2', label: 'Spinach', section: 'Produce', added_by_member_key: null, source: 'meal', done: false },
  { id: 'g3', label: 'Milk', section: 'Dairy & eggs', added_by_member_key: 'm1', source: 'manual', done: false },
  { id: 'g4', label: 'Pasta', section: 'Pantry', added_by_member_key: null, source: 'meal', done: false },
  { id: 'g5', label: 'Granola bars', section: 'Pantry', added_by_member_key: 'm3', source: 'manual', done: false },
  { id: 'g6', label: 'Dog food', section: 'Household', added_by_member_key: 'm1', source: 'manual', done: false },
]

export const useGroceries = () => useFamilyTable('grocery_items', { order: { column: 'created_at' }, sample: SAMPLE_GROCERIES })
export const addGrocery = ({ label, section, added_by_member_key, source }) =>
  insertRow('grocery_items', { label, section: section || guessSection(label), added_by_member_key: added_by_member_key || null, source: source || 'manual' })
export const toggleGrocery = (id, done) => updateRow('grocery_items', id, { done })
export const updateGrocerySection = (id, section) => updateRow('grocery_items', id, { section })
export const clearCheckedGroceries = () => deleteWhere('grocery_items', { done: true })

// Push a meal's comma-separated ingredients onto the grocery list.
export async function addIngredientsToGroceries(ingredients, memberKey) {
  const items = String(ingredients || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const label of items) {
    await insertRow('grocery_items', { label, section: guessSection(label), added_by_member_key: memberKey || null, source: 'meal' })
  }
  return items.length
}

// ---------- recurring staples ----------
export const SAMPLE_STAPLES = [
  { id: 's1', label: 'Milk', section: 'Dairy & eggs' },
  { id: 's2', label: 'Eggs', section: 'Dairy & eggs' },
  { id: 's3', label: 'Bread', section: 'Bakery' },
  { id: 's4', label: 'Bananas', section: 'Produce' },
  { id: 's5', label: 'Dog food', section: 'Household' },
]
export const useStaples = () => useFamilyTable('grocery_staples', { order: { column: 'label' }, sample: SAMPLE_STAPLES })
export const addStaple = (label) => insertRow('grocery_staples', { label: String(label).trim(), section: guessSection(label) })
export const removeStaple = (id) => deleteRow('grocery_staples', id)
