import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token
)


async def create_user(
    db: AsyncSession,
    email: str,
    password: str,
    persona: str,
    weight_kg: float
):
    result = await db.execute(
        select(User).where(
            User.email == email
        )
    )

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise ValueError(
            "Email already exists"
        )

    user = User(
        email=email,
        password_hash=hash_password(password),
        is_verified=False,
        persona=persona,
        weight_kg=weight_kg,
        has_car=False,
        max_travel_km=50,
        prefer_public_transport=False,
        level=1,
        xp=0
    )

    db.add(user)

    await db.commit()
    await db.refresh(user)

    return user


async def login_user(
    db: AsyncSession,
    email: str,
    password: str
):
    result = await db.execute(
        select(User).where(
            User.email == email
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return create_access_token(
        {"sub": user.email}
    )