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
  const factorConfig = [
    { key: 'front', label: 'Front Passage', max: 30 },
    { key: 'wind', label: 'Wind', max: 25 },
    { key: 'precipitation', label: 'Precipitation', max: 20 },
    { key: 'pressure', label: 'Pressure', max: 10 },
    { key: 'visibility', label: 'Visibility', max: 10 },
    { key: 'temperature', label: 'Temperature', max: 5 }
  ]

  return (
    <div className="space-y-1">
      {factorConfig.map(({ key, label, max }) => (
        <FactorBar
          key={key}
          label={label}
          score={factors[key]?.score || 0}
          maxScore={max}
          description={showDescriptions ? factors[key]?.description : null}
        />
      ))}
    </div>
  )
}

export default FactorBreakdown
