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
    is_active_migration,
    is_peak_migration,
    migration_label,
    factors,
    summary
  } = prediction

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
      !is_active_migration ? 'opacity-75' : ''
    }`}>
      {/* Off-season warning */}
      {is_active_migration === false && (
        <div className="mb-3 -mt-1 -mx-1 px-3 py-1.5 bg-gray-100 rounded-t text-xs text-gray-500 flex items-center gap-1">
          <span>Off-season</span>
          <span className="text-gray-400">- Fallouts unlikely</span>
        </div>
      )}

      {/* Peak migration indicator */}
      {is_peak_migration && (
        <div className="mb-3 -mt-1 -mx-1 px-3 py-1.5 bg-green-100 rounded-t text-xs text-green-700 flex items-center gap-1">
          <span>Peak Migration Window</span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
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

          <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
            <span>
              <strong>Migration:</strong>{' '}
              <span className={is_active_migration ? 'text-green-600' : 'text-gray-400'}>
                {migration_label || season}
              </span>
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

          {!is_active_migration && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
              <strong>Note:</strong> These weather conditions would be significant during migration season,
              but fallouts are extremely rare outside of spring (Mar-May) and fall (Aug-Nov) migration periods.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PredictionCard
