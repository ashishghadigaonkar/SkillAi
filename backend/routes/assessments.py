from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
import random
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    Assessment, AssessmentCreate, AssessmentResult, 
    Question, AssessmentType, DifficultyLevel, User
)
from database import get_database
from dependencies import get_current_user

router = APIRouter(prefix="/api/assessments", tags=["assessments"])

# Sample assessment data for AI generation
SAMPLE_QUESTIONS = {
    "python": {
        "beginner": [
            {
                "question": "What is the correct way to create a list in Python?",
                "options": ["list = []", "list = ()", "list = {}", "list = <>"],
                "correct_answer": "list = []",
                "explanation": "Square brackets [] are used to create lists in Python."
            },
            {
                "question": "Which function is used to print output in Python?",
                "options": ["echo()", "print()", "output()", "display()"],
                "correct_answer": "print()",
                "explanation": "The print() function is used to display output in Python."
            }
        ],
        "intermediate": [
            {
                "question": "What is a decorator in Python?",
                "options": [
                    "A function that modifies another function",
                    "A way to create classes",
                    "A type of variable",
                    "A loop structure"
                ],
                "correct_answer": "A function that modifies another function",
                "explanation": "Decorators are functions that modify or extend the behavior of other functions."
            }
        ],
        "advanced": [
            {
                "question": "What is the Global Interpreter Lock (GIL) in Python?",
                "options": [
                    "A mechanism that prevents multiple native threads from executing Python bytecodes",
                    "A way to lock variables globally",
                    "A security feature",
                    "A debugging tool"
                ],
                "correct_answer": "A mechanism that prevents multiple native threads from executing Python bytecodes",
                "explanation": "The GIL is a mutex that protects access to Python objects."
            }
        ]
    },
    "javascript": {
        "beginner": [
            {
                "question": "How do you declare a variable in JavaScript?",
                "options": ["var x;", "variable x;", "v x;", "declare x;"],
                "correct_answer": "var x;",
                "explanation": "Variables in JavaScript are declared using var, let, or const keywords."
            }
        ]
    },
    "data-science": {
        "beginner": [
            {
                "question": "What is the purpose of exploratory data analysis (EDA)?",
                "options": [
                    "To clean the data",
                    "To understand the data's structure and patterns",
                    "To train machine learning models",
                    "To visualize results"
                ],
                "correct_answer": "To understand the data's structure and patterns",
                "explanation": "EDA helps understand data characteristics before analysis."
            }
        ]
    }
}

@router.post("/", response_model=Assessment)
async def create_assessment(
    assessment_data: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new assessment"""
    
    # Generate questions based on type
    questions = []
    
    if assessment_data.type == AssessmentType.AI_GENERATED:
        questions = generate_ai_questions(
            assessment_data.subject,
            assessment_data.difficulty,
            count=10
        )
    elif assessment_data.type == AssessmentType.MULTIPLE_CHOICE:
        questions = generate_multiple_choice_questions(
            assessment_data.subject,
            assessment_data.difficulty,
            count=15
        )
    elif assessment_data.type == AssessmentType.SKILL_BASED:
        questions = generate_skill_based_questions(
            assessment_data.subject,
            assessment_data.difficulty,
            count=8
        )
    
    total_points = sum(q.points for q in questions)
    
    assessment = Assessment(
        title=assessment_data.title,
        description=assessment_data.description,
        type=assessment_data.type,
        difficulty=assessment_data.difficulty,
        subject=assessment_data.subject,
        questions=questions,
        total_points=total_points,
        duration_minutes=assessment_data.duration_minutes,
        created_by=current_user.id
    )
    
    await db.assessments.insert_one(assessment.dict())
    return assessment

@router.get("/", response_model=List[Assessment])
async def get_assessments(
    subject: Optional[str] = None,
    difficulty: Optional[DifficultyLevel] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get assessments with optional filtering"""
    
    query = {"is_active": True}
    if subject:
        query["subject"] = subject
    if difficulty:
        query["difficulty"] = difficulty
    
    assessments_docs = await db.assessments.find(query).to_list(100)
    return [Assessment(**doc) for doc in assessments_docs]

@router.get("/my", response_model=List[Assessment])
async def get_my_assessments(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get assessments created by current user"""
    
    assessments_docs = await db.assessments.find({
        "created_by": current_user.id,
        "is_active": True
    }).to_list(100)
    
    return [Assessment(**doc) for doc in assessments_docs]

@router.get("/{assessment_id}", response_model=Assessment)
async def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get specific assessment by ID"""
    
    assessment_doc = await db.assessments.find_one({
        "id": assessment_id,
        "is_active": True
    })
    
    if not assessment_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    return Assessment(**assessment_doc)

@router.post("/{assessment_id}/submit", response_model=AssessmentResult)
async def submit_assessment(
    assessment_id: str,
    answers: dict,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Submit assessment answers and get results"""
    
    # Get assessment
    assessment_doc = await db.assessments.find_one({"id": assessment_id})
    if not assessment_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    assessment = Assessment(**assessment_doc)
    
    # Calculate score
    score = 0
    total_points = assessment.total_points
    
    for question in assessment.questions:
        if question.id in answers and answers[question.id] == question.correct_answer:
            score += question.points
    
    percentage = (score / total_points) * 100 if total_points > 0 else 0
    
    # Create result
    result = AssessmentResult(
        user_id=current_user.id,
        assessment_id=assessment_id,
        answers=answers,
        score=score,
        total_points=total_points,
        percentage=percentage,
        time_taken_minutes=answers.get("time_taken", 0)
    )
    
    await db.assessment_results.insert_one(result.dict())
    
    # Update user credits based on performance
    if percentage >= 70:
        credits_earned = max(1, int(percentage / 10))
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"completed_credits": credits_earned}}
        )
    
    return result

@router.get("/results/my", response_model=List[AssessmentResult])
async def get_my_results(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get assessment results for current user"""
    
    results_docs = await db.assessment_results.find({
        "user_id": current_user.id
    }).sort("completed_at", -1).to_list(100)
    
    return [AssessmentResult(**doc) for doc in results_docs]

def generate_ai_questions(subject: str, difficulty: DifficultyLevel, count: int = 10) -> List[Question]:
    """Generate AI-powered questions"""
    questions = []
    subject_key = subject.lower().replace(" ", "-")
    
    if subject_key in SAMPLE_QUESTIONS and difficulty.value in SAMPLE_QUESTIONS[subject_key]:
        sample_questions = SAMPLE_QUESTIONS[subject_key][difficulty.value]
        
        for i in range(min(count, len(sample_questions) * 2)):
            q_data = random.choice(sample_questions)
            question = Question(
                question=q_data["question"],
                options=q_data["options"],
                correct_answer=q_data["correct_answer"],
                explanation=q_data["explanation"],
                points=2 if difficulty == DifficultyLevel.ADVANCED else 1
            )
            questions.append(question)
    
    # Add some generic questions if not enough subject-specific ones
    while len(questions) < count:
        questions.append(Question(
            question=f"Sample {subject} question {len(questions) + 1}",
            options=["Option A", "Option B", "Option C", "Option D"],
            correct_answer="Option A",
            explanation="This is a sample question for demonstration.",
            points=1
        ))
    
    return questions[:count]

def generate_multiple_choice_questions(subject: str, difficulty: DifficultyLevel, count: int = 15) -> List[Question]:
    """Generate multiple choice questions"""
    return generate_ai_questions(subject, difficulty, count)

def generate_skill_based_questions(subject: str, difficulty: DifficultyLevel, count: int = 8) -> List[Question]:
    """Generate skill-based practical questions"""
    questions = []
    
    for i in range(count):
        question = Question(
            question=f"Practical {subject} skill assessment {i + 1}",
            options=None,  # No options for practical questions
            correct_answer=None,
            explanation=f"This is a hands-on assessment for {subject} skills.",
            points=3 if difficulty == DifficultyLevel.ADVANCED else 2
        )
        questions.append(question)
    
    return questions