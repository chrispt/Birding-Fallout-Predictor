import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class RegionType(str, enum.Enum):
    STATE = "state"
    COUNTY = "county"
    HOTSPOT_CLUSTER = "hotspot_cluster"


class MigrationCorridor(str, enum.Enum):
    GULF_COAST = "gulf_coast"
    ATLANTIC = "atlantic"
    PACIFIC = "pacific"
    CENTRAL = "central"
    GREAT_LAKES = "great_lakes"


class Region(Base):
    __tablename__ = "regions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    region_type = Column(SQLEnum(RegionType), nullable=False)
    parent_region_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=True)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    bounds_geojson = Column(JSONB, nullable=True)
    migration_corridor = Column(SQLEnum(MigrationCorridor), nullable=True)
    timezone = Column(String(50), default="UTC")
    is_coastal = Column(String(10), default="false")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    parent = relationship("Region", remote_side=[id], backref="children")
    weather_snapshots = relationship("WeatherSnapshot", back_populates="region")
    predictions = relationship("Prediction", back_populates="region")
    hotspots = relationship("Hotspot", back_populates="region")
