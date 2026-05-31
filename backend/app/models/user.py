from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    persona: Mapped[str] = mapped_column(String(50), nullable=False)

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