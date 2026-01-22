import { Link } from 'react-router-dom'

function LearnPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Understanding Birding Fallouts</h1>
        <p className="text-gray-600 mt-2">
          Learn what causes fallouts and how to predict these spectacular birding events
        </p>
      </div>

      {/* What is a Fallout */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Fallout?</h2>
        <p className="text-gray-700 mb-4">
          A <strong>birding fallout</strong> occurs when migrating birds are forced to land due to
          adverse weather conditions. Instead of continuing their journey, thousands of exhausted
          birds concentrate in small areas, creating exceptional birding opportunities.
        </p>
        <p className="text-gray-700 mb-4">
          During spring migration, neotropical songbirds fly north across the Gulf of Mexico -
          a non-stop 600-mile journey that takes 18-24 hours. When these birds encounter bad
          weather over land, they drop into the first available habitat, often coastal woodlands
          and barrier islands.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Why birders love fallouts:</strong> Species that normally stay hidden in
            forest canopy become visible at eye level, exhausted birds allow close approach,
            and dozens of species can be seen in a single morning.
          </p>
        </div>
      </section>

      {/* The Science */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Science Behind Fallouts</h2>
        <p className="text-gray-700 mb-4">
          Most songbirds migrate at night, using stars and Earth's magnetic field for navigation.
          They typically fly at altitudes of 1,000-5,000 feet. Several weather factors can disrupt
          this journey:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li><strong>Headwinds</strong> slow birds down and deplete their energy reserves</li>
          <li><strong>Rain</strong> weighs down feathers and forces birds to land</li>
          <li><strong>Low visibility</strong> from fog or clouds disorients nocturnal migrants</li>
          <li><strong>Cold fronts</strong> bring sudden weather changes that trap birds</li>
        </ul>
        <p className="text-gray-700">
          The classic spring fallout scenario: birds depart the Yucatan Peninsula on favorable
          south winds, but encounter a cold front with north winds and rain as they approach
          the Gulf Coast. Unable to continue, they drop into the first trees they find.
        </p>
      </section>

      {/* Weather Factors */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Weather Factors</h2>
        <p className="text-gray-600 mb-4">
          Our prediction algorithm weighs six weather factors. Here's what each one means:
        </p>

        <div className="space-y-4">
          <WeatherFactor
            name="Front Passage"
            points={30}
            color="red"
            description="Cold fronts are the #1 fallout trigger. We look for rapid pressure drops, temperature changes, and wind shifts that indicate a front moving through."
          />
          <WeatherFactor
            name="Wind"
            points={25}
            color="orange"
            description="Headwinds opposing migration direction are critical. In spring, north winds push against northbound birds. In fall, south winds slow southbound migrants."
          />
          <WeatherFactor
            name="Precipitation"
            points={20}
            color="yellow"
            description="Rain forces birds to land immediately. Even moderate rain probability at coastal locations significantly increases fallout chances."
          />
          <WeatherFactor
            name="Pressure"
            points={10}
            color="blue"
            description="Low pressure systems and rapid pressure changes indicate unsettled weather. Pressure below 1005 hPa often accompanies storm systems."
          />
          <WeatherFactor
            name="Visibility"
            points={10}
            color="purple"
            description="Fog, mist, and low clouds disorient nocturnal migrants. Birds can't navigate and must land until conditions improve."
          />
          <WeatherFactor
            name="Temperature"
            points={5}
            color="gray"
            description="Sharp temperature drops during frontal passages add stress. Combined with other factors, extreme temps contribute to fallout conditions."
          />
        </div>
      </section>

      {/* Migration Timing */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Migration Timing</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">Spring Migration</h3>
            <p className="text-green-700 text-sm mb-2">March 1 - May 31</p>
            <p className="text-green-700 text-sm mb-2">
              <strong>Peak:</strong> April 15 - May 15
            </p>
            <p className="text-green-600 text-sm">
              Trans-Gulf migrants heading north. This is prime fallout season, especially
              along the Gulf Coast. Warblers, tanagers, buntings, and thrushes.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-bold text-orange-800 mb-2">Fall Migration</h3>
            <p className="text-orange-700 text-sm mb-2">August 1 - November 30</p>
            <p className="text-orange-700 text-sm mb-2">
              <strong>Peak:</strong> September 15 - October 31
            </p>
            <p className="text-orange-600 text-sm">
              Southbound birds heading to wintering grounds. Fallouts are less dramatic
              than spring but still productive. Shorebirds peak earlier in fall.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-700 mb-2">Off-Season (Winter & Summer)</h3>
          <p className="text-gray-600 text-sm">
            Fallouts are extremely rare outside migration periods. Weather conditions that
            would cause fallouts in April have little effect in July when birds aren't
            migrating. Our predictions are heavily reduced during off-season months.
          </p>
        </div>
      </section>

      {/* Where Fallouts Happen */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Where Fallouts Happen</h2>
        <p className="text-gray-700 mb-4">
          Geography matters. Certain locations consistently produce fallouts due to their
          position along migration corridors:
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-bold text-gray-800">Gulf Coast Corridor</h3>
            <p className="text-gray-600 text-sm">
              The premier spring fallout region. Coastal Texas, Louisiana, Mississippi, Alabama,
              and Florida panhandle. Birds completing their Gulf crossing land here when weather
              turns bad. Famous sites: High Island TX, Grand Isle LA, Dauphin Island AL.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-gray-800">Great Lakes Corridor</h3>
            <p className="text-gray-600 text-sm">
              Major migration funnel for both spring and fall. Birds concentrate along lakeshores
              rather than crossing open water. Famous sites: Point Pelee ON, Magee Marsh OH,
              Whitefish Point MI.
            </p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-bold text-gray-800">Atlantic Coast Corridor</h3>
            <p className="text-gray-600 text-sm">
              Especially important in fall when birds follow the coastline south. Cape May NJ
              is legendary for fall hawk and songbird migration. Barrier islands and coastal
              parks concentrate migrants.
            </p>
          </div>
        </div>
      </section>

      {/* How We Calculate */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Calculate Predictions</h2>
        <p className="text-gray-700 mb-4">
          Our algorithm combines weather forecasts with migration timing and geography:
        </p>

        <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
          <li>Analyze 6 weather factors and assign points (0-100 base score)</li>
          <li>Apply seasonal multiplier (full score during migration, reduced off-season)</li>
          <li>Add corridor bonus for known migration hotspots (+10-20%)</li>
          <li>Factor in peak migration timing for additional boost</li>
        </ol>

        <div className="grid grid-cols-5 gap-2 mb-4">
          <ScoreExample label="Low" range="0-20" color="bg-score-low" />
          <ScoreExample label="Moderate" range="21-40" color="bg-score-moderate" />
          <ScoreExample label="Elevated" range="41-60" color="bg-score-elevated" />
          <ScoreExample label="High" range="61-80" color="bg-score-high" />
          <ScoreExample label="Exceptional" range="81-100" color="bg-score-exceptional" />
        </div>

        <p className="text-gray-600 text-sm">
          <strong>Confidence levels:</strong> Predictions within 24 hours are most reliable.
          Beyond 3 days, weather forecasts become less certain, so treat longer-range
          predictions as general guidance.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Ready to Find a Fallout?</h2>
        <p className="text-blue-200 mb-4">
          Check the current predictions for your area or explore known hotspots.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-2 bg-white text-blue-900 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            View Predictions
          </Link>
          <Link
            to="/hotspots"
            className="px-6 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Browse Hotspots
          </Link>
        </div>
      </section>
    </div>
  )
}

function WeatherFactor({ name, points, color, description }) {
  const colorClasses = {
    red: 'bg-red-100 border-red-300 text-red-800',
    orange: 'bg-orange-100 border-orange-300 text-orange-800',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    blue: 'bg-blue-100 border-blue-300 text-blue-800',
    purple: 'bg-purple-100 border-purple-300 text-purple-800',
    gray: 'bg-gray-100 border-gray-300 text-gray-700'
  }

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">{name}</h3>
        <span className="text-sm font-medium">{points} pts max</span>
      </div>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  )
}

function ScoreExample({ label, range, color }) {
  return (
    <div className="text-center">
      <div className={`${color} h-8 rounded mb-1`}></div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
      <div className="text-xs text-gray-500">{range}</div>
    </div>
  )
}

export default LearnPage
