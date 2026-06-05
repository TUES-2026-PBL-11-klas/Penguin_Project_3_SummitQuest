from dataclasses import dataclass


@dataclass(frozen=True)
class ForecastSlot:
    day: str
    temperature: float
    sun_score: float