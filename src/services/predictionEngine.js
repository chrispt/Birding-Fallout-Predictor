// Client-side prediction engine

const CORRIDORS = {
  gulf_coast: { lat_min: 25, lat_max: 31, lon_min: -98, lon_max: -80 },
  atlantic: { lat_min: 35, lat_max: 45, lon_min: -77, lon_max: -70 },
  great_lakes: { lat_min: 41, lat_max: 47, lon_min: -92, lon_max: -76 }
}

function getSeason(date) {
  const m = date.getMonth() + 1
  if ([3, 4, 5].includes(m)) return { season: 'spring', type: 'neotropical' }
  if ([8, 9, 10, 11].includes(m)) return { season: 'fall', type: 'neotropical' }
  if ([12, 1, 2].includes(m)) return { season: 'winter', type: 'irruption' }
  return { season: 'summer', type: 'dispersal' }
}

function getCorridor(lat, lon) {
  for (const [name, b] of Object.entries(CORRIDORS)) {
    if (lat >= b.lat_min && lat <= b.lat_max && lon >= b.lon_min && lon <= b.lon_max) {
      return name
    }
  }
  return null
}

function isCoastal(lat, lon) {
  return (lat >= 25 && lat <= 31 && lon >= -98 && lon <= -80) || lon <= -117 || (lat <= 45 && lon >= -77)
}

function calcFrontScore(w, season) {
  let score = 0
  const desc = []

  if (w.is_frontal_passage) {
    score += 10
    desc.push('Frontal passage')
  }

  const pd3 = w.pressure_delta_3h
  if (pd3 && pd3 < -4) {
    score += 12
    desc.push('Rapid pressure drop')
  } else if (pd3 && pd3 < -2) {
    score += 8
  }

  const td = w.temperature_delta_24h
  if (td && season === 'spring' && td < -8) {
    score += 5
    desc.push(`Cooling ${td.toFixed(0)}°C`)
  }
  if (td && season === 'fall' && td < -6) {
    score += 5
  }

  return { score: Math.min(score, 30), description: desc.join('; ') || 'No frontal activity' }
}

function calcWindScore(w, season) {
  let score = 0
  const desc = []
  const ws = w.wind_speed_10m
  const wd = w.wind_direction_10m

  if (!ws || wd === null) return { score: 0, description: 'No wind data' }

  const isHeadwind = (season === 'spring' && (wd >= 315 || wd <= 45)) ||
                     (season === 'fall' && wd >= 135 && wd <= 225)

  if (isHeadwind) {
    if (ws >= 40) {
      score += 15
      desc.push(`Strong headwind ${ws.toFixed(0)}km/h`)
    } else if (ws >= 25) {
      score += 10
    } else if (ws >= 15) {
      score += 5
    }
  }

  if (w.wind_gusts_10m && w.wind_gusts_10m >= 50) {
    score += 5
  }

  return { score: Math.min(score, 25), description: desc.join('; ') || 'Favorable winds' }
}

function calcPrecipScore(w, coastal) {
  let score = 0
  const desc = []
  const prob = w.precipitation_probability

  if (prob && prob >= 80) {
    score += 10
    desc.push(`High rain prob ${prob}%`)
  } else if (prob && prob >= 50) {
    score += 6
  }

  if (w.precipitation_mm && w.precipitation_mm >= 10) {
    score += 5
  }

  if (coastal && prob && prob >= 40) {
    score += 4
  }

  return { score: Math.min(score, 20), description: desc.join('; ') || 'Dry' }
}

function calcPressureScore(w) {
  let score = 0
  if (w.pressure_delta_24h && w.pressure_delta_24h < -5) score += 4
  if (w.pressure_msl && w.pressure_msl < 1005) score += 3
  return { score: Math.min(score, 10), description: 'Pressure pattern' }
}

function calcVisibilityScore(w) {
  let score = 0
  if (w.visibility_m && w.visibility_m < 3000) score += 4
  if (w.cloud_cover_low && w.cloud_cover_low >= 80) score += 3
  return { score: Math.min(score, 10), description: 'Visibility' }
}

function getLabel(score) {
  if (score <= 20) return 'Low'
  if (score <= 40) return 'Moderate'
  if (score <= 60) return 'Elevated'
  if (score <= 80) return 'High'
  return 'Exceptional'
}

export function generatePredictions(forecasts, lat, lon) {
  const corridor = getCorridor(lat, lon)
  const coastal = isCoastal(lat, lon)
  const now = new Date()

  // Group by date
  const daily = {}
  forecasts.forEach(f => {
    const dateStr = f.forecast_time.substring(0, 10)
    if (!daily[dateStr]) daily[dateStr] = []
    daily[dateStr].push(f)
  })

  const results = []
  for (const [dateStr, dayForecasts] of Object.entries(daily).sort()) {
    const forecastDate = new Date(dateStr)
    const { season, type: migrationType } = getSeason(forecastDate)

    // Find the forecast with most significant weather
    const best = dayForecasts.reduce((a, b) => {
      const scoreA = Math.abs(a.pressure_delta_3h || 0) + (a.precipitation_probability || 0) / 10
      const scoreB = Math.abs(b.pressure_delta_3h || 0) + (b.precipitation_probability || 0) / 10
      return scoreB > scoreA ? b : a
    })

    const front = calcFrontScore(best, season)
    const wind = calcWindScore(best, season)
    const precip = calcPrecipScore(best, coastal)
    const pressure = calcPressureScore(best)
    const visibility = calcVisibilityScore(best)

    const rawScore = front.score + wind.score + precip.score + pressure.score + visibility.score

    let multiplier = 1.0
    if (corridor === 'gulf_coast' && season === 'spring') multiplier = 1.2
    else if (corridor === 'atlantic' && season === 'fall') multiplier = 1.15

    const finalScore = Math.min(Math.round(rawScore * multiplier), 100)

    const forecastTime = new Date(best.forecast_time)
    const hoursAhead = (forecastTime - now) / (1000 * 60 * 60)
    const confidence = hoursAhead <= 24 ? 'high' : hoursAhead <= 72 ? 'medium' : 'low'

    const label = getLabel(finalScore)
    const summary = finalScore >= 60
      ? `${label} fallout potential.`
      : `${label} conditions.`

    results.push({
      prediction_date: dateStr,
      overall_score: finalScore,
      score_label: label,
      confidence,
      season,
      migration_type: migrationType,
      factors: {
        front,
        wind,
        precipitation: precip,
        pressure,
        visibility
      },
      summary
    })
  }

  return results
}
