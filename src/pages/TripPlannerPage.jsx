import { useState } from 'react'
import TripCalendarGrid from '../components/planner/TripCalendarGrid'
import CellDetailPopup from '../components/planner/CellDetailPopup'
import { useTripPlannerData } from '../hooks/useTripPlanner'
import { scoreColors } from '../utils/colors'

function TripPlannerPage() {
  const { data, loading, error } = useTripPlannerData()
  const [selectedCell, setSelectedCell] = useState(null)

  const handleCellClick = (cell) => {
    setSelectedCell(cell)
  }

  const handleClosePopup = () => {
    setSelectedCell(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trip Planner</h1>
        <p className="text-gray-600 mt-1">
          Compare fallout predictions across all sites for the next 7 days. Click any cell for details.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Score Legend</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: scoreColors.low }}></div>
            <span className="text-sm text-gray-600">0-20 Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: scoreColors.moderate }}></div>
            <span className="text-sm text-gray-600">21-40 Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: scoreColors.elevated }}></div>
            <span className="text-sm text-gray-600">41-60 Elevated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: scoreColors.high }}></div>
            <span className="text-sm text-gray-600">61-80 High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: scoreColors.exceptional }}></div>
            <span className="text-sm text-gray-600">81-100 Exceptional</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>★ = Best day for location</span>
          <span>▲ = Best location for day</span>
          <span className="bg-yellow-300 text-yellow-900 px-1 rounded font-bold">BEST</span>
          <span>= Overall best</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-2">
                  <div className="h-12 bg-gray-200 rounded w-40"></div>
                  {[1, 2, 3, 4, 5, 6, 7].map(j => (
                    <div key={j} className="h-12 bg-gray-200 rounded w-20"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-500 mt-4">Loading predictions for all sites...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-6 text-center">
          <p className="font-medium">Failed to load trip planner data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && !error && data && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TripCalendarGrid
            data={data}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
          />
        </div>
      )}

      {/* Best Overall Summary */}
      {!loading && !error && data?.bestOverall && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-4 border border-yellow-200">
          <h2 className="text-sm font-semibold text-yellow-800 mb-1">Best Opportunity</h2>
          <p className="text-lg font-bold text-gray-900">
            {data.bestOverall.hotspot} on{' '}
            {new Date(data.bestOverall.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-600">
            Predicted score: <span className="font-bold">{data.bestOverall.score}</span>
          </p>
        </div>
      )}

      {/* Detail Popup */}
      {selectedCell && (
        <CellDetailPopup cell={selectedCell} onClose={handleClosePopup} />
      )}
    </div>
  )
}

export default TripPlannerPage
