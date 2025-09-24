from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import User, ProfileSettings
from database import get_database
from dependencies import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/settings", response_model=ProfileSettings)
async def get_profile_settings(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get user profile settings"""
    
    settings_doc = await db.profile_settings.find_one({"user_id": current_user.id})
    
    if not settings_doc:
        # Create default settings
        settings = ProfileSettings(user_id=current_user.id)
        await db.profile_settings.insert_one(settings.dict())
        return settings
    
    return ProfileSettings(**settings_doc)

@router.put("/settings", response_model=ProfileSettings)
async def update_profile_settings(
    settings_data: dict,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update user profile settings"""
    
    # Filter allowed fields
    allowed_fields = [
        "notifications_enabled", "email_notifications", "sms_notifications",
        "weekly_progress_email", "achievement_notifications", "learning_reminders",
        "preferred_study_time", "daily_goal_minutes", "privacy_profile"
    ]
    
    update_data = {k: v for k, v in settings_data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update or create settings
    result = await db.profile_settings.update_one(
        {"user_id": current_user.id},
        {"$set": update_data},
        upsert=True
    )
    
    # Fetch updated settings
    settings_doc = await db.profile_settings.find_one({"user_id": current_user.id})
    return ProfileSettings(**settings_doc)

@router.get("/stats")
async def get_profile_stats(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get user profile statistics"""
    
    # Get course enrollments
    total_courses = await db.user_courses.count_documents({
        "user_id": current_user.id,
        "is_active": True
    })
    
    completed_courses = await db.user_courses.count_documents({
        "user_id": current_user.id,
        "progress": {"$gte": 100},
        "is_active": True
    })
    
    # Get assessment results
    total_assessments = await db.assessment_results.count_documents({
        "user_id": current_user.id
    })
    
    # Get average assessment score
    assessment_pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$percentage"}}}
    ]
    
    avg_score_result = await db.assessment_results.aggregate(assessment_pipeline).to_list(1)
    avg_score = avg_score_result[0]["avg_score"] if avg_score_result else 0
    
    # Get roadmaps count
    total_roadmaps = await db.roadmaps.count_documents({
        "user_id": current_user.id,
        "is_active": True
    })
    
    # Calculate learning streak (simplified)
    streak_days = current_user.streak
    
    return {
        "total_courses": total_courses,
        "completed_courses": completed_courses,
        "completion_rate": (completed_courses / total_courses * 100) if total_courses > 0 else 0,
        "total_assessments": total_assessments,
        "average_score": round(avg_score, 1),
        "total_roadmaps": total_roadmaps,
        "learning_streak": streak_days,
        "credits_earned": current_user.completed_credits,
        "current_level": current_user.current_level
    }

@router.get("/achievements")
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get user achievements and badges"""
    
    achievements = []
    
    # Course completion achievements
    completed_courses = await db.user_courses.count_documents({
        "user_id": current_user.id,
        "progress": {"$gte": 100}
    })
    
    if completed_courses >= 1:
        achievements.append({
            "title": "First Course Complete",
            "description": "Completed your first course",
            "type": "milestone",
            "icon": "🎓",
            "date": "Recently"
        })
    
    if completed_courses >= 5:
        achievements.append({
            "title": "Learning Enthusiast", 
            "description": "Completed 5 courses",
            "type": "badge",
            "icon": "🌟",
            "date": "Recently"
        })
    
    # Assessment achievements
    assessment_count = await db.assessment_results.count_documents({
        "user_id": current_user.id,
        "percentage": {"$gte": 80}
    })
    
    if assessment_count >= 3:
        achievements.append({
            "title": "High Performer",
            "description": "Scored 80%+ in 3 assessments",
            "type": "badge", 
            "icon": "🏆",
            "date": "Recently"
        })
    
    # Streak achievements
    if current_user.streak >= 7:
        achievements.append({
            "title": "Week Warrior",
            "description": f"{current_user.streak} day learning streak",
            "type": "milestone",
            "icon": "🔥",
            "date": "Recently"
        })
    
    # Credits achievement
    if current_user.completed_credits >= 50:
        achievements.append({
            "title": "Credit Collector",
            "description": f"Earned {current_user.completed_credits} credits",
            "type": "badge",
            "icon": "💎",
            "date": "Recently"
        })
    
    return achievements

@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Deactivate user account"""
    
    # Soft delete - deactivate instead of hard delete
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Account deactivated successfully"}

@router.post("/export-data")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Export user data (GDPR compliance)"""
    
    # Get all user data
    user_data = {
        "profile": current_user.dict(),
        "courses": [],
        "assessments": [],
        "roadmaps": [],
        "settings": {}
    }
    
    # Get courses
    user_courses = await db.user_courses.find({
        "user_id": current_user.id
    }).to_list(100)
    user_data["courses"] = user_courses
    
    # Get assessment results
    assessments = await db.assessment_results.find({
        "user_id": current_user.id
    }).to_list(100)
    user_data["assessments"] = assessments
    
    # Get roadmaps
    roadmaps = await db.roadmaps.find({
        "user_id": current_user.id
    }).to_list(100)
    user_data["roadmaps"] = roadmaps
    
    # Get settings
    settings = await db.profile_settings.find_one({"user_id": current_user.id})
    if settings:
        user_data["settings"] = settings
    
    return user_data