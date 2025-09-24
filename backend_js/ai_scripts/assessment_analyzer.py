#!/usr/bin/env python3
"""
AI-powered Assessment Analysis using Emergent LLM integration
Analyzes assessment results and provides detailed feedback and recommendations
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

async def analyze_assessment(answers, questions):
    """Analyze assessment results using AI"""
    
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id=f"assessment_analysis_{datetime.now().isoformat()}",
            system_message="""You are an AI assessment analyst specializing in skill evaluation and learning path optimization for India's NSQF-aligned education system. Your expertise includes:

1. Analyzing assessment performance across multiple skill domains
2. Identifying learning gaps and strengths
3. Providing detailed feedback on skill levels
4. Recommending targeted improvement strategies
5. Mapping performance to NSQF competency levels
6. Generating personalized learning recommendations

Analysis Framework:
- Evaluate both correct and incorrect responses
- Identify patterns in knowledge gaps
- Assess depth of understanding vs. surface-level knowledge
- Consider time taken for responses (if available)
- Map skills to NSQF proficiency levels
- Provide actionable improvement strategies

Always provide constructive feedback with specific recommendations for skill development."""
        ).with_model("openai", "gpt-4o")
        
        # Construct comprehensive prompt
        prompt = f"""
Analyze the following assessment results and provide comprehensive feedback:

ASSESSMENT QUESTIONS:
{json.dumps(questions, indent=2)}

USER ANSWERS:
{json.dumps(answers, indent=2)}

Provide analysis in the following JSON format:

{{
    "overallPerformance": {{
        "totalQuestions": {len(questions)},
        "correctAnswers": "calculated_value",
        "accuracyPercentage": "calculated_percentage",
        "overallGrade": "A/B/C/D/F",
        "nsqfLevel": "NSQF Level X",
        "proficiencyLevel": "beginner/intermediate/advanced/expert"
    }},
    "skillBreakdown": [
        {{
            "skillName": "Skill name",
            "questionsAsked": 5,
            "correctAnswers": 3,
            "accuracy": 60,
            "strength": "high/medium/low",
            "nsqfLevel": "NSQF Level X",
            "feedback": "Detailed feedback for this skill area",
            "improvementAreas": ["area1", "area2"],
            "recommendedResources": ["resource1", "resource2"]
        }}
    ]],
    "strengthsAndWeaknesses": {{
        "strengths": [
            {{
                "area": "Strong area name",
                "description": "What user did well",
                "evidence": "Specific examples from responses",
                "buildUpon": "How to leverage this strength"
            }}
        ],
        "weaknesses": [
            {{
                "area": "Weak area name",
                "description": "What needs improvement",
                "evidence": "Specific examples from responses",
                "impact": "How this affects overall performance",
                "improvementStrategy": "Specific steps to improve"
            }}
        ]
    }},
    "detailedFeedback": [
        {{
            "questionId": "q1",
            "question": "Question text",
            "userAnswer": "User's answer",
            "correctAnswer": "Correct answer",
            "isCorrect": true/false,
            "explanation": "Why answer is correct/incorrect",
            "learningPoint": "Key concept to understand",
            "difficulty": "easy/medium/hard",
            "skillTested": "Skill being evaluated"
        }}
    ],
    "learningRecommendations": [
        {{
            "type": "course/book/practice/tutorial",
            "title": "Recommendation title",
            "description": "What this will help with",
            "priority": "high/medium/low",
            "estimatedTime": "Time to complete",
            "skillsImproved": ["skill1", "skill2"],
            "provider": "Recommended provider",
            "difficulty": "beginner/intermediate/advanced"
        }}
    ],
    "nextSteps": [
        {{
            "step": "Action to take",
            "description": "Detailed description",
            "timeframe": "When to complete",
            "priority": "high/medium/low",
            "resources": ["resource1", "resource2"]
        }}
    ],
    "competencyMapping": {{
        "currentCompetencies": ["competency1", "competency2"],
        "developingCompetencies": ["competency3", "competency4"],
        "targetCompetencies": ["competency5", "competency6"],
        "readinessForNextLevel": {{
            "ready": true/false,
            "percentage": 75,
            "requirements": ["requirement1", "requirement2"]
        }}
    }},
    "motivationalFeedback": {{
        "encouragement": "Positive motivational message",
        "progressHighlights": ["progress1", "progress2"],
        "goalSetting": "Suggested goals for improvement",
        "celebrateWins": ["achievement1", "achievement2"]
    }}
}}

Please provide thorough analysis considering:
- Question difficulty levels and skill domains
- Pattern recognition in correct/incorrect responses
- Learning gaps that need immediate attention
- Strengths that can be built upon
- Progression readiness for next NSQF level
- Specific resources for improvement
- Motivational elements to encourage continued learning
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
            
            analysis = json.loads(json_content)
            
            # Add metadata
            analysis["metadata"] = {
                "analyzedAt": datetime.now().isoformat(),
                "aiModel": "gpt-4o",
                "confidence": 0.88,
                "version": "1.0",
                "analysisType": "comprehensive"
            }
            
            return analysis
            
        except (json.JSONDecodeError, ValueError) as e:
            return create_fallback_analysis(answers, questions)
    
    except Exception as e:
        return {
            "error": "AI analysis failed",
            "message": str(e),
            "fallback": create_fallback_analysis(answers, questions)
        }

def create_fallback_analysis(answers, questions):
    """Create basic fallback analysis when AI generation fails"""
    
    # Calculate basic metrics
    total_questions = len(questions)
    correct_count = 0
    
    # Simple scoring logic
    for i, question in enumerate(questions):
        if i < len(answers):
            user_answer = answers[i] if isinstance(answers, list) else answers.get(str(i), "")
            if hasattr(question, 'correctAnswer') and str(user_answer).lower() == str(question.get('correctAnswer', '')).lower():
                correct_count += 1
    
    accuracy = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    return {
        "overallPerformance": {
            "totalQuestions": total_questions,
            "correctAnswers": correct_count,
            "accuracyPercentage": round(accuracy, 1),
            "overallGrade": "A" if accuracy >= 90 else "B" if accuracy >= 80 else "C" if accuracy >= 70 else "D" if accuracy >= 60 else "F",
            "nsqfLevel": "NSQF Level 4" if accuracy >= 70 else "NSQF Level 3",
            "proficiencyLevel": "intermediate" if accuracy >= 75 else "beginner"
        },
        "skillBreakdown": [
            {
                "skillName": "General Knowledge",
                "questionsAsked": total_questions,
                "correctAnswers": correct_count,
                "accuracy": round(accuracy, 1),
                "strength": "high" if accuracy >= 80 else "medium" if accuracy >= 60 else "low",
                "nsqfLevel": "NSQF Level 4" if accuracy >= 70 else "NSQF Level 3",
                "feedback": f"You answered {correct_count} out of {total_questions} questions correctly",
                "improvementAreas": ["Practice more questions", "Review fundamental concepts"],
                "recommendedResources": ["Study materials", "Practice assessments"]
            }
        ],
        "strengthsAndWeaknesses": {
            "strengths": [
                {
                    "area": "Assessment Completion",
                    "description": "Successfully completed the assessment",
                    "evidence": "Answered all questions",
                    "buildUpon": "Continue regular practice"
                }
            ] if accuracy > 50 else [],
            "weaknesses": [
                {
                    "area": "Knowledge Gaps",
                    "description": "Some areas need improvement",
                    "evidence": f"Missed {total_questions - correct_count} questions",
                    "impact": "Affects overall proficiency",
                    "improvementStrategy": "Focus on weak areas through targeted learning"
                }
            ] if accuracy < 90 else []
        },
        "learningRecommendations": [
            {
                "type": "course",
                "title": "Fundamentals Review Course",
                "description": "Strengthen foundational knowledge",
                "priority": "high" if accuracy < 70 else "medium",
                "estimatedTime": "4-6 weeks",
                "skillsImproved": ["Core concepts", "Problem solving"],
                "provider": "Skill India Digital",
                "difficulty": "beginner"
            }
        ],
        "nextSteps": [
            {
                "step": "Review incorrect answers",
                "description": "Understand where mistakes were made",
                "timeframe": "Within 1 week",
                "priority": "high",
                "resources": ["Assessment feedback", "Study materials"]
            },
            {
                "step": "Practice similar questions",
                "description": "Reinforce learning through practice",
                "timeframe": "Ongoing",
                "priority": "medium",
                "resources": ["Practice tests", "Online quizzes"]
            }
        ],
        "competencyMapping": {
            "currentCompetencies": ["Basic understanding"] if accuracy > 50 else [],
            "developingCompetencies": ["Intermediate skills"] if accuracy > 60 else ["Basic skills"],
            "targetCompetencies": ["Advanced proficiency", "Expert knowledge"],
            "readinessForNextLevel": {
                "ready": accuracy >= 75,
                "percentage": min(accuracy, 100),
                "requirements": ["Improve weak areas", "Complete recommended courses"]
            }
        },
        "motivationalFeedback": {
            "encouragement": "Keep learning and improving! Every assessment is a step forward.",
            "progressHighlights": [f"Completed assessment with {accuracy:.1f}% accuracy"],
            "goalSetting": "Aim for 80% or higher in your next assessment",
            "celebrateWins": ["Taking the assessment shows commitment to learning"]
        },
        "metadata": {
            "analyzedAt": datetime.now().isoformat(),
            "aiModel": "fallback",
            "confidence": 0.6,
            "version": "1.0",
            "analysisType": "basic"
        }
    }

async def main():
    """Main function to handle input and analyze assessment"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        answers = data.get('answers', [])
        questions = data.get('questions', [])
        
        # Analyze assessment
        analysis = await analyze_assessment(answers, questions)
        
        # Output result as JSON
        print(json.dumps(analysis, indent=2))
        
    except Exception as e:
        error_response = {
            "error": "Assessment analysis failed",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())