// Score to color mapping for predictions
export const scoreColors = {
  low: '#4CAF50',       // Green (0-20)
  moderate: '#8BC34A',  // Light green (21-40)
  elevated: '#FBC02D',  // Darker yellow/amber (41-60) - WCAG compliant
  high: '#FF9800',      // Orange (61-80)
  exceptional: '#F44336' // Red (81-100)
}

// Text colors for score backgrounds (ensures WCAG AA compliance)
export const scoreTextColors = {
  low: '#FFFFFF',       // White text on green
  moderate: '#1A1A1A',  // Dark text on light green
  elevated: '#1A1A1A',  // Dark text on yellow/amber
  high: '#1A1A1A',      // Dark text on orange
  exceptional: '#FFFFFF' // White text on red
}

export function getScoreColor(score) {
  if (score <= 20) return scoreColors.low
  if (score <= 40) return scoreColors.moderate
  if (score <= 60) return scoreColors.elevated
  if (score <= 80) return scoreColors.high
  return scoreColors.exceptional
}

export function getScoreTextColor(score) {
  if (score <= 20) return scoreTextColors.low
  if (score <= 40) return scoreTextColors.moderate
  if (score <= 60) return scoreTextColors.elevated
  if (score <= 80) return scoreTextColors.high
  return scoreTextColors.exceptional
}

export function getScoreLabel(score) {
  if (score <= 20) return 'Low'
  if (score <= 40) return 'Moderate'
  if (score <= 60) return 'Elevated'
  if (score <= 80) return 'High'
  return 'Exceptional'
}

export function getScoreClass(score) {
  if (score <= 20) return 'score-low'
  if (score <= 40) return 'score-moderate'
  if (score <= 60) return 'score-elevated'
  if (score <= 80) return 'score-high'
  return 'score-exceptional'
}

// Convert score to opacity for heatmap
export function scoreToOpacity(score, min = 0.2, max = 0.9) {
  return min + (score / 100) * (max - min)
}
