from datetime import datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trail_point import TrailPoint
from app.trail_sync.overpass_client import OverpassClient


class TrailPointSyncService:
    def __init__(
        self,
        session: AsyncSession,
        client: OverpassClient,
    ) -> None:
        self._session = session
        self._client = client

    async def sync(self) -> int:
        elements = await self._client.fetch_trail_points()

        created = 0

        for element in elements:
            osm_id = element.get("id")

            if osm_id is None:
                continue

            existing = (
                await self._session.execute(
                    select(TrailPoint).where(
                        TrailPoint.osm_id == osm_id
                    )
                )
            ).scalar_one_or_none()

            if existing:
                continue

            tags = element.get("tags", {})

            point_type = self._resolve_type(tags)

            try:
                elevation = int(tags.get("ele", 0))
            except (TypeError, ValueError):
                elevation = 0

            trail_point = TrailPoint(
                id=str(uuid4()),
                osm_id=osm_id,
                name=tags.get("name", "Unknown"),
                type=point_type,
                elevation_m=elevation,
                region="Bulgaria",
                last_synced_at=datetime.utcnow(),
            )

            self._session.add(trail_point)

            created += 1

        await self._session.commit()

        return created

    def _resolve_type(self, tags: dict) -> str:
        if tags.get("tourism") == "alpine_hut":
            return "hut"

        if tags.get("natural") == "water":
            return "lake"

        return "peak"