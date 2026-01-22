import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import FalloutMap from '../components/map/FalloutMap'
import PredictionCard from '../components/predictions/PredictionCard'
import WeatherPanel from '../components/weather/WeatherPanel'
import SuggestedSitesPanel from '../components/hotspots/SuggestedSitesPanel'
import MigrationStatusBanner from '../components/common/MigrationStatusBanner'
import FeedbackModal from '../components/common/FeedbackModal'
import { usePredictions } from '../hooks/usePredictions'
import { useCurrentWeather } from '../hooks/useWeather'
import { formatCoords } from '../utils/formatting'
import { FALLOUT_HOTSPOTS } from '../services/hotspots'

const LOCATION_STORAGE_KEY = 'bfp_selected_location'

function HomePage() {
  const location = useLocation()
  const [selectedLocation, setSelectedLocation] = useState(() => {
    // Initialize from localStorage on first render
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          return parsed // Will include name if it was stored
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null
  })

  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  // Handle navigation from Trip Planner with location state
  useEffect(() => {
    if (location.state?.lat && location.state?.lon) {
      setSelectedLocation({ lat: location.state.lat, lon: location.state.lon })
    }
  }, [location.state])

  // Persist selected location to localStorage
  useEffect(() => {
    if (selectedLocation) {
      try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(selectedLocation))
      } catch {
        // Ignore storage errors
      }
    }
  }, [selectedLocation])

  const [expandedPrediction, setExpandedPrediction] = useState(null)

  const { predictions, loading: predictionsLoading, loadingSlow, error: predictionsError, refetch: refetchPredictions } =
    usePredictions(selectedLocation?.lat, selectedLocation?.lon)

  const { weather, loading: weatherLoading } =
    useCurrentWeather(selectedLocation?.lat, selectedLocation?.lon)

  const handleLocationSelect = (lat, lon, name = null) => {
    setSelectedLocation(name ? { lat, lon, name } : { lat, lon })
    setExpandedPrediction(null)
    setGeoError(null)
  }

  const handleHotspotClick = (hotspot) => {
    setSelectedLocation({ lat: hotspot.lat, lon: hotspot.lon, name: hotspot.name })
    setExpandedPrediction(null)
    setGeoError(null)
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    setGeoLoading(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'My Location'
        })
        setExpandedPrediction(null)
        setGeoLoading(false)
      },
      (error) => {
        setGeoLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission denied')
            break
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location unavailable')
            break
          case error.TIMEOUT:
            setGeoError('Location request timed out')
            break
          default:
            setGeoError('Unable to get location')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Birding Fallout Predictor</h1>
        <p className="text-gray-600 mt-1">
          Click anywhere on the map to get a 7-day fallout prediction.{' '}
          <Link to="/learn" className="text-blue-600 hover:text-blue-800 hover:underline">
            Learn how fallouts work
          </Link>
          {' | '}
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Give Feedback
          </button>
        </p>
      </div>

      {/* Migration Status Banner */}
      <div className="mb-6">
        <MigrationStatusBanner />
      </div>

      {/* Use My Location Button */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={handleGeolocation}
          disabled={geoLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {geoLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Getting location...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Use My Location</span>
            </>
          )}
        </button>
        {geoError && (
          <span className="text-red-600 text-sm">{geoError}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map and Quick Access */}
        <div className="lg:col-span-2">
          <FalloutMap
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            hotspots={FALLOUT_HOTSPOTS}
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
              <p className="text-sm text-blue-600 font-medium">
                {selectedLocation.name || formatCoords(selectedLocation.lat, selectedLocation.lon)}
              </p>
              {selectedLocation.name && (
                <p className="text-xs text-blue-500 mt-0.5">
                  {formatCoords(selectedLocation.lat, selectedLocation.lon)}
                </p>
              )}
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
          <div>
            {loadingSlow && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700 text-sm">
                Taking longer than expected... Please wait, weather data is being fetched.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {predictionsError && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 flex items-center justify-between">
            <span>Error: {predictionsError}</span>
            <button
              onClick={refetchPredictions}
              className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors text-sm font-medium"
            >
              Try Again
            </button>
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </div>
  )
}

export default HomePage
