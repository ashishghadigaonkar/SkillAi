#!/usr/bin/env python3
"""
AI-powered Roadmap Generator using Emergent LLM integration
Generates personalized learning roadmaps based on user profile, career goals, and market trends
"""

import sys
import json
import os
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    print(json.dumps({
        "error": "emergentintegrations not installed",
        "message": "Please install emergentintegrations library"
    }))
    sys.exit(1)

async def generate_roadmap(user_profile, career_goal, timeframe):
    """Generate personalized learning roadmap using AI"""
    
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id=f"roadmap_generation_{datetime.now().isoformat()}",
            system_message="""You are an AI career advisor specializing in India's National Skills Qualifications Framework (NSQF) and personalized learning path generation. Your task is to create comprehensive, adaptive learning roadmaps for learners based on their profiles, career aspirations, and current market trends.

Guidelines:
1. Always structure learning paths according to NSQF levels (1-10)
2. Consider India-specific industry demands and regional factors
3. Include both technical and soft skills development
4. Provide realistic timelines with milestone-based progression
5. Account for user's current skill level, available time, and learning preferences
6. Include assessment points and certification opportunities
7. Consider employability and market demand for each skill/course
8. Provide alternative paths based on different scenarios

Output Format: Return a detailed JSON structure with phases, courses, skills, assessments, and career progression milestones."""
        ).with_model("openai", "gpt-4o")
        
        # Construct comprehensive prompt
        prompt = f"""
Generate a comprehensive personalized learning roadmap for the following profile:

USER PROFILE:
{json.dumps(user_profile, indent=2)}

CAREER GOAL: {career_goal}
TIMEFRAME: {timeframe}

Please create a detailed roadmap with the following structure:

{{
    "title": "Personalized Learning Roadmap to become {career_goal}",
    "description": "AI-generated roadmap description",
    "currentLevel": "NSQF Level X",
    "targetLevel": "NSQF Level Y",
    "estimatedDuration": "duration in months",
    "phases": [
        {{
            "phaseNumber": 1,
            "title": "Foundation Building",
            "duration": "3 months",
            "nsqfLevel": "NSQF Level 4",
            "description": "Phase description",
            "courses": [
                {{
                    "title": "Course name",
                    "provider": "Provider name",
                    "duration": "duration",
                    "priority": "high/medium/low",
                    "prerequisites": ["prereq1", "prereq2"],
                    "learningOutcomes": ["outcome1", "outcome2"]
                }}
            ],
            "skills": [
                {{
                    "name": "Skill name",
                    "currentLevel": "beginner",
                    "targetLevel": "intermediate",
                    "priority": "high"
                }}
            ],
            "assessments": [
                {{
                    "name": "Assessment name",
                    "type": "skill-assessment",
                    "estimatedDate": "YYYY-MM-DD"
                }}
            ],
            "milestones": [
                {{
                    "title": "Milestone title",
                    "description": "Milestone description",
                    "targetDate": "YYYY-MM-DD"
                }}
            ]
        }}
    ],
    "careerProgression": [
        {{
            "phase": 1,
            "expectedRole": "Junior Role",
            "expectedSalary": {{"min": 300000, "max": 500000}},
            "skillsRequired": ["skill1", "skill2"],
            "marketReadiness": 60
        }}
    ],
    "recommendations": [
        {{
            "type": "course",
            "title": "Recommendation title",
            "reasoning": "Why this is recommended",
            "confidence": 90,
            "priority": "high"
        }}
    ],
    "marketAlignment": {{
        "industryRelevance": 95,
        "jobMarketDemand": 88,
        "salaryExpectation": {{
            "realistic": true,
            "marketRate": {{"min": 800000, "max": 1200000}}
        }}
    }}
}}

Consider:
- Current skill levels and learning pace
- Regional job market in {user_profile.get('state', 'India')}
- NSQF compliance and certification pathways
- Industry-specific requirements for {career_goal}
- Available time per week: {user_profile.get('availableHours', 10)} hours
- Preferred learning format: {user_profile.get('preferredFormat', 'hybrid')}
- Budget considerations for course fees and certifications

Ensure the roadmap is practical, achievable, and aligned with current market demands in India.
"""

        # Send message to AI
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            # Extract JSON from response
            response_text = str(response)
            
            # Find JSON content (assuming it's wrapped in markdown code blocks)
            if "```json" in response_text:
                start_idx = response_text.find("```json") + 7
                end_idx = response_text.find("```", start_idx)
                json_content = response_text[start_idx:end_idx].strip()
            elif "{" in response_text:
                # Try to extract JSON directly
                start_idx = response_text.find("{")
                end_idx = response_text.rfind("}") + 1
                json_content = response_text[start_idx:end_idx]
            else:
                raise ValueError("No JSON content found in AI response")
            
            roadmap_data = json.loads(json_content)
            
            # Add metadata
            roadmap_data["metadata"] = {
                "generatedBy": "ai",
                "generatedAt": datetime.now().isoformat(),
                "version": "1.0",
                "aiModel": "gpt-4o",
                "confidence": 0.85
            }
            
            return roadmap_data
            
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback roadmap if AI response parsing fails
            return create_fallback_roadmap(user_profile, career_goal, timeframe)
    
    except Exception as e:
        return {
            "error": "AI generation failed",
            "message": str(e),
            "fallback": create_fallback_roadmap(user_profile, career_goal, timeframe)
        }

def create_fallback_roadmap(user_profile, career_goal, timeframe):
    """Create a basic fallback roadmap when AI generation fails"""
    
    timeframe_months = {
        "6months": 6,
        "1year": 12,
        "2years": 24,
        "flexible": 18
    }.get(timeframe, 12)
    
    return {
        "title": f"Learning Roadmap to become {career_goal}",
        "description": f"Structured learning path to achieve your goal of becoming a {career_goal}",
        "currentLevel": "NSQF Level 4",
        "targetLevel": "NSQF Level 7",
        "estimatedDuration": f"{timeframe_months} months",
        "phases": [
            {
                "phaseNumber": 1,
                "title": "Foundation Building",
                "duration": f"{timeframe_months // 3} months",
                "nsqfLevel": "NSQF Level 4",
                "description": "Build fundamental skills and knowledge",
                "courses": [
                    {
                        "title": "Programming Fundamentals",
                        "provider": "Skill India Digital",
                        "duration": "6 weeks",
                        "priority": "high",
                        "prerequisites": [],
                        "learningOutcomes": ["Basic programming concepts", "Problem-solving skills"]
                    }
                ],
                "skills": [
                    {
                        "name": "Programming",
                        "currentLevel": "beginner",
                        "targetLevel": "intermediate",
                        "priority": "high"
                    }
                ],
                "assessments": [
                    {
                        "name": "Programming Skills Assessment",
                        "type": "skill-assessment",
                        "estimatedDate": (datetime.now() + timedelta(weeks=8)).strftime("%Y-%m-%d")
                    }
                ],
                "milestones": [
                    {
                        "title": "Complete Foundation Course",
                        "description": "Successfully complete programming fundamentals",
                        "targetDate": (datetime.now() + timedelta(weeks=6)).strftime("%Y-%m-%d")
                    }
                ]
            }
        ],
        "careerProgression": [
            {
                "phase": 1,
                "expectedRole": f"Junior {career_goal}",
                "expectedSalary": {"min": 300000, "max": 600000},
                "skillsRequired": ["Programming", "Problem Solving"],
                "marketReadiness": 60
            }
        ],
        "recommendations": [
            {
                "type": "course",
                "title": "Start with Programming Fundamentals",
                "reasoning": "Essential foundation for technical career",
                "confidence": 85,
                "priority": "high"
            }
        ],
        "marketAlignment": {
            "industryRelevance": 80,
            "jobMarketDemand": 75,
            "salaryExpectation": {
                "realistic": True,
                "marketRate": {"min": 600000, "max": 1000000}
            }
        },
        "metadata": {
            "generatedBy": "fallback",
            "generatedAt": datetime.now().isoformat(),
            "version": "1.0",
            "aiModel": "fallback",
            "confidence": 0.7
        }
    }

async def main():
    """Main function to handle input and generate roadmap"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        user_profile = data.get('userProfile', {})
        career_goal = data.get('careerGoal', 'Software Developer')
        timeframe = data.get('timeframe', '1year')
        
        # Generate roadmap
        roadmap = await generate_roadmap(user_profile, career_goal, timeframe)
        
        # Output result as JSON
        print(json.dumps(roadmap, indent=2))
        
    except Exception as e:
        error_response = {
            "error": "Roadmap generation failed",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())