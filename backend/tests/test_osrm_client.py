from typing import Any
from unittest.mock import AsyncMock

import httpx
import pytest

from app.tracking.osrm_client import OsrmClient
from app.tracking.transport_exceptions import (
    InvalidTransportModeError,
    NoBusStopFoundError,
    OsrmApiError,
)


class MockResponse:
    def __init__(self, data: dict[str, Any], status_code: int = 200) -> None:
        self._data = data
        self.status_code = status_code

    def json(self) -> dict[str, Any]:
        return self._data

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            request = httpx.Request("GET", "https://example.test")
            response = httpx.Response(self.status_code, request=request)

            raise httpx.HTTPStatusError(
                "HTTP error",
                request=request,
                response=response,
            )


@pytest.mark.asyncio
async def test_get_travel_time_min_for_car_calls_osrm(mocker):
    osrm_response = {
        "routes": [
            {
                "duration": 1800,
                "distance": 15000,
            }
        ]
    }

    http_get_mock = mocker.patch(
        "app.tracking.osrm_client.httpx.AsyncClient.get",
        new_callable=AsyncMock,
    )
    http_get_mock.return_value = MockResponse(osrm_response)

    client = OsrmClient(
        osrm_base_url="https://osrm.test",
        overpass_base_url="https://overpass.test",
    )

    result = await client.get_travel_time_min(
        from_lat=42.6977,
        from_lon=23.3219,
        to_lat=42.562,
        to_lon=23.278,
        transport_mode="car",
    )

    assert result == 30.0

    called_url = http_get_mock.call_args.args[0]

    assert "/route/v1/driving/" in called_url
    assert "23.3219,42.6977;23.278,42.562" in called_url


@pytest.mark.asyncio
async def test_get_public_transport_estimate_uses_bus_stop_and_walking_route(
    mocker,
):
    overpass_response = {
        "elements": [
            {
                "type": "node",
                "id": 123,
                "lat": 42.560,
                "lon": 23.275,
                "tags": {
                    "highway": "bus_stop",
                    "name": "Test Bus Stop",
                },
            }
        ]
    }

    osrm_walking_response = {
        "routes": [
            {
                "duration": 600,
                "distance": 800,
            }
        ]
    }

    http_post_mock = mocker.patch(
        "app.tracking.osrm_client.httpx.AsyncClient.post",
        new_callable=AsyncMock,
    )
    http_post_mock.return_value = MockResponse(overpass_response)

    http_get_mock = mocker.patch(
        "app.tracking.osrm_client.httpx.AsyncClient.get",
        new_callable=AsyncMock,
    )
    http_get_mock.return_value = MockResponse(osrm_walking_response)

    client = OsrmClient(
        osrm_base_url="https://osrm.test",
        overpass_base_url="https://overpass.test",
    )

    result = await client.get_travel_estimate(
        from_lat=42.6977,
        from_lon=23.3219,
        to_lat=42.562,
        to_lon=23.278,
        transport_mode="public_transport",
    )

    assert result.transport_mode == "public_transport"
    assert result.travel_time_min == 10.0
    assert result.distance_m == 800
    assert result.nearest_bus_stop is not None
    assert result.nearest_bus_stop.name == "Test Bus Stop"
    assert http_post_mock.await_count == 1
    assert http_get_mock.await_count == 1

    overpass_call_url = http_post_mock.call_args.args[0]
    osrm_call_url = http_get_mock.call_args.args[0]

    assert overpass_call_url == "https://overpass.test"
    assert "/route/v1/foot/" in osrm_call_url


@pytest.mark.asyncio
async def test_public_transport_falls_back_to_haversine_when_walking_route_fails(
    mocker,
):
    overpass_response = {
        "elements": [
            {
                "type": "node",
                "id": 123,
                "lat": 42.560,
                "lon": 23.275,
                "tags": {
                    "highway": "bus_stop",
                    "name": "Test Bus Stop",
                },
            }
        ]
    }

    http_post_mock = mocker.patch(
        "app.tracking.osrm_client.httpx.AsyncClient.post",
        new_callable=AsyncMock,
    )
    http_post_mock.return_value = MockResponse(overpass_response)

    http_get_mock = mocker.patch(
        "app.tracking.osrm_client.httpx.AsyncClient.get",
        new_callable=AsyncMock,
    )
    http_get_mock.return_value = MockResponse({"message": "profile not found"}, status_code=400)

    client = OsrmClient(
        osrm_base_url="https://osrm.test",
        overpass_base_url="https://overpass.test",
    )

    result = await client.get_travel_estimate(
        from_lat=42.6977,
        from_lon=23.3219,
        to_lat=42.562,
        to_lon=23.278,
        transport_mode="public_transport",
    )

    assert result.travel_time_min > 0
    assert result.distance_m > 0
    assert result.nearest_bus_stop is not None


@pytest.mark.asyncio
async def test_public_transport_raises_when_no_bus_stop_found(mocker):
    http_post_mock = mocker.patch(
        "app.tracking.osrm_client.httpx.AsyncClient.post",
        new_callable=AsyncMock,
    )
    http_post_mock.return_value = MockResponse({"elements": []})

    client = OsrmClient(
        osrm_base_url="https://osrm.test",
        overpass_base_url="https://overpass.test",
    )

    with pytest.raises(NoBusStopFoundError):
        await client.get_travel_estimate(
            from_lat=42.6977,
            from_lon=23.3219,
            to_lat=42.562,
            to_lon=23.278,
            transport_mode="public_transport",
        )


@pytest.mark.asyncio
async def test_car_route_raises_on_osrm_http_error(mocker):
    http_get_mock = mocker.patch(
        "app.tracking.osrm_client.httpx.AsyncClient.get",
        new_callable=AsyncMock,
    )
    http_get_mock.return_value = MockResponse(
        {"message": "OSRM failed"},
        status_code=500,
    )

    client = OsrmClient(
        osrm_base_url="https://osrm.test",
        overpass_base_url="https://overpass.test",
    )

    with pytest.raises(OsrmApiError):
        await client.get_travel_time_min(
            from_lat=42.6977,
            from_lon=23.3219,
            to_lat=42.562,
            to_lon=23.278,
            transport_mode="car",
        )


@pytest.mark.asyncio
async def test_invalid_transport_mode_raises_error():
    client = OsrmClient(
        osrm_base_url="https://osrm.test",
        overpass_base_url="https://overpass.test",
    )

    with pytest.raises(InvalidTransportModeError):
        await client.get_travel_time_min(
            from_lat=42.6977,
            from_lon=23.3219,
            to_lat=42.562,
            to_lon=23.278,
            transport_mode="bike",
        )