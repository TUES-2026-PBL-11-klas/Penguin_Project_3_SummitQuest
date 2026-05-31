import structlog

import httpx

from app.core.config import settings

logger = structlog.get_logger(__name__)


# TODO: replace with Dancho's implementation from tracking/
class WeatherClient:
    async def get_forecast(self, lat: float, lon: float) -> dict:
        return {
            "list": [
                {"main": {"temp": 18}, "weather": [{"description": "clear sky"}]},
                {"main": {"temp": 15}, "weather": [{"description": "few clouds"}]},
                {"main": {"temp": 13}, "weather": [{"description": "scattered clouds"}]},
            ]
        }


# TODO: replace with Dancho's implementation from tracking/
class OsrmClient:
    async def get_travel_time_min(
        self,
        from_lat: float,
        from_lon: float,
        to_lat: float,
        to_lon: float,
    ) -> float:
        return 45.0


class AIClient:
    _url = "https://api.mistral.ai/v1/chat/completions"
    _model = "mistral-small-latest"

    async def get_clothing_tip(self, persona: str, forecast: dict) -> str:
        try:
            items = forecast["list"][:3]
            avg_temp = sum(item["main"]["temp"] for item in items) / len(items)
            descriptions = [item["weather"][0]["description"] for item in items]

            prompt = (
                f"You are an outdoor advisor. A '{persona}' hiker is planning a mountain trip. "
                f"The weather forecast shows an average temperature of {avg_temp:.1f}°C "
                f"with conditions: {', '.join(descriptions)}. "
                "Give a single concise sentence of clothing advice for this hike."
            )

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self._url,
                    headers={
                        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self._model,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                    timeout=15.0,
                )
                response.raise_for_status()
                tip: str = response.json()["choices"][0]["message"]["content"].strip()
                logger.info("clothing_tip_generated", persona=persona, tip=tip)
                return tip
        except Exception as exc:
            logger.warning("clothing_tip_failed", error=str(exc))
            return "Dress in layers suitable for mountain weather."
