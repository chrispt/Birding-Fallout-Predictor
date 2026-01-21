import { useState, useEffect, useCallback } from 'react'
import { FALLOUT_HOTSPOTS, getHotspotsByRegion, getHotspotsByState, getRegions, getStates } from '../services/hotspots'
import { fetchNearbyHotspots, fetchRegionHotspots, isEbirdConfigured, US_STATES } from '../services/ebirdApi'
import { getCustomLocations, addCustomLocation, deleteCustomLocation } from '../services/customLocations'

export function useHotspots(options = {}) {
  const { includeCustom = true, includeEbird = false, region = 'all', state = 'all' } = options

  const [hotspots, setHotspots] = useState([])
  const [customLocations, setCustomLocations] = useState([])
  const [ebirdHotspots, setEbirdHotspots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load static and custom hotspots
  useEffect(() => {
    let filtered = FALLOUT_HOTSPOTS

    if (region !== 'all') {
      filtered = getHotspotsByRegion(region)
    } else if (state !== 'all') {
      filtered = getHotspotsByState(state)
    }

    const custom = includeCustom ? getCustomLocations() : []
    setCustomLocations(custom)

    // Combine all sources
    const combined = [
      ...filtered.map(h => ({ ...h, source: 'static' })),
      ...custom,
      ...(includeEbird ? ebirdHotspots : [])
    ]

    setHotspots(combined)
  }, [region, state, includeCustom, includeEbird, ebirdHotspots])

  // Refresh custom locations
  const refreshCustomLocations = useCallback(() => {
    const custom = getCustomLocations()
    setCustomLocations(custom)
  }, [])

  // Add a custom location
  const addLocation = useCallback((location) => {
    try {
      const newLoc = addCustomLocation(location)
      refreshCustomLocations()
      return newLoc
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [refreshCustomLocations])

  // Remove a custom location
  const removeLocation = useCallback((id) => {
    try {
      deleteCustomLocation(id)
      refreshCustomLocations()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [refreshCustomLocations])

  // Search eBird hotspots near a location
  const searchNearby = useCallback(async (lat, lon, distKm = 50) => {
    if (!isEbirdConfigured()) {
      setError('eBird API not configured')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const results = await fetchNearbyHotspots(lat, lon, distKm)
      setEbirdHotspots(results)
      return results
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Search eBird hotspots by state/region
  const searchByRegion = useCallback(async (regionCode) => {
    if (!isEbirdConfigured()) {
      setError('eBird API not configured')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const results = await fetchRegionHotspots(regionCode)
      setEbirdHotspots(results)
      return results
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear eBird results
  const clearEbirdResults = useCallback(() => {
    setEbirdHotspots([])
  }, [])

  return {
    hotspots,
    customLocations,
    ebirdHotspots,
    loading,
    error,
    addLocation,
    removeLocation,
    searchNearby,
    searchByRegion,
    clearEbirdResults,
    refreshCustomLocations,
    isEbirdConfigured: isEbirdConfigured(),
    regions: getRegions(),
    states: getStates(),
    usStates: US_STATES
  }
}
