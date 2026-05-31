from typing import Any
from unittest.mock import AsyncMock

import httpx
import pytest

from app.tracking.exceptions import WeatherApiError, WeatherConfigurationError
from app.tracking.weather_client import WeatherClient


class FakeWeatherRepository:
    def __init__(self, cached_forecast: dict[str, Any] | None = None) -> None:
        self.cached_forecast = cached_forecast
        self.saved_cache_id = None
        self.saved_forecast = None
        self.saved_ttl_minutes = None

    async def get_valid_forecast(self, cache_id):
        return self.cached_forecast

    async def save_forecast(self, cache_id, forecast_json, ttl_minutes=60):
        self.saved_cache_id = cache_id
        self.saved_forecast = forecast_json
        self.saved_ttl_minutes = ttl_minutes


class MockResponse:
    def __init__(self, data: dict[str, Any], status_code: int = 200) -> None:
        self._data = data
        self.status_code = status_code

    def json(self) -> dict[str, Any]:
        return self._data

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            request = httpx.Request(
                "GET",
                "https://api.openweathermap.org/data/2.5/forecast",
            )
            response = httpx.Response(self.status_code, request=request)

            raise httpx.HTTPStatusError(
                "HTTP error",
                request=request,
                response=response,
            )


@pytest.mark.asyncio
async def test_get_forecast_returns_cached_result_without_api_call(mocker):
    cached_forecast = {
        "list": [
            {
                "main": {"temp": 12, "feels_like": 10},
                "weather": [{"description": "ясно"}],
                "wind": {"speed": 2.5},
                "pop": 0.1,
                "dt_txt": "2026-06-01 12:00:00",
            }
        ]
    }

    repository = FakeWeatherRepository(cached_forecast=cached_forecast)

    http_get_mock = mocker.patch(
        "app.tracking.weather_client.httpx.AsyncClient.get",
        new_callable=AsyncMock,
    )

    client = WeatherClient(repository=repository, api_key="test-api-key")

    result = await client.get_forecast(42.6977, 23.3219)

    assert result == cached_forecast
    http_get_mock.assert_not_called()


@pytest.mark.asyncio
async def test_get_forecast_calls_openweather_on_cache_miss(mocker):
    api_forecast = {
        "list": [
            {
                "main": {"temp": 15, "feels_like": 13},
                "weather": [{"description": "облачно"}],
                "wind": {"speed": 3.2},
                "pop": 0.2,
                "dt_txt": "2026-06-01 15:00:00",
            }
        ]
    }

    repository = FakeWeatherRepository(cached_forecast=None)

    http_get_mock = mocker.patch(
        "app.tracking.weather_client.httpx.AsyncClient.get",
        new_callable=AsyncMock,
    )

    http_get_mock.return_value = MockResponse(api_forecast)

    client = WeatherClient(repository=repository, api_key="test-api-key")

    result = await client.get_forecast(42.6977, 23.3219)

    assert result == api_forecast
    assert repository.saved_forecast == api_forecast
    assert repository.saved_ttl_minutes == 60

    http_get_mock.assert_awaited_once()

    params = http_get_mock.call_args.kwargs["params"]

    assert params["lat"] == 42.6977
    assert params["lon"] == 23.3219
    assert params["appid"] == "test-api-key"
    assert params["units"] == "metric"
    assert params["lang"] == "bg"
    assert params["cnt"] == 3


@pytest.mark.asyncio
async def test_get_forecast_raises_when_api_key_missing():
    repository = FakeWeatherRepository(cached_forecast=None)
    client = WeatherClient(repository=repository, api_key="")

    with pytest.raises(WeatherConfigurationError):
        await client.get_forecast(42.6977, 23.3219)


@pytest.mark.asyncio
async def test_get_forecast_raises_on_openweather_http_error(mocker):
    repository = FakeWeatherRepository(cached_forecast=None)

    http_get_mock = mocker.patch(
        "app.tracking.weather_client.httpx.AsyncClient.get",
        new_callable=AsyncMock,
    )

    http_get_mock.return_value = MockResponse(
        {"message": "Invalid API key"},
        status_code=401,
    )

    client = WeatherClient(repository=repository, api_key="wrong-key")

    with pytest.raises(WeatherApiError):
        await client.get_forecast(42.6977, 23.3219)