import { useFamilyTable, insertRow, updateRow, deleteRow, deleteWhere } from './db.js'

// Monday of the current week as YYYY-MM-DD, and the 7 day ISO strings.
export function weekDates(from = new Date()) {
  const d = new Date(from)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  // Local calendar dates. (toISOString() is UTC, which in Edmonton rolls to
  // tomorrow after 5 or 6 pm and shifted every dinner by a day each evening.)
  const pad = (n) => String(n).padStart(2, '0')
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
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

// Keyword → section. The LONGEST matching keyword wins, so specific phrases
// beat generic words: "garlic bread" is Bakery (not Produce for "garlic"),
// "peanut butter" is Pantry (not Dairy for "butter"), "dog food" is Household.
const SECTION_KEYWORDS = [
  ['Household', ['paper towel', 'toilet', 'detergent', 'soap', 'dish soap', 'dishwasher', 'cleaner', 'bleach', 'garbage', 'trash bag', 'foil', 'plastic wrap', 'saran', 'ziploc', 'freezer bag', 'diaper', 'wipes', 'shampoo', 'conditioner', 'toothpaste', 'toothbrush', 'deodorant', 'dog food', 'cat food', 'dog treat', 'litter', 'batteries', 'napkin', 'tissue', 'kleenex', 'sponge', 'light bulb', 'lotion', 'sunscreen', 'vitamin']],
  ['Produce', ['apple', 'banana', 'lettuce', 'romaine', 'iceberg', 'arugula', 'spinach', 'onion', 'shallot', 'tomato', 'potato', 'yam', 'carrot', 'pepper', 'jalapeno', 'cucumber', 'zucchini', 'squash', 'pumpkin', 'berry', 'berries', 'grape', 'orange', 'clementine', 'mandarin', 'lemon', 'lime', 'avocado', 'broccoli', 'cauliflower', 'cabbage', 'celery', 'mushroom', 'garlic', 'ginger', 'kale', 'salad', 'fruit', 'veg', 'cilantro', 'parsley', 'basil', 'herb', 'corn', 'peas', 'green bean', 'bean sprout', 'asparagus', 'pear', 'peach', 'plum', 'melon', 'watermelon', 'cantaloupe', 'pineapple', 'mango', 'kiwi', 'cherr', 'radish', 'beet', 'leek', 'sweet potato']],
  ['Dairy & eggs', ['milk', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'butter', 'yogurt', 'yoghurt', 'cream', 'egg', 'sour cream', 'cottage', 'cream cheese', 'whipping cream', 'half and half', 'kefir', 'margarine']],
  ['Meat & fish', ['chicken', 'beef', 'pork', 'bacon', 'sausage', 'turkey', 'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'prawn', 'ham', 'ground beef', 'ground pork', 'ground turkey', 'ground chicken', 'steak', 'meat', 'roast', 'ribs', 'lamb', 'deli', 'salami', 'pepperoni', 'hot dog', 'wiener', 'meatball']],
  ['Bakery', ['bread', 'garlic bread', 'bun', 'buns', 'bagel', 'tortilla', 'wrap', 'croissant', 'muffin', 'roll', 'pita', 'naan', 'english muffin', 'cake', 'donut', 'baguette', 'sourdough', 'crouton', 'stuffing']],
  ['Frozen', ['frozen', 'ice cream', 'popsicle', 'frozen pizza', 'frozen fries', 'fries', 'waffle', 'perogies', 'pierogi', 'bag of ice', 'ice cubes']],
  ['Drinks', ['juice', 'soda', 'pop', 'coffee', 'tea', 'sparkling', 'water', 'wine', 'beer', 'cola', 'gatorade', 'kombucha', 'lemonade', 'iced tea', 'iced coffee']],
  ['Pantry', ['pasta', 'spaghetti', 'macaroni', 'rice', 'flour', 'sugar', 'salt', 'oil', 'olive oil', 'sauce', 'pasta sauce', 'beans', 'black bean', 'kidney bean', 'chickpea', 'lentil', 'soup', 'cereal', 'cracker', 'granola', 'snack', 'chips', 'tortilla chip', 'cookie', 'spice', 'canned', 'peanut butter', 'peanut', 'jam', 'honey', 'syrup', 'oatmeal', 'oats', 'noodle', 'ketchup', 'mustard', 'mayo', 'relish', 'vinegar', 'broth', 'stock', 'baking', 'yeast', 'chocolate', 'nuts', 'almond', 'popcorn', 'pickle', 'salsa', 'dressing', 'taco seasoning']],
]

// Best-guess section for a label; 'Other' when nothing matches.
export function guessSection(label) {
  const t = String(label || '').toLowerCase()
  let best = 'Other'
  let bestLen = 0
  for (const [section, words] of SECTION_KEYWORDS) {
    for (const w of words) {
      if (w.length > bestLen && t.includes(w)) {
        best = section
        bestLen = w.length
      }
    }
  }
  return best
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
