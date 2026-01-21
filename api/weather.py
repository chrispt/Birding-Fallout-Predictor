import json
import urllib.request
import urllib.parse
from http.server import BaseHTTPRequestHandler


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
            days = min(max(days, 1), 16)

            # Fetch from Open-Meteo
            variables = [
                "temperature_2m", "apparent_temperature", "precipitation_probability",
                "precipitation", "weather_code", "pressure_msl", "cloud_cover",
                "visibility", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
            ]
            api_params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": ",".join(variables),
                "forecast_days": days,
                "timezone": "UTC",
            }
            url = f"https://api.open-meteo.com/v1/forecast?{urllib.parse.urlencode(api_params)}"

            with urllib.request.urlopen(url, timeout=30) as response:
                data = json.loads(response.read().decode())

            self._json(200, {
                "latitude": lat,
                "longitude": lon,
                "forecasts": data.get("hourly", {})
            })
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
