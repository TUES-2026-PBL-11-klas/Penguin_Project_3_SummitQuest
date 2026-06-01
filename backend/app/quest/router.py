from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.quest.clients import AIClient
from app.tracking.osrm_client import OsrmClient
from app.tracking.weather_client import WeatherClient
from app.quest.engine import NoTrailPointsError, QuestEngineImpl
from app.quest.strategies import TrailPointData

router = APIRouter(prefix="/api/quest", tags=["quest"])

MOCK_TRAILS: list[TrailPointData] = [
    TrailPointData("1", "Musala", "peak", 2925, 42.179, 23.585, "Rila"),
    TrailPointData("2", "Vihren", "peak", 2914, 41.766, 23.402, "Pirin"),
    TrailPointData("3", "Cherni Vrah", "peak", 2290, 42.562, 23.278, "Vitosha"),
    TrailPointData("4", "Belmeken Lake", "lake", 1850, 42.115, 23.647, "Rila"),
    TrailPointData("5", "Hizha Vazov", "hut", 1490, 42.731, 24.706, "Stara Planina"),
]


class QuestRequest(BaseModel):
    user_id: str
    persona: str
    lat: float
    lon: float
    transport_mode: str


def get_engine(db: AsyncSession = Depends(get_db)) -> QuestEngineImpl:
    return QuestEngineImpl(
        weather_client=WeatherClient(session=db),
        osrm_client=OsrmClient(),
        ai_client=AIClient(),
    )


@router.post("/generate")
async def generate_quest(
    request: QuestRequest,
    engine: QuestEngineImpl = Depends(get_engine),
) -> dict:
    try:
        return await engine.generate(
            user_id=request.user_id,
            persona=request.persona,
            lat=request.lat,
            lon=request.lon,
            transport_mode=request.transport_mode,
            trail_points=MOCK_TRAILS,
        )

    except NoTrailPointsError as e:
        raise HTTPException(status_code=404, detail=str(e))