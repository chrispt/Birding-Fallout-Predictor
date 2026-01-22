import { useState, useEffect, memo } from 'react'
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

  // Filter by search query
  const filteredHotspots = hotspots.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectLocation = (hotspot) => {
    navigate('/', { state: { lat: hotspot.lat, lon: hotspot.lon } })
  }

  const handleEbirdSearch = async (regionCode) => {
    if (regionCode) {
      await searchByRegion(regionCode)
    } else {
      clearEbirdResults()
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search eBird hotspots by state
                </label>
                <select
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
                <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-4">
                  {error}
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

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Invalid latitude (must be -90 to 90)')
      return
    }
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      setError('Invalid longitude (must be -180 to 180)')
      return
    }

    try {
      onAdd({
        name: name.trim(),
        lat: latNum,
        lon: lonNum,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Backyard"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g., 29.5647"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <input
                type="text"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="e.g., -94.3912"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., TX"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Great for warblers"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
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
          <input
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
