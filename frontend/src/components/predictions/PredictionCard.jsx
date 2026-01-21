import ScoreGauge from './ScoreGauge'
import FactorBreakdown from './FactorBreakdown'
import { formatDate } from '../../utils/formatting'
import { getScoreClass } from '../../utils/colors'

function PredictionCard({ prediction, expanded = false }) {
  const {
    prediction_date,
    overall_score,
    score_label,
    confidence,
    season,
    migration_type,
    factors,
    summary
  } = prediction

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-gray-800">
              {formatDate(prediction_date)}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getScoreClass(overall_score)}`}>
              {score_label}
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600 capitalize">
              {confidence} confidence
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3">{summary}</p>

          <div className="flex gap-4 text-xs text-gray-500">
            <span className="capitalize">
              <strong>Season:</strong> {season}
            </span>
            <span className="capitalize">
              <strong>Type:</strong> {migration_type}
            </span>
          </div>
        </div>

        <div className="ml-4">
          <ScoreGauge score={overall_score} size="md" />
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Factor Breakdown</h4>
          <FactorBreakdown factors={factors} showDescriptions />
        </div>
      )}
    </div>
  )
}

export default PredictionCard
