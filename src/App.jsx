import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import ErrorBoundary from './components/common/ErrorBoundary'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const TripPlannerPage = lazy(() => import('./pages/TripPlannerPage'))
const HotspotsPage = lazy(() => import('./pages/HotspotsPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/planner" element={<TripPlannerPage />} />
              <Route path="/hotspots" element={<HotspotsPage />} />
              <Route path="/learn" element={<LearnPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App
