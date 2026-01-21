import { useNavigate } from 'react-router-dom'
import { getScoreColor } from '../../utils/colors'
import { formatDate } from '../../utils/formatting'

function CellDetailPopup({ cell, onClose }) {
  const navigate = useNavigate()

  if (!cell) return null

  const { hotspot, date, prediction, location } = cell

  const handleViewOnMap = () => {
    // Navigate to home page with location in state
    navigate('/', { state: { lat: location.lat, lon: location.lon } })
  }

  const factors = prediction?.factors || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 rounded-t-xl text-white"
          style={{ backgroundColor: getScoreColor(prediction?.score ?? 0) }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold drop-shadow-sm">{hotspot}</h3>
              <p className="text-white/90 text-sm">{location?.state} - {formatDate(date)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              &times;
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{prediction?.score ?? 0}</span>
            <span className="text-lg font-medium">{prediction?.label ?? 'Unknown'}</span>
          </div>
          {prediction?.confidence && (
            <div className="mt-1 text-sm text-white/80">
              {prediction.confidence} confidence
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Summary */}
          {prediction?.summary && (
            <p className="text-gray-700">{prediction.summary}</p>
          )}

          {/* Factor Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Factor Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(factors).map(([key, factor]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-24 text-xs text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(factor.score / getMaxScore(key)) * 100}%`,
                        backgroundColor: getScoreColor(factor.score * 3)
                      }}
                    />
                  </div>
                  <div className="w-8 text-xs font-medium text-gray-700 text-right">
                    {factor.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factor Descriptions */}
          <div className="text-xs text-gray-500 space-y-1">
            {Object.entries(factors).map(([key, factor]) => (
              factor.description && factor.description !== key && (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                  {factor.description}
                </div>
              )
            ))}
          </div>

          {/* Location Info */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">{location?.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 rounded-b-xl flex gap-2">
          <button
            onClick={handleViewOnMap}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View on Map
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function getMaxScore(factorKey) {
  const maxScores = {
    front: 30,
    wind: 25,
    precipitation: 20,
    pressure: 10,
    visibility: 10
  }
  return maxScores[factorKey] || 30
}

export default CellDetailPopup
