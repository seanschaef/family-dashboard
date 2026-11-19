// Sunrise and sunset for Edmonton (or VITE_WEATHER_LAT/LON), worked out on the
// device with the NOAA solar formulas: no lookup, no network. Accurate to a
// minute or two, which is plenty for switching colours.

const LAT = Number(import.meta.env.VITE_WEATHER_LAT || 53.5461)
const LON = Number(import.meta.env.VITE_WEATHER_LON || -113.4938)
const rad = Math.PI / 180

// Returns { sunrise: Date, sunset: Date } for the local calendar day of `date`.
// (At this latitude the sun always rises and sets, so no polar cases.)
export function sunTimes(date = new Date(), lat = LAT, lon = LON) {
  const noonUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)
  const n = Math.round((noonUtc - Date.UTC(2000, 0, 1, 12)) / 86400000) // days since J2000
  const meanNoon = n - lon / 360
  const M = (357.5291 + 0.98560028 * meanNoon) % 360
  const Cc = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad)
  const lambda = (M + Cc + 180 + 102.9372) % 360
  const transit = 2451545 + meanNoon + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad)
  const decl = Math.asin(Math.sin(lambda * rad) * Math.sin(23.44 * rad))
  const cosH = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(decl)) / (Math.cos(lat * rad) * Math.cos(decl))
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad
  const toDate = (jd) => new Date((jd - 2440587.5) * 86400000)
  return { sunrise: toDate(transit - H / 360), sunset: toDate(transit + H / 360) }
}

export const isDaylight = (now = new Date()) => {
  const { sunrise, sunset } = sunTimes(now)
  return now >= sunrise && now < sunset
}

export const sunText = (d) => d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Edmonton' })
