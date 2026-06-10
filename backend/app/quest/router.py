from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.quest import Quest as QuestModel
from app.quest.clients import AIClient
from app.tracking.osrm_client import OsrmClient
from app.tracking.weather_client import WeatherClient
from app.quest.engine import NoTrailPointsError, QuestEngineImpl
from app.quest.strategies import TrailPointData

router = APIRouter(prefix="/api/quest", tags=["quest"])

MOCK_TRAILS: list[TrailPointData] = [
    TrailPointData("1a0ed5a3-fcd6-42ee-844c-ce7e7f47fede", "Musala", "peak", 2925, 42.179, 23.585, "Rila"),
    TrailPointData("470e91e5-d58e-4394-a2ac-822a2bb4590c", "Vihren", "peak", 2914, 41.766, 23.402, "Pirin"),
    TrailPointData("073a37df-5e98-4be1-b5a5-fc255748bfb6", "Cherni Vrah", "peak", 2290, 42.562, 23.278, "Vitosha"),
    TrailPointData("eb90a5d7-29e0-4ed9-bb2e-adb0fa32f864", "Belmeken Lake", "lake", 1850, 42.115, 23.647, "Rila"),
    TrailPointData("250072b4-7470-4c27-955a-a7325f88ad10", "Hizha Vazov", "hut", 1490, 42.731, 24.706, "Stara Planina"),
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
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
        quest_dict = await engine.generate(
            user_id=request.user_id,
            persona=request.persona,
            lat=request.lat,
            lon=request.lon,
            transport_mode=request.transport_mode,
            trail_points=MOCK_TRAILS,
        )

        db_quest = QuestModel(
            id=UUID(quest_dict["id"]),
            user_id=UUID(quest_dict["user_id"]),
            trail_point_id=quest_dict["trail_point_id"],
            persona_used=quest_dict["persona_used"],
            difficulty=quest_dict["difficulty"],
            distance_to_start_km=quest_dict["distance_to_start_km"],
            estimated_duration_min=quest_dict["estimated_duration_min"],
            transport_mode=quest_dict["transport_mode"],
            status="generated",
            generated_at=datetime.utcnow(),
            expires_at=datetime.fromisoformat(quest_dict["expires_at"]),
        )
        db.add(db_quest)
        await db.commit()

        return quest_dict

    except NoTrailPointsError as e:
        raise HTTPException(status_code=404, detail=str(e))