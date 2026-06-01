from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

import structlog

from app.tracking.checkin_exceptions import (
    InvalidQuestStatusError,
    QuestNotFoundError,
    QuestOwnerMismatchError,
)
from app.tracking.checkin_repository import CheckInRepository

logger = structlog.get_logger(__name__)


# TODO(badge-service-integration): This protocol defines the minimum method
# CheckInService needs from the real BadgeService.
# When feature/badge-service is merged, inject the real BadgeService here
# instead of NoOpBadgeService.
class BadgeServiceProtocol(Protocol):
    async def evaluate_and_award(self, user_id: str) -> None:
        ...


class NoOpBadgeService:
    async def evaluate_and_award(self, user_id: str) -> None:
        # TODO(badge-service-integration): Temporary fallback.
        # Replace this class with the real BadgeService implementation after
        # feature/badge-service is merged into dev.
        logger.info("badge_service_not_configured", user_id=user_id)


@dataclass(frozen=True)
class CheckInResult:
    quest_id: str
    user_id: str
    verified: bool
    status: str
    message: str


class CheckInService:
    DEFAULT_RADIUS_M = 100

    def __init__(
        self,
        repository: CheckInRepository,
        badge_service: BadgeServiceProtocol | None = None,
        radius_m: int = DEFAULT_RADIUS_M,
    ) -> None:
        self._repository = repository
        self._badge_service = badge_service or NoOpBadgeService()
        self._radius_m = radius_m

    async def verify(
        self,
        quest_id: str,
        user_lat: float,
        user_lon: float,
        user_id: str | None = None,
    ) -> CheckInResult:
        quest_check = await self._repository.get_quest_location_check(
            quest_id=quest_id,
            user_lat=user_lat,
            user_lon=user_lon,
            radius_m=self._radius_m,
        )

        if quest_check is None:
            raise QuestNotFoundError(f"Quest '{quest_id}' was not found.")

        # TODO(auth-integration): user_id is currently optional because
        # authentication is not implemented yet.
        # When feature/authentication is merged, user_id should come from the
        # authenticated JWT user, not from the request body.
        if user_id is not None and quest_check.user_id != user_id:
            raise QuestOwnerMismatchError(
                "Quest does not belong to the provided user."
            )

        if quest_check.status == "completed":
            return CheckInResult(
                quest_id=quest_check.quest_id,
                user_id=quest_check.user_id,
                verified=True,
                status="completed",
                message="Quest is already completed.",
            )

        if quest_check.status == "expired":
            raise InvalidQuestStatusError("Expired quest cannot be completed.")

        if quest_check.status not in {"generated", "active"}:
            raise InvalidQuestStatusError(
                f"Quest status '{quest_check.status}' cannot be completed."
            )

        if not quest_check.is_near_destination:
            logger.info(
                "checkin_failed_not_near_destination",
                quest_id=quest_check.quest_id,
                user_id=quest_check.user_id,
            )

            return CheckInResult(
                quest_id=quest_check.quest_id,
                user_id=quest_check.user_id,
                verified=False,
                status=quest_check.status,
                message="You are not close enough to the destination.",
            )

        await self._repository.mark_quest_completed(
            quest_id=quest_check.quest_id,
            completed_at=datetime.utcnow(),
        )

        # TODO(badge-service-integration): This currently calls
        # NoOpBadgeService. After the real BadgeService is merged, this should
        # trigger badge evaluation based on the completed quest and accumulated
        # user stats.
        await self._badge_service.evaluate_and_award(quest_check.user_id)

        logger.info(
            "quest_completed_by_checkin",
            quest_id=quest_check.quest_id,
            user_id=quest_check.user_id,
        )

        return CheckInResult(
            quest_id=quest_check.quest_id,
            user_id=quest_check.user_id,
            verified=True,
            status="completed",
            message="Quest completed successfully.",
        )