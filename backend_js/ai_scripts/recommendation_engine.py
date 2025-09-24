#!/usr/bin/env python3
"""
AI-powered Recommendation Engine using Emergent LLM integration
Generates personalized course and skill recommendations based on user data and market trends
"""

import sys
import json
import os
import asyncio
from datetime import datetime
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

async def generate_recommendations(user_skills, learning_history, market_trends):
    """Generate personalized recommendations using AI"""
    
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id=f"recommendations_{datetime.now().isoformat()}",
            system_message="""You are an AI-powered recommendation engine specializing in India's skill development ecosystem and NSQF-aligned learning paths. Your role is to analyze user profiles, learning histories, and market trends to provide highly personalized and actionable recommendations.

Core Responsibilities:
1. Analyze user's current skill portfolio and identify gaps
2. Recommend courses, certifications, and learning resources
3. Suggest career advancement opportunities
4. Provide market-driven insights for skill development
5. Consider NSQF progression and industry standards
6. Account for regional job market demands in India

Recommendation Criteria:
- Relevance to user's career goals and current skills
- Market demand and employment potential
- NSQF alignment and certification value
- Learning feasibility based on user's profile
- ROI in terms of salary growth and career advancement

Always provide confidence scores and clear reasoning for recommendations."""
        ).with_model("openai", "gpt-4o")
        
        # Construct comprehensive prompt
        prompt = f"""
Analyze the following user data and generate personalized recommendations:

USER SKILLS:
{json.dumps(user_skills, indent=2)}

LEARNING HISTORY:
{json.dumps(learning_history, indent=2)}

MARKET TRENDS:
{json.dumps(market_trends, indent=2)}

Generate recommendations in the following JSON format:

{{
    "courseRecommendations": [
        {{
            "title": "Course title",
            "provider": "Provider name",
            "category": "technology/healthcare/finance/etc",
            "nsqfLevel": "NSQF Level X",
            "duration": "duration",
            "confidence": 95,
            "priority": "high/medium/low",
            "reasoning": ["reason1", "reason2", "reason3"],
            "expectedOutcomes": ["outcome1", "outcome2"],
            "marketDemand": "high/medium/low",
            "salaryImpact": "+15% expected increase",
            "prerequisites": ["prereq1", "prereq2"],
            "estimatedCost": "INR 5000-10000"
        }}
    ],
    "skillRecommendations": [
        {{
            "skillName": "Skill name",
            "category": "technical/soft-skill/domain-specific",
            "currentLevel": "beginner/intermediate/advanced",
            "targetLevel": "intermediate/advanced/expert",
            "confidence": 90,
            "priority": "high/medium/low",
            "reasoning": "Why this skill is recommended",
            "marketDemand": "high/medium/low",
            "learningResources": [
                {{
                    "type": "course/book/certification/practice",
                    "name": "Resource name",
                    "provider": "Provider",
                    "duration": "duration",
                    "cost": "cost estimate"
                }}
            ],
            "timeToAcquire": "2-3 months",
            "jobRoles": ["role1", "role2"]
        }}
    ],
    "careerPathRecommendations": [
        {{
            "title": "Career path title",
            "description": "Description of career progression",
            "timeframe": "12-18 months",
            "confidence": 85,
            "currentFit": 75,
            "requiredSkills": ["skill1", "skill2"],
            "skillGaps": ["gap1", "gap2"],
            "averageSalary": {{"min": 600000, "max": 1200000}},
            "jobAvailability": "high/medium/low",
            "nextSteps": ["step1", "step2", "step3"]
        }}
    ],
    "certificationRecommendations": [
        {{
            "name": "Certification name",
            "issuingBody": "Issuing organization",
            "nsqfLevel": "NSQF Level X",
            "confidence": 88,
            "priority": "high/medium/low",
            "reasoning": "Why this certification is valuable",
            "industryRecognition": "high/medium/low",
            "examDifficulty": "easy/medium/hard",
            "preparationTime": "2-4 months",
            "cost": "INR 10000-25000",
            "validity": "3 years",
            "careerImpact": "Significant/Moderate/Minimal"
        }}
    ],
    "improvementAreas": [
        {{
            "area": "Area needing improvement",
            "currentLevel": "current level description",
            "targetLevel": "target level description",
            "importance": "high/medium/low",
            "reasoning": "Why improvement is needed",
            "actionItems": ["action1", "action2"],
            "timeframe": "1-3 months",
            "resources": ["resource1", "resource2"]
        }}
    ],
    "marketInsights": [
        {{
            "insight": "Market insight description",
            "impact": "high/medium/low",
            "actionable": "What user can do about it",
            "timeframe": "When to act",
            "confidence": 80
        }}
    ]
}}

Consider:
- User's current skill level and learning pace
- Regional job market demands
- Industry growth trends in India
- NSQF progression pathways
- Budget constraints for courses and certifications
- Time availability for learning
- Career advancement opportunities
"""

        # Send message to AI
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            response_text = str(response)
            
            # Extract JSON from response
            if "```json" in response_text:
                start_idx = response_text.find("```json") + 7
                end_idx = response_text.find("```", start_idx)
                json_content = response_text[start_idx:end_idx].strip()
            elif "{" in response_text:
                start_idx = response_text.find("{")
                end_idx = response_text.rfind("}") + 1
                json_content = response_text[start_idx:end_idx]
            else:
                raise ValueError("No JSON content found in AI response")
            
            recommendations = json.loads(json_content)
            
            # Add metadata
            recommendations["metadata"] = {
                "generatedAt": datetime.now().isoformat(),
                "aiModel": "gpt-4o",
                "confidence": 0.87,
                "version": "1.0"
            }
            
            return recommendations
            
        except (json.JSONDecodeError, ValueError) as e:
            return create_fallback_recommendations(user_skills, learning_history)
    
    except Exception as e:
        return {
            "error": "AI recommendation generation failed",
            "message": str(e),
            "fallback": create_fallback_recommendations(user_skills, learning_history)
        }

def create_fallback_recommendations(user_skills, learning_history):
    """Create basic fallback recommendations when AI generation fails"""
    
    return {
        "courseRecommendations": [
            {
                "title": "Advanced Programming Concepts",
                "provider": "Skill India Digital",
                "category": "technology",
                "nsqfLevel": "NSQF Level 5",
                "duration": "8 weeks",
                "confidence": 75,
                "priority": "high",
                "reasoning": ["Build on existing programming foundation", "High market demand", "Career advancement opportunity"],
                "expectedOutcomes": ["Advanced programming skills", "Problem-solving abilities"],
                "marketDemand": "high",
                "salaryImpact": "+20% expected increase",
                "prerequisites": ["Basic programming knowledge"],
                "estimatedCost": "INR 8000-15000"
            }
        ],
        "skillRecommendations": [
            {
                "skillName": "Data Analysis",
                "category": "technical",
                "currentLevel": "beginner",
                "targetLevel": "intermediate",
                "confidence": 80,
                "priority": "high",
                "reasoning": "High demand skill with good career prospects",
                "marketDemand": "high",
                "learningResources": [
                    {
                        "type": "course",
                        "name": "Data Analysis Fundamentals",
                        "provider": "Online Platform",
                        "duration": "6 weeks",
                        "cost": "INR 5000"
                    }
                ],
                "timeToAcquire": "3-4 months",
                "jobRoles": ["Data Analyst", "Business Analyst"]
            }
        ],
        "careerPathRecommendations": [
            {
                "title": "Software Developer Career Path",
                "description": "Progress from junior to senior developer roles",
                "timeframe": "18-24 months",
                "confidence": 78,
                "currentFit": 70,
                "requiredSkills": ["Programming", "Problem Solving", "Software Design"],
                "skillGaps": ["Advanced frameworks", "System design"],
                "averageSalary": {"min": 600000, "max": 1500000},
                "jobAvailability": "high",
                "nextSteps": ["Complete advanced programming course", "Build portfolio projects", "Gain practical experience"]
            }
        ],
        "certificationRecommendations": [
            {
                "name": "NSDC Certified Software Developer",
                "issuingBody": "National Skill Development Corporation",
                "nsqfLevel": "NSQF Level 6",
                "confidence": 85,
                "priority": "high",
                "reasoning": "Government recognized certification with industry value",
                "industryRecognition": "high",
                "examDifficulty": "medium",
                "preparationTime": "3-4 months",
                "cost": "INR 15000-25000",
                "validity": "Lifetime",
                "careerImpact": "Significant"
            }
        ],
        "improvementAreas": [
            {
                "area": "Communication Skills",
                "currentLevel": "Basic technical communication",
                "targetLevel": "Professional communication and presentation",
                "importance": "high",
                "reasoning": "Essential for career growth and leadership roles",
                "actionItems": ["Join communication workshops", "Practice presentations", "Engage in team discussions"],
                "timeframe": "2-3 months",
                "resources": ["Communication skills course", "Toastmasters club", "Online practice platforms"]
            }
        ],
        "marketInsights": [
            {
                "insight": "AI and Machine Learning skills are in high demand across industries",
                "impact": "high",
                "actionable": "Consider adding ML courses to your learning path",
                "timeframe": "Next 6 months",
                "confidence": 85
            }
        ],
        "metadata": {
            "generatedAt": datetime.now().isoformat(),
            "aiModel": "fallback",
            "confidence": 0.7,
            "version": "1.0"
        }
    }

async def main():
    """Main function to handle input and generate recommendations"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        user_skills = data.get('userSkills', [])
        learning_history = data.get('learningHistory', [])
        market_trends = data.get('marketTrends', {})
        
        # Generate recommendations
        recommendations = await generate_recommendations(user_skills, learning_history, market_trends)
        
        # Output result as JSON
        print(json.dumps(recommendations, indent=2))
        
    except Exception as e:
        error_response = {
            "error": "Recommendation generation failed",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())