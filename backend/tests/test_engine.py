import pytest
from unittest.mock import AsyncMock

from app.quest.engine import NoTrailPointsError, QuestEngineImpl
from app.quest.strategies import TrailPointData

TRAILS = [TrailPointData("1", "Musala", "peak", 2925, 42.179, 23.585, "Rila")]


@pytest.mark.asyncio
async def test_generate_returns_quest():
    weather_client = AsyncMock()
    weather_client.get_forecast.return_value = {
        "list": [{"main": {"temp": 10}, "weather": [{"description": "cloudy"}]}]
    }

    osrm_client = AsyncMock()
    osrm_client.get_travel_time_min.return_value = 45.0

    ai_client = AsyncMock()
    ai_client.get_clothing_tip.return_value = "Wear a windbreaker."

    engine = QuestEngineImpl(
        weather_client=weather_client,
        osrm_client=osrm_client,
        ai_client=ai_client,
    )

    quest = await engine.generate("user-1", "athlete", 42.0, 23.0, "car", TRAILS)

    assert quest["trail_name"] == "Musala"
    assert quest["clothing_tip"] == "Wear a windbreaker."
    assert quest["status"] == "generated"


@pytest.mark.asyncio
async def test_generate_raises_when_no_matching_trails():
    engine = QuestEngineImpl(
        weather_client=AsyncMock(),
        osrm_client=AsyncMock(),
        ai_client=AsyncMock(),
    )

    with pytest.raises(NoTrailPointsError):
        await engine.generate("user-1", "zen_explorer", 42.0, 23.0, "car", TRAILS)
