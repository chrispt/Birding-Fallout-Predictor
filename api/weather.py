from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs, urlparse

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _utils.weather_service import WeatherService


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)

            lat = params.get('lat', [None])[0]
            lon = params.get('lon', [None])[0]
            days = params.get('days', ['7'])[0]

            if lat is None or lon is None:
                self.send_error_response(400, "Missing required parameters: lat, lon")
                return

            try:
                lat = float(lat)
                lon = float(lon)
                days = int(days)
            except ValueError:
                self.send_error_response(400, "Invalid parameter values")
                return

            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                self.send_error_response(400, "Coordinates out of range")
                return

            days = min(max(days, 1), 16)

            weather_service = WeatherService()
            forecasts = weather_service.get_forecast(lat, lon, days)

            response = {
                "latitude": lat,
                "longitude": lon,
                "forecast_count": len(forecasts),
                "forecasts": forecasts
            }

            self.send_json_response(200, response)

        except Exception as e:
            self.send_error_response(500, str(e))

    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def send_error_response(self, status_code, message):
        self.send_json_response(status_code, {"error": message})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
