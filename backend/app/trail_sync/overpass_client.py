import httpx


class OverpassClient:
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"

    async def fetch_trail_points(self) -> list[dict]:
        query = """
        [out:json][timeout:25];
        (
          node["natural"="peak"](41.2,22.3,44.3,28.8);
          node["tourism"="alpine_hut"](41.2,22.3,44.3,28.8);
          node["natural"="water"](41.2,22.3,44.3,28.8);
        );
        out body;
        """

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                self.OVERPASS_URL,
                data=query,
            )

            response.raise_for_status()

            payload = response.json()

        return payload.get("elements", [])