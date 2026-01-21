import { useState } from 'react'
import FalloutMap from '../components/map/FalloutMap'
import PredictionCard from '../components/predictions/PredictionCard'
import WeatherPanel from '../components/weather/WeatherPanel'
import { usePredictions } from '../hooks/usePredictions'
import { useCurrentWeather } from '../hooks/useWeather'
import { formatCoords } from '../utils/formatting'

function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)

  const { predictions, loading: predictionsLoading } =
    usePredictions(selectedLocation?.lat, selectedLocation?.lon)

  const { weather, loading: weatherLoading } =
    useCurrentWeather(selectedLocation?.lat, selectedLocation?.lon)

  const handleLocationSelect = (lat, lon) => {
    setSelectedLocation({ lat, lon })
  }

  // Get today's prediction for quick display
  const todayPrediction = predictions[0] || null

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Full-screen map */}
      <div className={`flex-1 relative ${showSidebar ? '' : 'w-full'}`}>
        <FalloutMap
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          height="100%"
          zoom={5}
        />

        {/* Toggle sidebar button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2 hover:bg-gray-50"
        >
          {showSidebar ? '→' : '←'} {showSidebar ? 'Hide' : 'Show'} Panel
        </button>

        {/* Instructions overlay */}
        {!selectedLocation && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 rounded-lg shadow-lg p-4 max-w-sm">
            <h3 className="font-semibold text-gray-800">Getting Started</h3>
            <p className="text-sm text-gray-600 mt-1">
              Click anywhere on the map to get fallout predictions for that location.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Location info */}
            {selectedLocation ? (
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-blue-800">Selected Location</h3>
                <p className="text-sm text-blue-600">
                  {formatCoords(selectedLocation.lat, selectedLocation.lon)}
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-gray-500">Click on the map to select a location</p>
              </div>
            )}

            {/* Weather panel */}
            {selectedLocation && (
              <WeatherPanel weather={weather} loading={weatherLoading} />
            )}

            {/* Today's prediction highlight */}
            {todayPrediction && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Today's Prediction</h3>
                <PredictionCard prediction={todayPrediction} expanded />
              </div>
            )}

            {/* Upcoming predictions */}
            {predictions.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Days</h3>
                <div className="space-y-3">
                  {predictions.slice(1).map((prediction) => (
                    <PredictionCard
                      key={prediction.prediction_date}
                      prediction={prediction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {predictionsLoading && selectedLocation && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading predictions...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MapPage
