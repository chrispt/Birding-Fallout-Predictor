import { useState, useEffect, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotspots } from '../hooks/useHotspots'
import { getRegions, getStates } from '../services/hotspots'
import { isEbirdConfigured, hasUserApiKey, isUsingDefaultApiKey } from '../services/ebirdApi'
import { getEbirdApiKey, setEbirdApiKey, validateEbirdApiKey, clearEbirdApiKey } from '../services/apiKeyStorage'

function HotspotsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('browse')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedState, setSelectedState] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [lastEbirdSearch, setLastEbirdSearch] = useState('')

  const {
    hotspots,
    customLocations,
    ebirdHotspots,
    loading,
    error,
    addLocation,
    removeLocation,
    searchByRegion,
    clearEbirdResults,
    usStates
  } = useHotspots({
    region: selectedRegion,
    state: selectedState,
    includeCustom: true,
    includeEbird: true
  })

  // Filter by search query - memoized to avoid recalculating on every render
  const filteredHotspots = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return hotspots.filter(h =>
      h.name.toLowerCase().includes(query) ||
      h.state?.toLowerCase().includes(query) ||
      h.description?.toLowerCase().includes(query)
    )
  }, [hotspots, searchQuery])

  const handleSelectLocation = (hotspot) => {
    navigate('/', { state: { lat: hotspot.lat, lon: hotspot.lon } })
  }

  const handleEbirdSearch = async (regionCode) => {
    if (regionCode) {
      setLastEbirdSearch(regionCode)
      await searchByRegion(regionCode)
    } else {
      setLastEbirdSearch('')
      clearEbirdResults()
    }
  }

  const handleRetryEbirdSearch = () => {
    if (lastEbirdSearch) {
      searchByRegion(lastEbirdSearch)
    }
  }

  const regions = getRegions()
  const states = getStates()

  const regionLabels = {
    gulf: 'Gulf Coast',
    atlantic: 'Atlantic Coast',
    greatlakes: 'Great Lakes',
    central: 'Central Flyway',
    custom: 'My Locations',
    ebird: 'eBird Search'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hotspots</h1>
        <p className="text-gray-600 mt-1">
          Browse {hotspots.length} birding locations or add your own favorites
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Browse Sites ({hotspots.length - customLocations.length - ebirdHotspots.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Locations ({customLocations.length})
          </button>
          <button
            onClick={() => setActiveTab('ebird')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ebird'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            eBird Search
          </button>
        </nav>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label htmlFor="filter-region" className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                id="filter-region"
                value={selectedRegion}
                onChange={(e) => { setSelectedRegion(e.target.value); setSelectedState('all'); }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Regions</option>
                {regions.map(r => (
                  <option key={r} value={r}>{regionLabels[r] || r}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                id="filter-state"
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedRegion('all'); }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All States</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                id="filter-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, state, or description..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Hotspot List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotspots.filter(h => h.source === 'static').map((hotspot) => (
              <HotspotCard
                key={`${hotspot.name}-${hotspot.lat}`}
                hotspot={hotspot}
                onSelect={() => handleSelectLocation(hotspot)}
              />
            ))}
          </div>

          {filteredHotspots.filter(h => h.source === 'static').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hotspots found matching your filters
            </div>
          )}
        </div>
      )}

      {/* Custom Locations Tab */}
      {activeTab === 'custom' && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Custom Location
            </button>
          </div>

          {customLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customLocations.map((location) => (
                <HotspotCard
                  key={location.id}
                  hotspot={location}
                  onSelect={() => handleSelectLocation(location)}
                  onDelete={() => removeLocation(location.id)}
                  showDelete
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No custom locations saved yet</p>
              <p className="text-sm text-gray-400">
                Add your favorite birding spots to track fallout predictions
              </p>
            </div>
          )}
        </div>
      )}

      {/* eBird Search Tab */}
      {activeTab === 'ebird' && (
        <div>
          {/* API Key Settings Section */}
          <ApiKeySettings />

          {!isEbirdConfigured() ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mt-6">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">eBird API Key Required</h3>
              <p className="text-yellow-700 mb-4">
                To search eBird hotspots, please add your eBird API key above.
              </p>
              <p className="text-sm text-yellow-600">
                Get a free API key at{' '}
                <a href="https://ebird.org/api/keygen" target="_blank" rel="noopener noreferrer" className="underline">
                  ebird.org/api/keygen
                </a>
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <label htmlFor="ebird-state-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search eBird hotspots by state
                </label>
                <select
                  id="ebird-state-search"
                  onChange={(e) => handleEbirdSearch(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select a state...</option>
                  {usStates.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">Searching eBird...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-4 flex items-center justify-between">
                  <span>{error}</span>
                  {lastEbirdSearch && (
                    <button
                      onClick={handleRetryEbirdSearch}
                      className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors text-sm font-medium"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              {ebirdHotspots.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Found {ebirdHotspots.length} hotspots (sorted by species count)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ebirdHotspots.map((hotspot) => (
                      <HotspotCard
                        key={hotspot.ebirdLocId}
                        hotspot={hotspot}
                        onSelect={() => handleSelectLocation(hotspot)}
                        showSpeciesCount
                      />
                    ))}
                  </div>
                  {/* eBird Attribution - Required by Terms of Use */}
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">
                      Hotspot data provided by{' '}
                      <a
                        href="https://ebird.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        eBird.org
                      </a>
                      , a project of the Cornell Lab of Ornithology
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Location Modal */}
      {showAddModal && (
        <AddLocationModal
          onClose={() => setShowAddModal(false)}
          onAdd={(location) => {
            addLocation(location)
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

const HotspotCard = memo(function HotspotCard({ hotspot, onSelect, onDelete, showDelete = false, showSpeciesCount = false }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{hotspot.name}</h3>
          <p className="text-sm text-gray-500">{hotspot.state}</p>
          {hotspot.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{hotspot.description}</p>
          )}
          {showSpeciesCount && hotspot.speciesCount > 0 && (
            <p className="text-xs text-blue-600 mt-1">{hotspot.speciesCount} species reported</p>
          )}
        </div>
        {hotspot.source && (
          <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
            hotspot.source === 'custom' ? 'bg-purple-100 text-purple-700' :
            hotspot.source === 'ebird' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {hotspot.source === 'custom' ? 'Custom' : hotspot.source === 'ebird' ? 'eBird' : hotspot.region}
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
        >
          View Predictions
        </button>
        {showDelete && (
          <button
            onClick={onDelete}
            className="text-sm px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
})

function AddLocationModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [state, setState] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Coordinate regex: optional negative, digits, optional decimal with up to 6 places
  const coordRegex = /^-?\d+(\.\d{1,6})?$/

  // Real-time validation for individual fields
  const validateField = (field, value) => {
    const errors = { ...fieldErrors }

    switch (field) {
      case 'name':
        if (value.length > 100) {
          errors.name = 'Name must be 100 characters or less'
        } else if (value.trim() === '') {
          errors.name = 'Name is required'
        } else {
          delete errors.name
        }
        break
      case 'lat':
        if (value && !coordRegex.test(value)) {
          errors.lat = 'Invalid format (e.g., 29.5647)'
        } else {
          const num = parseFloat(value)
          if (value && (isNaN(num) || num < -90 || num > 90)) {
            errors.lat = 'Must be between -90 and 90'
          } else {
            delete errors.lat
          }
        }
        break
      case 'lon':
        if (value && !coordRegex.test(value)) {
          errors.lon = 'Invalid format (e.g., -94.3912)'
        } else {
          const num = parseFloat(value)
          if (value && (isNaN(num) || num < -180 || num > 180)) {
            errors.lon = 'Must be between -180 and 180'
          } else {
            delete errors.lon
          }
        }
        break
      case 'state':
        if (value.length > 50) {
          errors.state = 'State must be 50 characters or less'
        } else {
          delete errors.state
        }
        break
      case 'description':
        if (value.length > 200) {
          errors.description = 'Description must be 200 characters or less'
        } else {
          delete errors.description
        }
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle input changes with validation
  const handleNameChange = (e) => {
    const value = e.target.value.slice(0, 100) // Enforce max length
    setName(value)
    validateField('name', value)
  }

  const handleLatChange = (e) => {
    setLat(e.target.value)
    validateField('lat', e.target.value)
  }

  const handleLonChange = (e) => {
    setLon(e.target.value)
    validateField('lon', e.target.value)
  }

  const handleStateChange = (e) => {
    const value = e.target.value.slice(0, 50)
    setState(value)
    validateField('state', value)
  }

  const handleDescriptionChange = (e) => {
    const value = e.target.value.slice(0, 200)
    setDescription(value)
    validateField('description', value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validate all fields on submit
    const nameValid = validateField('name', name)
    const latValid = validateField('lat', lat)
    const lonValid = validateField('lon', lon)

    if (!nameValid || !latValid || !lonValid || Object.keys(fieldErrors).length > 0) {
      setError('Please fix the errors above')
      return
    }

    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!lat || isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Invalid latitude (must be -90 to 90)')
      return
    }
    if (!lon || isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      setError('Invalid longitude (must be -180 to 180)')
      return
    }

    try {
      onAdd({
        name: name.trim(),
        lat: parseFloat(latNum.toFixed(6)), // Limit to 6 decimal places
        lon: parseFloat(lonNum.toFixed(6)),
        state: state.trim(),
        description: description.trim()
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Custom Location</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="location-name" className="block text-sm font-medium text-gray-700 mb-1">
              Location Name *
            </label>
            <input
              id="location-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., My Backyard"
              maxLength={100}
              className={`w-full border rounded-md px-3 py-2 ${
                fieldErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{name.length}/100</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location-lat" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                id="location-lat"
                type="text"
                value={lat}
                onChange={handleLatChange}
                placeholder="e.g., 29.5647"
                className={`w-full border rounded-md px-3 py-2 ${
                  fieldErrors.lat ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.lat && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.lat}</p>
              )}
            </div>
            <div>
              <label htmlFor="location-lon" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <input
                id="location-lon"
                type="text"
                value={lon}
                onChange={handleLonChange}
                placeholder="e.g., -94.3912"
                className={`w-full border rounded-md px-3 py-2 ${
                  fieldErrors.lon ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.lon && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.lon}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="location-state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              id="location-state"
              type="text"
              value={state}
              onChange={handleStateChange}
              placeholder="e.g., TX"
              maxLength={50}
              className={`w-full border rounded-md px-3 py-2 ${
                fieldErrors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldErrors.state && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="location-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              id="location-description"
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="e.g., Great for warblers"
              maxLength={200}
              className={`w-full border rounded-md px-3 py-2 ${
                fieldErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{description.length}/200</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Location
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          Tip: You can find coordinates by right-clicking on Google Maps
        </p>
      </div>
    </div>
  )
}

// API Key Settings Component
function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validating, setValidating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [hasKey, setHasKey] = useState(hasUserApiKey())
  const [isUsingDefault, setIsUsingDefault] = useState(isUsingDefaultApiKey())

  // Load existing key on mount
  useEffect(() => {
    const existingKey = getEbirdApiKey()
    if (existingKey) {
      setApiKey(existingKey)
    }
  }, [])

  // Auto-dismiss success and info messages after 5 seconds
  useEffect(() => {
    if (message.type === 'success' || message.type === 'info') {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' })
      return
    }

    setValidating(true)
    setMessage({ type: '', text: '' })

    const result = await validateEbirdApiKey(apiKey.trim())

    if (result.valid) {
      setEbirdApiKey(apiKey.trim())
      setHasKey(true)
      setIsUsingDefault(false)
      setMessage({ type: 'success', text: 'API key saved and validated successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }

    setValidating(false)
  }

  const handleRemoveKey = () => {
    clearEbirdApiKey()
    setApiKey('')
    setHasKey(false)
    setIsUsingDefault(isUsingDefaultApiKey())
    setMessage({ type: 'info', text: 'API key removed' })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">eBird API Key</h3>
        {hasKey && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Your key active
          </span>
        )}
        {!hasKey && isUsingDefault && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Using default key
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {hasKey
          ? 'Your personal eBird API key is being used.'
          : isUsingDefault
            ? 'A default API key is configured. Add your own key for dedicated access.'
            : 'Add your eBird API key to enable hotspot searching.'}
      </p>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <label htmlFor="ebird-api-key" className="sr-only">eBird API Key</label>
          <input
            id="ebird-api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your eBird API key"
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <button
          onClick={handleSaveKey}
          disabled={validating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {validating ? 'Validating...' : 'Save'}
        </button>
        {hasKey && (
          <button
            onClick={handleRemoveKey}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      {message.text && (
        <div className={`mt-3 text-sm p-2 rounded ${
          message.type === 'success' ? 'bg-green-50 text-green-700' :
          message.type === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        Get a free API key at{' '}
        <a
          href="https://ebird.org/api/keygen"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          ebird.org/api/keygen
        </a>
        . Your key is stored locally in your browser.
      </p>
    </div>
  )
}

export default HotspotsPage
