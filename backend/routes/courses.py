from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Course, UserCourse, User
from database import get_database
from dependencies import get_current_user

router = APIRouter(prefix="/api/courses", tags=["courses"])

# Sample course data
SAMPLE_COURSES = [
    {
        "title": "Python Programming Fundamentals",
        "description": "Learn Python from basics to advanced concepts with hands-on projects",
        "provider": "TechSkill India",
        "level": "NSQF Level 4",
        "duration": "6 weeks",
        "skills": ["Python", "Programming", "Problem Solving"],
        "prerequisites": [],
        "rating": 4.8,
        "enrollments": 15420
    },
    {
        "title": "Data Analysis with Excel",
        "description": "Master data analysis using Excel with real-world datasets",
        "provider": "Skill India Digital",
        "level": "NSQF Level 4",
        "duration": "4 weeks",
        "skills": ["Excel", "Data Analysis", "Visualization"],
        "prerequisites": [],
        "rating": 4.6,
        "enrollments": 12350
    },
    {
        "title": "Machine Learning Basics",
        "description": "Introduction to ML algorithms and applications",
        "provider": "AI Learning Hub",
        "level": "NSQF Level 5",
        "duration": "8 weeks",
        "skills": ["Machine Learning", "Python", "Data Science"],
        "prerequisites": ["Python Programming Fundamentals"],
        "rating": 4.9,
        "enrollments": 8920
    },
    {
        "title": "Web Development with React",
        "description": "Build modern web applications using React framework",
        "provider": "WebDev Academy",
        "level": "NSQF Level 5",
        "duration": "10 weeks",
        "skills": ["React", "JavaScript", "Web Development"],
        "prerequisites": ["JavaScript Fundamentals"],
        "rating": 4.7,
        "enrollments": 11200
    }
]

@router.get("/", response_model=List[Course])
async def get_courses(
    level: Optional[str] = None,
    skills: Optional[str] = None,
    db = Depends(get_database)
):
    """Get available courses with optional filtering"""
    
    # Try to get from database first
    query = {"is_active": True}
    if level:
        query["level"] = level
    
    courses_docs = await db.courses.find(query).to_list(100)
    
    # If no courses in database, populate with sample data
    if not courses_docs:
        for course_data in SAMPLE_COURSES:
            course = Course(**course_data)
            await db.courses.insert_one(course.dict())
            courses_docs.append(course.dict())
    
    courses = [Course(**doc) for doc in courses_docs]
    
    # Filter by skills if provided
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        courses = [
            course for course in courses
            if any(skill.lower() in [s.lower() for s in course.skills] for skill in skill_list)
        ]
    
    return courses

@router.post("/{course_id}/enroll")
async def enroll_in_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Enroll user in a course"""
    
    # Check if course exists
    course_doc = await db.courses.find_one({"id": course_id, "is_active": True})
    if not course_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if already enrolled
    existing_enrollment = await db.user_courses.find_one({
        "user_id": current_user.id,
        "course_id": course_id,
        "is_active": True
    })
    
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    # Create enrollment
    user_course = UserCourse(
        user_id=current_user.id,
        course_id=course_id,
        next_deadline="Assignment 1 - Due in 1 week"
    )
    
    await db.user_courses.insert_one(user_course.dict())
    
    # Update course enrollment count
    await db.courses.update_one(
        {"id": course_id},
        {"$inc": {"enrollments": 1}}
    )
    
    return {"message": "Successfully enrolled in course"}

@router.get("/my-courses", response_model=List[dict])
async def get_my_courses(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get courses enrolled by current user"""
    
    # Get user course enrollments
    user_courses_docs = await db.user_courses.find({
        "user_id": current_user.id,
        "is_active": True
    }).to_list(100)
    
    courses_with_progress = []
    
    for uc_doc in user_courses_docs:
        user_course = UserCourse(**uc_doc)
        
        # Get course details
        course_doc = await db.courses.find_one({"id": user_course.course_id})
        if course_doc:
            course = Course(**course_doc)
            
            course_with_progress = {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "provider": course.provider,
                "level": course.level,
                "duration": course.duration,
                "skills": course.skills,
                "progress": user_course.progress,
                "enrolled_at": user_course.enrolled_at,
                "completed_at": user_course.completed_at,
                "next_deadline": user_course.next_deadline
            }
            
            courses_with_progress.append(course_with_progress)
    
    return courses_with_progress

@router.put("/{course_id}/progress")
async def update_course_progress(
    course_id: str,
    progress_data: dict,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update course progress for user"""
    
    progress = progress_data.get("progress", 0)
    if progress < 0 or progress > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress must be between 0 and 100"
        )
    
    update_data = {"progress": progress}
    
    # If course is completed
    if progress >= 100:
        update_data["completed_at"] = datetime.utcnow()
        
        # Award credits to user
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"completed_credits": 10}}
        )
    
    result = await db.user_courses.update_one(
        {
            "user_id": current_user.id,
            "course_id": course_id,
            "is_active": True
        },
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course enrollment not found"
        )
    
    return {"message": "Progress updated successfully"}

@router.get("/recommendations")
async def get_course_recommendations(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get personalized course recommendations"""
    
    # Get user's skills and target role
    user_skills = [skill.lower() for skill in current_user.skills]
    target_role = current_user.target_role
    
    # Get all courses
    courses_docs = await db.courses.find({"is_active": True}).to_list(100)
    courses = [Course(**doc) for doc in courses_docs]
    
    # Get enrolled courses
    enrolled_courses = await db.user_courses.find({
        "user_id": current_user.id,
        "is_active": True
    }).to_list(100)
    enrolled_course_ids = [uc["course_id"] for uc in enrolled_courses]
    
    # Filter out already enrolled courses
    available_courses = [c for c in courses if c.id not in enrolled_course_ids]
    
    # Simple recommendation logic
    recommendations = []
    
    for course in available_courses:
        confidence = 50  # Base confidence
        reasons = []
        
        # Boost confidence if course skills match user skills
        matching_skills = [skill for skill in course.skills if skill.lower() in user_skills]
        if matching_skills:
            confidence += len(matching_skills) * 10
            reasons.append("Builds on your existing skills")
        
        # Boost if course aligns with target role
        if target_role and any(skill.lower() in target_role.lower() for skill in course.skills):
            confidence += 20
            reasons.append(f"Aligns with {target_role} career goal")
        
        # Boost based on course rating
        if course.rating >= 4.5:
            confidence += 10
            reasons.append("Highly rated course")
        
        # Boost based on popularity
        if course.enrollments > 10000:
            confidence += 5
            reasons.append("Popular choice")
        
        if not reasons:
            reasons = ["Relevant to your learning journey"]
        
        recommendation = {
            "course": course,
            "confidence": min(confidence, 95),  # Cap at 95%
            "reasons": reasons[:3]  # Limit to top 3 reasons
        }
        
        recommendations.append(recommendation)
    
    # Sort by confidence and return top 5
    recommendations.sort(key=lambda x: x["confidence"], reverse=True)
    
    return recommendations[:5]