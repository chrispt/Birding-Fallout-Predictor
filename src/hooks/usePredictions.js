import { useState, useEffect, useCallback } from 'react'
import { fetchWeatherForecast } from '../services/weatherApi'
import { generatePredictions } from '../services/predictionEngine'
import { FALLOUT_HOTSPOTS } from '../services/hotspots'

export function usePredictions(lat, lon, days = 7) {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPredictions = useCallback(async () => {
    // Clear state when no location selected
    if (lat == null || lon == null) {
      setPredictions([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const forecasts = await fetchWeatherForecast(lat, lon, days)
      const predictions = generatePredictions(forecasts, lat, lon)
      setPredictions(predictions)
    } catch (err) {
      setError(err.message || 'Failed to fetch predictions')
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }, [lat, lon, days])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  return { predictions, loading, error, refetch: fetchPredictions }
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
        // Fetch predictions for all hotspots in parallel
        const results = await Promise.all(
          FALLOUT_HOTSPOTS.map(async (hotspot) => {
            const forecasts = await fetchWeatherForecast(hotspot.lat, hotspot.lon, 7)
            const preds = generatePredictions(forecasts, hotspot.lat, hotspot.lon)
            // Find prediction for requested date
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
        )

        // Sort by score descending and take top N
        const sorted = results
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
