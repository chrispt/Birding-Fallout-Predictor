// Direct Open-Meteo API calls (no backend needed)

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'
const REQUEST_TIMEOUT_MS = 10000
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

const HOURLY_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'pressure_msl',
  'cloud_cover',
  'cloud_cover_low',
  'visibility',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m'
]

// In-memory cache for weather data
const weatherCache = new Map()

function getCacheKey(lat, lon, days) {
  // Round coordinates to 2 decimal places for cache key
  return `${lat.toFixed(2)},${lon.toFixed(2)},${days}`
}

function getCachedData(key) {
  const cached = weatherCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    weatherCache.delete(key)
    return null
  }
  return cached.data
}

function setCachedData(key, data) {
  weatherCache.set(key, { data, timestamp: Date.now() })
}

export async function fetchWeatherForecast(lat, lon, days = 7) {
  const cacheKey = getCacheKey(lat, lon, days)
  const cached = getCachedData(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: HOURLY_VARIABLES.join(','),
    forecast_days: Math.min(days, 16),
    timezone: 'UTC'
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${OPEN_METEO_URL}?${params}`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) throw new Error('Failed to fetch weather data')

    const data = await response.json()
    const result = parseAndAddDeltas(data)
    setCachedData(cacheKey, result)
    return result
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Weather request timed out')
    }
    throw error
  }
}

function parseAndAddDeltas(data) {
  const hourly = data.hourly || {}
  const times = hourly.time || []

  const results = times.map((time, i) => ({
    forecast_time: time,
    temperature_2m: hourly.temperature_2m?.[i] ?? null,
    apparent_temperature: hourly.apparent_temperature?.[i] ?? null,
    wind_speed_10m: hourly.wind_speed_10m?.[i] ?? null,
    wind_direction_10m: hourly.wind_direction_10m?.[i] ?? null,
    wind_gusts_10m: hourly.wind_gusts_10m?.[i] ?? null,
    pressure_msl: hourly.pressure_msl?.[i] ?? null,
    precipitation_probability: hourly.precipitation_probability?.[i] ?? null,
    precipitation_mm: hourly.precipitation?.[i] ?? null,
    cloud_cover_total: hourly.cloud_cover?.[i] ?? null,
    cloud_cover_low: hourly.cloud_cover_low?.[i] ?? null,
    visibility_m: hourly.visibility?.[i] ?? null,
    weather_code: hourly.weather_code?.[i] ?? null
  }))

  // Add deltas
  results.forEach((w, i) => {
    w.pressure_delta_3h = (i >= 3 && w.pressure_msl && results[i-3].pressure_msl)
      ? Math.round((w.pressure_msl - results[i-3].pressure_msl) * 100) / 100
      : null
    w.pressure_delta_24h = (i >= 24 && w.pressure_msl && results[i-24].pressure_msl)
      ? Math.round((w.pressure_msl - results[i-24].pressure_msl) * 100) / 100
      : null
    w.temperature_delta_24h = (i >= 24 && w.temperature_2m && results[i-24].temperature_2m)
      ? Math.round((w.temperature_2m - results[i-24].temperature_2m) * 100) / 100
      : null
    w.is_frontal_passage = (w.pressure_delta_3h || 0) < -3
  })

  return results
}
