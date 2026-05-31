import structlog
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

app = FastAPI(title="SummitQuest API")

Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
