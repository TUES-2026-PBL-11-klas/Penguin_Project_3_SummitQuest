from datetime import datetime

from sqlalchemy import BigInteger, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TrailPoint(Base):
    __tablename__ = "trail_points"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    osm_id: Mapped[int] = mapped_column(
        BigInteger,
        unique=True
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    type: Mapped[str] = mapped_column(String(50))

    elevation_m: Mapped[int] = mapped_column(Integer)

    region: Mapped[str] = mapped_column(String(255))

    last_synced_at: Mapped[datetime] = mapped_column(DateTime)

    quests = relationship(
        "Quest",
        back_populates="trail_point"
    )