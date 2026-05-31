import structlog
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.quest.router import router as quest_router

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

app = FastAPI(title="SummitQuest API")

app.include_router(quest_router)
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}