// Custom user locations with localStorage persistence

const STORAGE_KEY = 'fallout-predictor-custom-locations'

// Get all custom locations from localStorage
export function getCustomLocations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (err) {
    console.error('Failed to load custom locations:', err)
    return []
  }
}

// Save custom locations to localStorage
function saveCustomLocations(locations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
  } catch (err) {
    console.error('Failed to save custom locations:', err)
  }
}

// Add a new custom location
export function addCustomLocation(location) {
  const locations = getCustomLocations()

  // Generate unique ID
  const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

  const newLocation = {
    ...location,
    id,
    source: 'custom',
    region: 'custom',
    createdAt: new Date().toISOString()
  }

  // Check for duplicates by coordinates
  const exists = locations.some(
    l => Math.abs(l.lat - location.lat) < 0.001 && Math.abs(l.lon - location.lon) < 0.001
  )

  if (exists) {
    throw new Error('A location with these coordinates already exists')
  }

  locations.push(newLocation)
  saveCustomLocations(locations)

  return newLocation
}

// Update an existing custom location
export function updateCustomLocation(id, updates) {
  const locations = getCustomLocations()
  const index = locations.findIndex(l => l.id === id)

  if (index === -1) {
    throw new Error('Location not found')
  }

  locations[index] = {
    ...locations[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  saveCustomLocations(locations)
  return locations[index]
}

// Delete a custom location
export function deleteCustomLocation(id) {
  const locations = getCustomLocations()
  const filtered = locations.filter(l => l.id !== id)

  if (filtered.length === locations.length) {
    throw new Error('Location not found')
  }

  saveCustomLocations(filtered)
  return true
}

// Check if a location is a custom location
export function isCustomLocation(location) {
  return location?.source === 'custom' || location?.id?.startsWith('custom-')
}

// Clear all custom locations
export function clearAllCustomLocations() {
  saveCustomLocations([])
}

// Export custom locations as JSON
export function exportCustomLocations() {
  const locations = getCustomLocations()
  return JSON.stringify(locations, null, 2)
}

// Import custom locations from JSON
export function importCustomLocations(jsonString) {
  try {
    const imported = JSON.parse(jsonString)

    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected an array')
    }

    const existing = getCustomLocations()
    const existingCoords = new Set(
      existing.map(l => `${l.lat.toFixed(3)},${l.lon.toFixed(3)}`)
    )

    let added = 0
    imported.forEach(loc => {
      if (!loc.lat || !loc.lon || !loc.name) return

      const coordKey = `${loc.lat.toFixed(3)},${loc.lon.toFixed(3)}`
      if (existingCoords.has(coordKey)) return

      addCustomLocation({
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
        state: loc.state || '',
        description: loc.description || 'Imported location'
      })

      existingCoords.add(coordKey)
      added++
    })

    return added
  } catch (err) {
    throw new Error(`Import failed: ${err.message}`)
  }
}
