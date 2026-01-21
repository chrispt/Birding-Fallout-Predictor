import { FALLOUT_FACTORS } from '../../constants/falloutFactors'

function FactorBar({ label, score, maxScore, description }) {
  const percentage = (score / maxScore) * 100

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}

function FactorBreakdown({ factors, showDescriptions = false }) {
  return (
    <div className="space-y-1">
      {FALLOUT_FACTORS.map(({ key, label, maxScore }) => (
        <FactorBar
          key={key}
          label={label}
          score={factors[key]?.score || 0}
          maxScore={maxScore}
          description={showDescriptions ? factors[key]?.description : null}
        />
      ))}
    </div>
  )
}

export default FactorBreakdown
