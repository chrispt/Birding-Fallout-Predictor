import { getMigrationStatus, getMigrationSeason } from '../../constants/migrationSeasons'

function MigrationStatusBanner({ date = new Date() }) {
  const status = getMigrationStatus(date)
  const season = getMigrationSeason(date)

  const colorClasses = {
    green: 'bg-green-100 border-green-300 text-green-800',
    blue: 'bg-blue-100 border-blue-300 text-blue-800',
    gray: 'bg-gray-100 border-gray-300 text-gray-600'
  }

  const bgClass = colorClasses[status.color] || colorClasses.gray

  return (
    <div className={`rounded-lg border p-4 ${bgClass}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={status.label}>
          {status.icon}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{status.label}</h3>
            {status.status === 'peak' && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                PEAK
              </span>
            )}
            {status.status === 'off_season' && (
              <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full">
                OFF SEASON
              </span>
            )}
          </div>
          <p className="text-sm opacity-90">{status.message}</p>
        </div>
      </div>

      {status.status === 'off_season' && (
        <div className="mt-3 pt-3 border-t border-current/20 text-sm">
          <p className="font-medium">When to check back:</p>
          <ul className="mt-1 space-y-1 text-sm opacity-80">
            <li>Spring Migration: March - May (Peak: mid-April to mid-May)</li>
            <li>Fall Migration: August - November (Peak: mid-September to late October)</li>
          </ul>
        </div>
      )}

      {status.status === 'active' && season.peakWeeks && (
        <div className="mt-2 text-xs opacity-75">
          Peak window: {formatPeakWindow(season.peakWeeks)}
        </div>
      )}
    </div>
  )
}

function formatPeakWindow(peakWeeks) {
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [startMonth, startDay] = peakWeeks.start.split('-').map(Number)
  const [endMonth, endDay] = peakWeeks.end.split('-').map(Number)
  return `${monthNames[startMonth]} ${startDay} - ${monthNames[endMonth]} ${endDay}`
}

export default MigrationStatusBanner
