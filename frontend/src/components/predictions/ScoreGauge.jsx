import { getScoreColor, getScoreLabel } from '../../utils/colors'

function ScoreGauge({ score, size = 'md' }) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  const sizes = {
    sm: { outer: 60, inner: 50, text: 'text-lg', label: 'text-xs' },
    md: { outer: 80, inner: 66, text: 'text-2xl', label: 'text-sm' },
    lg: { outer: 120, inner: 100, text: 'text-4xl', label: 'text-base' }
  }

  const s = sizes[size] || sizes.md
  const circumference = Math.PI * s.inner
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: s.outer, height: s.outer }}>
        <svg
          className="transform -rotate-90"
          width={s.outer}
          height={s.outer}
        >
          {/* Background circle */}
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={s.inner / 2}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={s.inner / 2}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${s.text}`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className={`mt-1 font-medium ${s.label}`} style={{ color }}>
        {label}
      </span>
    </div>
  )
}

export default ScoreGauge
