from sqlalchemy import Integer, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class QuestStats(Base):
    __tablename__ = "quest_stats"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    quest_id: Mapped[str] = mapped_column(
        ForeignKey("quests.id"),
        nullable=False
    )

    steps: Mapped[int] = mapped_column(Integer)

    elevation_gain_m: Mapped[int] = mapped_column(Integer)

    actual_duration_min: Mapped[int] = mapped_column(Integer)

    avg_pace_min_per_km: Mapped[float] = mapped_column(Float)

    quest = relationship(
        "Quest",
        back_populates="stats"
    )