import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class Season(str, enum.Enum):
    SPRING = "spring"
    SUMMER = "summer"
    FALL = "fall"
    WINTER = "winter"


class MigrationType(str, enum.Enum):
    NEOTROPICAL = "neotropical"
    IRRUPTION = "irruption"
    DISPERSAL = "dispersal"


class ConfidenceLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    region_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=False, index=True)
    prediction_date = Column(Date, nullable=False, index=True)
    prediction_hour = Column(Integer, nullable=True)  # 0-23, NULL for daily aggregate
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Scores (0-100 scale)
    overall_score = Column(Integer, nullable=False, index=True)
    confidence_level = Column(SQLEnum(ConfidenceLevel), nullable=True)

    # Component scores
    front_score = Column(Integer, default=0)
    wind_score = Column(Integer, default=0)
    precipitation_score = Column(Integer, default=0)
    pressure_score = Column(Integer, default=0)
    temperature_score = Column(Integer, default=0)
    visibility_score = Column(Integer, default=0)

    # Metadata
    season = Column(SQLEnum(Season), nullable=False)
    migration_type = Column(SQLEnum(MigrationType), nullable=True)
    weather_snapshot_id = Column(UUID(as_uuid=True), ForeignKey("weather_snapshots.id"), nullable=True)
    algorithm_version = Column(String(20), default="v1.0")

    # Explanation
    factors_json = Column(JSONB, nullable=True)

    # Relationships
    region = relationship("Region", back_populates="predictions")

    __table_args__ = (
        UniqueConstraint("region_id", "prediction_date", "prediction_hour", name="uq_prediction_region_date_hour"),
    )

    @property
    def score_label(self) -> str:
        if self.overall_score <= 20:
            return "Low"
        elif self.overall_score <= 40:
            return "Moderate"
        elif self.overall_score <= 60:
            return "Elevated"
        elif self.overall_score <= 80:
            return "High"
        else:
            return "Exceptional"
