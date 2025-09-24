const express = require('express');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateRoadmapGeneration, validatePagination } = require('../middleware/validation');
const aiService = require('../utils/aiService');
const logger = require('../utils/logger');

const router = express.Router();

// Generate new AI roadmap
router.post('/generate', authenticateToken, validateRoadmapGeneration, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetRole, targetIndustry, timeframe, experience, additionalContext } = req.body;
    
    // Get user profile for AI generation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Prepare user profile data for AI
    const userProfile = {
      currentLevel: user.currentLevel,
      skills: user.skills.map(skill => ({
        name: skill.name,
        level: skill.level,
        score: skill.score
      })),
      education: user.profile.education,
      experience: user.profile.socioEconomic?.employmentStatus,
      state: user.profile.state,
      language: user.profile.language,
      learningHistory: user.learningHistory.slice(-5), // Last 5 courses
      aspirations: user.profile.aspirations,
      availableHours: user.profile.aspirations?.availableHoursPerWeek || 10,
      preferredFormat: user.profile.aspirations?.preferredLearningMode || 'hybrid',
      additionalContext: additionalContext || ''
    };
    
    logger.info('Generating AI roadmap:', { userId, targetRole, timeframe });
    
    // Generate roadmap using AI service
    const aiRoadmapData = await aiService.generateRoadmap(userProfile, targetRole, timeframe);
    
    if (aiRoadmapData.error) {
      logger.error('AI roadmap generation error:', aiRoadmapData.error);
      return res.status(500).json({
        error: 'AI generation failed',
        message: aiRoadmapData.message || 'Unable to generate roadmap',
        fallback: aiRoadmapData.fallback
      });
    }
    
    // Create roadmap in database
    const roadmapData = {
      userId,
      title: aiRoadmapData.title || `Learning Path: ${targetRole}`,
      description: aiRoadmapData.description || `AI-generated roadmap to become ${targetRole}`,
      targetRole,
      targetIndustry,
      currentLevel: user.currentLevel,
      targetLevel: aiRoadmapData.targetLevel || 'NSQF Level 7',
      timeframe: {
        planned: timeframe,
        startDate: new Date(),
        expectedEndDate: new Date(Date.now() + (parseInt(aiRoadmapData.estimatedDuration) || 12) * 30 * 24 * 60 * 60 * 1000)
      },
      phases: aiRoadmapData.phases || [],
      careerProgression: aiRoadmapData.careerProgression || [],
      adaptiveElements: {
        aiGenerated: true,
        lastAiUpdate: new Date(),
        adaptationReason: 'Initial AI generation',
        marketDataInfluence: aiRoadmapData.marketAlignment || {},
        personalFactors: {
          learningPace: experience,
          availableTime: userProfile.availableHours,
          preferredFormat: userProfile.preferredFormat
        }
      },
      recommendations: aiRoadmapData.recommendations || [],
      marketAlignment: aiRoadmapData.marketAlignment || {},
      metadata: {
        generatedBy: 'ai',
        template: null,
        version: 1,
        lastUpdated: new Date(),
        tags: [targetRole, targetIndustry, timeframe]
      }
    };
    
    const roadmap = new Roadmap(roadmapData);
    await roadmap.save();
    
    // Update user's current roadmap reference
    user.profile.aspirations = {
      ...user.profile.aspirations,
      targetRole,
      targetIndustry,
      timeframe
    };
    await user.save();
    
    logger.info('AI roadmap generated successfully:', { userId, roadmapId: roadmap._id });
    
    res.status(201).json({
      message: 'Roadmap generated successfully',
      roadmap: roadmap.toJSON(),
      aiMetadata: aiRoadmapData.metadata
    });
  } catch (error) {
    logger.error('Roadmap generation error:', error);
    res.status(500).json({
      error: 'Roadmap generation failed',
      message: 'Unable to generate personalized roadmap'
    });
  }
});

// Get user's roadmaps
router.get('/my-roadmaps', authenticateToken, validatePagination, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // active, completed, archived
    
    let query = { userId, isActive: true };
    
    // Filter by status if provided
    if (status === 'completed') {
      query['progress.overallCompletion'] = 100;
    } else if (status === 'active') {
      query['progress.overallCompletion'] = { $lt: 100 };
    }
    
    const skip = (page - 1) * limit;
    
    const roadmaps = await Roadmap.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title description targetRole targetIndustry progress timeframe metadata');
    
    const total = await Roadmap.countDocuments(query);
    
    res.json({
      roadmaps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get roadmaps error:', error);
    res.status(500).json({
      error: 'Failed to fetch roadmaps',
      message: 'Unable to retrieve your roadmaps'
    });
  }
});

// Get specific roadmap details
router.get('/:roadmapId', authenticateToken, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user._id;
    
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    
    if (!roadmap) {
      return res.status(404).json({
        error: 'Roadmap not found',
        message: 'The requested roadmap was not found or you do not have access to it'
      });
    }
    
    res.json({
      roadmap: roadmap.toJSON()
    });
  } catch (error) {
    logger.error('Get roadmap error:', error);
    res.status(500).json({
      error: 'Failed to fetch roadmap',
      message: 'Unable to retrieve roadmap details'
    });
  }
});

// Update roadmap progress
router.put('/:roadmapId/progress', authenticateToken, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user._id;
    const { phaseNumber, courseId, status, progress } = req.body;
    
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    
    if (!roadmap) {
      return res.status(404).json({
        error: 'Roadmap not found',
        message: 'The requested roadmap was not found'
      });
    }
    
    // Find the phase and course to update
    const phase = roadmap.phases.find(p => p.phaseNumber === phaseNumber);
    if (!phase) {
      return res.status(404).json({
        error: 'Phase not found',
        message: 'The specified phase was not found in the roadmap'
      });
    }
    
    if (courseId) {
      // Update specific course progress
      const course = phase.courses.find(c => c.courseId?.toString() === courseId);
      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          message: 'The specified course was not found in this phase'
        });
      }
      
      if (status) course.status = status;
      if (progress !== undefined) course.progress = progress;
      if (status === 'completed') course.actualCompletion = new Date();
    }
    
    // Update phase progress
    if (status) phase.status = status;
    if (progress !== undefined) phase.completionPercentage = progress;
    
    // Recalculate overall progress
    await roadmap.updateProgress();
    
    logger.info('Roadmap progress updated:', { userId, roadmapId, phaseNumber, courseId });
    
    res.json({
      message: 'Progress updated successfully',
      progress: roadmap.progress,
      updatedPhase: phase
    });
  } catch (error) {
    logger.error('Update roadmap progress error:', error);
    res.status(500).json({
      error: 'Progress update failed',
      message: 'Unable to update roadmap progress'
    });
  }
});

// Add feedback to roadmap
router.post('/:roadmapId/feedback', authenticateToken, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user._id;
    const { rating, comments, suggestions } = req.body;
    
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    
    if (!roadmap) {
      return res.status(404).json({
        error: 'Roadmap not found',
        message: 'The requested roadmap was not found'
      });
    }
    
    // Add feedback
    roadmap.feedback.push({
      source: 'user',
      rating,
      comments,
      suggestions: suggestions || [],
      createdAt: new Date()
    });
    
    await roadmap.save();
    
    logger.info('Roadmap feedback added:', { userId, roadmapId, rating });
    
    res.json({
      message: 'Feedback added successfully',
      feedback: roadmap.feedback[roadmap.feedback.length - 1]
    });
  } catch (error) {
    logger.error('Add roadmap feedback error:', error);
    res.status(500).json({
      error: 'Feedback submission failed',
      message: 'Unable to submit feedback'
    });
  }
});

// Regenerate roadmap with AI updates
router.post('/:roadmapId/regenerate', authenticateToken, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;
    
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    
    if (!roadmap) {
      return res.status(404).json({
        error: 'Roadmap not found',
        message: 'The requested roadmap was not found'
      });
    }
    
    // Get updated user profile
    const user = await User.findById(userId);
    
    const userProfile = {
      currentLevel: user.currentLevel,
      skills: user.skills.map(skill => ({
        name: skill.name,
        level: skill.level,
        score: skill.score
      })),
      currentProgress: roadmap.progress,
      completedPhases: roadmap.phases.filter(p => p.status === 'completed'),
      learningHistory: user.learningHistory.slice(-10),
      feedback: roadmap.feedback.slice(-3)
    };
    
    logger.info('Regenerating roadmap with AI:', { userId, roadmapId, reason });
    
    // Generate updated roadmap
    const aiRoadmapData = await aiService.generateRoadmap(userProfile, roadmap.targetRole, roadmap.timeframe.planned);
    
    if (aiRoadmapData.error) {
      return res.status(500).json({
        error: 'AI regeneration failed',
        message: aiRoadmapData.message
      });
    }
    
    // Update roadmap with new AI recommendations
    roadmap.phases = aiRoadmapData.phases || roadmap.phases;
    roadmap.recommendations = aiRoadmapData.recommendations || [];
    roadmap.marketAlignment = aiRoadmapData.marketAlignment || roadmap.marketAlignment;
    roadmap.adaptiveElements.lastAiUpdate = new Date();
    roadmap.adaptiveElements.adaptationReason = reason || 'User requested regeneration';
    roadmap.metadata.version += 1;
    roadmap.metadata.lastUpdated = new Date();
    
    await roadmap.save();
    
    logger.info('Roadmap regenerated successfully:', { userId, roadmapId });
    
    res.json({
      message: 'Roadmap regenerated successfully',
      roadmap: roadmap.toJSON(),
      changes: {
        phasesUpdated: aiRoadmapData.phases?.length || 0,
        newRecommendations: aiRoadmapData.recommendations?.length || 0
      }
    });
  } catch (error) {
    logger.error('Roadmap regeneration error:', error);
    res.status(500).json({
      error: 'Regeneration failed',
      message: 'Unable to regenerate roadmap'
    });
  }
});

// Delete roadmap
router.delete('/:roadmapId', authenticateToken, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user._id;
    
    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: roadmapId, userId },
      { isActive: false },
      { new: true }
    );
    
    if (!roadmap) {
      return res.status(404).json({
        error: 'Roadmap not found',
        message: 'The requested roadmap was not found'
      });
    }
    
    logger.info('Roadmap deleted:', { userId, roadmapId });
    
    res.json({
      message: 'Roadmap deleted successfully'
    });
  } catch (error) {
    logger.error('Delete roadmap error:', error);
    res.status(500).json({
      error: 'Deletion failed',
      message: 'Unable to delete roadmap'
    });
  }
});

module.exports = router;