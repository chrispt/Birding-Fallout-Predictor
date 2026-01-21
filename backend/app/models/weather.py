import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    region_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=False, index=True)
    forecast_time = Column(DateTime, nullable=False, index=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    # Temperature (Celsius)
    temperature_2m = Column(Float, nullable=True)
    temperature_delta_24h = Column(Float, nullable=True)
    apparent_temperature = Column(Float, nullable=True)

    # Wind
    wind_speed_10m = Column(Float, nullable=True)  # km/h
    wind_direction_10m = Column(Integer, nullable=True)  # degrees
    wind_gusts_10m = Column(Float, nullable=True)
    wind_speed_80m = Column(Float, nullable=True)

    # Pressure (hPa)
    pressure_msl = Column(Float, nullable=True)
    pressure_delta_3h = Column(Float, nullable=True)
    pressure_delta_24h = Column(Float, nullable=True)

    # Precipitation
    precipitation_probability = Column(Integer, nullable=True)  # 0-100
    precipitation_mm = Column(Float, nullable=True)
    rain_mm = Column(Float, nullable=True)

    # Visibility & Clouds
    cloud_cover_total = Column(Integer, nullable=True)  # 0-100
    cloud_cover_low = Column(Integer, nullable=True)
    visibility_m = Column(Integer, nullable=True)

    # Derived/Coded
    weather_code = Column(Integer, nullable=True)  # WMO code
    is_frontal_passage = Column(Boolean, default=False)
    front_type = Column(String(20), nullable=True)  # cold, warm, stationary, occluded

    # Relationships
    region = relationship("Region", back_populates="weather_snapshots")

    __table_args__ = (
        UniqueConstraint("region_id", "forecast_time", name="uq_weather_region_time"),
    )
