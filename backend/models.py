from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class UserRole(str, Enum):
    LEARNER = "learner"
    TRAINER = "trainer"
    POLICYMAKER = "policymaker"

class AssessmentType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SKILL_BASED = "skill_based"
    AI_GENERATED = "ai_generated"

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password_hash: str
    role: UserRole = UserRole.LEARNER
    language: str = "english"
    state: Optional[str] = None
    target_role: Optional[str] = None
    current_level: str = "NSQF Level 1"
    completed_credits: int = 0
    total_credits: int = 100
    streak: int = 0
    profile_picture: Optional[str] = None
    learning_goals: List[str] = []
    skills: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.LEARNER
    language: str = "english"
    state: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    language: str
    state: Optional[str] = None
    target_role: Optional[str] = None
    current_level: str
    completed_credits: int
    total_credits: int
    streak: int
    profile_picture: Optional[str] = None
    learning_goals: List[str]
    skills: List[str]
    created_at: datetime
    last_login: Optional[datetime] = None

# Assessment Models
class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    points: int = 1

class Assessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    type: AssessmentType
    difficulty: DifficultyLevel
    subject: str
    questions: List[Question]
    total_points: int
    duration_minutes: int
    created_by: str  # user_id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class AssessmentCreate(BaseModel):
    title: str
    description: str
    type: AssessmentType
    difficulty: DifficultyLevel
    subject: str
    duration_minutes: int = 30

class AssessmentResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    assessment_id: str
    answers: Dict[str, str]  # question_id -> answer
    score: int
    total_points: int
    percentage: float
    time_taken_minutes: int
    completed_at: datetime = Field(default_factory=datetime.utcnow)

# Roadmap Models
class RoadmapItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    type: str  # course, certification, project, etc.
    duration: str
    difficulty: DifficultyLevel
    prerequisites: List[str] = []
    skills_gained: List[str] = []
    is_completed: bool = False
    order: int = 0

class Roadmap(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    target_role: str
    current_level: str
    target_level: str
    items: List[RoadmapItem]
    estimated_duration: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class RoadmapCreate(BaseModel):
    title: str
    target_role: str
    current_level: str
    target_level: str
    user_preferences: Optional[Dict[str, Any]] = {}

# Course Models
class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    provider: str
    level: str
    duration: str
    skills: List[str]
    prerequisites: List[str] = []
    rating: float = 0.0
    enrollments: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCourse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    progress: int = 0  # percentage
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    next_deadline: Optional[str] = None
    is_active: bool = True

# Profile Settings Models
class ProfileSettings(BaseModel):
    user_id: str
    notifications_enabled: bool = True
    email_notifications: bool = True
    sms_notifications: bool = False
    weekly_progress_email: bool = True
    achievement_notifications: bool = True
    learning_reminders: bool = True
    preferred_study_time: Optional[str] = None
    daily_goal_minutes: int = 60
    privacy_profile: str = "public"  # public, private, friends_only
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse