from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class WeatherCache(Base):
    __tablename__ = "weather_cache"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    forecast_json = mapped_column(JSONB)

    fetched_at: Mapped[datetime] = mapped_column(DateTime)

    valid_until: Mapped[datetime] = mapped_column(DateTime)