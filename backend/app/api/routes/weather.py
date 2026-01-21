from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.services.weather_service import get_weather_service

router = APIRouter()


class WeatherForecastResponse(BaseModel):
    latitude: float
    longitude: float
    forecast_count: int
    forecasts: list[dict]


class CurrentWeatherResponse(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    weather: dict


@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_weather_forecast(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    days: int = Query(7, ge=1, le=16, description="Number of forecast days")
):
    """
    Get weather forecast for a location.

    Returns hourly forecast data including temperature, wind, precipitation,
    pressure, and calculated deltas for fallout prediction.
    """
    try:
        service = await get_weather_service()
        forecasts = await service.get_forecast_with_deltas(lat, lon, days)

        return WeatherForecastResponse(
            latitude=lat,
            longitude=lon,
            forecast_count=len(forecasts),
            forecasts=forecasts
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")


@router.get("/current", response_model=CurrentWeatherResponse)
async def get_current_weather(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude")
):
    """
    Get current weather conditions for a location.

    Returns the most recent forecast hour's data.
    """
    try:
        service = await get_weather_service()
        forecasts = await service.get_forecast_with_deltas(lat, lon, forecast_days=1)

        if not forecasts:
            raise HTTPException(status_code=404, detail="No weather data available")

        # Find closest to current time
        now = datetime.utcnow()
        closest = min(
            forecasts,
            key=lambda f: abs(
                (datetime.fromisoformat(f["forecast_time"]) - now).total_seconds()
            )
        )

        return CurrentWeatherResponse(
            latitude=lat,
            longitude=lon,
            timestamp=closest["forecast_time"],
            weather=closest
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")


@router.get("/region/{region_code}/forecast")
async def get_region_forecast(
    region_code: str,
    days: int = Query(7, ge=1, le=16, description="Number of forecast days")
):
    """
    Get weather forecast for a region by its code.

    Note: This endpoint requires regions to be set up in the database.
    For now, returns a placeholder response.
    """
    # TODO: Look up region coordinates from database
    # For now, return a helpful message
    return {
        "message": f"Region lookup for '{region_code}' not yet implemented. Use /forecast with lat/lon instead.",
        "suggestion": "Use GET /weather/forecast?lat=29.5&lon=-94.5&days=7"
    }


@router.get("/region/{region_code}/current")
async def get_region_current_weather(region_code: str):
    """
    Get current weather for a region by its code.

    Note: This endpoint requires regions to be set up in the database.
    For now, returns a placeholder response.
    """
    return {
        "message": f"Region lookup for '{region_code}' not yet implemented. Use /current with lat/lon instead.",
        "suggestion": "Use GET /weather/current?lat=29.5&lon=-94.5"
    }
