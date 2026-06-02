from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    token: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime)

    used: Mapped[bool] = mapped_column(Boolean, default=False)

    user = relationship(
        "User",
        back_populates="email_verifications"
    )