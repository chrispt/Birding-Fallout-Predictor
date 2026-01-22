import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getScoreColor } from '../../utils/colors'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

// Sanitize a value to be safe for HTML attribute/content
function sanitizeForHtml(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  return String(value).replace(/[<>"'&]/g, char => ({
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;'
  }[char]))
}

// Create a colored circle marker icon
function createScoreMarker(score) {
  const color = getScoreColor(score)
  const safeScore = sanitizeForHtml(score)
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">${safeScore}</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

// Component to center map on selected location
function MapCenterUpdater({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])

  return null
}

function FalloutMap({
  center = [39.5, -98.35], // Center of continental US
  zoom = 4,
  selectedLocation = null,
  predictions = [],
  hotspots = [],
  onLocationSelect,
  height = '500px'
}) {
  const [mapCenter, setMapCenter] = useState(center)

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lon])
    }
  }, [selectedLocation])

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onLocationSelect && (
          <MapClickHandler onLocationSelect={onLocationSelect} />
        )}

        <MapCenterUpdater center={mapCenter} />

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
            <Popup>
              <div className="text-center">
                <strong>Selected Location</strong>
                <p className="text-sm text-gray-600">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Prediction markers */}
        {predictions.map((pred, index) => (
          <Marker
            key={`pred-${index}`}
            position={[pred.latitude, pred.longitude]}
            icon={createScoreMarker(pred.overall_score)}
          >
            <Popup>
              <div>
                <strong>{pred.score_label}</strong>
                <p className="text-sm">{pred.summary}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hotspot markers - supports both lat/lon and latitude/longitude formats */}
        {hotspots.map((hotspot, index) => {
          const lat = hotspot.lat ?? hotspot.latitude
          const lon = hotspot.lon ?? hotspot.longitude
          const state = hotspot.state ?? hotspot.state_code
          const isFalloutSite = hotspot.is_fallout_site ?? hotspot.region != null

          return (
            <Marker
              key={hotspot.ebird_loc_id || hotspot.name || index}
              position={[lat, lon]}
              icon={L.divIcon({
                className: 'hotspot-marker',
                html: `<div style="
                  background-color: ${isFalloutSite ? '#9333ea' : '#6b7280'};
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5]
              })}
            >
              <Popup>
                <div>
                  <strong>{sanitizeForHtml(hotspot.name)}</strong>
                  <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">
                    {sanitizeForHtml(state)}
                    {hotspot.description ? ` - ${sanitizeForHtml(hotspot.description)}` : ''}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default FalloutMap
