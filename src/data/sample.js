// SAMPLE DATA ONLY.
// Placeholder content so the screens render and can be reviewed. It is replaced
// by live Supabase data feature-by-feature (calendars, chores, meals,
// groceries, photos, weather). Keyed by member key (m1..m4) so names/colours
// resolve from the database roster; no real people here.
import { PET_NAME } from '../config/people.js'

export const weather = { temp: 1, conditions: 'Light snow' }

export const dinnerTonight = 'Butter chicken'

// Hub: everyone's events for today (who = member key).
export const hubEvents = [
  { time: '8:20', title: 'School drop-off', memberKey: 'm2' },
  { time: '3:45', title: 'School pickup', memberKey: 'm1' },
  { time: '6:30', title: 'Soccer practice', memberKey: 'm3' },
]

export const hubUpcoming = 'Tomorrow: Dentist 4:00 · Wed: Soccer game 7:00'

// Hub: chore progress per member.
export const choreProgress = [
  { key: 'm1', done: 2, total: 3 },
  { key: 'm2', done: 3, total: 4 },
  { key: 'm3', done: 1, total: 3 },
  { key: 'm4', done: 2, total: 2 },
]

// Pet care log (pet name is a placeholder until the pet feature is DB-backed).
export const petName = PET_NAME
export const petLog = [
  { key: 'breakfast', label: 'Breakfast', byKey: 'm2', at: '7:05', done: true },
  { key: 'walk', label: 'Walk', done: false },
  { key: 'dinner', label: 'Dinner', done: false },
]

export const familyReminders = ['Sign field trip form', 'Recycling day']

// Per-member pages (keyed by member key).
export const memberData = {
  m1: {
    today: [
      { time: '9:00', title: '[Event]', sub: '[Calendar]' },
      { time: '3:45', title: 'School pickup', sub: 'Family' },
      { time: '7:30', title: '[Event]', sub: '[Calendar]' },
    ],
    chores: [
      { label: 'Walk the dog', done: true },
      { label: 'Laundry', done: true },
      { label: 'Groceries', done: false },
    ],
    reminders: ['Sign field trip form', '[Reminder]'],
  },
  m2: {
    today: [
      { time: '8:30', title: 'Team meeting', sub: 'Work calendar · this page only' },
      { time: '12:00', title: 'Lunch', sub: 'Personal' },
      { time: '6:30', title: 'Soccer practice', sub: 'ManageSoccer' },
    ],
    chores: [
      { label: 'Feed the dog', done: true },
      { label: 'Make lunches', done: true },
      { label: 'Load dishwasher', done: true },
      { label: 'Garbage out', done: false },
    ],
    reminders: ['Book winter tire swap', '[Reminder]'],
  },
  m3: {
    today: [
      { time: '8:20', title: 'School' },
      { time: '4:00', title: '[Event]' },
      { time: '6:30', title: 'Soccer practice', sub: 'ManageSoccer' },
    ],
    chores: [
      { label: 'Empty dishwasher', done: true },
      { label: 'Take out recycling', done: false },
      { label: 'Walk the dog', done: false },
    ],
    homework: ['[Assignment] due Wed', 'Pack soccer bag'],
  },
  m4: {
    today: [
      { time: '8:20', title: 'School' },
      { time: '3:45', title: 'Pickup' },
      { time: '7:30', title: 'Bedtime' },
    ],
    jobs: [
      { label: 'Make bed', done: true },
      { label: 'Feed the dog', done: true },
      { label: 'Put away laundry', done: false },
      { label: 'Read 20 minutes', done: false },
    ],
    tomorrow: 'Dentist at 4:00',
  },
}

// Next-four-days strip (adult/teen pages).
export const nextDays = [
  { label: 'Tue 17', lines: ['Dentist', '4:00'] },
  { label: 'Wed 18', lines: ['Soccer game', '7:00'] },
  { label: 'Thu 19', lines: ['Free'] },
  { label: 'Fri 20', lines: ['Pizza night', 'Family'] },
]

// Meals page.
export const weekDinners = [
  { day: 'Mon', meal: '[Meal]', highlight: true },
  { day: 'Tue', meal: '[Meal]' },
  { day: 'Wed', meal: '[Meal]' },
  { day: 'Thu', meal: '[Meal]' },
  { day: 'Fri', meal: 'Pizza night' },
  { day: 'Sat', meal: '[Meal]' },
  { day: 'Sun', meal: '[Meal]' },
]

export const staples = ['Milk', 'Eggs', 'Bread', 'Bananas', 'Dog food']

export const grocerySections = [
  {
    name: 'PRODUCE',
    items: [
      { label: 'Apples', note: 'Added', done: false },
      { label: 'Spinach', note: 'Meal plan', done: false },
      { label: 'Onions', note: 'Meal plan', done: true },
    ],
  },
  {
    name: 'PANTRY AND OTHER',
    items: [
      { label: 'Pasta', note: 'Meal plan', done: false },
      { label: 'Granola bars', note: 'Added', done: false },
      { label: 'Dog food', note: 'Added', done: false },
    ],
  },
]

// Smart-home page (step 6; placeholder until Home Assistant).
export const scenes = ['Good morning', 'Movie', 'Away', 'Good night']
export const lights = [
  { name: '[Room 1]', on: true, level: '80%' },
  { name: '[Room 2]', on: true, level: '60%' },
  { name: '[Room 3]', on: false, level: 'Off' },
  { name: '[Room 4]', on: true, level: '100%' },
  { name: '[Room 5]', on: false, level: 'Off' },
  { name: '[Room 6]', on: false, level: 'Off' },
]
export const doors = [
  { name: 'Front door', state: 'Locked', ok: true },
  { name: 'Back door', state: 'Locked', ok: true },
  { name: 'Garage', state: 'Open', ok: false },
]
