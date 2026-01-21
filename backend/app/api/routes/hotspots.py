from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from math import radians, cos, sin, asin, sqrt
from app.database import get_db
from app.models.hotspot import Hotspot

router = APIRouter()


class HotspotResponse(BaseModel):
    id: str
    ebird_loc_id: str
    name: str
    latitude: float
    longitude: float
    state_code: Optional[str] = None
    county_code: Optional[str] = None
    habitat_type: Optional[str] = None
    is_fallout_site: bool = False
    fallout_history_score: int = 0
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class HotspotListResponse(BaseModel):
    hotspots: list[HotspotResponse]
    total: int


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth in kilometers.
    """
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return round(km, 2)


@router.get("", response_model=HotspotListResponse)
async def list_hotspots(
    state_code: Optional[str] = Query(None, description="Filter by state code (e.g., US-TX)"),
    fallout_sites_only: bool = Query(False, description="Only show known fallout sites"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List hotspots with optional filters.
    """
    query = db.query(Hotspot)

    if state_code:
        query = query.filter(Hotspot.state_code == state_code)

    if fallout_sites_only:
        query = query.filter(Hotspot.is_fallout_site == True)

    total = query.count()
    hotspots = query.order_by(Hotspot.fallout_history_score.desc()).offset(offset).limit(limit).all()

    return HotspotListResponse(
        hotspots=[
            HotspotResponse(
                id=str(h.id),
                ebird_loc_id=h.ebird_loc_id,
                name=h.name,
                latitude=h.latitude,
                longitude=h.longitude,
                state_code=h.state_code,
                county_code=h.county_code,
                habitat_type=h.habitat_type,
                is_fallout_site=h.is_fallout_site,
                fallout_history_score=h.fallout_history_score
            )
            for h in hotspots
        ],
        total=total
    )


@router.get("/nearby", response_model=HotspotListResponse)
async def get_nearby_hotspots(
    lat: float = Query(..., ge=-90, le=90, description="Center latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Center longitude"),
    radius_km: float = Query(50, ge=1, le=500, description="Search radius in kilometers"),
    fallout_sites_only: bool = Query(False, description="Only show known fallout sites"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Find hotspots near a given location.

    Note: This uses a simple bounding box + haversine calculation.
    For production, consider using PostGIS for efficient spatial queries.
    """
    # Calculate rough bounding box (1 degree latitude ~ 111km)
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / (111.0 * cos(radians(lat)))

    query = db.query(Hotspot).filter(
        Hotspot.latitude.between(lat - lat_delta, lat + lat_delta),
        Hotspot.longitude.between(lon - lon_delta, lon + lon_delta)
    )

    if fallout_sites_only:
        query = query.filter(Hotspot.is_fallout_site == True)

    hotspots = query.all()

    # Calculate actual distances and filter by radius
    results = []
    for h in hotspots:
        distance = haversine_distance(lat, lon, h.latitude, h.longitude)
        if distance <= radius_km:
            results.append((h, distance))

    # Sort by distance and limit
    results.sort(key=lambda x: x[1])
    results = results[:limit]

    return HotspotListResponse(
        hotspots=[
            HotspotResponse(
                id=str(h.id),
                ebird_loc_id=h.ebird_loc_id,
                name=h.name,
                latitude=h.latitude,
                longitude=h.longitude,
                state_code=h.state_code,
                county_code=h.county_code,
                habitat_type=h.habitat_type,
                is_fallout_site=h.is_fallout_site,
                fallout_history_score=h.fallout_history_score,
                distance_km=distance
            )
            for h, distance in results
        ],
        total=len(results)
    )


@router.get("/fallout-sites", response_model=HotspotListResponse)
async def get_fallout_sites(
    state_code: Optional[str] = Query(None, description="Filter by state code"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get known fallout locations - hotspots historically associated with
    significant bird fallout events.
    """
    query = db.query(Hotspot).filter(Hotspot.is_fallout_site == True)

    if state_code:
        query = query.filter(Hotspot.state_code == state_code)

    hotspots = query.order_by(Hotspot.fallout_history_score.desc()).limit(limit).all()

    return HotspotListResponse(
        hotspots=[
            HotspotResponse(
                id=str(h.id),
                ebird_loc_id=h.ebird_loc_id,
                name=h.name,
                latitude=h.latitude,
                longitude=h.longitude,
                state_code=h.state_code,
                county_code=h.county_code,
                habitat_type=h.habitat_type,
                is_fallout_site=h.is_fallout_site,
                fallout_history_score=h.fallout_history_score
            )
            for h in hotspots
        ],
        total=len(hotspots)
    )


@router.get("/{ebird_loc_id}", response_model=HotspotResponse)
async def get_hotspot(ebird_loc_id: str, db: Session = Depends(get_db)):
    """
    Get a specific hotspot by its eBird location ID.
    """
    hotspot = db.query(Hotspot).filter(Hotspot.ebird_loc_id == ebird_loc_id).first()
    if not hotspot:
        raise HTTPException(status_code=404, detail=f"Hotspot not found: {ebird_loc_id}")

    return HotspotResponse(
        id=str(hotspot.id),
        ebird_loc_id=hotspot.ebird_loc_id,
        name=hotspot.name,
        latitude=hotspot.latitude,
        longitude=hotspot.longitude,
        state_code=hotspot.state_code,
        county_code=hotspot.county_code,
        habitat_type=hotspot.habitat_type,
        is_fallout_site=hotspot.is_fallout_site,
        fallout_history_score=hotspot.fallout_history_score
    )
