# Birding Fallout Predictor

Predict prime conditions for birding fallouts anywhere in the Lower 48 US States.

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

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Backend API available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database settings

# Run the server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Predictions

```bash
# Get 7-day predictions for a location
GET /api/v1/predictions/location?lat=29.5&lon=-94.5&days=7

# Response:
{
  "predictions": [
    {
      "prediction_date": "2025-04-15",
      "overall_score": 72,
      "score_label": "High",
      "confidence": "high",
      "season": "spring",
      "migration_type": "neotropical",
      "factors": { ... },
      "summary": "High fallout potential. Key factors: front passage, precipitation."
    }
  ]
}
```

### Weather

```bash
# Get current weather
GET /api/v1/weather/current?lat=29.5&lon=-94.5

# Get 7-day forecast
GET /api/v1/weather/forecast?lat=29.5&lon=-94.5&days=7
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
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── database.py          # DB connection
│   │   ├── models/              # SQLAlchemy models
│   │   ├── services/
│   │   │   ├── prediction_engine.py  # Core algorithm
│   │   │   └── weather_service.py    # Open-Meteo client
│   │   └── api/routes/          # API endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # React pages
│   │   ├── components/          # UI components
│   │   ├── hooks/               # React hooks
│   │   └── services/            # API client
│   └── package.json
└── docker-compose.yml
```

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React, Vite, Leaflet, Recharts, Tailwind CSS
- **Weather Data**: Open-Meteo API (free, no key required)

## Next Steps

1. **Database Setup**: Run migrations to create tables
2. **eBird Integration**: Add hotspot data from eBird API
3. **Historical Data**: Correlate past observations with weather
4. **CLI Tool**: Command-line interface for predictions
5. **Alerts**: Email/webhook notifications for high scores

## License

MIT
