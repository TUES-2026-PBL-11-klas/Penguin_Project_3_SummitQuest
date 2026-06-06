from dataclasses import dataclass
from math import asin, cos, radians, sin, sqrt
from typing import Any, Literal

import httpx
import structlog

from app.core.config import settings
from app.tracking.transport_exceptions import (
    InvalidTransportModeError,
    NoBusStopFoundError,
    OsrmApiError,
    OverpassApiError,
)

logger = structlog.get_logger(__name__)

TransportMode = Literal["car", "public_transport"]


@dataclass(frozen=True)
class RouteResult:
    distance_m: float
    duration_sec: float


@dataclass(frozen=True)
class BusStop:
    id: int
    name: str
    lat: float
    lon: float
    straight_line_distance_m: float


@dataclass(frozen=True)
class TravelEstimate:
    transport_mode: TransportMode
    travel_time_min: float
    distance_m: float
    nearest_bus_stop: BusStop | None = None


class OsrmClient:
    WALKING_SPEED_M_PER_MIN = 5000 / 60
    DRIVING_PROFILE = "driving"
    WALKING_PROFILE = "foot"

    def __init__(
        self,
        osrm_base_url: str | None = None,
        overpass_base_url: str | None = None,
        timeout_seconds: float = 10.0,
        bus_stop_search_radius_m: int = 1500,
    ) -> None:
        self._osrm_base_url = (osrm_base_url or settings.OSRM_BASE_URL).rstrip("/")
        self._overpass_base_url = (
            overpass_base_url or settings.OVERPASS_BASE_URL
        ).rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._bus_stop_search_radius_m = bus_stop_search_radius_m

    async def get_travel_time_min(
        self,
        from_lat: float,
        from_lon: float,
        to_lat: float,
        to_lon: float,
        transport_mode: TransportMode = "car",
    ) -> float:
        estimate = await self.get_travel_estimate(
            from_lat=from_lat,
            from_lon=from_lon,
            to_lat=to_lat,
            to_lon=to_lon,
            transport_mode=transport_mode,
        )

        return estimate.travel_time_min

    async def get_travel_estimate(
        self,
        from_lat: float,
        from_lon: float,
        to_lat: float,
        to_lon: float,
        transport_mode: TransportMode = "car",
    ) -> TravelEstimate:
        if transport_mode == "car":
            return await self._get_car_estimate(
                from_lat=from_lat,
                from_lon=from_lon,
                to_lat=to_lat,
                to_lon=to_lon,
            )

        if transport_mode == "public_transport":
            return await self._get_public_transport_estimate(
                route_start_lat=to_lat,
                route_start_lon=to_lon,
            )

        raise InvalidTransportModeError(f"Unsupported transport mode: {transport_mode}")

    async def _get_car_estimate(
        self,
        from_lat: float,
        from_lon: float,
        to_lat: float,
        to_lon: float,
    ) -> TravelEstimate:
        route = await self._get_osrm_route(
            profile=self.DRIVING_PROFILE,
            from_lat=from_lat,
            from_lon=from_lon,
            to_lat=to_lat,
            to_lon=to_lon,
        )

        return TravelEstimate(
            transport_mode="car",
            travel_time_min=round(route.duration_sec / 60, 2),
            distance_m=round(route.distance_m, 2),
        )

    async def _get_public_transport_estimate(
        self,
        route_start_lat: float,
        route_start_lon: float,
    ) -> TravelEstimate:
        nearest_stop = await self._find_nearest_bus_stop(
            lat=route_start_lat,
            lon=route_start_lon,
        )

        try:
            walking_route = await self._get_osrm_route(
                profile=self.WALKING_PROFILE,
                from_lat=nearest_stop.lat,
                from_lon=nearest_stop.lon,
                to_lat=route_start_lat,
                to_lon=route_start_lon,
            )
            walking_distance_m = walking_route.distance_m
            walking_time_min = walking_route.duration_sec / 60

        except OsrmApiError:
            walking_distance_m = self._haversine_distance_m(
                nearest_stop.lat,
                nearest_stop.lon,
                route_start_lat,
                route_start_lon,
            )
            walking_time_min = walking_distance_m / self.WALKING_SPEED_M_PER_MIN

        return TravelEstimate(
            transport_mode="public_transport",
            travel_time_min=round(walking_time_min, 2),
            distance_m=round(walking_distance_m, 2),
            nearest_bus_stop=nearest_stop,
        )

    async def _get_osrm_route(
        self,
        profile: str,
        from_lat: float,
        from_lon: float,
        to_lat: float,
        to_lon: float,
    ) -> RouteResult:
        url = (
            f"{self._osrm_base_url}/route/v1/{profile}/"
            f"{from_lon},{from_lat};{to_lon},{to_lat}"
        )

        params = {
            "overview": "false",
            "alternatives": "false",
            "steps": "false",
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout_seconds) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data: dict[str, Any] = response.json()

        except httpx.HTTPStatusError as exc:
            raise OsrmApiError("OSRM returned an HTTP error.") from exc

        except httpx.HTTPError as exc:
            raise OsrmApiError("OSRM request failed.") from exc

        except ValueError as exc:
            raise OsrmApiError("OSRM returned invalid JSON.") from exc

        routes = data.get("routes", [])

        if not routes:
            raise OsrmApiError("OSRM response contains no routes.")

        route = routes[0]
        distance = route.get("distance")
        duration = route.get("duration")

        if not isinstance(distance, int | float):
            raise OsrmApiError("OSRM route is missing distance.")

        if not isinstance(duration, int | float):
            raise OsrmApiError("OSRM route is missing duration.")

        return RouteResult(
            distance_m=float(distance),
            duration_sec=float(duration),
        )

    async def _find_nearest_bus_stop(self, lat: float, lon: float) -> BusStop:
        query = self._build_bus_stop_query(lat=lat, lon=lon)

        try:
            async with httpx.AsyncClient(timeout=self._timeout_seconds) as client:
                response = await client.post(
                    self._overpass_base_url,
                    content=f"data={query}".encode(),
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
                response.raise_for_status()
                data: dict[str, Any] = response.json()

        except httpx.HTTPStatusError as exc:
            raise OverpassApiError("Overpass returned an HTTP error.") from exc

        except httpx.HTTPError as exc:
            raise OverpassApiError("Overpass request failed.") from exc

        except ValueError as exc:
            raise OverpassApiError("Overpass returned invalid JSON.") from exc

        elements = data.get("elements", [])

        bus_stops = [
            self._to_bus_stop(element=element, target_lat=lat, target_lon=lon)
            for element in elements
            if self._is_bus_stop_node(element)
        ]

        if not bus_stops:
            raise NoBusStopFoundError("No bus stop found near route start.")

        return min(bus_stops, key=lambda stop: stop.straight_line_distance_m)

    def _build_bus_stop_query(self, lat: float, lon: float) -> str:
        radius = self._bus_stop_search_radius_m

        return f"""
[out:json][timeout:10];
(
  node["highway"="bus_stop"](around:{radius},{lat},{lon});
  node["public_transport"="platform"]["bus"="yes"](around:{radius},{lat},{lon});
  node["public_transport"="stop_position"]["bus"="yes"](around:{radius},{lat},{lon});
);
out body;
"""

    def _to_bus_stop(
        self,
        element: dict[str, Any],
        target_lat: float,
        target_lon: float,
    ) -> BusStop:
        stop_lat = float(element["lat"])
        stop_lon = float(element["lon"])
        tags = element.get("tags", {})

        name = tags.get("name") or tags.get("ref") or "Unnamed bus stop"

        return BusStop(
            id=int(element["id"]),
            name=name,
            lat=stop_lat,
            lon=stop_lon,
            straight_line_distance_m=round(
                self._haversine_distance_m(
                    stop_lat,
                    stop_lon,
                    target_lat,
                    target_lon,
                ),
                2,
            ),
        )

    @staticmethod
    def _is_bus_stop_node(element: dict[str, Any]) -> bool:
        return (
            element.get("type") == "node"
            and isinstance(element.get("lat"), int | float)
            and isinstance(element.get("lon"), int | float)
        )

    @staticmethod
    def _haversine_distance_m(
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float,
    ) -> float:
        earth_radius_m = 6_371_000

        d_lat = radians(lat2 - lat1)
        d_lon = radians(lon2 - lon1)

        r_lat1 = radians(lat1)
        r_lat2 = radians(lat2)

        a = (
            sin(d_lat / 2) ** 2
            + cos(r_lat1) * cos(r_lat2) * sin(d_lon / 2) ** 2
        )

        c = 2 * asin(sqrt(a))

        return earth_radius_m * c