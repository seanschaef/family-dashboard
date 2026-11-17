import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// One codebase, two deployments:
//  - Vercel serves the phone PWA (this build).
//  - The Raspberry Pi serves the same build locally in Chromium kiosk mode
//    for the wall screen (so it can later reach Home Assistant on the LAN).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      // Offline matters most for the grocery list (poor signal in stores).
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallbackDenylist: [/^\/wall/],
      },
      manifest: {
        name: 'Family Dashboard',
        short_name: 'Family',
        description: 'Family calendar, chores, meals, groceries and photos.',
        theme_color: '#B4532A',
        background_color: '#FBF5EC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/app/today',
        scope: '/',
        // SVG mark works in modern browsers and avoids shipping binary assets.
        // Swap in 192/512 PNGs later if you want App Store-grade icons.
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: { host: true, port: 5173 },
})
