from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from app.database import get_db
from app.models.region import Region, RegionType, MigrationCorridor

router = APIRouter()


class RegionResponse(BaseModel):
    id: str
    name: str
    code: str
    region_type: str
    center_lat: float
    center_lon: float
    migration_corridor: Optional[str] = None
    parent_region_id: Optional[str] = None

    class Config:
        from_attributes = True


class RegionListResponse(BaseModel):
    regions: list[RegionResponse]
    total: int


@router.get("", response_model=RegionListResponse)
async def list_regions(
    region_type: Optional[str] = Query(None, description="Filter by region type (state, county, hotspot_cluster)"),
    corridor: Optional[str] = Query(None, description="Filter by migration corridor"),
    parent_code: Optional[str] = Query(None, description="Filter by parent region code"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List all regions with optional filters.
    """
    query = db.query(Region)

    if region_type:
        try:
            rt = RegionType(region_type)
            query = query.filter(Region.region_type == rt)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid region_type: {region_type}")

    if corridor:
        try:
            mc = MigrationCorridor(corridor)
            query = query.filter(Region.migration_corridor == mc)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid corridor: {corridor}")

    if parent_code:
        parent = db.query(Region).filter(Region.code == parent_code).first()
        if parent:
            query = query.filter(Region.parent_region_id == parent.id)

    total = query.count()
    regions = query.offset(offset).limit(limit).all()

    return RegionListResponse(
        regions=[
            RegionResponse(
                id=str(r.id),
                name=r.name,
                code=r.code,
                region_type=r.region_type.value,
                center_lat=r.center_lat,
                center_lon=r.center_lon,
                migration_corridor=r.migration_corridor.value if r.migration_corridor else None,
                parent_region_id=str(r.parent_region_id) if r.parent_region_id else None
            )
            for r in regions
        ],
        total=total
    )


@router.get("/{code}", response_model=RegionResponse)
async def get_region(code: str, db: Session = Depends(get_db)):
    """
    Get a specific region by its code.
    """
    region = db.query(Region).filter(Region.code == code).first()
    if not region:
        raise HTTPException(status_code=404, detail=f"Region not found: {code}")

    return RegionResponse(
        id=str(region.id),
        name=region.name,
        code=region.code,
        region_type=region.region_type.value,
        center_lat=region.center_lat,
        center_lon=region.center_lon,
        migration_corridor=region.migration_corridor.value if region.migration_corridor else None,
        parent_region_id=str(region.parent_region_id) if region.parent_region_id else None
    )


@router.get("/{code}/children", response_model=RegionListResponse)
async def get_region_children(code: str, db: Session = Depends(get_db)):
    """
    Get all child regions (sub-regions) of a region.
    """
    parent = db.query(Region).filter(Region.code == code).first()
    if not parent:
        raise HTTPException(status_code=404, detail=f"Region not found: {code}")

    children = db.query(Region).filter(Region.parent_region_id == parent.id).all()

    return RegionListResponse(
        regions=[
            RegionResponse(
                id=str(r.id),
                name=r.name,
                code=r.code,
                region_type=r.region_type.value,
                center_lat=r.center_lat,
                center_lon=r.center_lon,
                migration_corridor=r.migration_corridor.value if r.migration_corridor else None,
                parent_region_id=str(r.parent_region_id) if r.parent_region_id else None
            )
            for r in children
        ],
        total=len(children)
    )


@router.get("/corridors/list")
async def list_migration_corridors():
    """
    List all available migration corridors.
    """
    return {
        "corridors": [
            {"code": c.value, "name": c.value.replace("_", " ").title()}
            for c in MigrationCorridor
        ]
    }
