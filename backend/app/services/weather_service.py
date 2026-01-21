import httpx
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass
from app.config import get_settings

settings = get_settings()


@dataclass
class WeatherData:
    """Processed weather data from Open-Meteo."""
    forecast_time: datetime
    temperature_2m: Optional[float] = None
    apparent_temperature: Optional[float] = None
    wind_speed_10m: Optional[float] = None
    wind_direction_10m: Optional[int] = None
    wind_gusts_10m: Optional[float] = None
    pressure_msl: Optional[float] = None
    precipitation_probability: Optional[int] = None
    precipitation_mm: Optional[float] = None
    rain_mm: Optional[float] = None
    cloud_cover_total: Optional[int] = None
    cloud_cover_low: Optional[int] = None
    visibility_m: Optional[int] = None
    weather_code: Optional[int] = None


class OpenMeteoClient:
    """Client for fetching weather data from Open-Meteo API."""

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    # Weather variables to fetch
    HOURLY_VARIABLES = [
        "temperature_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "rain",
        "weather_code",
        "pressure_msl",
        "cloud_cover",
        "cloud_cover_low",
        "visibility",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
    ]

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    async def get_forecast(
        self,
        latitude: float,
        longitude: float,
        forecast_days: int = 7
    ) -> list[WeatherData]:
        """
        Fetch weather forecast for a location.

        Args:
            latitude: Location latitude
            longitude: Location longitude
            forecast_days: Number of days to forecast (1-16)

        Returns:
            List of WeatherData objects for each hour in the forecast
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ",".join(self.HOURLY_VARIABLES),
            "forecast_days": min(forecast_days, 16),
            "timezone": "UTC",
        }

        response = await self.client.get(self.BASE_URL, params=params)
        response.raise_for_status()

        data = response.json()
        return self._parse_forecast(data)

    def _parse_forecast(self, data: dict) -> list[WeatherData]:
        """Parse Open-Meteo API response into WeatherData objects."""
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])

        results = []
        for i, time_str in enumerate(times):
            forecast_time = datetime.fromisoformat(time_str)

            weather = WeatherData(
                forecast_time=forecast_time,
                temperature_2m=self._get_value(hourly, "temperature_2m", i),
                apparent_temperature=self._get_value(hourly, "apparent_temperature", i),
                wind_speed_10m=self._get_value(hourly, "wind_speed_10m", i),
                wind_direction_10m=self._get_int_value(hourly, "wind_direction_10m", i),
                wind_gusts_10m=self._get_value(hourly, "wind_gusts_10m", i),
                pressure_msl=self._get_value(hourly, "pressure_msl", i),
                precipitation_probability=self._get_int_value(hourly, "precipitation_probability", i),
                precipitation_mm=self._get_value(hourly, "precipitation", i),
                rain_mm=self._get_value(hourly, "rain", i),
                cloud_cover_total=self._get_int_value(hourly, "cloud_cover", i),
                cloud_cover_low=self._get_int_value(hourly, "cloud_cover_low", i),
                visibility_m=self._get_int_value(hourly, "visibility", i),
                weather_code=self._get_int_value(hourly, "weather_code", i),
            )
            results.append(weather)

        return results

    @staticmethod
    def _get_value(data: dict, key: str, index: int) -> Optional[float]:
        """Safely get a float value from the response."""
        values = data.get(key, [])
        if index < len(values) and values[index] is not None:
            return float(values[index])
        return None

    @staticmethod
    def _get_int_value(data: dict, key: str, index: int) -> Optional[int]:
        """Safely get an integer value from the response."""
        values = data.get(key, [])
        if index < len(values) and values[index] is not None:
            return int(values[index])
        return None

    async def get_current_weather(
        self,
        latitude: float,
        longitude: float
    ) -> Optional[WeatherData]:
        """Get the current weather (nearest hour forecast)."""
        forecasts = await self.get_forecast(latitude, longitude, forecast_days=1)
        if not forecasts:
            return None

        # Find the forecast closest to now
        now = datetime.utcnow()
        closest = min(forecasts, key=lambda w: abs((w.forecast_time - now).total_seconds()))
        return closest


class WeatherService:
    """
    Service for managing weather data with caching and delta calculations.
    """

    def __init__(self):
        self.client = OpenMeteoClient()

    async def close(self):
        await self.client.close()

    async def get_forecast_with_deltas(
        self,
        latitude: float,
        longitude: float,
        forecast_days: int = 7
    ) -> list[dict]:
        """
        Get forecast data with calculated deltas (temperature change, pressure change).

        Returns list of dicts with all weather data plus delta calculations.
        """
        forecasts = await self.client.get_forecast(latitude, longitude, forecast_days)

        results = []
        for i, weather in enumerate(forecasts):
            result = {
                "forecast_time": weather.forecast_time.isoformat(),
                "temperature_2m": weather.temperature_2m,
                "apparent_temperature": weather.apparent_temperature,
                "wind_speed_10m": weather.wind_speed_10m,
                "wind_direction_10m": weather.wind_direction_10m,
                "wind_direction_label": self._get_wind_direction_label(weather.wind_direction_10m),
                "wind_gusts_10m": weather.wind_gusts_10m,
                "pressure_msl": weather.pressure_msl,
                "precipitation_probability": weather.precipitation_probability,
                "precipitation_mm": weather.precipitation_mm,
                "rain_mm": weather.rain_mm,
                "cloud_cover_total": weather.cloud_cover_total,
                "cloud_cover_low": weather.cloud_cover_low,
                "visibility_m": weather.visibility_m,
                "weather_code": weather.weather_code,
                "weather_description": self._get_weather_description(weather.weather_code),
            }

            # Calculate 3-hour pressure delta
            if i >= 3 and forecasts[i-3].pressure_msl and weather.pressure_msl:
                result["pressure_delta_3h"] = round(weather.pressure_msl - forecasts[i-3].pressure_msl, 2)
            else:
                result["pressure_delta_3h"] = None

            # Calculate 24-hour deltas
            if i >= 24:
                prev = forecasts[i-24]
                if prev.pressure_msl and weather.pressure_msl:
                    result["pressure_delta_24h"] = round(weather.pressure_msl - prev.pressure_msl, 2)
                else:
                    result["pressure_delta_24h"] = None

                if prev.temperature_2m and weather.temperature_2m:
                    result["temperature_delta_24h"] = round(weather.temperature_2m - prev.temperature_2m, 2)
                else:
                    result["temperature_delta_24h"] = None
            else:
                result["pressure_delta_24h"] = None
                result["temperature_delta_24h"] = None

            # Detect frontal passage
            result["is_frontal_passage"] = self._detect_frontal_passage(result, forecasts, i)
            result["front_type"] = self._determine_front_type(result) if result["is_frontal_passage"] else None
            result["pressure_trend"] = self._get_pressure_trend(result)

            results.append(result)

        return results

    def _detect_frontal_passage(self, current: dict, forecasts: list, index: int) -> bool:
        """Detect likely frontal passage based on weather changes."""
        if index < 3:
            return False

        # Check for rapid pressure drop
        pressure_delta = current.get("pressure_delta_3h")
        if pressure_delta is not None and pressure_delta < -3:
            return True

        # Check for significant wind shift
        curr_dir = current.get("wind_direction_10m")
        prev_dir = forecasts[index-3].wind_direction_10m if index >= 3 else None

        if curr_dir is not None and prev_dir is not None:
            # Check for S/SW to N/NW shift (cold front)
            if self._is_southerly(prev_dir) and self._is_northerly(curr_dir):
                return True

        return False

    def _determine_front_type(self, weather: dict) -> str:
        """Determine the type of front based on weather characteristics."""
        temp_delta = weather.get("temperature_delta_24h")
        pressure_delta = weather.get("pressure_delta_3h")

        if temp_delta is not None and temp_delta < -5:
            return "cold"
        elif temp_delta is not None and temp_delta > 5:
            return "warm"
        elif pressure_delta is not None and abs(pressure_delta) < 1:
            return "stationary"
        return "cold"  # Default to cold front

    @staticmethod
    def _is_southerly(direction: int) -> bool:
        """Check if wind direction is from the south (135-225 degrees)."""
        return 135 <= direction <= 225

    @staticmethod
    def _is_northerly(direction: int) -> bool:
        """Check if wind direction is from the north (315-360 or 0-45 degrees)."""
        return direction >= 315 or direction <= 45

    @staticmethod
    def _get_wind_direction_label(direction: Optional[int]) -> Optional[str]:
        """Convert wind direction degrees to compass label."""
        if direction is None:
            return None

        directions = [
            "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
        ]
        index = round(direction / 22.5) % 16
        return directions[index]

    @staticmethod
    def _get_pressure_trend(weather: dict) -> str:
        """Determine pressure trend from delta values."""
        delta_3h = weather.get("pressure_delta_3h")
        if delta_3h is None:
            return "unknown"
        if delta_3h < -2:
            return "falling_rapidly"
        if delta_3h < -0.5:
            return "falling"
        if delta_3h > 2:
            return "rising_rapidly"
        if delta_3h > 0.5:
            return "rising"
        return "steady"

    @staticmethod
    def _get_weather_description(code: Optional[int]) -> Optional[str]:
        """Convert WMO weather code to description."""
        if code is None:
            return None

        descriptions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            56: "Light freezing drizzle",
            57: "Dense freezing drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail",
        }
        return descriptions.get(code, f"Unknown ({code})")


# Singleton instance
_weather_service: Optional[WeatherService] = None


async def get_weather_service() -> WeatherService:
    """Get or create the weather service singleton."""
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service
