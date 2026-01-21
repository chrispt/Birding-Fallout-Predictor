import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import TripPlannerPage from './pages/TripPlannerPage'
import HotspotsPage from './pages/HotspotsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/planner" element={<TripPlannerPage />} />
          <Route path="/hotspots" element={<HotspotsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
