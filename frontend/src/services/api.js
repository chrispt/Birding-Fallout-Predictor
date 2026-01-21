import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Weather endpoints
export const weatherApi = {
  getForecast: (lat, lon, days = 7) =>
    api.get('/weather/forecast', { params: { lat, lon, days } }),

  getCurrent: (lat, lon) =>
    api.get('/weather/current', { params: { lat, lon } })
}

// Predictions endpoints
export const predictionsApi = {
  getForLocation: (lat, lon, days = 7) =>
    api.get('/predictions/location', { params: { lat, lon, days } }),

  getTop: (date, limit = 10) =>
    api.get('/predictions/top', { params: { date_str: date, limit } }),

  getForMap: (date, minScore = 0) =>
    api.get('/predictions/map', { params: { date_str: date, min_score: minScore } })
}

// Hotspots endpoints
export const hotspotsApi = {
  list: (params = {}) =>
    api.get('/hotspots', { params }),

  getNearby: (lat, lon, radiusKm = 50, falloutSitesOnly = false) =>
    api.get('/hotspots/nearby', {
      params: { lat, lon, radius_km: radiusKm, fallout_sites_only: falloutSitesOnly }
    }),

  getFalloutSites: (stateCode = null) =>
    api.get('/hotspots/fallout-sites', { params: { state_code: stateCode } }),

  get: (ebirdLocId) =>
    api.get(`/hotspots/${ebirdLocId}`)
}

// Regions endpoints
export const regionsApi = {
  list: (params = {}) =>
    api.get('/regions', { params }),

  get: (code) =>
    api.get(`/regions/${code}`),

  getChildren: (code) =>
    api.get(`/regions/${code}/children`),

  getCorridors: () =>
    api.get('/regions/corridors/list')
}

export default api
