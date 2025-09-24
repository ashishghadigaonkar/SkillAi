from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
import sys

# Add the backend directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import database functions
from database import connect_to_mongo, close_mongo_connection

# Import route modules
from routes import auth, assessments, roadmaps, courses, profile

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(
    title="SkillPath AI API",
    description="AI-Powered Learning Platform API for Smart India Hackathon 2025",
    version="1.0.0"
)

# Create a router with the /api prefix for existing endpoints
api_router = APIRouter(prefix="/api")

# Basic health check endpoint
@api_router.get("/")
async def root():
    return {"message": "SkillPath AI API is running!", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is operational"}

# Include all route modules
app.include_router(auth.router)
app.include_router(assessments.router)
app.include_router(roadmaps.router)
app.include_router(courses.router)
app.include_router(profile.router)

# Include the basic API router
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database event handlers
@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on startup"""
    await connect_to_mongo()
    logger.info("Connected to MongoDB and API is ready!")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown"""
    await close_mongo_connection()
    logger.info("Disconnected from MongoDB")

# Add some sample endpoints for compatibility
from datetime import datetime
from models import User
import uuid

@api_router.post("/status")
async def create_status_check(input: dict):
    """Legacy status endpoint for compatibility"""
    return {
        "id": str(uuid.uuid4()),
        "client_name": input.get("client_name", "Unknown"),
        "timestamp": datetime.utcnow()
    }

@api_router.get("/status")
async def get_status_checks():
    """Legacy status endpoint for compatibility"""
    return []