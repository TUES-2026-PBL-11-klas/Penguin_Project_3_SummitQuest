import asyncio
import random
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Protocol
from uuid import uuid4

import structlog

from app.quest.clients import AIClient
from app.tracking.osrm_client import OsrmClient, TravelEstimate
from app.tracking.weather_client import WeatherClient
from app.quest.strategies import TrailPointData, get_strategy

logger = structlog.get_logger(__name__)


class QuestGenerationError(Exception):
    pass


class NoTrailPointsError(QuestGenerationError):
    pass


class IQuestEngine(Protocol):
    async def generate(
        self,
        user_id: str,
        persona: str,
        lat: float,
        lon: float,
        transport_mode: str,
        trail_points: list[TrailPointData],
    ) -> dict:
        ...


@dataclass
class ExternalData:
    forecast: dict = field(default_factory=dict)
    travel_time_min: float = 0.0
    clothing_tip: str = ""
    travel_estimate: TravelEstimate | None = None


class QuestEngineImpl:
    def __init__(
        self,
        weather_client: WeatherClient,
        osrm_client: OsrmClient,
        ai_client: AIClient,
    ) -> None:
        self._weather = weather_client
        self._osrm = osrm_client
        self._ai = ai_client

    async def _fetch_external_data(
        self,
        user_lat: float,
        user_lon: float,
        trail_lat: float,
        trail_lon: float,
        persona: str,
        transport_mode: str,
    ) -> ExternalData:
        data = ExternalData()
        queue: asyncio.Queue = asyncio.Queue()

        async def producer() -> None:
            await queue.put(("weather", self._weather.get_forecast(trail_lat, trail_lon)))
            await queue.put(("osrm", self._osrm.get_travel_estimate(user_lat, user_lon, trail_lat, trail_lon, transport_mode=transport_mode)))
            await queue.put(None)

        async def consumer() -> None:
            while True:
                item = await queue.get()
                if item is None:
                    break
                key, coro = item
                result = await coro
                if key == "weather":
                    data.forecast = result
                elif key == "osrm":
                    data.travel_estimate = result
                    data.travel_time_min = result.travel_time_min

        await asyncio.gather(producer(), consumer())

        data.clothing_tip = await self._ai.get_clothing_tip(persona, data.forecast)
        logger.info("external_data_fetched", persona=persona, travel_time_min=data.travel_time_min)
        return data

    async def generate(
        self,
        user_id: str,
        persona: str,
        lat: float,
        lon: float,
        transport_mode: str,
        trail_points: list[TrailPointData],
    ) -> dict:
        filtered = get_strategy(persona).filter(trail_points)
        if not filtered:
            raise NoTrailPointsError(f"No trail points found for persona '{persona}'")

        selected = random.choice(filtered)
        logger.info("trail_point_selected", trail_id=selected.id, trail_name=selected.name)

        external = await self._fetch_external_data( lat, lon, selected.lat, selected.lon, persona, transport_mode, )
        elevation_m = selected.elevation_m
        estimated_duration_min = int((elevation_m / 600) * 60)
        now = datetime.utcnow()

        return {
            "id": str(uuid4()),
            "user_id": user_id,
            "trail_point_id": selected.id,
            "trail_name": selected.name,
            "persona_used": persona,
            "difficulty": min(10, elevation_m // 200),
            "distance_to_start_km": round(external.travel_time_min * 0.8, 1),
            "estimated_duration_min": estimated_duration_min,
            "transport_mode": transport_mode,
            "status": "generated",
            "generated_at": now.isoformat(),
            "expires_at": (now + timedelta(hours=24)).isoformat(),
            "clothing_tip": external.clothing_tip,
            "forecast": external.forecast,
            "trail_lat": selected.lat,
            "trail_lon": selected.lon,
            "elevation_m": elevation_m,
            "travel_time_min": external.travel_time_min if transport_mode == "car" else None,
            "transit_walk_time_min": external.travel_estimate.travel_time_min if transport_mode == "public_transport" and external.travel_estimate else None,
            "transit_stop_name": external.travel_estimate.nearest_bus_stop.name if transport_mode == "public_transport" and external.travel_estimate and external.travel_estimate.nearest_bus_stop else ("Nearest bus stop" if transport_mode == "public_transport" else None),
            "transit_stop_lat": external.travel_estimate.nearest_bus_stop.lat if transport_mode == "public_transport" and external.travel_estimate and external.travel_estimate.nearest_bus_stop else None,
            "transit_stop_lon": external.travel_estimate.nearest_bus_stop.lon if transport_mode == "public_transport" and external.travel_estimate and external.travel_estimate.nearest_bus_stop else None,
        }
