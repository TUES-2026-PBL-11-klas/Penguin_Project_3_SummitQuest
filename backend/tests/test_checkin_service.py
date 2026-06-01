import pytest

from app.tracking.checkin_exceptions import (
    InvalidQuestStatusError,
    QuestNotFoundError,
    QuestOwnerMismatchError,
)
from app.tracking.checkin_repository import QuestLocationCheck
from app.tracking.checkin_service import CheckInService


class FakeCheckInRepository:
    def __init__(self, quest_check: QuestLocationCheck | None) -> None:
        self.quest_check = quest_check
        self.completed_quest_id = None
        self.completed_at = None

    async def get_quest_location_check(
        self,
        quest_id: str,
        user_lat: float,
        user_lon: float,
        radius_m: int,
    ) -> QuestLocationCheck | None:
        return self.quest_check

    async def mark_quest_completed(self, quest_id: str, completed_at) -> None:
        self.completed_quest_id = quest_id
        self.completed_at = completed_at


class FakeBadgeService:
    def __init__(self) -> None:
        self.awarded_for_user_id = None

    async def evaluate_and_award(self, user_id: str) -> None:
        self.awarded_for_user_id = user_id


@pytest.mark.asyncio
async def test_verify_marks_quest_completed_and_triggers_badges():
    repository = FakeCheckInRepository(
        QuestLocationCheck(
            quest_id="quest-1",
            user_id="user-1",
            status="active",
            is_near_destination=True,
        )
    )
    badge_service = FakeBadgeService()

    service = CheckInService(
        repository=repository,
        badge_service=badge_service,
        radius_m=100,
    )

    result = await service.verify(
        quest_id="quest-1",
        user_id="user-1",
        user_lat=42.1,
        user_lon=23.1,
    )

    assert result.verified is True
    assert result.status == "completed"
    assert repository.completed_quest_id == "quest-1"
    assert repository.completed_at is not None
    assert badge_service.awarded_for_user_id == "user-1"


@pytest.mark.asyncio
async def test_verify_returns_false_when_user_is_not_near_destination():
    repository = FakeCheckInRepository(
        QuestLocationCheck(
            quest_id="quest-1",
            user_id="user-1",
            status="active",
            is_near_destination=False,
        )
    )
    badge_service = FakeBadgeService()

    service = CheckInService(
        repository=repository,
        badge_service=badge_service,
        radius_m=100,
    )

    result = await service.verify(
        quest_id="quest-1",
        user_id="user-1",
        user_lat=42.1,
        user_lon=23.1,
    )

    assert result.verified is False
    assert result.status == "active"
    assert repository.completed_quest_id is None
    assert badge_service.awarded_for_user_id is None


@pytest.mark.asyncio
async def test_verify_raises_when_quest_does_not_exist():
    repository = FakeCheckInRepository(quest_check=None)
    service = CheckInService(repository=repository)

    with pytest.raises(QuestNotFoundError):
        await service.verify(
            quest_id="missing-quest",
            user_id="user-1",
            user_lat=42.1,
            user_lon=23.1,
        )


# TODO(auth-integration): This test uses manually provided user_id because
# authentication is not implemented yet. After Auth is merged, add router-level
# tests that verify the user_id comes from the authenticated user context.
@pytest.mark.asyncio
async def test_verify_raises_when_user_does_not_own_quest():
    repository = FakeCheckInRepository(
        QuestLocationCheck(
            quest_id="quest-1",
            user_id="real-owner",
            status="active",
            is_near_destination=True,
        )
    )
    service = CheckInService(repository=repository)

    with pytest.raises(QuestOwnerMismatchError):
        await service.verify(
            quest_id="quest-1",
            user_id="wrong-user",
            user_lat=42.1,
            user_lon=23.1,
        )


@pytest.mark.asyncio
async def test_verify_returns_success_when_quest_is_already_completed():
    repository = FakeCheckInRepository(
        QuestLocationCheck(
            quest_id="quest-1",
            user_id="user-1",
            status="completed",
            is_near_destination=True,
        )
    )
    badge_service = FakeBadgeService()

    service = CheckInService(
        repository=repository,
        badge_service=badge_service,
    )

    result = await service.verify(
        quest_id="quest-1",
        user_id="user-1",
        user_lat=42.1,
        user_lon=23.1,
    )

    assert result.verified is True
    assert result.status == "completed"
    assert repository.completed_quest_id is None
    assert badge_service.awarded_for_user_id is None


@pytest.mark.asyncio
async def test_verify_raises_when_quest_is_expired():
    repository = FakeCheckInRepository(
        QuestLocationCheck(
            quest_id="quest-1",
            user_id="user-1",
            status="expired",
            is_near_destination=True,
        )
    )
    service = CheckInService(repository=repository)

    with pytest.raises(InvalidQuestStatusError):
        await service.verify(
            quest_id="quest-1",
            user_id="user-1",
            user_lat=42.1,
            user_lon=23.1,
        )