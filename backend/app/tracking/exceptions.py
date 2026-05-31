class WeatherClientError(Exception):
    """Base exception for weather client errors."""


class WeatherConfigurationError(WeatherClientError):
    """Raised when weather client configuration is missing or invalid."""


class WeatherApiError(WeatherClientError):
    """Raised when an OpenWeather API request fails."""