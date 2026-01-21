import { useState, useEffect, useCallback } from 'react'
import { fetchWeatherForecast } from '../services/weatherApi'

export function useWeather(lat, lon, days = 7) {
  const [forecasts, setForecasts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async () => {
    if (lat === null || lon === null) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchWeatherForecast(lat, lon, days)
      setForecasts(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data')
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
        const data = await fetchWeatherForecast(lat, lon, 1)
        // Get the current hour's weather (first entry)
        setWeather(data[0] || null)
      } catch (err) {
        setError(err.message || 'Failed to fetch current weather')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [lat, lon])

  return { weather, loading, error }
}
