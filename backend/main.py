import structlog
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from app.checkin.router import router as checkin_router
from app.quest.router import router as quest_router
from app.auth.router import router as auth_router

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

app = FastAPI(title="SummitQuest API")

app.include_router(quest_router)
app.include_router(auth_router)
app.include_router(checkin_router)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}