from datetime import datetime

from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.models.base import Base


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    trail_point_id: Mapped[str] = mapped_column(
        ForeignKey("trail_points.id"),
        nullable=False
    )

    persona_used: Mapped[str] = mapped_column(String(50))

    difficulty: Mapped[int] = mapped_column(Integer)

    distance_to_start_km: Mapped[float] = mapped_column(Float)

    estimated_duration_min: Mapped[int] = mapped_column(Integer)

    transport_mode: Mapped[str] = mapped_column(String(50))

    status: Mapped[str] = mapped_column(String(50))

    generated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime)

    completed_at: Mapped[datetime] = mapped_column(DateTime)

    user = relationship(
        "User",
        back_populates="quests"
    )

    trail_point = relationship(
        "TrailPoint",
        back_populates="quests"
    )

    stats = relationship(
        "QuestStats",
        back_populates="quest",
        uselist=False
    )