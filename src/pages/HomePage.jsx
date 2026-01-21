import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import FalloutMap from '../components/map/FalloutMap'
import PredictionCard from '../components/predictions/PredictionCard'
import WeatherPanel from '../components/weather/WeatherPanel'
import SuggestedSitesPanel from '../components/hotspots/SuggestedSitesPanel'
import { usePredictions } from '../hooks/usePredictions'
import { useCurrentWeather } from '../hooks/useWeather'
import { formatCoords } from '../utils/formatting'
import { FALLOUT_HOTSPOTS } from '../services/hotspots'

function HomePage() {
  const location = useLocation()
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Handle navigation from Trip Planner with location state
  useEffect(() => {
    if (location.state?.lat && location.state?.lon) {
      setSelectedLocation({ lat: location.state.lat, lon: location.state.lon })
    }
  }, [location.state])
  const [expandedPrediction, setExpandedPrediction] = useState(null)

  const { predictions, loading: predictionsLoading, error: predictionsError } =
    usePredictions(selectedLocation?.lat, selectedLocation?.lon)

  const { weather, loading: weatherLoading } =
    useCurrentWeather(selectedLocation?.lat, selectedLocation?.lon)

  const handleLocationSelect = (lat, lon) => {
    setSelectedLocation({ lat, lon })
    setExpandedPrediction(null)
  }

  const handleHotspotClick = (hotspot) => {
    handleLocationSelect(hotspot.lat, hotspot.lon)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Birding Fallout Predictor</h1>
        <p className="text-gray-600 mt-1">
          Click anywhere on the map to get a 7-day fallout prediction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map and Quick Access */}
        <div className="lg:col-span-2">
          <FalloutMap
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            height="400px"
          />

          {/* Quick access hotspots */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Access - Known Fallout Sites</h3>
            <div className="flex flex-wrap gap-2">
              {FALLOUT_HOTSPOTS.map((hotspot) => (
                <button
                  key={hotspot.name}
                  onClick={() => handleHotspotClick(hotspot)}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
                  title={hotspot.description}
                >
                  {hotspot.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Suggested sites panel */}
          <SuggestedSitesPanel
            onSiteSelect={handleLocationSelect}
            limit={5}
          />

          {/* Location info */}
          {selectedLocation && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-800">Selected Location</h3>
              <p className="text-sm text-blue-600">
                {formatCoords(selectedLocation.lat, selectedLocation.lon)}
              </p>
            </div>
          )}

          {/* Weather panel */}
          <WeatherPanel weather={weather} loading={weatherLoading} />
        </div>
      </div>

      {/* Predictions section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7-Day Forecast</h2>

        {!selectedLocation && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              Click on the map or select a hotspot to view predictions
            </p>
          </div>
        )}

        {predictionsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {predictionsError && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4">
            Error: {predictionsError}
          </div>
        )}

        {predictions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <div
                key={prediction.prediction_date}
                onClick={() => setExpandedPrediction(
                  expandedPrediction === index ? null : index
                )}
                className="cursor-pointer"
              >
                <PredictionCard
                  prediction={prediction}
                  expanded={expandedPrediction === index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
