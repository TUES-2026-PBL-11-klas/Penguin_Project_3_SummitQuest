from typing import Any
from uuid import NAMESPACE_URL, UUID, uuid5

import httpx
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.tracking.exceptions import WeatherApiError, WeatherConfigurationError
from app.tracking.weather_repository import WeatherRepository

logger = structlog.get_logger(__name__)


class WeatherClient:
    _url = "https://api.openweathermap.org/data/2.5/forecast"

    def __init__(
        self,
        session: AsyncSession | None = None,
        repository: WeatherRepository | None = None,
        api_key: str | None = None,
        timeout_seconds: float = 10.0,
        cache_ttl_minutes: int = 60,
    ) -> None:
        self._api_key = settings.OPENWEATHER_API_KEY if api_key is None else api_key
        self._timeout_seconds = timeout_seconds
        self._cache_ttl_minutes = cache_ttl_minutes

        if repository is not None:
            self._repository = repository
        elif session is not None:
            self._repository = WeatherRepository(session)
        else:
            self._repository = None

    @staticmethod
    def _build_cache_id(lat: float, lon: float) -> UUID:
        rounded_lat = round(lat, 3)
        rounded_lon = round(lon, 3)
        cache_key = f"openweather:{rounded_lat}:{rounded_lon}:metric:bg:6h"
        return uuid5(NAMESPACE_URL, cache_key)

    async def get_forecast(self, lat: float, lon: float) -> dict[str, Any]:
        if not self._api_key:
            raise WeatherConfigurationError("OPENWEATHER_API_KEY is not configured.")

        cache_id = self._build_cache_id(lat, lon)

        if self._repository is not None:
            cached_forecast = await self._repository.get_valid_forecast(cache_id)

            if cached_forecast is not None:
                logger.info("weather_cache_hit", lat=lat, lon=lon)
                return cached_forecast

        forecast = await self._fetch_from_openweather(lat=lat, lon=lon)

        if self._repository is not None:
            await self._repository.save_forecast(
                cache_id=cache_id,
                forecast_json=forecast,
                ttl_minutes=self._cache_ttl_minutes,
            )

        logger.info("weather_forecast_fetched", lat=lat, lon=lon)
        return forecast

    async def _fetch_from_openweather(self, lat: float, lon: float) -> dict[str, Any]:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self._api_key,
            "units": "metric",
            "lang": "bg",
            "cnt": 3,
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout_seconds) as client:
                response = await client.get(self._url, params=params)
                response.raise_for_status()
                forecast = response.json()

        except httpx.HTTPStatusError as exc:
            raise WeatherApiError("OpenWeather returned an HTTP error.") from exc

        except httpx.HTTPError as exc:
            raise WeatherApiError("OpenWeather request failed.") from exc

        except ValueError as exc:
            raise WeatherApiError("OpenWeather returned invalid JSON.") from exc

        if not isinstance(forecast, dict) or "list" not in forecast:
            raise WeatherApiError("Invalid OpenWeather response: missing 'list'.")

        return forecast