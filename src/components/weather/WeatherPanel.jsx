import { formatTemp, formatWind, formatPressure } from '../../utils/formatting'

function WeatherPanel({ weather, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-gray-500 text-center">
        Select a location to see weather
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Conditions</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500">Temperature</span>
          <p className="text-2xl font-bold text-gray-800">
            {formatTemp(weather.temperature_2m)}
          </p>
          <p className="text-sm text-gray-500">
            Feels like {formatTemp(weather.apparent_temperature)}
          </p>
        </div>

        <div>
          <span className="text-sm text-gray-500">Wind</span>
          <p className="text-lg font-semibold text-gray-800">
            {formatWind(weather.wind_speed_10m, weather.wind_direction_10m)}
          </p>
          {weather.wind_gusts_10m && (
            <p className="text-sm text-gray-500">
              Gusts: {Math.round(weather.wind_gusts_10m * 0.621371)} mph
            </p>
          )}
        </div>

        <div>
          <span className="text-sm text-gray-500">Pressure</span>
          <p className="text-lg font-semibold text-gray-800">
            {formatPressure(weather.pressure_msl)}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            {weather.pressure_trend?.replace('_', ' ') || 'Steady'}
          </p>
        </div>

        <div>
          <span className="text-sm text-gray-500">Precipitation</span>
          <p className="text-lg font-semibold text-gray-800">
            {weather.precipitation_probability || 0}% chance
          </p>
          <p className="text-sm text-gray-500">
            {weather.weather_description || 'Clear'}
          </p>
        </div>

        <div>
          <span className="text-sm text-gray-500">Cloud Cover</span>
          <p className="text-lg font-semibold text-gray-800">
            {weather.cloud_cover_total || 0}%
          </p>
        </div>

        <div>
          <span className="text-sm text-gray-500">Visibility</span>
          <p className="text-lg font-semibold text-gray-800">
            {weather.visibility_m ? `${(weather.visibility_m / 1609.34).toFixed(1)} mi` : '--'}
          </p>
        </div>
      </div>

      {weather.is_frontal_passage && (
        <div className="mt-4 p-2 bg-orange-100 border border-orange-300 rounded">
          <p className="text-sm text-orange-800 font-medium">
            ⚠️ {weather.front_type?.charAt(0).toUpperCase() + weather.front_type?.slice(1)} front passage detected
          </p>
        </div>
      )}
    </div>
  )
}

export default WeatherPanel
