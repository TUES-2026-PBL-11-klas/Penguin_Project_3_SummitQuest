from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weather_cache import WeatherCache


class WeatherRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_valid_forecast(self, cache_id: UUID) -> dict[str, Any] | None:
        now = datetime.utcnow()

        result = await self._session.execute(
            select(WeatherCache).where(
                WeatherCache.id == cache_id,
                WeatherCache.valid_until > now,
            )
        )

        cache = result.scalar_one_or_none()

        if cache is None:
            return None

        return cache.forecast_json

    async def save_forecast(
        self,
        cache_id: UUID,
        forecast_json: dict[str, Any],
        ttl_minutes: int = 60,
    ) -> None:
        now = datetime.utcnow()
        valid_until = now + timedelta(minutes=ttl_minutes)

        cache = await self._session.get(WeatherCache, cache_id)

        if cache is None:
            cache = WeatherCache(
                id=cache_id,
                forecast_json=forecast_json,
                fetched_at=now,
                valid_until=valid_until,
            )
            self._session.add(cache)
        else:
            cache.forecast_json = forecast_json
            cache.fetched_at = now
            cache.valid_until = valid_until

        await self._session.commit()