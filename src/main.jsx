import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { MembersProvider } from './lib/members.jsx'
import { ThemeProvider } from './lib/theme.jsx'
import { registerSW } from 'virtual:pwa-register'

// Keep installed copies current. Phones keep the app open in the background
// for days, so a new version only arrived after a full close and reopen.
// Check for one whenever the app comes back to the foreground and every 30
// minutes; with registerType 'autoUpdate' the page reloads itself onto it.
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const check = () => reg.update().catch(() => {})
    setInterval(check, 30 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check()
    })
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MembersProvider>
            <App />
          </MembersProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
