from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.tracking.checkin_exceptions import (
    CheckInRepositoryError,
    InvalidQuestStatusError,
    QuestNotFoundError,
    QuestOwnerMismatchError,
)
from app.tracking.checkin_repository import CheckInRepository
from app.tracking.checkin_service import CheckInService, NoOpBadgeService

router = APIRouter(prefix="/api/checkin", tags=["checkin"])


class CheckInRequest(BaseModel):
    quest_id: str
    user_lat: float
    user_lon: float

    # TODO(auth-integration): Temporary field until authentication is
    # implemented. Later this should be removed from the request body and
    # replaced with current_user.id from the Auth module / JWT token.
    user_id: str | None = None


class CheckInResponse(BaseModel):
    quest_id: str
    user_id: str
    verified: bool
    status: str
    message: str


def get_checkin_service(
    db: AsyncSession = Depends(get_db),
) -> CheckInService:
    return CheckInService(
        repository=CheckInRepository(db),
        # TODO(badge-service-integration): Replace NoOpBadgeService with the
        # real BadgeService when feature/badge-service is merged.
        badge_service=NoOpBadgeService(),
    )


@router.post("/verify", response_model=CheckInResponse)
async def verify_checkin(
    request: CheckInRequest,
    service: CheckInService = Depends(get_checkin_service),
) -> CheckInResponse:
    try:
        result = await service.verify(
            quest_id=request.quest_id,
            user_lat=request.user_lat,
            user_lon=request.user_lon,
            # TODO(auth-integration): Replace request.user_id with the
            # authenticated user id when feature/authentication is merged.
            user_id=request.user_id,
        )

        return CheckInResponse(
            quest_id=result.quest_id,
            user_id=result.user_id,
            verified=result.verified,
            status=result.status,
            message=result.message,
        )

    except QuestNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    except QuestOwnerMismatchError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    except InvalidQuestStatusError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    except CheckInRepositoryError as exc:
        raise HTTPException(
            status_code=500,
            detail="Check-in verification failed.",
        ) from exc