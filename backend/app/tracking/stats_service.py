from dataclasses import dataclass
from typing import Sequence


class StatsServiceError(Exception):
    """Base exception for stats service errors."""


class InvalidStatsInputError(StatsServiceError):
    """Raised when stats calculation input is invalid."""


@dataclass(frozen=True)
class StatsInput:
    distance_m: float
    duration_min: float
    user_weight_kg: float
    elevation_samples_m: Sequence[float]


@dataclass(frozen=True)
class StatsResult:
    steps: int
    calories_burned: float
    elevation_gain_m: int


class StatsService:
    AVERAGE_STEP_LENGTH_M = 0.75
    HIKING_MET = 6.0
    ELEVATION_CALORIE_FACTOR_PER_1000M = 0.10

    def calculate(self, stats_input: StatsInput) -> StatsResult:
        self._validate_input(stats_input)

        elevation_gain_m = self.calculate_elevation_gain(
            stats_input.elevation_samples_m
        )

        return StatsResult(
            steps=self.calculate_steps(stats_input.distance_m),
            calories_burned=self.calculate_calories(
                user_weight_kg=stats_input.user_weight_kg,
                duration_min=stats_input.duration_min,
                elevation_gain_m=elevation_gain_m,
            ),
            elevation_gain_m=elevation_gain_m,
        )

    def calculate_steps(self, distance_m: float) -> int:
        if distance_m < 0:
            raise InvalidStatsInputError("Distance cannot be negative.")

        return round(distance_m / self.AVERAGE_STEP_LENGTH_M)

    def calculate_elevation_gain(
        self,
        elevation_samples_m: Sequence[float],
    ) -> int:
        if not elevation_samples_m:
            return 0

        return round(max(elevation_samples_m) - min(elevation_samples_m))

    def calculate_calories(
        self,
        user_weight_kg: float,
        duration_min: float,
        elevation_gain_m: float,
    ) -> float:
        if user_weight_kg <= 0:
            raise InvalidStatsInputError("User weight must be positive.")

        if duration_min <= 0:
            raise InvalidStatsInputError("Duration must be positive.")

        if elevation_gain_m < 0:
            raise InvalidStatsInputError("Elevation gain cannot be negative.")

        duration_hours = duration_min / 60

        base_calories = self.HIKING_MET * user_weight_kg * duration_hours

        elevation_factor = (1 + (elevation_gain_m / 1000) * self.ELEVATION_CALORIE_FACTOR_PER_1000M
        )

        return round(base_calories * elevation_factor, 2)

    def _validate_input(self, stats_input: StatsInput) -> None:
        if stats_input.distance_m < 0:
            raise InvalidStatsInputError("Distance cannot be negative.")

        if stats_input.duration_min <= 0:
            raise InvalidStatsInputError("Duration must be positive.")

        if stats_input.user_weight_kg <= 0:
            raise InvalidStatsInputError("User weight must be positive.")