// Centralized configuration for fallout prediction factors
// Used by prediction engine, factor breakdown displays, and detail popups

export const FALLOUT_FACTORS = [
  { key: 'front', label: 'Front Passage', maxScore: 30 },
  { key: 'wind', label: 'Wind', maxScore: 25 },
  { key: 'precipitation', label: 'Precipitation', maxScore: 20 },
  { key: 'pressure', label: 'Pressure', maxScore: 10 },
  { key: 'visibility', label: 'Visibility', maxScore: 10 },
  { key: 'temperature', label: 'Temperature', maxScore: 5 }
]

// Helper to get max score for a specific factor
export function getFactorMaxScore(factorKey) {
  const factor = FALLOUT_FACTORS.find(f => f.key === factorKey)
  return factor?.maxScore ?? 30
}

// Total possible score (sum of all max scores)
export const MAX_TOTAL_SCORE = FALLOUT_FACTORS.reduce((sum, f) => sum + f.maxScore, 0)

// Score thresholds for labels
export const SCORE_THRESHOLDS = {
  LOW: 20,
  MODERATE: 40,
  ELEVATED: 60,
  HIGH: 80
}

// Get label for a given score
export function getScoreLabel(score) {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'Exceptional'
  if (score >= SCORE_THRESHOLDS.ELEVATED) return 'High'
  if (score >= SCORE_THRESHOLDS.MODERATE) return 'Elevated'
  if (score >= SCORE_THRESHOLDS.LOW) return 'Moderate'
  return 'Low'
}
