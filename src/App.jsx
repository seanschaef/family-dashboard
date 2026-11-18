import { Navigate, Route, Routes } from 'react-router-dom'
import Protected from './components/Protected.jsx'
import Login from './pages/Login.jsx'

import WallLayout from './wall/WallLayout.jsx'
import Hub from './wall/Hub.jsx'
import WallCalendar from './wall/Calendar.jsx'
import WallMember from './wall/Member.jsx'
import WallMeals from './wall/Meals.jsx'
import WallHome from './wall/Home.jsx'
import WallSoccer from './wall/Soccer.jsx'

import PhoneLayout from './phone/PhoneLayout.jsx'
import Today from './phone/Today.jsx'
import Calendar from './phone/Calendar.jsx'
import Groceries from './phone/Groceries.jsx'
import PhoneMeals from './phone/Meals.jsx'
import Chores from './phone/Chores.jsx'
import Photos from './phone/Photos.jsx'
import Calendars from './phone/Calendars.jsx'
import WallDisplay from './phone/WallDisplay.jsx'
import Widgets from './phone/Widgets.jsx'
import Rewards from './phone/Rewards.jsx'
import Settings from './phone/Settings.jsx'
import WallPreview from './phone/WallPreview.jsx'
import Arrange from './phone/Arrange.jsx'
import Accounts from './phone/Accounts.jsx'
import Dates from './phone/Dates.jsx'

// On the Pi we set VITE_DEVICE_MODE=wall so the root boots straight to the wall.
const DEVICE_MODE = import.meta.env.VITE_DEVICE_MODE
const HOME_ROUTE = DEVICE_MODE === 'wall' ? '/wall/hub' : '/app/today'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={HOME_ROUTE} replace />} />
      <Route path="/login" element={<Login />} />

      {/* Wall screen (Raspberry Pi kiosk) */}
      <Route
        path="/wall"
        element={
          <Protected>
            <WallLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="hub" replace />} />
        <Route path="hub" element={<Hub />} />
        <Route path="calendar" element={<WallCalendar />} />
        <Route path="member/:memberKey" element={<WallMember />} />
        <Route path="meals" element={<WallMeals />} />
        <Route path="home" element={<WallHome />} />
        <Route path="soccer" element={<WallSoccer />} />
      </Route>

      {/* Phone / computer app (installable PWA on Vercel) */}
      <Route
        path="/app"
        element={
          <Protected>
            <PhoneLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="today" replace />} />
        <Route path="today" element={<Today />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="groceries" element={<Groceries />} />
        <Route path="meals" element={<PhoneMeals />} />
        <Route path="chores" element={<Chores />} />
        <Route path="photos" element={<Photos />} />
        <Route path="calendars" element={<Calendars />} />
        <Route path="wall-display" element={<WallDisplay />} />
        <Route path="widgets" element={<Widgets />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="settings" element={<Settings />} />
        <Route path="wall-preview" element={<WallPreview />} />
        <Route path="arrange" element={<Arrange />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="dates" element={<Dates />} />
      </Route>

      <Route path="*" element={<Navigate to={HOME_ROUTE} replace />} />
    </Routes>
  )
}
