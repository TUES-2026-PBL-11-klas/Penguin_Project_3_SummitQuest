from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.tracking.checkin_exceptions import CheckInRepositoryError


@dataclass(frozen=True)
class QuestLocationCheck:
    quest_id: str
    user_id: str
    status: str
    is_near_destination: bool


class CheckInRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_quest_location_check(
        self,
        quest_id: str,
        user_lat: float,
        user_lon: float,
        radius_m: int,
    ) -> QuestLocationCheck | None:
        # TODO(database-integration): This query depends on the final database
        # schema. It expects:
        # - quests.id
        # - quests.user_id
        # - quests.status
        # - quests.trail_point_id
        # - trail_points.id
        # - trail_points.location as PostGIS GEOMETRY(POINT, 4326)
        #
        # If the final SQLAlchemy TrailPoint model exposes the PostGIS
        # location column later, this raw SQL can be replaced with ORM logic.
        #
        # PostGIS must be enabled in Supabase and trail_points.location must
        # be populated by the OpenStreetMap sync module before this works
        # with real data.
        query = text(
            """
            SELECT
                q.id::text AS quest_id,
                q.user_id::text AS user_id,
                q.status::text AS status,
                ST_DWithin(
                    tp.location::geography,
                    ST_SetSRID(
                        ST_MakePoint(:user_lon, :user_lat),
                        4326
                    )::geography,
                    :radius_m
                ) AS is_near_destination
            FROM quests q
            JOIN trail_points tp ON tp.id = q.trail_point_id
            WHERE q.id = :quest_id
            """
        )

        try:
            result = await self._session.execute(
                query,
                {
                    "quest_id": quest_id,
                    "user_lat": user_lat,
                    "user_lon": user_lon,
                    "radius_m": radius_m,
                },
            )
        except Exception as exc:
            raise CheckInRepositoryError(
                "Failed to check quest location."
            ) from exc

        row = result.mappings().one_or_none()

        if row is None:
            return None

        return QuestLocationCheck(
            quest_id=row["quest_id"],
            user_id=row["user_id"],
            status=row["status"],
            is_near_destination=bool(row["is_near_destination"]),
        )

    async def mark_quest_completed(
        self,
        quest_id: str,
        completed_at: datetime,
    ) -> None:
        query = text(
            """
            UPDATE quests
            SET status = 'completed',
                completed_at = :completed_at
            WHERE id = :quest_id
            """
        )

        try:
            await self._session.execute(
                query,
                {
                    "quest_id": quest_id,
                    "completed_at": completed_at,
                },
            )
            await self._session.commit()
        except Exception as exc:
            await self._session.rollback()
            raise CheckInRepositoryError(
                "Failed to mark quest as completed."
            ) from exc