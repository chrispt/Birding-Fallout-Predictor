from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date, datetime
from app.database import get_db
from app.services.prediction_engine import PredictionEngine, get_prediction_engine
from app.services.weather_service import get_weather_service

router = APIRouter()


class PredictionFactors(BaseModel):
    front: dict
    wind: dict
    precipitation: dict
    pressure: dict
    visibility: dict
    temperature: dict


class PredictionResponse(BaseModel):
    latitude: float
    longitude: float
    prediction_date: str
    overall_score: int
    score_label: str
    confidence: str
    season: str
    migration_type: str
    factors: PredictionFactors
    summary: str


class PredictionListResponse(BaseModel):
    predictions: list[PredictionResponse]
    total: int


@router.get("/location", response_model=PredictionListResponse)
async def get_predictions_for_location(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    days: int = Query(7, ge=1, le=14, description="Number of days to predict"),
    detailed: bool = Query(False, description="Include detailed factor breakdown")
):
    """
    Get fallout predictions for a specific location.

    Returns daily predictions with scores and confidence levels.
    """
    try:
        weather_service = await get_weather_service()
        engine = get_prediction_engine()

        # Get weather forecast with deltas
        forecasts = await weather_service.get_forecast_with_deltas(lat, lon, days)

        # Generate predictions for each day
        predictions = engine.generate_predictions(forecasts, lat, lon)

        return PredictionListResponse(
            predictions=[
                PredictionResponse(
                    latitude=lat,
                    longitude=lon,
                    prediction_date=p["prediction_date"],
                    overall_score=p["overall_score"],
                    score_label=p["score_label"],
                    confidence=p["confidence"],
                    season=p["season"],
                    migration_type=p["migration_type"],
                    factors=PredictionFactors(
                        front=p["factors"]["front"],
                        wind=p["factors"]["wind"],
                        precipitation=p["factors"]["precipitation"],
                        pressure=p["factors"]["pressure"],
                        visibility=p["factors"]["visibility"],
                        temperature=p["factors"]["temperature"]
                    ),
                    summary=p["summary"]
                )
                for p in predictions
            ],
            total=len(predictions)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating predictions: {str(e)}")


@router.get("/top")
async def get_top_predictions(
    date_str: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (default: today)"),
    limit: int = Query(10, ge=1, le=50, description="Number of top predictions to return"),
    db: Session = Depends(get_db)
):
    """
    Get top fallout predictions nationwide.

    Note: This requires regions and predictions to be stored in the database.
    Returns sample data for demonstration.
    """
    target_date = date_str or date.today().isoformat()

    # TODO: Query database for stored predictions
    return {
        "message": "Top predictions feature requires database-stored predictions.",
        "date": target_date,
        "suggestion": "Use GET /predictions/location?lat=29.5&lon=-94.5 for real-time predictions",
        "sample_hotspots": [
            {"name": "High Island, TX", "lat": 29.56, "lon": -94.39, "description": "Premier Gulf Coast fallout site"},
            {"name": "Point Pelee, ON", "lat": 41.96, "lon": -82.52, "description": "Great Lakes migration funnel"},
            {"name": "Cape May, NJ", "lat": 38.93, "lon": -74.91, "description": "Atlantic coast concentration point"},
            {"name": "Dauphin Island, AL", "lat": 30.25, "lon": -88.11, "description": "Gulf Coast barrier island"},
            {"name": "South Padre Island, TX", "lat": 26.10, "lon": -97.17, "description": "Lower Texas coast stopover"}
        ]
    }


@router.get("/map")
async def get_predictions_for_map(
    date_str: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    min_score: int = Query(0, ge=0, le=100, description="Minimum score filter")
):
    """
    Get aggregated prediction data for map visualization.

    Returns a grid of prediction points suitable for heatmap rendering.
    """
    target_date = date_str or date.today().isoformat()

    # TODO: Implement grid-based predictions
    return {
        "message": "Map predictions require pre-computed regional data.",
        "date": target_date,
        "min_score": min_score,
        "suggestion": "Use GET /predictions/location for individual location predictions"
    }


@router.get("/region/{region_code}")
async def get_region_predictions(
    region_code: str,
    days: int = Query(7, ge=1, le=14)
):
    """
    Get predictions for a specific region by code.

    Note: Requires regions to be set up in the database.
    """
    return {
        "message": f"Region predictions for '{region_code}' not yet implemented.",
        "suggestion": f"Use GET /predictions/location with lat/lon coordinates instead"
    }
