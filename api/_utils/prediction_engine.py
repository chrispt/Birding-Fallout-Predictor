from datetime import datetime, date
from typing import Optional
from dataclasses import dataclass


@dataclass
class ScoreComponent:
    """A single scoring component with points and description."""
    score: int
    description: str


class PredictionEngine:
    """
    Rule-based prediction engine for birding fallout conditions.

    Calculates scores based on weather factors that influence bird fallouts:
    - Cold front passage (max 30 points)
    - Wind direction/speed (max 25 points)
    - Precipitation (max 20 points)
    - Pressure changes (max 10 points)
    - Visibility/clouds (max 10 points)
    - Temperature extremes (max 5 points)
    """

    # Known fallout corridor regions (approximate bounding boxes)
    CORRIDORS = {
        "gulf_coast": {"lat_min": 25, "lat_max": 31, "lon_min": -98, "lon_max": -80},
        "atlantic": {"lat_min": 35, "lat_max": 45, "lon_min": -77, "lon_max": -70},
        "great_lakes": {"lat_min": 41, "lat_max": 47, "lon_min": -92, "lon_max": -76},
        "pacific": {"lat_min": 32, "lat_max": 49, "lon_min": -125, "lon_max": -117},
        "central": {"lat_min": 30, "lat_max": 48, "lon_min": -105, "lon_max": -93},
    }

    def get_migration_season(self, forecast_date: date, latitude: float) -> tuple:
        """Determine migration season and type based on date and location."""
        month = forecast_date.month

        if month in [3, 4, 5]:
            return ("spring", "neotropical")
        elif month in [8, 9, 10, 11]:
            return ("fall", "neotropical")
        elif month in [12, 1, 2]:
            return ("winter", "irruption")
        else:
            return ("summer", "dispersal")

    def get_migration_corridor(self, latitude: float, longitude: float) -> Optional[str]:
        """Determine which migration corridor a location is in."""
        for corridor, bounds in self.CORRIDORS.items():
            if (bounds["lat_min"] <= latitude <= bounds["lat_max"] and
                bounds["lon_min"] <= longitude <= bounds["lon_max"]):
                return corridor
        return None

    def is_coastal(self, latitude: float, longitude: float) -> bool:
        """Check if location is in a coastal area."""
        if 25 <= latitude <= 31 and -98 <= longitude <= -80:
            return True
        if latitude <= 45 and longitude >= -77:
            return True
        if longitude <= -117:
            return True
        return False

    def calculate_front_score(self, pressure_delta_3h, pressure_delta_24h,
                              temperature_delta_24h, wind_direction,
                              is_frontal_passage, season) -> ScoreComponent:
        """Calculate score for cold front passage (0-30 points)."""
        score = 0
        descriptions = []

        if is_frontal_passage:
            score += 10
            descriptions.append("Frontal passage detected")

        if pressure_delta_3h is not None:
            if pressure_delta_3h < -4:
                score += 12
                descriptions.append("Very rapid pressure drop")
            elif pressure_delta_3h < -2:
                score += 8
                descriptions.append("Rapid pressure drop")
            elif pressure_delta_3h < -1:
                score += 4
                descriptions.append("Moderate pressure drop")

        if temperature_delta_24h is not None:
            if season == "spring":
                if temperature_delta_24h < -12:
                    score += 8
                    descriptions.append(f"Major cold snap ({temperature_delta_24h:.0f}°C)")
                elif temperature_delta_24h < -8:
                    score += 5
                    descriptions.append(f"Significant cooling ({temperature_delta_24h:.0f}°C)")
                elif temperature_delta_24h < -5:
                    score += 3
                    descriptions.append(f"Moderate cooling ({temperature_delta_24h:.0f}°C)")
            elif season == "fall":
                if temperature_delta_24h < -10:
                    score += 8
                    descriptions.append(f"Strong cold front ({temperature_delta_24h:.0f}°C)")
                elif temperature_delta_24h < -6:
                    score += 5
                    descriptions.append(f"Cold front passage ({temperature_delta_24h:.0f}°C)")

        description = "; ".join(descriptions) if descriptions else "No significant frontal activity"
        return ScoreComponent(score=min(score, 30), description=description)

    def calculate_wind_score(self, wind_speed, wind_direction, wind_gusts,
                             season, corridor) -> ScoreComponent:
        """Calculate score for wind conditions (0-25 points)."""
        score = 0
        descriptions = []

        if wind_speed is None or wind_direction is None:
            return ScoreComponent(score=0, description="No wind data")

        is_headwind = False
        if season == "spring":
            if wind_direction >= 315 or wind_direction <= 45:
                is_headwind = True
                descriptions.append("Northerly headwinds")
        elif season == "fall":
            if 135 <= wind_direction <= 225:
                is_headwind = True
                descriptions.append("Southerly headwinds")

        if is_headwind:
            if wind_speed >= 40:
                score += 15
                descriptions.append(f"Strong ({wind_speed:.0f} km/h)")
            elif wind_speed >= 25:
                score += 10
                descriptions.append(f"Moderate ({wind_speed:.0f} km/h)")
            elif wind_speed >= 15:
                score += 5
                descriptions.append(f"Light ({wind_speed:.0f} km/h)")

        if wind_gusts is not None:
            if wind_gusts >= 60:
                score += 8
                descriptions.append(f"Very strong gusts ({wind_gusts:.0f} km/h)")
            elif wind_gusts >= 45:
                score += 5
                descriptions.append(f"Strong gusts ({wind_gusts:.0f} km/h)")
            elif wind_gusts >= 30:
                score += 2
                descriptions.append(f"Moderate gusts ({wind_gusts:.0f} km/h)")

        if corridor == "pacific" and wind_direction is not None:
            if 45 <= wind_direction <= 135 and wind_speed >= 15:
                score += 3
                descriptions.append("Unusual easterly winds on Pacific coast")

        description = "; ".join(descriptions) if descriptions else "Favorable winds"
        return ScoreComponent(score=min(score, 25), description=description)

    def calculate_precipitation_score(self, precip_probability, precip_amount,
                                       is_coastal) -> ScoreComponent:
        """Calculate score for precipitation (0-20 points)."""
        score = 0
        descriptions = []

        if precip_probability is not None:
            if precip_probability >= 80:
                score += 10
                descriptions.append(f"High rain probability ({precip_probability}%)")
            elif precip_probability >= 50:
                score += 6
                descriptions.append(f"Moderate rain probability ({precip_probability}%)")
            elif precip_probability >= 30:
                score += 3
                descriptions.append(f"Some rain possible ({precip_probability}%)")

        if precip_amount is not None:
            if precip_amount >= 20:
                score += 8
                descriptions.append(f"Heavy rain expected ({precip_amount:.1f}mm)")
            elif precip_amount >= 10:
                score += 5
                descriptions.append(f"Moderate rain ({precip_amount:.1f}mm)")
            elif precip_amount >= 3:
                score += 2
                descriptions.append(f"Light rain ({precip_amount:.1f}mm)")

        if is_coastal and precip_probability is not None and precip_probability >= 40:
            score += 4
            descriptions.append("Coastal precipitation - trans-Gulf migrants affected")

        description = "; ".join(descriptions) if descriptions else "Dry conditions"
        return ScoreComponent(score=min(score, 20), description=description)

    def calculate_pressure_score(self, pressure_current, pressure_delta_24h,
                                  pressure_trend) -> ScoreComponent:
        """Calculate score for barometric pressure (0-10 points)."""
        score = 0
        descriptions = []

        if pressure_delta_24h is not None:
            if pressure_delta_24h < -10:
                score += 7
                descriptions.append(f"Major pressure drop ({pressure_delta_24h:.1f} hPa)")
            elif pressure_delta_24h < -5:
                score += 4
                descriptions.append(f"Significant pressure drop ({pressure_delta_24h:.1f} hPa)")
            elif pressure_delta_24h < -2:
                score += 2
                descriptions.append(f"Falling pressure ({pressure_delta_24h:.1f} hPa)")

        if pressure_current is not None:
            if pressure_current < 1000:
                score += 3
                descriptions.append(f"Low pressure system ({pressure_current:.0f} hPa)")
            elif pressure_current < 1008:
                score += 1
                descriptions.append(f"Below average pressure ({pressure_current:.0f} hPa)")

        description = "; ".join(descriptions) if descriptions else "Stable pressure"
        return ScoreComponent(score=min(score, 10), description=description)

    def calculate_visibility_score(self, cloud_cover, cloud_cover_low,
                                    visibility_m) -> ScoreComponent:
        """Calculate score for visibility and clouds (0-10 points)."""
        score = 0
        descriptions = []

        if visibility_m is not None:
            if visibility_m < 1000:
                score += 6
                descriptions.append(f"Very low visibility ({visibility_m}m)")
            elif visibility_m < 3000:
                score += 4
                descriptions.append(f"Reduced visibility ({visibility_m}m)")
            elif visibility_m < 5000:
                score += 2
                descriptions.append(f"Moderate visibility ({visibility_m}m)")

        if cloud_cover_low is not None:
            if cloud_cover_low >= 90:
                score += 4
                descriptions.append(f"Very low cloud ceiling ({cloud_cover_low}%)")
            elif cloud_cover_low >= 70:
                score += 2
                descriptions.append(f"Low clouds ({cloud_cover_low}%)")
        elif cloud_cover is not None:
            if cloud_cover >= 95:
                score += 2
                descriptions.append(f"Overcast ({cloud_cover}%)")

        description = "; ".join(descriptions) if descriptions else "Good visibility"
        return ScoreComponent(score=min(score, 10), description=description)

    def calculate_temperature_score(self, temperature, apparent_temperature,
                                     season) -> ScoreComponent:
        """Calculate score for temperature extremes (0-5 points)."""
        score = 0
        descriptions = []

        if temperature is None:
            return ScoreComponent(score=0, description="No temperature data")

        if season == "spring":
            if temperature < 0:
                score += 5
                descriptions.append(f"Freezing conditions ({temperature:.0f}°C)")
            elif temperature < 5:
                score += 3
                descriptions.append(f"Cold snap ({temperature:.0f}°C)")
        elif season == "winter":
            if temperature < -20:
                score += 5
                descriptions.append(f"Extreme cold ({temperature:.0f}°C)")
            elif temperature < -10:
                score += 3
                descriptions.append(f"Very cold ({temperature:.0f}°C)")

        if apparent_temperature is not None and temperature is not None:
            if apparent_temperature < temperature - 10:
                score += 2
                descriptions.append("Significant wind chill")

        description = "; ".join(descriptions) if descriptions else "Normal temperatures"
        return ScoreComponent(score=min(score, 5), description=description)

    def apply_regional_multiplier(self, score, corridor, season):
        """Apply regional multipliers for known fallout hotspots."""
        multiplier = 1.0
        reason = None

        if corridor == "gulf_coast" and season == "spring":
            multiplier = 1.2
            reason = "Gulf Coast spring migration corridor (+20%)"
        elif corridor == "atlantic" and season == "fall":
            multiplier = 1.15
            reason = "Atlantic coast fall migration (+15%)"
        elif corridor == "great_lakes" and season in ["spring", "fall"]:
            multiplier = 1.1
            reason = "Great Lakes migration funnel (+10%)"

        return (int(score * multiplier), reason)

    def get_score_label(self, score: int) -> str:
        """Convert numeric score to descriptive label."""
        if score <= 20:
            return "Low"
        elif score <= 40:
            return "Moderate"
        elif score <= 60:
            return "Elevated"
        elif score <= 80:
            return "High"
        else:
            return "Exceptional"

    def determine_confidence(self, hours_ahead: float) -> str:
        """Determine prediction confidence based on forecast horizon."""
        if hours_ahead <= 24:
            return "high"
        elif hours_ahead <= 72:
            return "medium"
        else:
            return "low"

    def generate_summary(self, score, factors, season, regional_boost):
        """Generate a human-readable summary of the prediction."""
        parts = []

        label = self.get_score_label(score)
        if score >= 60:
            parts.append(f"{label} fallout potential")
        elif score >= 40:
            parts.append(f"{label} birding conditions")
        else:
            parts.append("Normal conditions")

        factor_scores = [
            (factors["front"]["score"], "front passage"),
            (factors["wind"]["score"], "wind"),
            (factors["precipitation"]["score"], "precipitation"),
        ]
        factor_scores.sort(reverse=True)

        top_factors = [name for s, name in factor_scores if s >= 5][:2]
        if top_factors:
            parts.append(f"Key factors: {', '.join(top_factors)}")

        if regional_boost:
            parts.append(regional_boost.split("(")[0].strip())

        return ". ".join(parts) + "."

    def generate_predictions(self, forecasts, latitude, longitude):
        """Generate predictions from weather forecast data."""
        corridor = self.get_migration_corridor(latitude, longitude)
        is_coastal = self.is_coastal(latitude, longitude)
        now = datetime.utcnow()

        daily_forecasts = {}
        for forecast in forecasts:
            forecast_time = datetime.fromisoformat(forecast["forecast_time"])
            date_str = forecast_time.date().isoformat()
            if date_str not in daily_forecasts:
                daily_forecasts[date_str] = []
            daily_forecasts[date_str].append(forecast)

        results = []
        for date_str, day_forecasts in sorted(daily_forecasts.items()):
            forecast_date = date.fromisoformat(date_str)
            season, migration_type = self.get_migration_season(forecast_date, latitude)

            best_forecast = max(
                day_forecasts,
                key=lambda f: (
                    abs(f.get("pressure_delta_3h") or 0) +
                    (f.get("precipitation_probability") or 0) / 10 +
                    (f.get("wind_speed_10m") or 0) / 5
                )
            )

            front = self.calculate_front_score(
                best_forecast.get("pressure_delta_3h"),
                best_forecast.get("pressure_delta_24h"),
                best_forecast.get("temperature_delta_24h"),
                best_forecast.get("wind_direction_10m"),
                best_forecast.get("is_frontal_passage", False),
                season
            )

            wind = self.calculate_wind_score(
                best_forecast.get("wind_speed_10m"),
                best_forecast.get("wind_direction_10m"),
                best_forecast.get("wind_gusts_10m"),
                season,
                corridor
            )

            precipitation = self.calculate_precipitation_score(
                best_forecast.get("precipitation_probability"),
                best_forecast.get("precipitation_mm"),
                is_coastal
            )

            pressure = self.calculate_pressure_score(
                best_forecast.get("pressure_msl"),
                best_forecast.get("pressure_delta_24h"),
                best_forecast.get("pressure_trend")
            )

            visibility = self.calculate_visibility_score(
                best_forecast.get("cloud_cover_total"),
                best_forecast.get("cloud_cover_low"),
                best_forecast.get("visibility_m")
            )

            temperature = self.calculate_temperature_score(
                best_forecast.get("temperature_2m"),
                best_forecast.get("apparent_temperature"),
                season
            )

            raw_score = (
                front.score + wind.score + precipitation.score +
                pressure.score + visibility.score + temperature.score
            )

            final_score, regional_boost = self.apply_regional_multiplier(raw_score, corridor, season)
            final_score = min(final_score, 100)

            forecast_time = datetime.fromisoformat(best_forecast["forecast_time"])
            hours_ahead = (forecast_time - now).total_seconds() / 3600
            confidence = self.determine_confidence(hours_ahead)

            factors = {
                "front": {"score": front.score, "description": front.description},
                "wind": {"score": wind.score, "description": wind.description},
                "precipitation": {"score": precipitation.score, "description": precipitation.description},
                "pressure": {"score": pressure.score, "description": pressure.description},
                "visibility": {"score": visibility.score, "description": visibility.description},
                "temperature": {"score": temperature.score, "description": temperature.description},
            }

            summary = self.generate_summary(final_score, factors, season, regional_boost)

            results.append({
                "prediction_date": date_str,
                "overall_score": final_score,
                "score_label": self.get_score_label(final_score),
                "confidence": confidence,
                "season": season,
                "migration_type": migration_type,
                "factors": factors,
                "summary": summary,
                "corridor": corridor,
                "regional_boost": regional_boost
            })

        return results
