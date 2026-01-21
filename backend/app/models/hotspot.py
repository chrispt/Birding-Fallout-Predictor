import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Float, Integer, Date, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ebird_loc_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    region_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=True)
    country_code = Column(String(5), nullable=True)
    state_code = Column(String(10), nullable=True, index=True)
    county_code = Column(String(20), nullable=True)
    habitat_type = Column(String(50), nullable=True)  # coastal, woodland, wetland, etc.
    is_fallout_site = Column(Boolean, default=False, index=True)
    fallout_history_score = Column(Integer, default=0)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    region = relationship("Region", back_populates="hotspots")
    observations = relationship("HistoricalObservation", back_populates="hotspot")


class HistoricalObservation(Base):
    __tablename__ = "historical_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hotspot_id = Column(UUID(as_uuid=True), ForeignKey("hotspots.id"), nullable=True, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    species_count = Column(Integer, nullable=True)
    checklist_count = Column(Integer, nullable=True)
    notable_species_count = Column(Integer, nullable=True)
    observation_json = Column(JSONB, nullable=True)

    # Weather at time of observation (denormalized for analysis)
    weather_snapshot_id = Column(UUID(as_uuid=True), ForeignKey("weather_snapshots.id"), nullable=True)

    # Computed
    is_fallout_event = Column(Boolean, default=False, index=True)
    fallout_intensity = Column(String(20), nullable=True)  # minor, moderate, major, exceptional

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    hotspot = relationship("Hotspot", back_populates="observations")

    __table_args__ = (
        UniqueConstraint("hotspot_id", "observation_date", name="uq_observation_hotspot_date"),
    )
