import { getScoreColor } from '../../utils/colors'
import { formatDate } from '../../utils/formatting'

function TripCalendarGrid({ data, onCellClick, selectedCell }) {
  if (!data) return null

  const { dates, hotspots, bestOverall, bestByDate, bestByHotspot } = data

  const isBestOverall = (hotspotName, date) => {
    return bestOverall.hotspot === hotspotName && bestOverall.date === date
  }

  const isBestInRow = (hotspotName, date) => {
    return bestByHotspot[hotspotName]?.date === date
  }

  const isBestInColumn = (hotspotName, date) => {
    return bestByDate[date]?.hotspot === hotspotName
  }

  const isSelected = (hotspotName, date) => {
    return selectedCell?.hotspot === hotspotName && selectedCell?.date === date
  }

  const getPrediction = (hotspot, date) => {
    return hotspot.predictions.find(p => p.date === date)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-r border-gray-300 min-w-[180px]">
              Location
            </th>
            {dates.map(date => (
              <th
                key={date}
                className="px-2 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300 min-w-[80px]"
              >
                <div className="text-xs text-gray-500">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div>
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hotspots.map((hotspot, rowIndex) => (
            <tr key={hotspot.name} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="sticky left-0 z-10 px-4 py-2 border-r border-gray-300 bg-inherit">
                <div className="font-medium text-gray-900 text-sm truncate max-w-[160px]" title={hotspot.name}>
                  {hotspot.name}
                </div>
                <div className="text-xs text-gray-500">{hotspot.state}</div>
              </td>
              {dates.map(date => {
                const pred = getPrediction(hotspot, date)
                const score = pred?.score ?? 0
                const bestInRow = isBestInRow(hotspot.name, date)
                const bestInCol = isBestInColumn(hotspot.name, date)
                const bestAll = isBestOverall(hotspot.name, date)
                const selected = isSelected(hotspot.name, date)

                return (
                  <td
                    key={date}
                    className="p-1 border-b border-gray-200"
                  >
                    <button
                      onClick={() => onCellClick({ hotspot: hotspot.name, date, prediction: pred, location: hotspot })}
                      className={`
                        w-full h-full min-h-[52px] rounded-lg flex flex-col items-center justify-center
                        transition-all duration-150 hover:scale-105 hover:shadow-md
                        ${selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                        ${bestAll ? 'ring-2 ring-yellow-400' : ''}
                      `}
                      style={{ backgroundColor: getScoreColor(score) }}
                    >
                      <span className="text-lg font-bold text-white drop-shadow-sm">
                        {score}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {bestInRow && !bestAll && (
                          <span className="text-xs text-white" title="Best day for this location">★</span>
                        )}
                        {bestInCol && !bestAll && (
                          <span className="text-xs text-white" title="Best location for this day">▲</span>
                        )}
                        {bestAll && (
                          <span className="text-[10px] font-bold text-yellow-900 bg-yellow-300 px-1 rounded">
                            BEST
                          </span>
                        )}
                      </div>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TripCalendarGrid
