"""
MongoDB Atlas connection management using Motor (async driver)
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

# Global MongoDB client and database instances
mongodb_client: Optional[AsyncIOMotorClient] = None
mongodb_database = None


async def connect_to_mongo() -> None:
    """
    Connect to MongoDB Atlas
    """
    global mongodb_client, mongodb_database
    
    try:
        logger.info("Connecting to MongoDB Atlas...")
        mongodb_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        
        # Test the connection
        await mongodb_client.admin.command('ping')
        
        # Get database name from URI or use default
        db_name = settings.MONGODB_URI.split('/')[-1].split('?')[0] or "tadaa"
        mongodb_database = mongodb_client[db_name]
        
        logger.info(f"Connected to MongoDB Atlas - Database: {db_name}")
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB Atlas: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection() -> None:
    """
    Close MongoDB connection
    """
    global mongodb_client
    
    if mongodb_client:
        logger.info("Closing MongoDB connection...")
        mongodb_client.close()
        logger.info("MongoDB connection closed")


async def ping_database() -> bool:
    """
    Ping MongoDB to check connection status
    
    Returns:
        bool: True if connection is alive, False otherwise
    """
    global mongodb_client
    
    if not mongodb_client:
        return False
    
    try:
        await mongodb_client.admin.command('ping')
        return True
    except Exception as e:
        logger.error(f"Database ping failed: {e}")
        return False


def get_database():
    """
    Get the MongoDB database instance
    
    Returns:
        AsyncIOMotorDatabase: The database instance
    """
    if mongodb_database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return mongodb_database


async def init_db_indexes():
    """
    Initialize database indexes for collections
    """
    db = get_database()
    
    # Create unique index on email field for users collection
    await db.users.create_index("email", unique=True)
    logger.info("Database indexes created successfully")


def get_users_collection():
    """
    Get the users collection
    
    Returns:
        AsyncIOMotorCollection: The users collection
    """
    db = get_database()
    return db.users