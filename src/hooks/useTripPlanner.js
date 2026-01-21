import { useState, useEffect } from 'react'
import { fetchWeatherForecast } from '../services/weatherApi'
import { generatePredictions } from '../services/predictionEngine'
import { FALLOUT_HOTSPOTS } from '../services/hotspots'

export function useTripPlannerData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAllPredictions() {
      setLoading(true)
      setError(null)

      try {
        // Generate dates for next 7 days
        const dates = []
        for (let i = 0; i < 7; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          dates.push(date.toISOString().split('T')[0])
        }

        // Fetch predictions for all hotspots in parallel
        const hotspotsData = await Promise.all(
          FALLOUT_HOTSPOTS.map(async (hotspot) => {
            const forecasts = await fetchWeatherForecast(hotspot.lat, hotspot.lon, 7)
            const predictions = generatePredictions(forecasts, hotspot.lat, hotspot.lon)

            return {
              name: hotspot.name,
              state: hotspot.state,
              lat: hotspot.lat,
              lon: hotspot.lon,
              description: hotspot.description,
              predictions: predictions.map(p => ({
                date: p.prediction_date,
                score: p.overall_score,
                label: p.score_label,
                confidence: p.confidence,
                factors: p.factors,
                summary: p.summary,
                season: p.season
              }))
            }
          })
        )

        // Find best overall score
        let bestOverall = { hotspot: '', date: '', score: 0 }
        hotspotsData.forEach(hotspot => {
          hotspot.predictions.forEach(pred => {
            if (pred.score > bestOverall.score) {
              bestOverall = {
                hotspot: hotspot.name,
                date: pred.date,
                score: pred.score
              }
            }
          })
        })

        // Find best score for each date (column max)
        const bestByDate = {}
        dates.forEach(date => {
          let best = { hotspot: '', score: 0 }
          hotspotsData.forEach(hotspot => {
            const pred = hotspot.predictions.find(p => p.date === date)
            if (pred && pred.score > best.score) {
              best = { hotspot: hotspot.name, score: pred.score }
            }
          })
          bestByDate[date] = best
        })

        // Find best score for each hotspot (row max)
        const bestByHotspot = {}
        hotspotsData.forEach(hotspot => {
          let best = { date: '', score: 0 }
          hotspot.predictions.forEach(pred => {
            if (pred.score > best.score) {
              best = { date: pred.date, score: pred.score }
            }
          })
          bestByHotspot[hotspot.name] = best
        })

        setData({
          dates,
          hotspots: hotspotsData,
          bestOverall,
          bestByDate,
          bestByHotspot
        })
      } catch (err) {
        setError(err.message || 'Failed to fetch trip planner data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllPredictions()
  }, [])

  return { data, loading, error }
}
