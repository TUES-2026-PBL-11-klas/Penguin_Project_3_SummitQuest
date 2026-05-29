from fastapi import FastAPI

app = FastAPI(title="SummitQuest API")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}