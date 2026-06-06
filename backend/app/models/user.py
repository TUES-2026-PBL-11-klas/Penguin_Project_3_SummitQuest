from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import UUID, uuid4
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base
from sqlalchemy import Enum
from app.models.enums import PersonaEnum

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    persona: Mapped[PersonaEnum] = mapped_column(
        Enum(PersonaEnum, name="persona_enum"),
        nullable=False
    )

    has_car: Mapped[bool] = mapped_column(Boolean, default=False)

    max_travel_km: Mapped[int] = mapped_column(Integer)

    prefer_public_transport: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    level: Mapped[int] = mapped_column(Integer, default=1)

    xp: Mapped[int] = mapped_column(Integer, default=0)

    weight_kg: Mapped[float] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    quests = relationship("Quest", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")
    email_verifications = relationship("EmailVerification", back_populates="user")