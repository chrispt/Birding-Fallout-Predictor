from http.server import BaseHTTPRequestHandler
import json

# Known fallout hotspots (static data)
FALLOUT_HOTSPOTS = [
    {
        "name": "High Island - Boy Scout Woods",
        "lat": 29.5647,
        "lon": -94.3912,
        "state": "TX",
        "description": "Premier Gulf Coast fallout site, famous for spring trans-Gulf migrants",
        "is_fallout_site": True,
        "habitat": "woodland"
    },
    {
        "name": "High Island - Smith Oaks",
        "lat": 29.5589,
        "lon": -94.3867,
        "state": "TX",
        "description": "Classic fallout location with rookery",
        "is_fallout_site": True,
        "habitat": "woodland"
    },
    {
        "name": "South Padre Island Convention Centre",
        "lat": 26.1044,
        "lon": -97.1650,
        "state": "TX",
        "description": "Lower Texas coast migrant trap",
        "is_fallout_site": True,
        "habitat": "coastal"
    },
    {
        "name": "Dauphin Island - Shell Mound Park",
        "lat": 30.2528,
        "lon": -88.1089,
        "state": "AL",
        "description": "Gulf Coast barrier island fallout site",
        "is_fallout_site": True,
        "habitat": "woodland"
    },
    {
        "name": "Fort Morgan",
        "lat": 30.2283,
        "lon": -88.0242,
        "state": "AL",
        "description": "Alabama coast migrant concentration point",
        "is_fallout_site": True,
        "habitat": "coastal"
    },
    {
        "name": "Point Pelee National Park",
        "lat": 41.9628,
        "lon": -82.5181,
        "state": "ON",
        "description": "Great Lakes migration funnel, spring warbler mecca",
        "is_fallout_site": True,
        "habitat": "woodland"
    },
    {
        "name": "Magee Marsh Wildlife Area",
        "lat": 41.6189,
        "lon": -83.1978,
        "state": "OH",
        "description": "The Warbler Capital of the World",
        "is_fallout_site": True,
        "habitat": "wetland"
    },
    {
        "name": "Cape May Point State Park",
        "lat": 38.9331,
        "lon": -74.9597,
        "state": "NJ",
        "description": "Atlantic coast fall migration hotspot",
        "is_fallout_site": True,
        "habitat": "coastal"
    },
    {
        "name": "Higbee Beach WMA",
        "lat": 38.9467,
        "lon": -74.9681,
        "state": "NJ",
        "description": "Famous morning flight location",
        "is_fallout_site": True,
        "habitat": "woodland"
    },
    {
        "name": "Central Park - The Ramble",
        "lat": 40.7794,
        "lon": -73.9686,
        "state": "NY",
        "description": "Urban oasis, spring and fall migrant trap",
        "is_fallout_site": True,
        "habitat": "urban_park"
    },
    {
        "name": "Galveston Island State Park",
        "lat": 29.2044,
        "lon": -94.9692,
        "state": "TX",
        "description": "Gulf Coast barrier island",
        "is_fallout_site": True,
        "habitat": "coastal"
    },
    {
        "name": "Padre Island National Seashore",
        "lat": 27.0500,
        "lon": -97.4000,
        "state": "TX",
        "description": "Longest undeveloped barrier island",
        "is_fallout_site": True,
        "habitat": "coastal"
    },
    {
        "name": "Whitefish Point Bird Observatory",
        "lat": 46.7714,
        "lon": -84.9583,
        "state": "MI",
        "description": "Great Lakes northern migration corridor",
        "is_fallout_site": True,
        "habitat": "woodland"
    },
    {
        "name": "Montrose Point Bird Sanctuary",
        "lat": 41.9631,
        "lon": -87.6383,
        "state": "IL",
        "description": "Chicago lakefront migrant trap",
        "is_fallout_site": True,
        "habitat": "urban_park"
    },
    {
        "name": "Anahuac National Wildlife Refuge",
        "lat": 29.6167,
        "lon": -94.5333,
        "state": "TX",
        "description": "Upper Texas coast wetlands",
        "is_fallout_site": True,
        "habitat": "wetland"
    }
]


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            response = {
                "hotspots": FALLOUT_HOTSPOTS,
                "total": len(FALLOUT_HOTSPOTS)
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
