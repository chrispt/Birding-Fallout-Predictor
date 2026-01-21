// Date formatting utilities
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// Temperature formatting
export function formatTemp(celsius, unit = 'F') {
  if (celsius === null || celsius === undefined) return '--'
  if (unit === 'C') {
    return `${Math.round(celsius)}°C`
  }
  const fahrenheit = (celsius * 9/5) + 32
  return `${Math.round(fahrenheit)}°F`
}

// Wind formatting
export function formatWind(speedKmh, direction) {
  if (speedKmh === null || speedKmh === undefined) return '--'
  const speedMph = Math.round(speedKmh * 0.621371)
  const dirLabel = direction ? getWindDirectionLabel(direction) : ''
  return `${dirLabel} ${speedMph} mph`
}

export function getWindDirectionLabel(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// Pressure formatting
export function formatPressure(hPa) {
  if (hPa === null || hPa === undefined) return '--'
  const inHg = hPa * 0.02953
  return `${inHg.toFixed(2)} inHg`
}

// Distance formatting
export function formatDistance(km) {
  if (km === null || km === undefined) return '--'
  const miles = km * 0.621371
  return `${miles.toFixed(1)} mi`
}

// Coordinates formatting
export function formatCoords(lat, lon) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
}
