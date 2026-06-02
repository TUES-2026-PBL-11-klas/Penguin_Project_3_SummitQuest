from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass
class TrailPointData:
    id: str
    name: str
    type: str
    elevation_m: int
    lat: float
    lon: float
    region: str


class IPersonaStrategy(ABC, Generic[T]):
    @abstractmethod
    def filter(self, points: list[TrailPointData]) -> list[TrailPointData]:
        ...

    @abstractmethod
    def get_persona_name(self) -> str:
        ...


class PhotographerStrategy(IPersonaStrategy[TrailPointData]):
    def filter(self, points: list[TrailPointData]) -> list[TrailPointData]:
        return [p for p in points if p.type == "peak" and p.elevation_m > 1500]

    def get_persona_name(self) -> str:
        return "photographer"


class AthleteStrategy(IPersonaStrategy[TrailPointData]):
    def filter(self, points: list[TrailPointData]) -> list[TrailPointData]:
        return [p for p in points if p.type == "peak" and p.elevation_m > 2000]

    def get_persona_name(self) -> str:
        return "athlete"


class ZenExplorerStrategy(IPersonaStrategy[TrailPointData]):
    def filter(self, points: list[TrailPointData]) -> list[TrailPointData]:
        return [p for p in points if p.type in ("lake", "hut")]

    def get_persona_name(self) -> str:
        return "zen_explorer"


STRATEGY_MAP: dict[str, IPersonaStrategy[TrailPointData]] = {
    "photographer": PhotographerStrategy(),
    "athlete": AthleteStrategy(),
    "zen_explorer": ZenExplorerStrategy(),
}


def get_strategy(persona: str) -> IPersonaStrategy[TrailPointData]:
    if persona not in STRATEGY_MAP:
        raise ValueError(f"Unknown persona: '{persona}'. Valid options: {list(STRATEGY_MAP)}")
    return STRATEGY_MAP[persona]
