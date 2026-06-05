from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

from typing import Any
from sqlalchemy.dialects.postgresql import JSONB


class Badge(Base):
    
    __tablename__ = "badges"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    name: Mapped[str] = mapped_column(String(255))

    description: Mapped[str] = mapped_column(Text)

    icon_url: Mapped[str] = mapped_column(String(255))

    condition_type: Mapped[str] = mapped_column(String(50))

    condition_value: Mapped[dict[str, Any]] = mapped_column(JSONB)
