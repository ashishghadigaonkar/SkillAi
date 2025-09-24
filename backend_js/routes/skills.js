const express = require('express');
const Skill = require('../models/Skill');
const User = require('../models/User');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { validatePagination, validateSearch } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Get all skills with filtering and search
router.get('/', optionalAuth, validatePagination, validateSearch, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.q;
    const category = req.query.category;
    const subcategory = req.query.subcategory;
    const nsqfLevel = req.query.nsqfLevel;
    const demandLevel = req.query.demandLevel;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
    // Build query
    let query = { isActive: true, isVerified: true };
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filters
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (nsqfLevel) {
      query.$or = [
        { 'nsqfMapping.minimumLevel': nsqfLevel },
        { 'nsqfMapping.maximumLevel': nsqfLevel }
      ];
    }
    if (demandLevel) query['marketData.demandLevel'] = demandLevel;
    
    const skip = (page - 1) * limit;
    
    // Execute query
    const skills = await Skill.find(query)
      .select('name description category subcategory nsqfMapping marketData tags popularity')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    const total = await Skill.countDocuments(query);
    
    // Add user-specific data if authenticated
    if (req.user) {
      const user = await User.findById(req.user._id).select('skills');
      
      skills.forEach(skill => {
        const userSkill = user.skills.find(
          us => us.skillId?.toString() === skill._id.toString() || 
                us.name?.toLowerCase() === skill.name.toLowerCase()
        );
        skill._doc.userLevel = userSkill?.level || null;
        skill._doc.userScore = userSkill?.score || null;
        skill._doc.lastAssessed = userSkill?.lastAssessed || null;
      });
    }
    
    res.json({
      skills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search,
        category,
        subcategory,
        nsqfLevel,
        demandLevel
      }
    });
  } catch (error) {
    logger.error('Get skills error:', error);
    res.status(500).json({
      error: 'Failed to fetch skills',
      message: 'Unable to retrieve skills'
    });
  }
});

// Get skill by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await Skill.findById(id)
      .populate('relatedSkills.skillId', 'name category marketData')
      .populate('prerequisites.skillId', 'name category')
      .populate('courses.courseId', 'title provider nsqfLevel');
    
    if (!skill || !skill.isActive) {
      return res.status(404).json({
        error: 'Skill not found',
        message: 'The requested skill was not found or is not available'
      });
    }
    
    // Add user-specific data if authenticated
    let userSkillData = null;
    if (req.user) {
      const user = await User.findById(req.user._id).select('skills');
      const userSkill = user.skills.find(
        us => us.skillId?.toString() === skill._id.toString() || 
              us.name?.toLowerCase() === skill.name.toLowerCase()
      );
      userSkillData = userSkill || null;
    }
    
    res.json({
      skill: skill.toJSON(),
      userSkillData
    });
  } catch (error) {
    logger.error('Get skill error:', error);
    res.status(500).json({
      error: 'Failed to fetch skill',
      message: 'Unable to retrieve skill details'
    });
  }
});

// Get skills by category
router.get('/category/:category', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const query = {
      category,
      isActive: true,
      isVerified: true
    };
    
    const skip = (page - 1) * limit;
    
    const skills = await Skill.find(query)
      .select('name description subcategory nsqfMapping marketData')
      .sort({ 'marketData.demandLevel': -1, name: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Skill.countDocuments(query);
    
    res.json({
      category,
      skills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get skills by category error:', error);
    res.status(500).json({
      error: 'Failed to fetch skills',
      message: 'Unable to retrieve skills for this category'
    });
  }
});

// Get trending/high-demand skills
router.get('/trending/in-demand', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const trendingSkills = await Skill.find({
      isActive: true,
      isVerified: true,
      'marketData.demandLevel': { $in: ['high', 'very-high'] },
      'marketData.trendDirection': { $in: ['increasing', 'stable'] }
    })
    .select('name description category marketData jobRoles')
    .sort({ 
      'marketData.demandLevel': -1,
      'marketData.averageSalaryImpact.percentage': -1
    })
    .limit(limit);
    
    res.json({
      trendingSkills,
      metadata: {
        basedOn: ['market demand', 'salary impact', 'trend direction'],
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    logger.error('Get trending skills error:', error);
    res.status(500).json({
      error: 'Failed to fetch trending skills',
      message: 'Unable to retrieve trending skills'
    });
  }
});

// Get skill recommendations for user
router.get('/recommendations/for-me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    
    const user = await User.findById(userId).select('skills profile currentLevel');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Get user's current skills
    const userSkillNames = user.skills.map(skill => skill.name.toLowerCase());
    
    // Find complementary skills
    const userSkillIds = user.skills.map(skill => skill.skillId).filter(id => id);
    
    const recommendedSkills = await Skill.find({
      isActive: true,
      isVerified: true,
      name: { $nin: userSkillNames.map(name => new RegExp(name, 'i')) },
      $or: [
        { 'relatedSkills.skillId': { $in: userSkillIds } },
        { 'marketData.demandLevel': { $in: ['high', 'very-high'] } }
      ]
    })
    .select('name description category marketData jobRoles relatedSkills')
    .limit(limit * 2); // Get more to filter later
    
    // Score and sort recommendations
    const scoredRecommendations = recommendedSkills.map(skill => {
      let score = 0;
      const reasons = [];
      
      // Check if it's related to user's existing skills
      const hasRelatedSkill = skill.relatedSkills.some(related => 
        userSkillIds.includes(related.skillId)
      );
      if (hasRelatedSkill) {
        score += 30;
        reasons.push('Complements your existing skills');
      }
      
      // Market demand score
      const demandScore = {
        'very-high': 25,
        'high': 20,
        'medium': 10,
        'low': 5
      }[skill.marketData.demandLevel] || 0;
      score += demandScore;
      
      if (skill.marketData.demandLevel === 'very-high') {
        reasons.push('Very high market demand');
      } else if (skill.marketData.demandLevel === 'high') {
        reasons.push('High market demand');
      }
      
      // Salary impact
      if (skill.marketData.averageSalaryImpact?.percentage > 15) {
        score += 15;
        reasons.push('Significant salary impact');
      }
      
      // Career relevance
      if (user.profile.aspirations?.targetRole) {
        const targetRole = user.profile.aspirations.targetRole.toLowerCase();
        const hasRelevantJobRole = skill.jobRoles.some(jobRole => 
          jobRole.title.toLowerCase().includes(targetRole) || 
          targetRole.includes(jobRole.title.toLowerCase())
        );
        if (hasRelevantJobRole) {
          score += 20;
          reasons.push('Relevant to your career goal');
        }
      }
      
      return {
        ...skill.toJSON(),
        recommendationScore: score,
        reasons
      };
    });
    
    // Sort by score and take top results
    const topRecommendations = scoredRecommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
    
    res.json({
      recommendations: topRecommendations,
      basedOn: {
        currentSkills: user.skills.length,
        targetRole: user.profile.aspirations?.targetRole,
        currentLevel: user.currentLevel
      }
    });
  } catch (error) {
    logger.error('Get skill recommendations error:', error);
    res.status(500).json({
      error: 'Failed to fetch skill recommendations',
      message: 'Unable to retrieve skill recommendations'
    });
  }
});

// Get skill gap analysis for user
router.get('/gap-analysis/:targetRole', authenticateToken, async (req, res) => {
  try {
    const { targetRole } = req.params;
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('skills currentLevel');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Find skills required for the target role
    const requiredSkills = await Skill.find({
      isActive: true,
      'jobRoles.title': new RegExp(targetRole, 'i'),
      'jobRoles.importance': { $in: ['critical', 'important'] }
    }).select('name description category jobRoles marketData');
    
    // Analyze skill gaps
    const userSkillMap = new Map();
    user.skills.forEach(skill => {
      userSkillMap.set(skill.name.toLowerCase(), skill);
    });
    
    const skillGapAnalysis = requiredSkills.map(requiredSkill => {
      const userSkill = userSkillMap.get(requiredSkill.name.toLowerCase());
      const jobRole = requiredSkill.jobRoles.find(jr => 
        jr.title.toLowerCase().includes(targetRole.toLowerCase())
      );
      
      const requiredLevel = jobRole?.minimumRequiredLevel || 'intermediate';
      const userLevel = userSkill?.level || 'none';
      
      const levelHierarchy = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
      const requiredLevelIndex = levelHierarchy.indexOf(requiredLevel);
      const userLevelIndex = levelHierarchy.indexOf(userLevel);
      
      const hasGap = userLevelIndex < requiredLevelIndex;
      
      return {
        skill: requiredSkill.name,
        description: requiredSkill.description,
        category: requiredSkill.category,
        importance: jobRole?.importance || 'important',
        requiredLevel,
        currentLevel: userLevel,
        hasGap,
        gapSize: hasGap ? requiredLevelIndex - userLevelIndex : 0,
        marketDemand: requiredSkill.marketData.demandLevel,
        recommendations: hasGap ? [
          'Take relevant courses',
          'Practice through projects',
          'Seek mentorship'
        ] : ['Continue maintaining proficiency']
      };
    });
    
    // Sort by gap size and importance
    skillGapAnalysis.sort((a, b) => {
      if (a.importance !== b.importance) {
        const importanceOrder = { 'critical': 3, 'important': 2, 'good-to-have': 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      }
      return b.gapSize - a.gapSize;
    });
    
    const summary = {
      totalSkillsRequired: requiredSkills.length,
      skillsWithGaps: skillGapAnalysis.filter(s => s.hasGap).length,
      criticalGaps: skillGapAnalysis.filter(s => s.hasGap && s.importance === 'critical').length,
      readinessPercentage: Math.round(
        ((requiredSkills.length - skillGapAnalysis.filter(s => s.hasGap).length) / requiredSkills.length) * 100
      )
    };
    
    res.json({
      targetRole,
      summary,
      skillGaps: skillGapAnalysis,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Get skill gap analysis error:', error);
    res.status(500).json({
      error: 'Failed to perform gap analysis',
      message: 'Unable to analyze skill gaps'
    });
  }
});

// Create new skill (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const skillData = {
      ...req.body,
      metadata: {
        createdBy: req.user._id,
        lastUpdated: new Date(),
        version: 1
      }
    };
    
    const skill = new Skill(skillData);
    await skill.save();
    
    logger.info('Skill created:', { skillId: skill._id, createdBy: req.user._id });
    
    res.status(201).json({
      message: 'Skill created successfully',
      skill: skill.toJSON()
    });
  } catch (error) {
    logger.error('Create skill error:', error);
    res.status(500).json({
      error: 'Skill creation failed',
      message: 'Unable to create skill'
    });
  }
});

// Update skill
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.metadata.createdBy;
    
    updates.metadata = {
      ...updates.metadata,
      lastUpdated: new Date(),
      version: (updates.metadata?.version || 1) + 1
    };
    
    const skill = await Skill.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return res.status(404).json({
        error: 'Skill not found',
        message: 'The requested skill was not found'
      });
    }
    
    logger.info('Skill updated:', { skillId: skill._id, updatedBy: req.user._id });
    
    res.json({
      message: 'Skill updated successfully',
      skill: skill.toJSON()
    });
  } catch (error) {
    logger.error('Update skill error:', error);
    res.status(500).json({
      error: 'Skill update failed',
      message: 'Unable to update skill'
    });
  }
});

// Get skill statistics
router.get('/stats/overview', authenticateToken, authorizeRoles('admin', 'policymaker'), async (req, res) => {
  try {
    const stats = await Skill.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalSkills: { $sum: 1 },
          verifiedSkills: {
            $sum: {
              $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
            }
          },
          skillsByCategory: {
            $push: '$category'
          },
          highDemandSkills: {
            $sum: {
              $cond: [
                { $in: ['$marketData.demandLevel', ['high', 'very-high']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Count by category
    const categoryStats = await Skill.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          highDemandCount: {
            $sum: {
              $cond: [
                { $in: ['$marketData.demandLevel', ['high', 'very-high']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Demand level distribution
    const demandStats = await Skill.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$marketData.demandLevel',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      overview: stats[0] || {},
      byCategory: categoryStats,
      byDemand: demandStats,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Get skill statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch skill statistics',
      message: 'Unable to retrieve skill statistics'
    });
  }
});

module.exports = router;