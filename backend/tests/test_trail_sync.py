from app.trail_sync.overpass_client import OverpassClient


def test_overpass_client_exists():
    client = OverpassClient()

    assert client is not None