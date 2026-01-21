import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Weather endpoints
export const weatherApi = {
  getForecast: (lat, lon, days = 7) =>
    api.get('/weather', { params: { lat, lon, days } }),

  getCurrent: (lat, lon) =>
    api.get('/weather', { params: { lat, lon, days: 1 } })
}

// Predictions endpoints
export const predictionsApi = {
  getForLocation: (lat, lon, days = 7) =>
    api.get('/predictions', { params: { lat, lon, days } }),
}

// Hotspots endpoints
export const hotspotsApi = {
  list: () => api.get('/hotspots'),
}

export default api
