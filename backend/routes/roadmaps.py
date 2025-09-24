from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
import random
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    Roadmap, RoadmapCreate, RoadmapItem, 
    DifficultyLevel, User
)
from database import get_database
from dependencies import get_current_user

router = APIRouter(prefix="/api/roadmaps", tags=["roadmaps"])

# Sample roadmap data for AI generation
ROADMAP_TEMPLATES = {
    "ai/ml engineer": {
        "NSQF Level 4": [
            {
                "title": "Python Programming Fundamentals",
                "description": "Master Python basics including syntax, data structures, and control flow",
                "type": "course",
                "duration": "6 weeks",
                "difficulty": "beginner",
                "skills_gained": ["Python", "Programming Logic", "Data Structures"],
                "order": 1
            },
            {
                "title": "Mathematics for AI",
                "description": "Learn linear algebra, statistics, and calculus for machine learning",
                "type": "course",
                "duration": "8 weeks",
                "difficulty": "intermediate",
                "prerequisites": ["Python Programming Fundamentals"],
                "skills_gained": ["Linear Algebra", "Statistics", "Calculus"],
                "order": 2
            },
            {
                "title": "Data Analysis with Pandas",
                "description": "Hands-on data manipulation and analysis using Pandas library",
                "type": "course",
                "duration": "4 weeks",
                "difficulty": "intermediate",
                "prerequisites": ["Python Programming Fundamentals"],
                "skills_gained": ["Pandas", "Data Analysis", "Data Cleaning"],
                "order": 3
            }
        ],
        "NSQF Level 5": [
            {
                "title": "Machine Learning Fundamentals",
                "description": "Introduction to ML algorithms and model training",
                "type": "course",
                "duration": "10 weeks",
                "difficulty": "intermediate",
                "prerequisites": ["Mathematics for AI", "Data Analysis with Pandas"],
                "skills_gained": ["Machine Learning", "Scikit-learn", "Model Training"],
                "order": 4
            },
            {
                "title": "Deep Learning with TensorFlow",
                "description": "Build neural networks and deep learning models",
                "type": "course",
                "duration": "12 weeks",
                "difficulty": "advanced",
                "prerequisites": ["Machine Learning Fundamentals"],
                "skills_gained": ["Deep Learning", "TensorFlow", "Neural Networks"],
                "order": 5
            }
        ]
    },
    "data scientist": {
        "NSQF Level 4": [
            {
                "title": "Statistics and Probability",
                "description": "Foundation in statistical analysis and probability theory",
                "type": "course",
                "duration": "6 weeks",
                "difficulty": "beginner",
                "skills_gained": ["Statistics", "Probability", "Descriptive Analysis"],
                "order": 1
            },
            {
                "title": "SQL for Data Analysis",
                "description": "Master database queries and data extraction",
                "type": "course",
                "duration": "4 weeks",
                "difficulty": "beginner",
                "skills_gained": ["SQL", "Database Queries", "Data Extraction"],
                "order": 2
            }
        ]
    }
}

@router.post("/generate", response_model=Roadmap)
async def generate_roadmap(
    roadmap_data: RoadmapCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Generate AI-powered learning roadmap"""
    
    # Generate roadmap items based on target role and level
    items = generate_roadmap_items(
        roadmap_data.target_role,
        roadmap_data.current_level,
        roadmap_data.target_level,
        roadmap_data.user_preferences
    )
    
    # Calculate estimated duration
    total_weeks = sum(
        int(item.duration.split()[0]) 
        for item in items 
        if item.duration and item.duration.split()[0].isdigit()
    )
    estimated_duration = f"{total_weeks} weeks"
    
    roadmap = Roadmap(
        user_id=current_user.id,
        title=roadmap_data.title,
        description=f"Personalized learning path to become a {roadmap_data.target_role}",
        target_role=roadmap_data.target_role,
        current_level=roadmap_data.current_level,
        target_level=roadmap_data.target_level,
        items=items,
        estimated_duration=estimated_duration
    )
    
    await db.roadmaps.insert_one(roadmap.dict())
    return roadmap

@router.post("/save", response_model=Roadmap)
async def save_roadmap_to_profile(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Save a generated roadmap to user's profile"""
    
    # Find the roadmap
    roadmap_doc = await db.roadmaps.find_one({
        "id": roadmap_id,
        "is_active": True
    })
    
    if not roadmap_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found"
        )
    
    roadmap = Roadmap(**roadmap_doc)
    
    # Check if user already has this roadmap saved
    existing = await db.roadmaps.find_one({
        "user_id": current_user.id,
        "id": roadmap_id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Roadmap already saved to your profile"
        )
    
    # If roadmap belongs to another user, create a copy
    if roadmap.user_id != current_user.id:
        roadmap.user_id = current_user.id
        roadmap.id = None  # Generate new ID
        await db.roadmaps.insert_one(roadmap.dict())
    
    return roadmap

@router.get("/", response_model=List[Roadmap])
async def get_my_roadmaps(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all roadmaps for current user"""
    
    roadmaps_docs = await db.roadmaps.find({
        "user_id": current_user.id,
        "is_active": True
    }).sort("created_at", -1).to_list(100)
    
    return [Roadmap(**doc) for doc in roadmaps_docs]

@router.get("/{roadmap_id}", response_model=Roadmap)
async def get_roadmap(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get specific roadmap by ID"""
    
    roadmap_doc = await db.roadmaps.find_one({
        "id": roadmap_id,
        "user_id": current_user.id,
        "is_active": True
    })
    
    if not roadmap_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found"
        )
    
    return Roadmap(**roadmap_doc)

@router.put("/{roadmap_id}/items/{item_id}/complete")
async def mark_item_complete(
    roadmap_id: str,
    item_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Mark a roadmap item as completed"""
    
    result = await db.roadmaps.update_one(
        {
            "id": roadmap_id,
            "user_id": current_user.id,
            "items.id": item_id
        },
        {
            "$set": {
                "items.$.is_completed": True,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap or item not found"
        )
    
    # Update user credits
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"completed_credits": 5}}
    )
    
    return {"message": "Item marked as completed"}

@router.delete("/{roadmap_id}")
async def delete_roadmap(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a roadmap"""
    
    result = await db.roadmaps.update_one(
        {
            "id": roadmap_id,
            "user_id": current_user.id
        },
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found"
        )
    
    return {"message": "Roadmap deleted successfully"}

def generate_roadmap_items(
    target_role: str,
    current_level: str,
    target_level: str,
    user_preferences: dict
) -> List[RoadmapItem]:
    """Generate roadmap items based on target role and levels"""
    
    items = []
    role_key = target_role.lower()
    
    # Get template items for the role
    if role_key in ROADMAP_TEMPLATES:
        template_items = []
        
        # Add items from current level onwards
        if current_level in ROADMAP_TEMPLATES[role_key]:
            template_items.extend(ROADMAP_TEMPLATES[role_key][current_level])
        
        # Add items from target level if different
        if target_level != current_level and target_level in ROADMAP_TEMPLATES[role_key]:
            template_items.extend(ROADMAP_TEMPLATES[role_key][target_level])
        
        # Convert template items to RoadmapItem objects
        for item_data in template_items:
            item = RoadmapItem(
                title=item_data["title"],
                description=item_data["description"],
                type=item_data["type"],
                duration=item_data["duration"],
                difficulty=DifficultyLevel(item_data["difficulty"]),
                prerequisites=item_data.get("prerequisites", []),
                skills_gained=item_data["skills_gained"],
                order=item_data["order"]
            )
            items.append(item)
    
    # If no template found, generate generic items
    if not items:
        items = generate_generic_roadmap_items(target_role, current_level, target_level)
    
    return sorted(items, key=lambda x: x.order)

def generate_generic_roadmap_items(target_role: str, current_level: str, target_level: str) -> List[RoadmapItem]:
    """Generate generic roadmap items"""
    
    generic_items = [
        {
            "title": f"Foundation Skills for {target_role}",
            "description": f"Build fundamental skills required for {target_role}",
            "type": "course",
            "duration": "4 weeks",
            "difficulty": "beginner",
            "skills_gained": ["Foundation Skills", "Industry Knowledge"],
            "order": 1
        },
        {
            "title": f"Intermediate {target_role} Concepts",
            "description": f"Advance your knowledge in {target_role} domain",
            "type": "course",
            "duration": "6 weeks",
            "difficulty": "intermediate",
            "skills_gained": ["Advanced Concepts", "Practical Application"],
            "order": 2
        },
        {
            "title": f"Professional {target_role} Project",
            "description": f"Complete a real-world project in {target_role}",
            "type": "project",
            "duration": "8 weeks",
            "difficulty": "advanced",
            "skills_gained": ["Project Management", "Portfolio Building"],
            "order": 3
        }
    ]
    
    items = []
    for item_data in generic_items:
        item = RoadmapItem(
            title=item_data["title"],
            description=item_data["description"],
            type=item_data["type"],
            duration=item_data["duration"],
            difficulty=DifficultyLevel(item_data["difficulty"]),
            skills_gained=item_data["skills_gained"],
            order=item_data["order"]
        )
        items.append(item)
    
    return items