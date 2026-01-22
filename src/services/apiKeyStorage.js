// Secure storage for user API keys
// Uses basic obfuscation to prevent casual inspection in localStorage

const STORAGE_KEY = 'bfp_api_keys'

// Simple obfuscation - not true encryption but prevents casual snooping
// For true security, API keys should be on a backend server
function obfuscate(str) {
  if (!str) return ''
  // Base64 encode with a simple character shift
  const shifted = str.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) + (i % 7) + 1)
  ).join('')
  return btoa(shifted)
}

function deobfuscate(str) {
  if (!str) return ''
  try {
    const shifted = atob(str)
    return shifted.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) - (i % 7) - 1)
    ).join('')
  } catch {
    return ''
  }
}

// Get all stored API keys
function getStoredKeys() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

// Save API keys
function saveKeys(keys) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch (err) {
    console.error('Failed to save API keys:', err)
  }
}

// eBird API Key management
export function getEbirdApiKey() {
  const keys = getStoredKeys()
  return keys.ebird ? deobfuscate(keys.ebird) : null
}

export function setEbirdApiKey(apiKey) {
  const keys = getStoredKeys()
  if (apiKey) {
    keys.ebird = obfuscate(apiKey)
  } else {
    delete keys.ebird
  }
  saveKeys(keys)
}

export function hasUserEbirdApiKey() {
  return !!getEbirdApiKey()
}

export function clearEbirdApiKey() {
  const keys = getStoredKeys()
  delete keys.ebird
  saveKeys(keys)
}

// Validate an eBird API key by making a test request
export async function validateEbirdApiKey(apiKey) {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API key is required' }
  }

  try {
    // Test with a simple hotspots request for a small area
    const response = await fetch(
      'https://api.ebird.org/v2/ref/hotspot/US-TX?fmt=json',
      {
        headers: { 'X-eBirdApiToken': apiKey.trim() }
      }
    )

    if (response.ok) {
      return { valid: true }
    } else if (response.status === 403) {
      return { valid: false, error: 'Invalid API key' }
    } else {
      return { valid: false, error: `API error: ${response.status}` }
    }
  } catch (err) {
    return { valid: false, error: 'Network error - could not validate key' }
  }
}
