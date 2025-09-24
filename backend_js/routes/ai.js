const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../utils/aiService');
const User = require('../models/User');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const logger = require('../utils/logger');

const router = express.Router();

// Generate personalized recommendations
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { context, preferences } = req.body;
    
    // Get user data
    const user = await User.findById(userId)
      .select('skills learningHistory profile currentLevel');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Get market trends (mock data for now)
    const marketTrends = {
      highDemandSkills: ['AI/ML', 'Cloud Computing', 'Data Science', 'Cybersecurity'],
      emergingSkills: ['Blockchain', 'IoT', 'Quantum Computing'],
      industryGrowth: {
        technology: 25,
        healthcare: 18,
        finance: 15
      },
      salaryTrends: {
        'AI/ML Engineer': { min: 800000, max: 2500000, growth: '+35%' },
        'Data Scientist': { min: 600000, max: 2000000, growth: '+28%' },
        'Cloud Architect': { min: 1200000, max: 3500000, growth: '+42%' }
      }
    };
    
    // Generate AI recommendations
    const recommendations = await aiService.generateRecommendations(
      user.skills,
      user.learningHistory,
      marketTrends
    );
    
    if (recommendations.error) {
      logger.error('AI recommendations failed:', recommendations.error);
      return res.status(500).json({
        error: 'AI generation failed',
        message: recommendations.message,
        fallback: recommendations.fallback
      });
    }
    
    logger.info('AI recommendations generated:', { userId, context });
    
    res.json({
      message: 'Recommendations generated successfully',
      recommendations,
      context: context || 'general',
      basedOn: {
        userSkills: user.skills.length,
        learningHistory: user.learningHistory.length,
        currentLevel: user.currentLevel
      }
    });
  } catch (error) {
    logger.error('Generate recommendations error:', error);
    res.status(500).json({
      error: 'Recommendation generation failed',
      message: 'Unable to generate personalized recommendations'
    });
  }
});

// Chat with AI mentor
router.post('/mentor/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;
    const userId = req.user._id;
    
    if (!message || !sessionId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Message and sessionId are required'
      });
    }
    
    // Get user context
    const user = await User.findById(userId)
      .select('name profile skills learningHistory currentLevel');
    
    // Prepare context for AI
    const mentorContext = {
      userName: user.name,
      currentLevel: user.currentLevel,
      targetRole: user.profile.aspirations?.targetRole,
      recentCourses: user.learningHistory.slice(-3),
      topSkills: user.skills.slice(0, 5),
      context: context || 'general'
    };
    
    // Here you would integrate with your AI chat service
    // For now, providing a structured response
    const aiResponse = {
      message: `Hello ${user.name}! I understand you're asking about "${message}". Based on your current level (${user.currentLevel}) and your goal to become ${user.profile.aspirations?.targetRole || 'a skilled professional'}, here are my thoughts...`,
      suggestions: [
        'Consider taking an advanced course in your target field',
        'Practice your skills through hands-on projects',
        'Connect with industry professionals for networking'
      ],
      resources: [
        {
          type: 'course',
          title: 'Advanced Skills Development',
          provider: 'Skill India',
          duration: '6 weeks'
        }
      ],
      followUpQuestions: [
        'Would you like specific course recommendations?',
        'Do you need help with career planning?',
        'Are you interested in skill assessments?'
      ]
    };
    
    logger.info('AI mentor chat:', { userId, sessionId, messageLength: message.length });
    
    res.json({
      response: aiResponse,
      sessionId,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('AI mentor chat error:', error);
    res.status(500).json({
      error: 'Chat failed',
      message: 'Unable to process your message'
    });
  }
});

// Analyze career path feasibility
router.post('/career-analysis', authenticateToken, async (req, res) => {
  try {
    const { targetRole, timeframe, currentExperience } = req.body;
    const userId = req.user._id;
    
    if (!targetRole) {
      return res.status(400).json({
        error: 'Missing target role',
        message: 'Target role is required for career analysis'
      });
    }
    
    const user = await User.findById(userId)
      .select('skills profile currentLevel learningHistory');
    
    // Find skills required for target role
    const requiredSkills = await Skill.find({
      'jobRoles.title': new RegExp(targetRole, 'i'),
      isActive: true
    }).select('name jobRoles marketData');
    
    // Find relevant courses
    const relevantCourses = await Course.find({
      $or: [
        { tags: new RegExp(targetRole, 'i') },
        { 'learning.skillsAcquired.skillName': { $in: requiredSkills.map(s => s.name) } }
      ],
      isActive: true,
      isVerified: true
    }).select('title nsqfLevel structure.duration quality marketRelevance');
    
    // Calculate feasibility score
    const userSkillNames = user.skills.map(s => s.name.toLowerCase());
    const requiredSkillNames = requiredSkills.map(s => s.name.toLowerCase());
    const skillMatch = userSkillNames.filter(skill => 
      requiredSkillNames.some(required => required.includes(skill) || skill.includes(required))
    ).length;
    
    const skillMatchPercentage = requiredSkills.length > 0 
      ? (skillMatch / requiredSkills.length) * 100 
      : 0;
    
    const feasibilityScore = Math.min(100, Math.max(20, 
      skillMatchPercentage * 0.4 + 
      (user.learningHistory.length * 2) + 
      (timeframe === 'flexible' ? 20 : timeframe === '2years' ? 15 : timeframe === '1year' ? 10 : 5)
    ));
    
    const analysis = {
      feasibilityScore: Math.round(feasibilityScore),
      feasibilityLevel: feasibilityScore >= 80 ? 'Very High' : 
                       feasibilityScore >= 60 ? 'High' : 
                       feasibilityScore >= 40 ? 'Medium' : 'Low',
      skillGaps: {
        total: requiredSkills.length,
        matched: skillMatch,
        missing: requiredSkills.length - skillMatch,
        matchPercentage: Math.round(skillMatchPercentage)
      },
      recommendations: {
        essentialSkills: requiredSkills.slice(0, 5).map(skill => ({
          name: skill.name,
          importance: skill.jobRoles.find(jr => 
            jr.title.toLowerCase().includes(targetRole.toLowerCase())
          )?.importance || 'important',
          marketDemand: skill.marketData.demandLevel
        })),
        suggestedCourses: relevantCourses.slice(0, 5).map(course => ({
          title: course.title,
          duration: course.structure.duration.weeks,
          level: course.nsqfLevel,
          rating: course.quality.rating
        })),
        timelineEstimate: {
          minimum: Math.max(6, requiredSkills.length * 2),
          realistic: Math.max(12, requiredSkills.length * 3),
          comfortable: Math.max(18, requiredSkills.length * 4)
        }
      },
      marketOutlook: {
        demandLevel: 'High', // This would come from market data
        averageSalary: '₹8-15 LPA', // This would be calculated from market data
        jobAvailability: 'Good',
        growthTrend: '+25% annually'
      }
    };
    
    logger.info('Career analysis completed:', { userId, targetRole, feasibilityScore });
    
    res.json({
      targetRole,
      analysis,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Career analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: 'Unable to analyze career path'
    });
  }
});

// Generate learning insights
router.get('/insights/learning', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select('learningHistory skills statistics profile');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Calculate learning patterns
    const learningPatterns = {
      preferredLearningDays: calculatePreferredDays(user.learningHistory),
      averageCompletionTime: calculateAverageCompletionTime(user.learningHistory),
      strengthAreas: identifyStrengthAreas(user.skills),
      improvementAreas: identifyImprovementAreas(user.skills),
      learningVelocity: calculateLearningVelocity(user.learningHistory),
      consistencyScore: user.statistics.currentStreak > 0 ? 
        Math.min(100, user.statistics.currentStreak * 5) : 0
    };
    
    // Generate insights
    const insights = {
      performance: {
        overallRating: calculateOverallRating(user),
        strengthsCount: learningPatterns.strengthAreas.length,
        areasForImprovement: learningPatterns.improvementAreas.length,
        consistencyScore: learningPatterns.consistencyScore
      },
      patterns: learningPatterns,
      recommendations: [
        {
          type: 'schedule',
          message: `You seem to learn best on ${learningPatterns.preferredLearningDays.join(', ')}. Consider scheduling your study sessions accordingly.`,
          priority: 'medium'
        },
        {
          type: 'skills',
          message: `Your strongest areas are ${learningPatterns.strengthAreas.slice(0, 2).join(' and ')}. Consider advanced courses in these areas.`,
          priority: 'low'
        },
        {
          type: 'improvement',
          message: `Focus on improving ${learningPatterns.improvementAreas.slice(0, 2).join(' and ')} through targeted practice.`,
          priority: 'high'
        }
      ],
      nextSteps: [
        'Take a skills assessment to identify gaps',
        'Enroll in a course that aligns with your career goals',
        'Set daily learning targets to improve consistency'
      ]
    };
    
    logger.info('Learning insights generated:', { userId });
    
    res.json({
      insights,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Generate learning insights error:', error);
    res.status(500).json({
      error: 'Insights generation failed',
      message: 'Unable to generate learning insights'
    });
  }
});

// Helper functions
function calculatePreferredDays(learningHistory) {
  // Mock implementation - in real scenario, analyze actual learning patterns
  return ['Monday', 'Wednesday', 'Friday'];
}

function calculateAverageCompletionTime(learningHistory) {
  const completedCourses = learningHistory.filter(course => 
    course.status === 'completed' && course.startDate && course.completionDate
  );
  
  if (completedCourses.length === 0) return 0;
  
  const totalDays = completedCourses.reduce((sum, course) => {
    const days = Math.ceil((new Date(course.completionDate) - new Date(course.startDate)) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / completedCourses.length);
}

function identifyStrengthAreas(skills) {
  return skills
    .filter(skill => skill.score >= 80)
    .map(skill => skill.name)
    .slice(0, 5);
}

function identifyImprovementAreas(skills) {
  return skills
    .filter(skill => skill.score < 60)
    .map(skill => skill.name)
    .slice(0, 5);
}

function calculateLearningVelocity(learningHistory) {
  const recentCourses = learningHistory.filter(course => {
    const courseDate = new Date(course.startDate);
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return courseDate >= threeMonthsAgo;
  });
  
  return recentCourses.length;
}

function calculateOverallRating(user) {
  const factors = [
    user.statistics.totalCoursesCompleted * 10, // Course completion
    user.statistics.currentStreak * 2, // Consistency
    user.skills.length * 5, // Skill diversity
    user.skills.reduce((sum, skill) => sum + (skill.score || 0), 0) / Math.max(user.skills.length, 1) // Average skill score
  ];
  
  return Math.min(100, Math.round(factors.reduce((sum, factor) => sum + factor, 0) / 4));
}

module.exports = router;