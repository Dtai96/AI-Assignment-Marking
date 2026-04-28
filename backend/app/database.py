from prisma import Prisma
from app.config import DATABASE_URL

# Global Prisma client instance
db = Prisma()


async def connect_db():
    """Connect to the database"""
    if not db.is_connected():
        await db.connect()
        print("Connected to MySQL database")


async def disconnect_db():
    """Disconnect from the database"""
    if db.is_connected():
        await db.disconnect()
        print("Disconnected from MySQL database")


def get_db() -> Prisma:
    """Get database instance (for dependency injection)"""
    return db
