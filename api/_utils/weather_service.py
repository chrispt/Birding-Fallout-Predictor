import urllib.request
import urllib.parse
import json
from datetime import datetime
from typing import Optional


class WeatherService:
    """Service for fetching weather data from Open-Meteo API."""

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

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

    def get_forecast(self, latitude: float, longitude: float, days: int = 7) -> list:
        """Fetch weather forecast for a location."""
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ",".join(self.HOURLY_VARIABLES),
            "forecast_days": min(days, 16),
            "timezone": "UTC",
        }

        url = f"{self.BASE_URL}?{urllib.parse.urlencode(params)}"

        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.loads(response.read().decode())

        return self._parse_forecast(data)

    def _parse_forecast(self, data: dict) -> list:
        """Parse Open-Meteo API response."""
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])

        results = []
        for i, time_str in enumerate(times):
            weather = {
                "forecast_time": time_str,
                "temperature_2m": self._get_value(hourly, "temperature_2m", i),
                "apparent_temperature": self._get_value(hourly, "apparent_temperature", i),
                "wind_speed_10m": self._get_value(hourly, "wind_speed_10m", i),
                "wind_direction_10m": self._get_int_value(hourly, "wind_direction_10m", i),
                "wind_gusts_10m": self._get_value(hourly, "wind_gusts_10m", i),
                "pressure_msl": self._get_value(hourly, "pressure_msl", i),
                "precipitation_probability": self._get_int_value(hourly, "precipitation_probability", i),
                "precipitation_mm": self._get_value(hourly, "precipitation", i),
                "rain_mm": self._get_value(hourly, "rain", i),
                "cloud_cover_total": self._get_int_value(hourly, "cloud_cover", i),
                "cloud_cover_low": self._get_int_value(hourly, "cloud_cover_low", i),
                "visibility_m": self._get_int_value(hourly, "visibility", i),
                "weather_code": self._get_int_value(hourly, "weather_code", i),
            }
            results.append(weather)

        # Add deltas and derived fields
        return self._add_deltas(results)

    def _add_deltas(self, forecasts: list) -> list:
        """Add pressure/temperature deltas and derived fields."""
        for i, weather in enumerate(forecasts):
            # 3-hour pressure delta
            if i >= 3 and forecasts[i-3].get("pressure_msl") and weather.get("pressure_msl"):
                weather["pressure_delta_3h"] = round(
                    weather["pressure_msl"] - forecasts[i-3]["pressure_msl"], 2
                )
            else:
                weather["pressure_delta_3h"] = None

            # 24-hour deltas
            if i >= 24:
                prev = forecasts[i-24]
                if prev.get("pressure_msl") and weather.get("pressure_msl"):
                    weather["pressure_delta_24h"] = round(
                        weather["pressure_msl"] - prev["pressure_msl"], 2
                    )
                else:
                    weather["pressure_delta_24h"] = None

                if prev.get("temperature_2m") and weather.get("temperature_2m"):
                    weather["temperature_delta_24h"] = round(
                        weather["temperature_2m"] - prev["temperature_2m"], 2
                    )
                else:
                    weather["temperature_delta_24h"] = None
            else:
                weather["pressure_delta_24h"] = None
                weather["temperature_delta_24h"] = None

            # Frontal passage detection
            weather["is_frontal_passage"] = self._detect_frontal_passage(weather, forecasts, i)
            weather["front_type"] = self._determine_front_type(weather) if weather["is_frontal_passage"] else None
            weather["pressure_trend"] = self._get_pressure_trend(weather)
            weather["wind_direction_label"] = self._get_wind_direction_label(weather.get("wind_direction_10m"))
            weather["weather_description"] = self._get_weather_description(weather.get("weather_code"))

        return forecasts

    def _detect_frontal_passage(self, current: dict, forecasts: list, index: int) -> bool:
        """Detect likely frontal passage."""
        if index < 3:
            return False

        pressure_delta = current.get("pressure_delta_3h")
        if pressure_delta is not None and pressure_delta < -3:
            return True

        curr_dir = current.get("wind_direction_10m")
        prev_dir = forecasts[index-3].get("wind_direction_10m") if index >= 3 else None

        if curr_dir is not None and prev_dir is not None:
            if self._is_southerly(prev_dir) and self._is_northerly(curr_dir):
                return True

        return False

    def _determine_front_type(self, weather: dict) -> str:
        """Determine the type of front."""
        temp_delta = weather.get("temperature_delta_24h")
        if temp_delta is not None and temp_delta < -5:
            return "cold"
        elif temp_delta is not None and temp_delta > 5:
            return "warm"
        return "cold"

    @staticmethod
    def _is_southerly(direction: int) -> bool:
        return 135 <= direction <= 225

    @staticmethod
    def _is_northerly(direction: int) -> bool:
        return direction >= 315 or direction <= 45

    @staticmethod
    def _get_wind_direction_label(direction: Optional[int]) -> Optional[str]:
        if direction is None:
            return None
        directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                      "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        index = round(direction / 22.5) % 16
        return directions[index]

    @staticmethod
    def _get_pressure_trend(weather: dict) -> str:
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
        if code is None:
            return None
        descriptions = {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Fog", 48: "Depositing rime fog",
            51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
            61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
            71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
            80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
            95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
        }
        return descriptions.get(code, f"Unknown ({code})")

    @staticmethod
    def _get_value(data: dict, key: str, index: int) -> Optional[float]:
        values = data.get(key, [])
        if index < len(values) and values[index] is not None:
            return float(values[index])
        return None

    @staticmethod
    def _get_int_value(data: dict, key: str, index: int) -> Optional[int]:
        values = data.get(key, [])
        if index < len(values) and values[index] is not None:
            return int(values[index])
        return None
