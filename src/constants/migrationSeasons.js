// Migration season configuration
// Defines when fallouts are likely to occur based on bird migration patterns

export const MIGRATION_SEASONS = {
  spring: {
    months: [3, 4, 5], // March, April, May
    label: 'Spring Migration',
    description: 'Peak neotropical migration - trans-Gulf migrants heading north',
    peakWeeks: { start: '04-15', end: '05-15' }, // Peak fallout window
    falloutLikelihood: 'high'
  },
  fall: {
    months: [8, 9, 10, 11], // August through November
    label: 'Fall Migration',
    description: 'Southbound migration - birds heading to wintering grounds',
    peakWeeks: { start: '09-15', end: '10-31' },
    falloutLikelihood: 'moderate'
  },
  winter: {
    months: [12, 1, 2],
    label: 'Winter',
    description: 'Non-migration period - occasional irruptive species only',
    peakWeeks: null,
    falloutLikelihood: 'very_low'
  },
  summer: {
    months: [6, 7],
    label: 'Summer',
    description: 'Non-migration period - breeding season',
    peakWeeks: null,
    falloutLikelihood: 'very_low'
  }
}

// Seasonal score multipliers - reduces scores outside migration
export const SEASONAL_MULTIPLIERS = {
  spring: 1.0,      // Full scores during spring migration
  fall: 0.85,       // Slightly reduced - fall fallouts less dramatic
  winter: 0.15,     // Heavily suppressed - fallouts extremely rare
  summer: 0.15      // Heavily suppressed - no migration
}

// Get current migration season info
export function getMigrationSeason(date = new Date()) {
  const month = date.getMonth() + 1

  for (const [seasonKey, season] of Object.entries(MIGRATION_SEASONS)) {
    if (season.months.includes(month)) {
      return {
        key: seasonKey,
        ...season,
        multiplier: SEASONAL_MULTIPLIERS[seasonKey],
        isActiveMigration: seasonKey === 'spring' || seasonKey === 'fall'
      }
    }
  }

  return {
    key: 'unknown',
    label: 'Unknown',
    description: '',
    multiplier: 0.5,
    isActiveMigration: false
  }
}

// Check if currently in peak migration window
export function isInPeakMigration(date = new Date()) {
  const season = getMigrationSeason(date)
  if (!season.peakWeeks) return false

  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return monthDay >= season.peakWeeks.start && monthDay <= season.peakWeeks.end
}

// Get display status for UI
export function getMigrationStatus(date = new Date()) {
  const season = getMigrationSeason(date)
  const isPeak = isInPeakMigration(date)

  if (isPeak) {
    return {
      status: 'peak',
      label: `Peak ${season.label}`,
      color: 'green',
      icon: '🔥',
      message: 'Prime fallout conditions possible with right weather'
    }
  }

  if (season.isActiveMigration) {
    return {
      status: 'active',
      label: season.label,
      color: 'blue',
      icon: '🐦',
      message: season.description
    }
  }

  return {
    status: 'off_season',
    label: 'Off Season',
    color: 'gray',
    icon: '❄️',
    message: `${season.label} - Fallouts unlikely regardless of weather`
  }
}
