import json
import urllib.request
import urllib.parse
from datetime import datetime, date
from http.server import BaseHTTPRequestHandler


# ============== Weather Service ==============
class WeatherService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    HOURLY_VARIABLES = [
        "temperature_2m", "apparent_temperature", "precipitation_probability",
        "precipitation", "rain", "weather_code", "pressure_msl", "cloud_cover",
        "cloud_cover_low", "visibility", "wind_speed_10m", "wind_direction_10m",
        "wind_gusts_10m",
    ]

    def get_forecast(self, latitude, longitude, days=7):
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
        return self._parse_and_add_deltas(data)

    def _parse_and_add_deltas(self, data):
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        results = []

        for i, time_str in enumerate(times):
            weather = {
                "forecast_time": time_str,
                "temperature_2m": self._get_val(hourly, "temperature_2m", i),
                "apparent_temperature": self._get_val(hourly, "apparent_temperature", i),
                "wind_speed_10m": self._get_val(hourly, "wind_speed_10m", i),
                "wind_direction_10m": self._get_int(hourly, "wind_direction_10m", i),
                "wind_gusts_10m": self._get_val(hourly, "wind_gusts_10m", i),
                "pressure_msl": self._get_val(hourly, "pressure_msl", i),
                "precipitation_probability": self._get_int(hourly, "precipitation_probability", i),
                "precipitation_mm": self._get_val(hourly, "precipitation", i),
                "cloud_cover_total": self._get_int(hourly, "cloud_cover", i),
                "cloud_cover_low": self._get_int(hourly, "cloud_cover_low", i),
                "visibility_m": self._get_int(hourly, "visibility", i),
            }
            results.append(weather)

        # Add deltas
        for i, w in enumerate(results):
            w["pressure_delta_3h"] = round(w["pressure_msl"] - results[i-3]["pressure_msl"], 2) if i >= 3 and w["pressure_msl"] and results[i-3]["pressure_msl"] else None
            w["pressure_delta_24h"] = round(w["pressure_msl"] - results[i-24]["pressure_msl"], 2) if i >= 24 and w["pressure_msl"] and results[i-24]["pressure_msl"] else None
            w["temperature_delta_24h"] = round(w["temperature_2m"] - results[i-24]["temperature_2m"], 2) if i >= 24 and w["temperature_2m"] and results[i-24]["temperature_2m"] else None
            w["is_frontal_passage"] = (w["pressure_delta_3h"] or 0) < -3

        return results

    def _get_val(self, data, key, i):
        vals = data.get(key, [])
        return float(vals[i]) if i < len(vals) and vals[i] is not None else None

    def _get_int(self, data, key, i):
        vals = data.get(key, [])
        return int(vals[i]) if i < len(vals) and vals[i] is not None else None


# ============== Prediction Engine ==============
class PredictionEngine:
    CORRIDORS = {
        "gulf_coast": {"lat_min": 25, "lat_max": 31, "lon_min": -98, "lon_max": -80},
        "atlantic": {"lat_min": 35, "lat_max": 45, "lon_min": -77, "lon_max": -70},
        "great_lakes": {"lat_min": 41, "lat_max": 47, "lon_min": -92, "lon_max": -76},
    }

    def get_season(self, d):
        m = d.month
        if m in [3,4,5]: return ("spring", "neotropical")
        if m in [8,9,10,11]: return ("fall", "neotropical")
        if m in [12,1,2]: return ("winter", "irruption")
        return ("summer", "dispersal")

    def get_corridor(self, lat, lon):
        for name, b in self.CORRIDORS.items():
            if b["lat_min"] <= lat <= b["lat_max"] and b["lon_min"] <= lon <= b["lon_max"]:
                return name
        return None

    def is_coastal(self, lat, lon):
        return (25 <= lat <= 31 and -98 <= lon <= -80) or lon <= -117 or (lat <= 45 and lon >= -77)

    def calc_front_score(self, w, season):
        score, desc = 0, []
        if w.get("is_frontal_passage"): score += 10; desc.append("Frontal passage")
        pd3 = w.get("pressure_delta_3h")
        if pd3 and pd3 < -4: score += 12; desc.append("Rapid pressure drop")
        elif pd3 and pd3 < -2: score += 8
        td = w.get("temperature_delta_24h")
        if td and season == "spring" and td < -8: score += 5; desc.append(f"Cooling {td:.0f}°C")
        if td and season == "fall" and td < -6: score += 5
        return min(score, 30), "; ".join(desc) or "No frontal activity"

    def calc_wind_score(self, w, season):
        score, desc = 0, []
        ws, wd = w.get("wind_speed_10m"), w.get("wind_direction_10m")
        if not ws or wd is None: return 0, "No wind data"
        headwind = (season == "spring" and (wd >= 315 or wd <= 45)) or (season == "fall" and 135 <= wd <= 225)
        if headwind:
            if ws >= 40: score += 15; desc.append(f"Strong headwind {ws:.0f}km/h")
            elif ws >= 25: score += 10
            elif ws >= 15: score += 5
        gusts = w.get("wind_gusts_10m")
        if gusts and gusts >= 50: score += 5
        return min(score, 25), "; ".join(desc) or "Favorable winds"

    def calc_precip_score(self, w, coastal):
        score, desc = 0, []
        prob = w.get("precipitation_probability")
        if prob and prob >= 80: score += 10; desc.append(f"High rain prob {prob}%")
        elif prob and prob >= 50: score += 6
        amt = w.get("precipitation_mm")
        if amt and amt >= 10: score += 5
        if coastal and prob and prob >= 40: score += 4
        return min(score, 20), "; ".join(desc) or "Dry"

    def calc_pressure_score(self, w):
        score = 0
        pd24 = w.get("pressure_delta_24h")
        if pd24 and pd24 < -5: score += 4
        p = w.get("pressure_msl")
        if p and p < 1005: score += 3
        return min(score, 10), "Pressure pattern"

    def calc_visibility_score(self, w):
        score = 0
        vis = w.get("visibility_m")
        if vis and vis < 3000: score += 4
        cc = w.get("cloud_cover_low")
        if cc and cc >= 80: score += 3
        return min(score, 10), "Visibility"

    def get_label(self, s):
        if s <= 20: return "Low"
        if s <= 40: return "Moderate"
        if s <= 60: return "Elevated"
        if s <= 80: return "High"
        return "Exceptional"

    def generate(self, forecasts, lat, lon):
        corridor = self.get_corridor(lat, lon)
        coastal = self.is_coastal(lat, lon)
        now = datetime.utcnow()

        daily = {}
        for f in forecasts:
            d = f["forecast_time"][:10]
            daily.setdefault(d, []).append(f)

        results = []
        for date_str, day_f in sorted(daily.items()):
            fd = date.fromisoformat(date_str)
            season, mtype = self.get_season(fd)
            best = max(day_f, key=lambda x: abs(x.get("pressure_delta_3h") or 0) + (x.get("precipitation_probability") or 0)/10)

            front_s, front_d = self.calc_front_score(best, season)
            wind_s, wind_d = self.calc_wind_score(best, season)
            precip_s, precip_d = self.calc_precip_score(best, coastal)
            press_s, press_d = self.calc_pressure_score(best)
            vis_s, vis_d = self.calc_visibility_score(best)

            raw = front_s + wind_s + precip_s + press_s + vis_s
            mult = 1.2 if corridor == "gulf_coast" and season == "spring" else 1.15 if corridor == "atlantic" and season == "fall" else 1.0
            final = min(int(raw * mult), 100)

            hrs = (datetime.fromisoformat(best["forecast_time"]) - now).total_seconds() / 3600
            conf = "high" if hrs <= 24 else "medium" if hrs <= 72 else "low"

            factors = {
                "front": {"score": front_s, "description": front_d},
                "wind": {"score": wind_s, "description": wind_d},
                "precipitation": {"score": precip_s, "description": precip_d},
                "pressure": {"score": press_s, "description": press_d},
                "visibility": {"score": vis_s, "description": vis_d},
            }

            label = self.get_label(final)
            summary = f"{label} fallout potential." if final >= 60 else f"{label} conditions."

            results.append({
                "prediction_date": date_str,
                "overall_score": final,
                "score_label": label,
                "confidence": conf,
                "season": season,
                "migration_type": mtype,
                "factors": factors,
                "summary": summary
            })
        return results


# ============== Vercel Handler ==============
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)

            lat = params.get('lat', [None])[0]
            lon = params.get('lon', [None])[0]
            days = int(params.get('days', ['7'])[0])

            if not lat or not lon:
                return self._json(400, {"error": "Missing lat/lon"})

            lat, lon = float(lat), float(lon)

            weather = WeatherService()
            engine = PredictionEngine()

            forecasts = weather.get_forecast(lat, lon, days)
            predictions = engine.generate(forecasts, lat, lon)

            self._json(200, {"latitude": lat, "longitude": lon, "predictions": predictions})
        except Exception as e:
            self._json(500, {"error": str(e)})

    def _json(self, code, data):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()
