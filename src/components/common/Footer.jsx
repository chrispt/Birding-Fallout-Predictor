function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-3">Birding Fallout Predictor</h3>
            <p className="text-sm text-gray-400">
              Predict prime conditions for birding fallouts using weather data and migration patterns.
            </p>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-white font-semibold mb-3">Data Sources</h3>
            <ul className="text-sm space-y-2">
              <li>
                Weather data:{' '}
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Open-Meteo
                </a>
              </li>
              <li>
                Hotspot data:{' '}
                <a
                  href="https://ebird.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  eBird.org
                </a>
                {' '}(Cornell Lab of Ornithology)
              </li>
              <li>
                Maps:{' '}
                <a
                  href="https://www.openstreetmap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  OpenStreetMap
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Resources</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href="https://ebird.org/explore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Explore eBird
                </a>
              </li>
              <li>
                <a
                  href="https://www.birds.cornell.edu/home/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Cornell Lab of Ornithology
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>
            eBird hotspot data provided by{' '}
            <a href="https://ebird.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              eBird.org
            </a>
            , a project of the Cornell Lab of Ornithology.
          </p>
          <p className="mt-2">
            Weather data from{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Open-Meteo.com
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
