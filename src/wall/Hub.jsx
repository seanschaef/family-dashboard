import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChoresPopover from './ChoresPopover.jsx'
import RecipePopover from './RecipePopover.jsx'
import FitText from '../components/FitText.jsx'
import { C, card } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { LiveCheck, ProgressRow, ClockText } from './parts.jsx'
import CalendarBlock from './CalendarBlock.jsx'
import TodayBlock from './TodayBlock.jsx'
import Rotator from './Rotator.jsx'
import LegendBlock from './LegendBlock.jsx'
import PhotoFrame from './PhotoFrame.jsx'
import WeatherCard from './WeatherCard.jsx'
import { formatLongDate, useNow } from '../lib/time.js'
import { hubGreeting } from '../lib/greetings.js'
import { useImportantDates } from '../lib/dates.js'
import { useWeather } from '../lib/weather.js'
import { useMembers } from '../lib/members.jsx'
import { todayISO } from '../lib/db.js'
import { useChores, useChoreLogs, dueChores, isDone, useRedemptions, pointsBalance, pointsThisWeek } from '../lib/chores.js'
import { useReminders } from '../lib/household.js'
import PetBlock from './PetBlock.jsx'
import InkBoard from '../components/InkBoard.jsx'
import { Scroll, JokeBlock, ComingUpBlock, GoalsBlock, LeaderboardBlock, MealsWeekBlock, GroceriesBlock, NotesBlock, NextUpBlock, ForecastBlock, AirBlock, WasteBlock, OnThisDayBlock } from './HubWidgets.jsx'
import { useMeals, mealFor } from '../lib/kitchen.js'
import { normalizeHubLayout, blockHeight, WIDTH_SPAN, ROW_UNIT, packedStyle, entryHeight } from './hubLayout.js'

export default function Hub() {
  const now = useNow()
  const navigate = useNavigate()
  const [choresFor, setChoresFor] = useState(null) // member whose chore pop-up is open
  const [recipeFor, setRecipeFor] = useState(null) // meal whose recipe pop-up is open
  const { members, familyName, petName, wallLayout } = useMembers()
  const T = todayISO()
  const { rows: chores } = useChores()
  const { rows: logs } = useChoreLogs()
  const { rows: reminders } = useReminders()
  const { rows: meals } = useMeals()
  const { rows: redemptions } = useRedemptions()

  const familyReminders = reminders.filter((r) => r.member_key === null && !r.done)
  const dinner = mealFor(meals, T)?.title
  const { rows: importantDates } = useImportantDates()
  const { data: weatherNow } = useWeather() // for weather-aware greetings

  // Block content by id. Rendered in the order/size the layout specifies.
  const blocks = {
    // Text sizes follow the window's size so greeting, clock and date always
    // fit (S is 160 px tall).
    header: (size) => {
      const t = { s: [24, 84, 22], m: [30, 110, 28], l: [34, 140, 32], xl: [38, 170, 36] }[size] || [24, 84, 22]
      return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, height: blockHeight('header', size), overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: '1 1 0' }}>
          {/* The greeting has a fixed box (beside the weather) and its text
              shrinks to fit rather than being cut off. */}
          <FitText max={t[0]} style={{ fontWeight: 600, color: C.rust, lineHeight: 1.15 }}>{hubGreeting({ now, familyName, petName, members, dates: importantDates, temp: weatherNow?.temp })}</FitText>
          <ClockText now={now} size={t[1]} />
          <div style={{ fontSize: t[2], color: C.muted, lineHeight: 1.15 }}>{formatLongDate(now)}</div>
        </div>
        <WeatherCard />
      </div>
      )
    },
    photo: (size, opts) => <PhotoFrame height={blockHeight('photo', size)} fit={opts?.fit} seconds={opts?.seconds} />,
    calendar: (size) => <CalendarBlock title="Family Calendar" height={blockHeight('calendar', size)} />,
    today: (size) => <TodayBlock height={blockHeight('today', size)} />,
    legend: () => <LegendBlock />,
    dinner: () => (
      // Tap the dinner for its recipe; "Meals ›" opens the week.
      <div style={{ boxSizing: 'border-box', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, background: C.tealTint, borderRadius: 16, padding: '16px 22px', color: C.ink }}>
        <button type="button" onClick={() => (mealFor(meals, T) ? setRecipeFor(mealFor(meals, T)) : navigate('/wall/meals'))} style={{ all: 'unset', cursor: 'pointer', fontSize: 24, minWidth: 0, flex: 1 }}>
          <span style={{ fontWeight: 800 }}>Dinner Tonight:</span> {dinner || 'Not planned yet'}
          {mealFor(meals, T)?.recipe && <span style={{ fontSize: 18, color: C.tealText, fontWeight: 700 }}> · Recipe</span>}
        </button>
        <button type="button" onClick={() => navigate('/wall/meals')} style={{ all: 'unset', cursor: 'pointer', fontSize: 20, color: C.tealText, fontWeight: 700, whiteSpace: 'nowrap' }}>Meals ›</button>
      </div>
    ),
    chores: () => (
      <div style={card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' })}>
        <div style={{ fontSize: 26, fontWeight: 800, flexShrink: 0 }}>Chores Today</div>
        <Scroll gap={12}>{members.map((m) => {
          const due = dueChores(chores, logs, m.key, T)
          const done = due.filter((c) => isDone(logs, c, T, m.key)).length
          return (
            <button key={m.key} type="button" aria-label={`Show ${m.name}'s chores`} onClick={() => setChoresFor(m)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
              <ProgressRow name={m.name} done={done} total={due.length} color={m.color} />
            </button>
          )
        })}</Scroll>
      </div>
    ),
    pet: () => <PetBlock chores={chores} logs={logs} />,
    goals: () => <GoalsBlock />,
    leaderboard: () => <LeaderboardBlock />,
    mealsweek: () => <MealsWeekBlock />,
    groceries: () => <GroceriesBlock />,
    notes: () => <NotesBlock />,
    nextup: () => <NextUpBlock />,
    forecast: () => <ForecastBlock />,
    air: () => <AirBlock />,
    waste: () => <WasteBlock />,
    onthisday: () => <OnThisDayBlock />,
    ink: () => <InkBoard title="Ink" big />,
    joke: () => <JokeBlock />,
    points: () => (
      <div style={card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' })}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Points</div>
        {[...members]
          .map((m) => ({ m, total: pointsBalance(logs, redemptions, m.key), week: pointsThisWeek(logs, m.key) }))
          .sort((a, b) => b.total - a.total)
          .map(({ m, total, week }) => (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, minWidth: 0 }}>
              <span style={{ width: 18, height: 18, borderRadius: 9, background: m.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{m.name}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 800, whiteSpace: 'nowrap' }}>{total}</span>
              <span style={{ color: C.muted, fontSize: 18, whiteSpace: 'nowrap', minWidth: 90, textAlign: 'right' }}>+{week} this wk</span>
            </div>
          ))}
      </div>
    ),
    reminders: () => (
      <div style={card({ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' })}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Reminders</div>
        {familyReminders.length ? (
          familyReminders.map((r) => <div key={r.id} style={{ fontSize: 22 }}>{r.text}</div>)
        ) : (
          <div style={{ fontSize: 22, color: C.muted }}>All clear</div>
        )}
      </div>
    ),
    birthdays: () => <ComingUpBlock />,
  }

  const layout = normalizeHubLayout(wallLayout).filter((b) => b.visible && (b.group || blocks[b.id]))

  return (
    <>
      {/* 4-column grid: full = 4, half = 2, quarter = 1 (see hubLayout.js). */}
      <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoRows: ROW_UNIT, columnGap: 24, rowGap: 0, alignContent: 'start' }}>
        {layout.map((b) => (
          <div key={b.id} style={packedStyle(WIDTH_SPAN[b.width] || 4, entryHeight(b), 24)}>
            {b.group ? (
              <Rotator items={b.group.filter((id) => blocks[id]).map((id) => blocks[id](b.size, b))} interval={b.interval} transition={b.transition} />
            ) : (
              blocks[b.id](b.size, b)
            )}
          </div>
        ))}
      </div>
      <RecipePopover meal={recipeFor} onClose={() => setRecipeFor(null)} />
      <ChoresPopover person={choresFor} chores={chores} logs={logs} onClose={() => setChoresFor(null)} />
    </>
  )
}
