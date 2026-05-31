from app.quest.strategies import (
    AthleteStrategy,
    PhotographerStrategy,
    TrailPointData,
    ZenExplorerStrategy,
)

MOCK = [
    TrailPointData("1", "High Peak", "peak", 2500, 0.0, 0.0, "Rila"),
    TrailPointData("2", "Low Peak", "peak", 1200, 0.0, 0.0, "Vitosha"),
    TrailPointData("3", "Lake", "lake", 1800, 0.0, 0.0, "Rila"),
    TrailPointData("4", "Hut", "hut", 1400, 0.0, 0.0, "Balkan"),
]


def test_photographer_filters_peaks_above_1500():
    result = PhotographerStrategy().filter(MOCK)
    assert all(p.type == "peak" and p.elevation_m > 1500 for p in result)
    assert len(result) == 1
    assert result[0].name == "High Peak"


def test_athlete_filters_peaks_above_2000():
    result = AthleteStrategy().filter(MOCK)
    assert all(p.type == "peak" and p.elevation_m > 2000 for p in result)
    assert len(result) == 1
    assert result[0].name == "High Peak"


def test_zen_filters_lakes_and_huts():
    result = ZenExplorerStrategy().filter(MOCK)
    assert all(p.type in ("lake", "hut") for p in result)
    assert len(result) == 2


def test_photographer_empty_input():
    assert PhotographerStrategy().filter([]) == []


def test_athlete_empty_input():
    assert AthleteStrategy().filter([]) == []


def test_zen_empty_input():
    assert ZenExplorerStrategy().filter([]) == []
