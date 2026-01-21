import { useState, useEffect, useCallback } from 'react'
import { predictionsApi } from '../services/api'

export function usePredictions(lat, lon, days = 7) {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPredictions = useCallback(async () => {
    if (lat === null || lon === null) return

    setLoading(true)
    setError(null)

    try {
      const response = await predictionsApi.getForLocation(lat, lon, days)
      setPredictions(response.data.predictions)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch predictions')
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
    async function fetch() {
      setLoading(true)
      try {
        const response = await predictionsApi.getTop(date, limit)
        setPredictions(response.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch top predictions')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [date, limit])

  return { predictions, loading, error }
}
