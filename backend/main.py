from fastapi import FastAPI

from app.quest.router import router as quest_router

app = FastAPI(title="SummitQuest API")

app.include_router(quest_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}