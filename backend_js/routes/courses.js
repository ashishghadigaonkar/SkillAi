const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, optionalAuth, authorizeRoles } = require('../middleware/auth');
const { validateCourseCreation, validatePagination, validateSearch } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Get all courses with filtering and search
router.get('/', optionalAuth, validatePagination, validateSearch, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.q;
    const category = req.query.category;
    const nsqfLevel = req.query.nsqfLevel;
    const format = req.query.format;
    const provider = req.query.provider;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Build query
    let query = { isActive: true, isVerified: true };
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filters
    if (category) query.category = category;
    if (nsqfLevel) query.nsqfLevel = nsqfLevel;
    if (format) query['structure.format'] = format;
    if (provider) query['provider.name'] = new RegExp(provider, 'i');
    
    const skip = (page - 1) * limit;
    
    // Execute query
    const courses = await Course.find(query)
      .select('title shortDescription category nsqfLevel provider structure quality marketRelevance tags')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    const total = await Course.countDocuments(query);
    
    // Add user-specific data if authenticated
    if (req.user) {
      const user = await User.findById(req.user._id).select('learningHistory skills');
      
      courses.forEach(course => {
        const enrollment = user.learningHistory.find(
          item => item.courseId?.toString() === course._id.toString()
        );
        course._doc.enrollmentStatus = enrollment?.status || 'not-enrolled';
        course._doc.progress = enrollment?.progress || 0;
      });
    }
    
    res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        search,
        category,
        nsqfLevel,
        format,
        provider
      }
    });
  } catch (error) {
    logger.error('Get courses error:', error);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: 'Unable to retrieve courses'
    });
  }
});

// Get course by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id);
    
    if (!course || !course.isActive || !course.isVerified) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course was not found or is not available'
      });
    }
    
    // Add user-specific data if authenticated
    let userEnrollment = null;
    if (req.user) {
      const user = await User.findById(req.user._id).select('learningHistory');
      const enrollment = user.learningHistory.find(
        item => item.courseId?.toString() === course._id.toString()
      );
      userEnrollment = enrollment || null;
    }
    
    res.json({
      course: course.toJSON(),
      userEnrollment
    });
  } catch (error) {
    logger.error('Get course error:', error);
    res.status(500).json({
      error: 'Failed to fetch course',
      message: 'Unable to retrieve course details'
    });
  }
});

// Get course recommendations for user
router.get('/recommendations/for-me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    
    const user = await User.findById(userId).select('skills profile learningHistory currentLevel');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Build recommendation query based on user profile
    let recommendationQuery = {
      isActive: true,
      isVerified: true
    };
    
    // Match current NSQF level or next level
    const currentLevelNum = parseInt(user.currentLevel.match(/\d+/)[0]);
    const targetLevels = [`NSQF Level ${currentLevelNum}`, `NSQF Level ${currentLevelNum + 1}`];
    recommendationQuery.nsqfLevel = { $in: targetLevels };
    
    // Exclude already enrolled courses
    const enrolledCourseIds = user.learningHistory.map(item => item.courseId).filter(id => id);
    if (enrolledCourseIds.length > 0) {
      recommendationQuery._id = { $nin: enrolledCourseIds };
    }
    
    // Prefer courses in target industry/role if specified
    if (user.profile.aspirations?.targetIndustry) {
      recommendationQuery.$or = [
        { category: user.profile.aspirations.targetIndustry },
        { tags: new RegExp(user.profile.aspirations.targetRole, 'i') }
      ];
    }
    
    const recommendations = await Course.find(recommendationQuery)
      .select('title shortDescription category nsqfLevel provider structure quality marketRelevance')
      .sort({ 'marketRelevance.demandScore': -1, 'quality.rating': -1 })
      .limit(limit);
    
    // Add recommendation reasons
    const recommendationsWithReasons = recommendations.map(course => {
      const reasons = [];
      
      if (targetLevels.includes(course.nsqfLevel)) {
        reasons.push('Matches your current skill level');
      }
      
      if (course.marketRelevance.demandScore > 70) {
        reasons.push('High market demand');
      }
      
      if (course.quality.rating > 4.0) {
        reasons.push('Highly rated by learners');
      }
      
      if (user.profile.aspirations?.targetRole && 
          course.tags.some(tag => tag.toLowerCase().includes(user.profile.aspirations.targetRole.toLowerCase()))) {
        reasons.push('Aligns with your career goal');
      }
      
      return {
        ...course.toJSON(),
        recommendationReasons: reasons,
        confidenceScore: Math.min(95, 60 + reasons.length * 10)
      };
    });
    
    res.json({
      recommendations: recommendationsWithReasons,
      basedOn: {
        currentLevel: user.currentLevel,
        targetRole: user.profile.aspirations?.targetRole,
        completedCourses: user.learningHistory.filter(item => item.status === 'completed').length
      }
    });
  } catch (error) {
    logger.error('Get course recommendations error:', error);
    res.status(500).json({
      error: 'Failed to fetch recommendations',
      message: 'Unable to retrieve course recommendations'
    });
  }
});

// Create new course (trainers and admins only)
router.post('/', authenticateToken, authorizeRoles('trainer', 'admin'), validateCourseCreation, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      metadata: {
        createdBy: req.user._id,
        lastUpdated: new Date(),
        version: 1
      }
    };
    
    const course = new Course(courseData);
    await course.save();
    
    logger.info('Course created:', { courseId: course._id, createdBy: req.user._id });
    
    res.status(201).json({
      message: 'Course created successfully',
      course: course.toJSON()
    });
  } catch (error) {
    logger.error('Create course error:', error);
    res.status(500).json({
      error: 'Course creation failed',
      message: 'Unable to create course'
    });
  }
});

// Update course
router.put('/:id', authenticateToken, authorizeRoles('trainer', 'admin'), async (req, res) => {
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
    
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course was not found'
      });
    }
    
    logger.info('Course updated:', { courseId: course._id, updatedBy: req.user._id });
    
    res.json({
      message: 'Course updated successfully',
      course: course.toJSON()
    });
  } catch (error) {
    logger.error('Update course error:', error);
    res.status(500).json({
      error: 'Course update failed',
      message: 'Unable to update course'
    });
  }
});

// Get courses by category
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
    
    const courses = await Course.find(query)
      .select('title shortDescription nsqfLevel provider structure quality marketRelevance')
      .sort({ 'marketRelevance.demandScore': -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      category,
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get courses by category error:', error);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: 'Unable to retrieve courses for this category'
    });
  }
});

// Get trending courses
router.get('/trending/popular', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const trendingCourses = await Course.find({
      isActive: true,
      isVerified: true,
      'marketRelevance.trendingStatus': 'rising'
    })
    .select('title shortDescription category nsqfLevel provider quality marketRelevance')
    .sort({ 
      'marketRelevance.demandScore': -1,
      'quality.rating': -1,
      'enrollment.currentEnrollment': -1
    })
    .limit(limit);
    
    res.json({
      trendingCourses,
      metadata: {
        basedOn: ['market demand', 'user ratings', 'enrollment numbers'],
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    logger.error('Get trending courses error:', error);
    res.status(500).json({
      error: 'Failed to fetch trending courses',
      message: 'Unable to retrieve trending courses'
    });
  }
});

// Get course statistics (for admins)
router.get('/stats/overview', authenticateToken, authorizeRoles('admin', 'policymaker'), async (req, res) => {
  try {
    const stats = await Course.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          verifiedCourses: {
            $sum: {
              $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
            }
          },
          averageRating: { $avg: '$quality.rating' },
          totalEnrollments: { $sum: '$enrollment.currentEnrollment' },
          coursesByCategory: {
            $push: '$category'
          },
          coursesByLevel: {
            $push: '$nsqfLevel'
          }
        }
      }
    ]);
    
    // Count by category
    const categoryStats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$quality.rating' },
          totalEnrollments: { $sum: '$enrollment.currentEnrollment' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Count by NSQF level
    const levelStats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$nsqfLevel',
          count: { $sum: 1 },
          averageRating: { $avg: '$quality.rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      overview: stats[0] || {},
      byCategory: categoryStats,
      byLevel: levelStats,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Get course statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch course statistics',
      message: 'Unable to retrieve course statistics'
    });
  }
});

module.exports = router;