const express = require('express');
const { Assessment, AssessmentResult } = require('../models/Assessment');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateAssessmentCreation, validatePagination } = require('../middleware/validation');
const aiService = require('../utils/aiService');
const logger = require('../utils/logger');

const router = express.Router();

// Get available assessments
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    
    let query = { isActive: true, 'accessControl.isPublic': true };
    
    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    // Check role-based access
    if (!query['accessControl.allowedRoles']) {
      query['accessControl.allowedRoles'] = { $in: [req.user.role] };
    }
    
    const skip = (page - 1) * limit;
    
    const assessments = await Assessment.find(query)
      .select('title description type category difficulty duration targetSkills nsqfLevel analytics accessControl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Assessment.countDocuments(query);
    
    // Add user attempt history
    const userAttempts = await AssessmentResult.aggregate([
      {
        $match: {
          userId: req.user._id,
          assessmentId: { $in: assessments.map(a => a._id) }
        }
      },
      {
        $group: {
          _id: '$assessmentId',
          attemptCount: { $sum: 1 },
          lastAttempt: { $max: '$createdAt' },
          bestScore: { $max: '$scoring.percentage' }
        }
      }
    ]);
    
    // Merge attempt data with assessments
    const assessmentsWithAttempts = assessments.map(assessment => {
      const attemptData = userAttempts.find(attempt => 
        attempt._id.toString() === assessment._id.toString()
      );
      
      return {
        ...assessment.toJSON(),
        userAttempts: attemptData || {
          attemptCount: 0,
          lastAttempt: null,
          bestScore: null
        }
      };
    });
    
    res.json({
      assessments: assessmentsWithAttempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get assessments error:', error);
    res.status(500).json({
      error: 'Failed to fetch assessments',
      message: 'Unable to retrieve assessments'
    });
  }
});

// Get assessment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const assessment = await Assessment.findById(id);
    
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({
        error: 'Assessment not found',
        message: 'The requested assessment was not found or is not available'
      });
    }
    
    // Check access permissions
    if (!assessment.accessControl.isPublic) {
      if (!assessment.accessControl.allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this assessment'
        });
      }
    }
    
    // Get user's attempt history
    const userAttempts = await AssessmentResult.find({
      assessmentId: id,
      userId: req.user._id
    })
    .select('attemptNumber startTime endTime status scoring')
    .sort({ attemptNumber: -1 });
    
    // Check if user can take another attempt
    const canRetake = userAttempts.length < assessment.accessControl.maxAttempts;
    const cooldownPeriod = assessment.accessControl.retakePolicy.cooldownPeriod;
    const lastAttempt = userAttempts[0];
    const cooldownExpired = !lastAttempt || 
      !cooldownPeriod || 
      (Date.now() - new Date(lastAttempt.endTime).getTime()) > (cooldownPeriod * 60 * 60 * 1000);
    
    // Don't send actual questions and answers in overview
    const assessmentOverview = {
      ...assessment.toJSON(),
      questions: assessment.questions.map(q => ({
        id: q.id,
        questionType: q.questionType,
        difficulty: q.difficulty,
        points: q.points,
        skill: q.skill
      }))
    };
    
    res.json({
      assessment: assessmentOverview,
      userAttempts,
      canRetake: canRetake && cooldownExpired,
      attemptsRemaining: Math.max(0, assessment.accessControl.maxAttempts - userAttempts.length)
    });
  } catch (error) {
    logger.error('Get assessment error:', error);
    res.status(500).json({
      error: 'Failed to fetch assessment',
      message: 'Unable to retrieve assessment details'
    });
  }
});

// Start assessment attempt
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const assessment = await Assessment.findById(id);
    
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({
        error: 'Assessment not found',
        message: 'The requested assessment was not found'
      });
    }
    
    // Check existing attempts
    const existingAttempts = await AssessmentResult.countDocuments({
      assessmentId: id,
      userId
    });
    
    if (existingAttempts >= assessment.accessControl.maxAttempts) {
      return res.status(400).json({
        error: 'Maximum attempts reached',
        message: 'You have reached the maximum number of attempts for this assessment'
      });
    }
    
    // Check for in-progress attempt
    const inProgressAttempt = await AssessmentResult.findOne({
      assessmentId: id,
      userId,
      status: { $in: ['started', 'in-progress'] }
    });
    
    if (inProgressAttempt) {
      return res.status(400).json({
        error: 'Attempt already in progress',
        message: 'You have an active attempt for this assessment',
        attemptId: inProgressAttempt.id
      });
    }
    
    // Create new attempt
    const attemptData = {
      assessmentId: id,
      userId,
      attemptNumber: existingAttempts + 1,
      startTime: new Date(),
      status: 'started',
      answers: []
    };
    
    const attempt = new AssessmentResult(attemptData);
    await attempt.save();
    
    // Return questions for the attempt
    let questions = assessment.questions;
    
    // Handle adaptive assessment
    if (assessment.adaptiveSettings.isAdaptive) {
      // Start with medium difficulty questions
      questions = questions.filter(q => q.difficulty === 'medium').slice(0, 5);
    }
    
    // Remove correct answers from questions
    const questionsForUser = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options ? q.options.map(opt => ({
        id: opt.id,
        text: opt.text
      })) : undefined,
      points: q.points,
      hints: q.hints,
      multimedia: q.multimedia
    }));
    
    logger.info('Assessment attempt started:', { userId, assessmentId: id, attemptId: attempt.id });
    
    res.json({
      message: 'Assessment started successfully',
      attemptId: attempt.id,
      questions: questionsForUser,
      timeLimit: assessment.duration, // in minutes
      totalPoints: assessment.scoring.totalPoints,
      instructions: {
        duration: assessment.duration,
        passingScore: assessment.scoring.passingScore,
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    logger.error('Start assessment error:', error);
    res.status(500).json({
      error: 'Failed to start assessment',
      message: 'Unable to start assessment'
    });
  }
});

// Submit answer for question
router.post('/attempt/:attemptId/answer', authenticateToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, answer, timeSpent } = req.body;
    const userId = req.user._id;
    
    const attempt = await AssessmentResult.findOne({
      id: attemptId,
      userId,
      status: { $in: ['started', 'in-progress'] }
    });
    
    if (!attempt) {
      return res.status(404).json({
        error: 'Attempt not found',
        message: 'Active assessment attempt not found'
      });
    }
    
    // Get assessment to validate answer
    const assessment = await Assessment.findById(attempt.assessmentId);
    const question = assessment.questions.find(q => q.id === questionId);
    
    if (!question) {
      return res.status(400).json({
        error: 'Question not found',
        message: 'Invalid question ID'
      });
    }
    
    // Check if answer already exists
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
    
    // Evaluate answer
    let isCorrect = false;
    let pointsEarned = 0;
    
    if (question.questionType === 'multiple-choice' || question.questionType === 'single-choice') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.id === answer;
    } else if (question.correctAnswer) {
      isCorrect = String(answer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
    }
    
    if (isCorrect) {
      pointsEarned = question.points;
    }
    
    const answerData = {
      questionId,
      answer,
      timeSpent: timeSpent || 0,
      isCorrect,
      pointsEarned
    };
    
    // Update or add answer
    if (existingAnswerIndex !== -1) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }
    
    // Update attempt status
    attempt.status = 'in-progress';
    
    await attempt.save();
    
    res.json({
      message: 'Answer submitted successfully',
      feedback: {
        isCorrect,
        pointsEarned,
        explanation: isCorrect ? 'Correct answer!' : 'Please review this topic'
      }
    });
  } catch (error) {
    logger.error('Submit answer error:', error);
    res.status(500).json({
      error: 'Failed to submit answer',
      message: 'Unable to submit answer'
    });
  }
});

// Complete assessment attempt
router.post('/attempt/:attemptId/complete', authenticateToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;
    
    const attempt = await AssessmentResult.findOne({
      id: attemptId,
      userId,
      status: { $in: ['started', 'in-progress'] }
    });
    
    if (!attempt) {
      return res.status(404).json({
        error: 'Attempt not found',
        message: 'Active assessment attempt not found'
      });
    }
    
    const assessment = await Assessment.findById(attempt.assessmentId);
    
    // Calculate final score
    const totalPoints = attempt.answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const totalPossiblePoints = assessment.scoring.totalPoints;
    const percentage = (totalPoints / totalPossiblePoints) * 100;
    const passed = percentage >= assessment.scoring.passingScore;
    
    // Determine grade
    let grade = 'F';
    for (const gradeScale of assessment.scoring.gradingScale) {
      if (percentage >= gradeScale.minPercentage && percentage <= gradeScale.maxPercentage) {
        grade = gradeScale.grade;
        break;
      }
    }
    
    // Update attempt with final results
    attempt.endTime = new Date();
    attempt.timeSpent = Math.floor((attempt.endTime - attempt.startTime) / 1000); // in seconds
    attempt.status = 'completed';
    attempt.scoring = {
      totalPoints: totalPossiblePoints,
      earnedPoints: totalPoints,
      percentage: Math.round(percentage * 100) / 100,
      grade,
      passed
    };
    
    // Generate AI analysis
    try {
      const aiAnalysis = await aiService.analyzeSkillAssessment(
        attempt.answers,
        assessment.questions
      );
      
      if (!aiAnalysis.error) {
        attempt.skillAnalysis = aiAnalysis.skillBreakdown || [];
        attempt.recommendations = aiAnalysis.learningRecommendations || [];
        attempt.feedback = aiAnalysis.motivationalFeedback || {};
      }
    } catch (aiError) {
      logger.warn('AI analysis failed for assessment:', aiError);
      // Continue without AI analysis
    }
    
    await attempt.save();
    
    // Update assessment analytics
    assessment.analytics.totalAttempts += 1;
    assessment.analytics.averageScore = 
      (assessment.analytics.averageScore * (assessment.analytics.totalAttempts - 1) + percentage) / 
      assessment.analytics.totalAttempts;
    
    if (passed) {
      assessment.analytics.completionRate = 
        ((assessment.analytics.completionRate * (assessment.analytics.totalAttempts - 1)) + 100) / 
        assessment.analytics.totalAttempts;
    }
    
    await assessment.save();
    
    // Update user skills based on assessment results
    if (attempt.skillAnalysis && attempt.skillAnalysis.length > 0) {
      const user = await User.findById(userId);
      
      attempt.skillAnalysis.forEach(skillResult => {
        const existingSkillIndex = user.skills.findIndex(
          skill => skill.name.toLowerCase() === skillResult.skillName.toLowerCase()
        );
        
        const skillData = {
          name: skillResult.skillName,
          level: skillResult.accuracy >= 80 ? 'advanced' : 
                 skillResult.accuracy >= 60 ? 'intermediate' : 'beginner',
          score: skillResult.accuracy,
          lastAssessed: new Date()
        };
        
        if (existingSkillIndex !== -1) {
          user.skills[existingSkillIndex] = { ...user.skills[existingSkillIndex].toObject(), ...skillData };
        } else {
          user.skills.push(skillData);
        }
      });
      
      await user.save();
    }
    
    logger.info('Assessment completed:', { 
      userId, 
      assessmentId: assessment._id, 
      attemptId: attempt.id,
      score: percentage,
      passed
    });
    
    res.json({
      message: 'Assessment completed successfully',
      results: {
        score: attempt.scoring,
        skillAnalysis: attempt.skillAnalysis,
        recommendations: attempt.recommendations,
        feedback: attempt.feedback,
        certificateEligible: passed && assessment.certification?.available
      }
    });
  } catch (error) {
    logger.error('Complete assessment error:', error);
    res.status(500).json({
      error: 'Failed to complete assessment',
      message: 'Unable to complete assessment'
    });
  }
});

// Get assessment results
router.get('/attempt/:attemptId/results', authenticateToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;
    
    const attempt = await AssessmentResult.findOne({
      id: attemptId,
      userId
    }).populate('assessmentId', 'title description type category');
    
    if (!attempt) {
      return res.status(404).json({
        error: 'Results not found',
        message: 'Assessment results not found'
      });
    }
    
    res.json({
      attempt: attempt.toJSON()
    });
  } catch (error) {
    logger.error('Get assessment results error:', error);
    res.status(500).json({
      error: 'Failed to fetch results',
      message: 'Unable to retrieve assessment results'
    });
  }
});

// Get user's assessment history
router.get('/my-assessments', authenticateToken, validatePagination, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    let query = { userId };
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const attempts = await AssessmentResult.find(query)
      .populate('assessmentId', 'title description type category')
      .select('attemptNumber startTime endTime status scoring assessmentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await AssessmentResult.countDocuments(query);
    
    res.json({
      attempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get assessment history error:', error);
    res.status(500).json({
      error: 'Failed to fetch assessment history',
      message: 'Unable to retrieve your assessment history'
    });
  }
});

module.exports = router;