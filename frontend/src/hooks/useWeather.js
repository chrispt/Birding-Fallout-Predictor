import { useState, useEffect, useCallback } from 'react'
import { weatherApi } from '../services/api'

export function useWeather(lat, lon, days = 7) {
  const [forecasts, setForecasts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async () => {
    if (lat === null || lon === null) return

    setLoading(true)
    setError(null)

    try {
      const response = await weatherApi.getForecast(lat, lon, days)
      setForecasts(response.data.forecasts)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch weather data')
      setForecasts([])
    } finally {
      setLoading(false)
    }
  }, [lat, lon, days])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  return { forecasts, loading, error, refetch: fetchWeather }
}

export function useCurrentWeather(lat, lon) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (lat === null || lon === null) return

    async function fetch() {
      setLoading(true)
      try {
        const response = await weatherApi.getCurrent(lat, lon)
        setWeather(response.data.weather)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch current weather')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [lat, lon])

  return { weather, loading, error }
}
