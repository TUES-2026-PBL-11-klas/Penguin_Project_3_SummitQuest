import structlog
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.models.badge import Badge
from app.models.quest import Quest
from app.models.quest_stats import QuestStats
from app.models.user_badge import UserBadge

logger = structlog.get_logger(__name__)

class BadgeService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def evaluate_and_award(self, user_id: str) -> None:
        badges = (
            await self._session.execute(
                select(Badge)
            )
        ).scalars().all()

        for badge in badges:
            already_awarded = (
                await self._session.execute(
                    select(UserBadge).where(
                        UserBadge.user_id == user_id,
                        UserBadge.badge_id == badge.id,
                    )
                )
            ).scalar_one_or_none()

            if already_awarded:
                continue

            unlocked = await self._badge_unlocked(
                user_id=user_id,
                badge=badge,
            )

            if unlocked:
                self._session.add(
                    UserBadge(
                        user_id=user_id,
                        badge_id=badge.id,
                        earned_at=datetime.utcnow(),
                    )
                )

                logger.info(
                    "badge_awarded",
                    user_id=str(user_id),
                    badge_id=str(badge.id),
                )

                import structlog

                logger = structlog.get_logger(__name__)

                logger.info(
                    "badge_awarded",
                    user_id=str(user_id),
                    badge_id=str(badge.id),
                )
                
        await self._session.commit()

    async def _badge_unlocked(
        self,
        user_id: str,
        badge: Badge,
    ) -> bool:
        condition_value = badge.condition_value or {}
        target_value = condition_value.get("value", 0)
        if badge.condition_type == "quests_completed":
            completed_count = (
                await self._session.execute(
                    select(func.count())
                    .select_from(Quest)
                    .where(
                        Quest.user_id == user_id,
                        Quest.status == "completed",
                    )
                )
            ).scalar() or 0

            return completed_count >= target_value

        if badge.condition_type == "steps":
            total_steps = (
                await self._session.execute(
                    select(
                        func.coalesce(
                            func.sum(QuestStats.steps),
                            0
                        )
                    )
                    .join(
                        Quest,
                        Quest.id == QuestStats.quest_id
                    )
                    .where(
                        Quest.user_id == user_id,
                        Quest.status == "completed",
                    )
                )
            ).scalar() or 0

            return total_steps >= target_value

        if badge.condition_type == "elevation_gain":
            total_elevation = (
                await self._session.execute(
                    select(
                        func.coalesce(
                            func.sum(
                                QuestStats.elevation_gain_m
                            ),
                            0
                        )
                    )
                    .join(
                        Quest,
                        Quest.id == QuestStats.quest_id
                    )
                    .where(
                        Quest.user_id == user_id,
                        Quest.status == "completed",
                    )
                )
            ).scalar() or 0

            return total_elevation >= target_value

        return False