import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchWeatherForecast } from '../services/weatherApi'
import { generatePredictions } from '../services/predictionEngine'
import { FALLOUT_HOTSPOTS } from '../services/hotspots'

const SLOW_LOADING_THRESHOLD_MS = 10000 // 10 seconds

export function usePredictions(lat, lon, days = 7) {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingSlow, setLoadingSlow] = useState(false)
  const [error, setError] = useState(null)
  const slowTimerRef = useRef(null)

  const fetchPredictions = useCallback(async () => {
    // Clear state when no location selected
    if (lat == null || lon == null) {
      setPredictions([])
      setError(null)
      setLoading(false)
      setLoadingSlow(false)
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
      return
    }

    setLoading(true)
    setLoadingSlow(false)
    setError(null)

    // Start slow loading timer
    slowTimerRef.current = setTimeout(() => {
      setLoadingSlow(true)
    }, SLOW_LOADING_THRESHOLD_MS)

    try {
      const forecasts = await fetchWeatherForecast(lat, lon, days)
      const predictions = generatePredictions(forecasts, lat, lon)
      setPredictions(predictions)
    } catch (err) {
      setError(err.message || 'Failed to fetch predictions')
      setPredictions([])
    } finally {
      setLoading(false)
      setLoadingSlow(false)
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
    }
  }, [lat, lon, days])

  useEffect(() => {
    fetchPredictions()
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
    }
  }, [fetchPredictions])

  return { predictions, loading, loadingSlow, error, refetch: fetchPredictions }
}

// Maximum number of hotspots to fetch to reduce API calls
// Prioritizes Gulf Coast locations during migration season
const MAX_HOTSPOTS_TO_FETCH = 15
const BATCH_SIZE = 5
const BATCH_DELAY_MS = 200

async function fetchInBatches(tasks, batchSize = BATCH_SIZE, delayMs = BATCH_DELAY_MS) {
  const results = []
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize)
    const settled = await Promise.allSettled(batch.map(fn => fn()))
    results.push(...settled)
    if (i + batchSize < tasks.length) {
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
  return results
}

export function useTopPredictions(date, limit = 10) {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      setError(null)

      try {
        const hotspotsToFetch = FALLOUT_HOTSPOTS.slice(0, MAX_HOTSPOTS_TO_FETCH)

        const tasks = hotspotsToFetch.map((hotspot) => async () => {
          const forecasts = await fetchWeatherForecast(hotspot.lat, hotspot.lon, 7)
          const preds = generatePredictions(forecasts, hotspot.lat, hotspot.lon)
          const pred = preds.find(p => p.prediction_date === date) || preds[0]
          return {
            ...pred,
            hotspot_name: hotspot.name,
            lat: hotspot.lat,
            lon: hotspot.lon,
            state: hotspot.state,
            description: hotspot.description
          }
        })

        const settled = await fetchInBatches(tasks)

        let fulfilled = settled
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value)

        // Retry failed requests once
        const failedIndices = settled
          .map((r, i) => r.status === 'rejected' ? i : null)
          .filter(i => i !== null)

        if (failedIndices.length > 0 && fulfilled.length > 0) {
          const retrySettled = await Promise.allSettled(
            failedIndices.map(i => tasks[i]())
          )
          fulfilled.push(
            ...retrySettled.filter(r => r.status === 'fulfilled').map(r => r.value)
          )
        }

        if (fulfilled.length === 0) {
          throw new Error('All weather requests failed')
        }

        const sorted = fulfilled
          .sort((a, b) => b.overall_score - a.overall_score)
          .slice(0, limit)

        setPredictions(sorted)
      } catch (err) {
        setError(err.message || 'Failed to fetch top predictions')
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [date, limit])

  return { predictions, loading, error }
}
