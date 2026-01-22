import { useState, useMemo } from 'react'
import { useTopPredictions } from '../../hooks/usePredictions'
import { getScoreColor } from '../../utils/colors'
import { formatDate } from '../../utils/formatting'

function SuggestedSitesPanel({ onSiteSelect, limit = 5 }) {
  // Generate next 7 days for date selector (using local timezone)
  const dateOptions = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      // Use local date components to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
    }
    return dates
  }, [])

  const [selectedDate, setSelectedDate] = useState(dateOptions[0])
  const { predictions, loading, error } = useTopPredictions(selectedDate, limit)

  const handleSiteClick = (site) => {
    if (onSiteSelect) {
      onSiteSelect(site.lat, site.lon, site.hotspot_name)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Top Fallout Sites</h2>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {dateOptions.map((date) => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
          Failed to load predictions
        </div>
      )}

      {!loading && !error && predictions.length > 0 && (
        <div className="space-y-2">
          {predictions.map((site, index) => (
            <button
              key={site.hotspot_name}
              onClick={() => handleSiteClick(site)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: getScoreColor(site.overall_score) }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {site.hotspot_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {site.state} - {site.description}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-lg font-bold"
                    style={{ color: getScoreColor(site.overall_score) }}
                  >
                    {site.overall_score}
                  </div>
                  <div className="text-xs text-gray-500">{site.score_label}</div>
                </div>
              </div>
              {site.confidence && (
                <div className="mt-2 flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      site.confidence === 'high'
                        ? 'bg-green-500'
                        : site.confidence === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  ></span>
                  <span className="text-xs text-gray-500 capitalize">
                    {site.confidence} confidence
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && !error && predictions.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">
          No predictions available
        </div>
      )}
    </div>
  )
}

export default SuggestedSitesPanel
