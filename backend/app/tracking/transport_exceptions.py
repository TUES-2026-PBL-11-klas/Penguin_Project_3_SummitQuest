class TransportClientError(Exception):
    """Base exception for transport client errors."""


class OsrmApiError(TransportClientError):
    """Raised when OSRM request fails or returns invalid data."""


class OverpassApiError(TransportClientError):
    """Raised when Overpass request fails or returns invalid data."""


class NoBusStopFoundError(TransportClientError):
    """Raised when no bus stop is found near the route start."""


class InvalidTransportModeError(TransportClientError):
    """Raised when unsupported transport mode is provided."""