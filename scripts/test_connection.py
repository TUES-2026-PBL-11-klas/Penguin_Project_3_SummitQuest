from sqlalchemy import text

from app.database.session import AsyncSessionLocal


async def test_db():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("SELECT 1")
        )

        print(result.scalar())