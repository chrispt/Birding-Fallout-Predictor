# Birding Fallout Predictor

Predict prime conditions for birding fallouts anywhere in the Lower 48 US States.

**Live Demo**: [Deployed on Vercel](https://your-app.vercel.app)

## What is a Fallout?

A "fallout" occurs when migrating birds are forced to land due to adverse weather conditions. These events concentrate large numbers of birds in small areas, creating exceptional birding opportunities. Key factors include:

- **Cold fronts** - The primary driver, bringing wind shifts and precipitation
- **Headwinds** - North winds in spring, south winds in fall
- **Precipitation** - Rain forces birds to land
- **Low visibility** - Disorients nocturnal migrants

## Features

- **7-day predictions** for any location in the continental US
- **Rule-based scoring** (0-100) based on 6 weather factors
- **Interactive map** with click-to-predict functionality
- **Real-time weather data** from Open-Meteo API
- **Known fallout sites** highlighted for quick access

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server (frontend + API via Vercel dev)
npx vercel dev

# Or run just the frontend
npm run dev
```

## API Endpoints

### Predictions

```bash
GET /api/predictions?lat=29.5&lon=-94.5&days=7
```

### Weather

```bash
GET /api/weather?lat=29.5&lon=-94.5&days=7
```

### Hotspots

```bash
GET /api/hotspots
```

## Scoring Algorithm

| Factor | Max Points | Description |
|--------|------------|-------------|
| Front Passage | 30 | Cold front detection via pressure/temp changes |
| Wind | 25 | Headwinds opposing migration direction |
| Precipitation | 20 | Rain probability and amount |
| Pressure | 10 | Barometric pressure trends |
| Visibility | 10 | Cloud cover and visibility |
| Temperature | 5 | Extreme temperature effects |

**Score Interpretation:**
- 0-20: Low - Normal conditions
- 21-40: Moderate - Some potential
- 41-60: Elevated - Good birding conditions
- 61-80: High - Strong fallout likely
- 81-100: Exceptional - Major event

## Project Structure

```
birding-fallout-predictor/
├── api/                          # Vercel serverless functions
│   ├── predictions.py            # Prediction endpoint
│   ├── weather.py                # Weather endpoint
│   ├── hotspots.py               # Hotspot data
│   └── _utils/                   # Shared Python modules
│       ├── prediction_engine.py  # Core scoring algorithm
│       └── weather_service.py    # Open-Meteo client
├── src/                          # React frontend
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── services/
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Tech Stack

- **Hosting**: Vercel (frontend + serverless functions)
- **Frontend**: React, Vite, Leaflet, Recharts, Tailwind CSS
- **Backend**: Python serverless functions
- **Weather Data**: Open-Meteo API (free, no key required)

## Deployment

Push to GitHub and connect to Vercel for automatic deployments.

## License

MIT
