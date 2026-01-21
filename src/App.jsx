import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import TripPlannerPage from './pages/TripPlannerPage'
import HotspotsPage from './pages/HotspotsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/planner" element={<TripPlannerPage />} />
          <Route path="/hotspots" element={<HotspotsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
