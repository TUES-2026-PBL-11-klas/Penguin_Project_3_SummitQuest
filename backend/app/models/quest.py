from datetime import datetime
from uuid import UUID, uuid4
from uuid import UUID
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy import Enum

from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey
)

from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.models.base import Base


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    trail_point_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("trail_points.id"),
        nullable=False
    )

    persona_used: Mapped[str] = mapped_column(
        Enum(
            "photographer",
            "athlete",
            "zen_explorer",
            name="persona_enum",
            create_type=False,
        )
    )

    transport_mode: Mapped[str] = mapped_column(
        Enum(
            "car",
            "public_transport",
            name="transport_mode_enum",
            create_type=False,
        )
    )

    status: Mapped[str] = mapped_column(
        Enum(
            "generated",
            "active",
            "completed",
            "expired",
            name="quest_status_enum",
            create_type=False,
        )
    )
    difficulty: Mapped[int] = mapped_column(Integer)
    distance_to_start_km: Mapped[float] = mapped_column(Float)
    estimated_duration_min: Mapped[int] = mapped_column(Integer)
    

    generated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime)

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    user = relationship("User", back_populates="quests")
    trail_point = relationship("TrailPoint", back_populates="quests")
    stats = relationship(
        "QuestStats",
        back_populates="quest",
        uselist=False
    )