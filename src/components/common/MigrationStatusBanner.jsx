import { getMigrationStatus, getMigrationSeason, getMigrationCountdown } from '../../constants/migrationSeasons'

function MigrationStatusBanner({ date = new Date() }) {
  const status = getMigrationStatus(date)
  const season = getMigrationSeason(date)
  const countdowns = getMigrationCountdown(date)

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
          <div className="flex items-center gap-2 flex-wrap">
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

        {/* Countdown display */}
        {countdowns.length > 0 && (
          <div className="text-right">
            <CountdownDisplay countdown={countdowns[0]} />
          </div>
        )}
      </div>

      {/* Additional countdowns and info */}
      {countdowns.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="flex flex-wrap gap-4">
            {countdowns.map((countdown, index) => (
              <CountdownBadge key={index} countdown={countdown} />
            ))}
          </div>
        </div>
      )}

      {status.status === 'off_season' && (
        <div className="mt-3 text-sm opacity-80">
          <p className="font-medium mb-1">Migration seasons:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-green-600">Spring:</span>
              <span>Mar 1 - May 31 (Peak: Apr 15 - May 15)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600">Fall:</span>
              <span>Aug 1 - Nov 30 (Peak: Sep 15 - Oct 31)</span>
            </div>
          </div>
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

function CountdownDisplay({ countdown }) {
  const { days, type } = countdown

  if (days <= 0) return null

  const isUrgent = type === 'upcoming' && days <= 14
  const textColor = isUrgent ? 'text-green-700' : ''

  return (
    <div className={`${textColor}`}>
      <div className="text-3xl font-bold leading-none">{days}</div>
      <div className="text-xs opacity-75">days</div>
    </div>
  )
}

function CountdownBadge({ countdown }) {
  const { label, days, type, season } = countdown

  const typeStyles = {
    upcoming: 'bg-green-200/50 text-green-800',
    remaining: 'bg-blue-200/50 text-blue-800',
    ends: 'bg-gray-200/50 text-gray-700'
  }

  const iconMap = {
    upcoming: '📅',
    remaining: '⏳',
    ends: '🏁'
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${typeStyles[type] || typeStyles.ends}`}>
      <span>{iconMap[type]}</span>
      <span className="font-medium">{label}:</span>
      <span className="font-bold">{days} day{days !== 1 ? 's' : ''}</span>
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
