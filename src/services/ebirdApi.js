// eBird API integration for fetching hotspots
// API documentation: https://documenter.getpostman.com/view/664302/S1ENwy59

import { getEbirdApiKey } from './apiKeyStorage'

const EBIRD_API_URL = 'https://api.ebird.org/v2'
const REQUEST_TIMEOUT_MS = 10000

// Get API key - user's key takes priority, then falls back to environment variable
function getApiKey() {
  // First check for user-provided key
  const userKey = getEbirdApiKey()
  if (userKey) return userKey

  // Fall back to environment variable
  return import.meta.env.VITE_EBIRD_API_KEY || ''
}

// Helper to make fetch requests with timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('eBird API request timed out')
    }
    throw error
  }
}

// Check if eBird API is configured (either user key or env key)
export function isEbirdConfigured() {
  return !!getApiKey()
}

// Check if user has provided their own API key
export function hasUserApiKey() {
  return !!getEbirdApiKey()
}

// Check if only using the default/environment API key
export function isUsingDefaultApiKey() {
  return !getEbirdApiKey() && !!import.meta.env.VITE_EBIRD_API_KEY
}

// Fetch hotspots near a location
export async function fetchNearbyHotspots(lat, lon, distKm = 50, maxResults = 50) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('eBird API key not configured. Set VITE_EBIRD_API_KEY in your environment.')
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lon.toString(),
    dist: Math.min(distKm, 50).toString(), // Max 50km
    fmt: 'json'
  })

  const response = await fetchWithTimeout(`${EBIRD_API_URL}/ref/hotspot/geo?${params}`, {
    headers: {
      'X-eBirdApiToken': apiKey
    }
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid eBird API key')
    }
    if (response.status === 429) {
      throw new Error('eBird API rate limit exceeded - please wait a moment and try again')
    }
    if (response.status >= 500) {
      throw new Error('eBird API is temporarily unavailable - please try again later')
    }
    throw new Error(`eBird API error: ${response.status}`)
  }

  const data = await response.json()

  // Transform to our hotspot format
  return data.slice(0, maxResults).map(h => ({
    name: h.locName,
    lat: h.lat,
    lon: h.lng,
    state: h.subnational1Code?.split('-')[1] || '',
    region: 'ebird',
    description: `eBird hotspot - ${h.numSpeciesAllTime || '?'} species reported`,
    ebirdLocId: h.locId,
    speciesCount: h.numSpeciesAllTime || 0,
    source: 'ebird'
  }))
}

// Fetch hotspots in a region (state/province)
export async function fetchRegionHotspots(regionCode, maxResults = 100) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('eBird API key not configured. Set VITE_EBIRD_API_KEY in your environment.')
  }

  const params = new URLSearchParams({
    fmt: 'json'
  })

  const response = await fetchWithTimeout(`${EBIRD_API_URL}/ref/hotspot/${regionCode}?${params}`, {
    headers: {
      'X-eBirdApiToken': apiKey
    }
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid eBird API key')
    }
    if (response.status === 429) {
      throw new Error('eBird API rate limit exceeded - please wait a moment and try again')
    }
    if (response.status >= 500) {
      throw new Error('eBird API is temporarily unavailable - please try again later')
    }
    throw new Error(`eBird API error: ${response.status}`)
  }

  const data = await response.json()

  // Sort by species count and take top results
  return data
    .sort((a, b) => (b.numSpeciesAllTime || 0) - (a.numSpeciesAllTime || 0))
    .slice(0, maxResults)
    .map(h => ({
      name: h.locName,
      lat: h.lat,
      lon: h.lng,
      state: h.subnational1Code?.split('-')[1] || '',
      region: 'ebird',
      description: `eBird hotspot - ${h.numSpeciesAllTime || '?'} species reported`,
      ebirdLocId: h.locId,
      speciesCount: h.numSpeciesAllTime || 0,
      source: 'ebird'
    }))
}

// US state codes for eBird API
export const US_STATES = [
  { code: 'US-AL', name: 'Alabama' },
  { code: 'US-AK', name: 'Alaska' },
  { code: 'US-AZ', name: 'Arizona' },
  { code: 'US-AR', name: 'Arkansas' },
  { code: 'US-CA', name: 'California' },
  { code: 'US-CO', name: 'Colorado' },
  { code: 'US-CT', name: 'Connecticut' },
  { code: 'US-DE', name: 'Delaware' },
  { code: 'US-FL', name: 'Florida' },
  { code: 'US-GA', name: 'Georgia' },
  { code: 'US-HI', name: 'Hawaii' },
  { code: 'US-ID', name: 'Idaho' },
  { code: 'US-IL', name: 'Illinois' },
  { code: 'US-IN', name: 'Indiana' },
  { code: 'US-IA', name: 'Iowa' },
  { code: 'US-KS', name: 'Kansas' },
  { code: 'US-KY', name: 'Kentucky' },
  { code: 'US-LA', name: 'Louisiana' },
  { code: 'US-ME', name: 'Maine' },
  { code: 'US-MD', name: 'Maryland' },
  { code: 'US-MA', name: 'Massachusetts' },
  { code: 'US-MI', name: 'Michigan' },
  { code: 'US-MN', name: 'Minnesota' },
  { code: 'US-MS', name: 'Mississippi' },
  { code: 'US-MO', name: 'Missouri' },
  { code: 'US-MT', name: 'Montana' },
  { code: 'US-NE', name: 'Nebraska' },
  { code: 'US-NV', name: 'Nevada' },
  { code: 'US-NH', name: 'New Hampshire' },
  { code: 'US-NJ', name: 'New Jersey' },
  { code: 'US-NM', name: 'New Mexico' },
  { code: 'US-NY', name: 'New York' },
  { code: 'US-NC', name: 'North Carolina' },
  { code: 'US-ND', name: 'North Dakota' },
  { code: 'US-OH', name: 'Ohio' },
  { code: 'US-OK', name: 'Oklahoma' },
  { code: 'US-OR', name: 'Oregon' },
  { code: 'US-PA', name: 'Pennsylvania' },
  { code: 'US-RI', name: 'Rhode Island' },
  { code: 'US-SC', name: 'South Carolina' },
  { code: 'US-SD', name: 'South Dakota' },
  { code: 'US-TN', name: 'Tennessee' },
  { code: 'US-TX', name: 'Texas' },
  { code: 'US-UT', name: 'Utah' },
  { code: 'US-VT', name: 'Vermont' },
  { code: 'US-VA', name: 'Virginia' },
  { code: 'US-WA', name: 'Washington' },
  { code: 'US-WV', name: 'West Virginia' },
  { code: 'US-WI', name: 'Wisconsin' },
  { code: 'US-WY', name: 'Wyoming' },
  { code: 'CA-ON', name: 'Ontario (Canada)' },
]
