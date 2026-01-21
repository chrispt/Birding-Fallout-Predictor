// Score to color mapping for predictions
export const scoreColors = {
  low: '#4CAF50',       // Green (0-20)
  moderate: '#8BC34A',  // Light green (21-40)
  elevated: '#FFEB3B',  // Yellow (41-60)
  high: '#FF9800',      // Orange (61-80)
  exceptional: '#F44336' // Red (81-100)
}

export function getScoreColor(score) {
  if (score <= 20) return scoreColors.low
  if (score <= 40) return scoreColors.moderate
  if (score <= 60) return scoreColors.elevated
  if (score <= 80) return scoreColors.high
  return scoreColors.exceptional
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
