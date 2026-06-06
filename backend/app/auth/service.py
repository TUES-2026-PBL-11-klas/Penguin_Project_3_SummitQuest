import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from app.models.email_verification import EmailVerification
from app.models.user import User

from app.models.enums import PersonaEnum

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
    weight_kg: float,
    first_name: str | None = None,
    last_name: str | None = None,
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
        first_name=first_name,
        last_name=last_name,
        password_hash=hash_password(password),
        is_verified=False,
        persona=PersonaEnum(persona),
        weight_kg=weight_kg,
        has_car=False,
        max_travel_km=50,
        prefer_public_transport=False,
        level=1,
        xp=0
    )

    db.add(user)
    await db.flush()    

    verification = EmailVerification(
        user_id=user.id,
        token=str(uuid.uuid4()),
        expires_at=datetime.utcnow() + timedelta(hours=24),
        used=False
    )

    db.add(verification)

    await db.commit()
    await db.refresh(user)

    return {
        "user": user,
        "verification_token": verification.token
    }


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

async def verify_email(
    db: AsyncSession,
    token: str
):
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.token == token
        )
    )

    verification = result.scalar_one_or_none()

    if not verification:
        return False

    if verification.used:
        return False

    if verification.expires_at < datetime.utcnow():
        return False

    result = await db.execute(
        select(User).where(
            User.id == verification.user_id
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        return False

    verification.used = True
    user.is_verified = True

    await db.commit()

    return True

