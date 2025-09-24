from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'skillpath_ai')

client: Optional[AsyncIOMotorClient] = None
database = None

async def connect_to_mongo():
    """Create database connection"""
    global client, database
    client = AsyncIOMotorClient(mongo_url)
    database = client[db_name]
    
    # Create indexes for better performance
    await database.users.create_index("email", unique=True)
    await database.users.create_index("phone", unique=True, sparse=True)
    await database.assessments.create_index("created_by")
    await database.assessment_results.create_index("user_id")
    await database.roadmaps.create_index("user_id")
    await database.user_courses.create_index("user_id")
    
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return database