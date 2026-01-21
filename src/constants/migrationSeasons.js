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

// Season start dates (month-day format, 1-indexed months)
const SEASON_DATES = {
  spring: { start: { month: 3, day: 1 }, end: { month: 5, day: 31 } },
  summer: { start: { month: 6, day: 1 }, end: { month: 7, day: 31 } },
  fall: { start: { month: 8, day: 1 }, end: { month: 11, day: 30 } },
  winter: { start: { month: 12, day: 1 }, end: { month: 2, day: 28 } }
}

// Get date for a season boundary in the appropriate year
function getSeasonDate(seasonKey, boundary, referenceDate) {
  const dates = SEASON_DATES[seasonKey]
  if (!dates) return null

  const { month, day } = dates[boundary]
  const year = referenceDate.getFullYear()

  // Handle winter which spans years
  if (seasonKey === 'winter' && boundary === 'end') {
    return new Date(year + 1, month - 1, day)
  }
  if (seasonKey === 'winter' && boundary === 'start' && referenceDate.getMonth() < 2) {
    return new Date(year - 1, month - 1, day)
  }

  return new Date(year, month - 1, day)
}

// Calculate days between two dates
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((date2 - date1) / oneDay)
}

// Get countdown information for migration seasons
export function getMigrationCountdown(date = new Date()) {
  const currentSeason = getMigrationSeason(date)
  const year = date.getFullYear()

  // Define key dates for this year
  const springStart = new Date(year, 2, 1)   // March 1
  const springPeakStart = new Date(year, 3, 15) // April 15
  const springPeakEnd = new Date(year, 4, 15)   // May 15
  const springEnd = new Date(year, 4, 31)    // May 31

  const fallStart = new Date(year, 7, 1)     // August 1
  const fallPeakStart = new Date(year, 8, 15)   // September 15
  const fallPeakEnd = new Date(year, 9, 31)     // October 31
  const fallEnd = new Date(year, 10, 30)     // November 30

  // Next year's spring for winter countdown
  const nextSpringStart = new Date(year + 1, 2, 1)

  const countdowns = []

  if (currentSeason.key === 'winter') {
    // Count down to spring migration
    const daysToSpring = daysBetween(date, date.getMonth() >= 11 ? nextSpringStart : springStart)
    countdowns.push({
      label: 'Spring Migration begins',
      days: daysToSpring,
      type: 'upcoming',
      season: 'spring'
    })
  } else if (currentSeason.key === 'summer') {
    // Count down to fall migration
    const daysToFall = daysBetween(date, fallStart)
    countdowns.push({
      label: 'Fall Migration begins',
      days: daysToFall,
      type: 'upcoming',
      season: 'fall'
    })
  } else if (currentSeason.key === 'spring') {
    // Show days until peak or days remaining in peak/season
    const isPeak = isInPeakMigration(date)
    if (date < springPeakStart) {
      countdowns.push({
        label: 'Peak migration begins',
        days: daysBetween(date, springPeakStart),
        type: 'upcoming',
        season: 'spring'
      })
    } else if (isPeak) {
      countdowns.push({
        label: 'Peak migration remaining',
        days: daysBetween(date, springPeakEnd),
        type: 'remaining',
        season: 'spring'
      })
    }
    countdowns.push({
      label: 'Spring Migration ends',
      days: daysBetween(date, springEnd),
      type: 'ends',
      season: 'spring'
    })
  } else if (currentSeason.key === 'fall') {
    // Show days until peak or days remaining in peak/season
    const isPeak = isInPeakMigration(date)
    if (date < fallPeakStart) {
      countdowns.push({
        label: 'Peak migration begins',
        days: daysBetween(date, fallPeakStart),
        type: 'upcoming',
        season: 'fall'
      })
    } else if (isPeak) {
      countdowns.push({
        label: 'Peak migration remaining',
        days: daysBetween(date, fallPeakEnd),
        type: 'remaining',
        season: 'fall'
      })
    }
    countdowns.push({
      label: 'Fall Migration ends',
      days: daysBetween(date, fallEnd),
      type: 'ends',
      season: 'fall'
    })
  }

  return countdowns
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
