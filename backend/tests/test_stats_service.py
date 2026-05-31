import pytest

from app.tracking.stats_service import (
    InvalidStatsInputError,
    StatsInput,
    StatsService,
)


def test_calculate_steps_from_distance():
    service = StatsService()

    steps = service.calculate_steps(7500)

    assert steps == 10000


def test_calculate_elevation_gain_from_samples():
    service = StatsService()

    elevation_gain = service.calculate_elevation_gain(
        [1000, 1200, 900, 1500]
    )

    assert elevation_gain == 600


def test_calculate_calories_with_elevation_adjustment():
    service = StatsService()

    calories = service.calculate_calories(
        user_weight_kg=70,
        duration_min=120,
        elevation_gain_m=600,
    )

    assert calories == 890.4


def test_calculate_full_stats_result():
    service = StatsService()

    result = service.calculate(
        StatsInput(
            distance_m=7500,
            duration_min=120,
            user_weight_kg=70,
            elevation_samples_m=[1000, 1200, 900, 1500],
        )
    )

    assert result.steps == 10000
    assert result.calories_burned == 890.4
    assert result.elevation_gain_m == 600


def test_calculate_steps_raises_for_negative_distance():
    service = StatsService()

    with pytest.raises(InvalidStatsInputError):
        service.calculate_steps(-1)


def test_calculate_calories_raises_for_zero_weight():
    service = StatsService()

    with pytest.raises(InvalidStatsInputError):
        service.calculate_calories(
            user_weight_kg=0,
            duration_min=60,
            elevation_gain_m=100,
        )


def test_calculate_calories_raises_for_zero_duration():
    service = StatsService()

    with pytest.raises(InvalidStatsInputError):
        service.calculate_calories(
            user_weight_kg=70,
            duration_min=0,
            elevation_gain_m=100,
        )