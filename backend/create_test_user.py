"""
Script to create a test user in the database
Run with: python3 create_test_user.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from utils.auth import hash_password
from datetime import datetime
from config import settings

async def create_test_user():
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    
    # Get database name from URI
    db_name = settings.MONGODB_URI.split('/')[-1].split('?')[0] or "tadaa"
    db = client[db_name]
    users_collection = db["users"]
    
    # Test user credentials
    test_user = {
        "name": "Test User",
        "email": "test@example.com",
        "hashed_password": hash_password("Test123!"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": test_user["email"]})
    
    if existing_user:
        print(f"✓ Test user already exists: {test_user['email']}")
    else:
        # Insert test user
        result = await users_collection.insert_one(test_user)
        print(f"✓ Test user created successfully!")
        print(f"  ID: {result.inserted_id}")
    
    print(f"\n🔑 Test Credentials:")
    print(f"  Email: {test_user['email']}")
    print(f"  Password: Test123!")
    print(f"  Name: {test_user['name']}")
    print(f"\n🌐 Login at: http://localhost:5173/login")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_user())