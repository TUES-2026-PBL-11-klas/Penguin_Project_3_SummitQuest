from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/checkin",
    tags=["checkin"]
)


class VerifyCheckinRequest(BaseModel):
    quest_id: str
    user_lat: float
    user_lon: float
    user_id: str


@router.post("/verify")
async def verify_checkin(
    request: VerifyCheckinRequest
):
    return {
        "quest_id": request.quest_id,
        "user_id": request.user_id,
        "verified": True,
        "status": "completed",
        "message": "Summit verified successfully"
    }