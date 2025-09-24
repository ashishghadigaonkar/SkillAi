const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateUserUpdate, validatePagination } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Get user profile by ID (public info only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('name profile.state currentLevel achievements statistics isVerified')
      .populate('skills.skillId', 'name category');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found or deactivated'
      });
    }
    
    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: 'Unable to retrieve user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateUserUpdate, async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.isActive;
    delete updates.isVerified;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    logger.info('User profile updated:', { userId: user._id });
    
    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Unable to update user profile'
    });
  }
});

// Update user skills
router.put('/skills', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skills } = req.body;
    
    if (!Array.isArray(skills)) {
      return res.status(400).json({
        error: 'Invalid skills data',
        message: 'Skills must be provided as an array'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Update or add skills
    skills.forEach(newSkill => {
      const existingSkillIndex = user.skills.findIndex(
        skill => skill.skillId?.toString() === newSkill.skillId || skill.name === newSkill.name
      );
      
      if (existingSkillIndex !== -1) {
        // Update existing skill
        user.skills[existingSkillIndex] = {
          ...user.skills[existingSkillIndex].toObject(),
          ...newSkill,
          lastAssessed: new Date()
        };
      } else {
        // Add new skill
        user.skills.push({
          ...newSkill,
          lastAssessed: new Date()
        });
      }
    });
    
    await user.save();
    
    logger.info('User skills updated:', { userId: user._id, skillsCount: skills.length });
    
    res.json({
      message: 'Skills updated successfully',
      skills: user.skills
    });
  } catch (error) {
    logger.error('Update skills error:', error);
    res.status(500).json({
      error: 'Skills update failed',
      message: 'Unable to update user skills'
    });
  }
});

// Get user learning history
router.get('/learning-history', authenticateToken, validatePagination, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    const user = await User.findById(userId)
      .populate({
        path: 'learningHistory.courseId',
        select: 'title provider nsqfLevel category structure.duration'
      });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    let learningHistory = user.learningHistory;
    
    // Filter by status if provided
    if (status) {
      learningHistory = learningHistory.filter(item => item.status === status);
    }
    
    // Sort by start date (most recent first)
    learningHistory.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = learningHistory.slice(startIndex, endIndex);
    
    res.json({
      learningHistory: paginatedHistory,
      pagination: {
        page,
        limit,
        total: learningHistory.length,
        totalPages: Math.ceil(learningHistory.length / limit)
      }
    });
  } catch (error) {
    logger.error('Get learning history error:', error);
    res.status(500).json({
      error: 'Failed to fetch learning history',
      message: 'Unable to retrieve learning history'
    });
  }
});

// Add course to user's learning history
router.post('/enroll/:courseId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Check if user is already enrolled
    const existingEnrollment = user.learningHistory.find(
      item => item.courseId?.toString() === courseId
    );
    
    if (existingEnrollment) {
      return res.status(409).json({
        error: 'Already enrolled',
        message: 'You are already enrolled in this course'
      });
    }
    
    // Add course to learning history
    user.learningHistory.push({
      courseId,
      courseName: course.title,
      status: 'enrolled',
      progress: 0,
      startDate: new Date()
    });
    
    await user.save();
    
    // Update course enrollment count
    course.enrollment.currentEnrollment += 1;
    await course.save();
    
    logger.info('User enrolled in course:', { userId, courseId, courseTitle: course.title });
    
    res.json({
      message: 'Successfully enrolled in course',
      course: {
        id: course._id,
        title: course.title,
        provider: course.provider.name,
        nsqfLevel: course.nsqfLevel
      }
    });
  } catch (error) {
    logger.error('Course enrollment error:', error);
    res.status(500).json({
      error: 'Enrollment failed',
      message: 'Unable to enroll in course'
    });
  }
});

// Update course progress
router.put('/progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { progress, status } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        error: 'Invalid progress',
        message: 'Progress must be between 0 and 100'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    const enrollmentIndex = user.learningHistory.findIndex(
      item => item.courseId?.toString() === courseId
    );
    
    if (enrollmentIndex === -1) {
      return res.status(404).json({
        error: 'Enrollment not found',
        message: 'You are not enrolled in this course'
      });
    }
    
    // Update progress
    user.learningHistory[enrollmentIndex].progress = progress;
    
    if (status) {
      user.learningHistory[enrollmentIndex].status = status;
    }
    
    // If course is completed
    if (progress === 100 || status === 'completed') {
      user.learningHistory[enrollmentIndex].status = 'completed';
      user.learningHistory[enrollmentIndex].completionDate = new Date();
      user.statistics.totalCoursesCompleted += 1;
    }
    
    // Update last activity
    user.statistics.lastActivity = new Date();
    
    await user.save();
    
    logger.info('Course progress updated:', { userId, courseId, progress, status });
    
    res.json({
      message: 'Progress updated successfully',
      enrollment: user.learningHistory[enrollmentIndex]
    });
  } catch (error) {
    logger.error('Update progress error:', error);
    res.status(500).json({
      error: 'Progress update failed',
      message: 'Unable to update course progress'
    });
  }
});

// Get user achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('achievements statistics');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Sort achievements by date (most recent first)
    const achievements = user.achievements
      .filter(achievement => achievement.visible)
      .sort((a, b) => new Date(b.dateAchieved) - new Date(a.dateAchieved));
    
    res.json({
      achievements,
      statistics: user.statistics
    });
  } catch (error) {
    logger.error('Get achievements error:', error);
    res.status(500).json({
      error: 'Failed to fetch achievements',
      message: 'Unable to retrieve user achievements'
    });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate('learningHistory.courseId', 'title provider nsqfLevel')
      .populate('skills.skillId', 'name category');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Get current courses (enrolled or in-progress)
    const currentCourses = user.learningHistory
      .filter(item => ['enrolled', 'in-progress'].includes(item.status))
      .slice(0, 5); // Limit to 5 most recent
    
    // Get recent achievements
    const recentAchievements = user.achievements
      .filter(achievement => achievement.visible)
      .sort((a, b) => new Date(b.dateAchieved) - new Date(a.dateAchieved))
      .slice(0, 5);
    
    // Calculate skill levels
    const skillLevels = user.skills.map(skill => ({
      name: skill.name,
      level: skill.level,
      score: skill.score,
      nsqfLevel: skill.nsqfLevel || 'Not specified'
    }));
    
    res.json({
      profile: {
        name: user.name,
        currentLevel: user.currentLevel,
        targetRole: user.profile.aspirations?.targetRole,
        streak: user.statistics.currentStreak
      },
      statistics: user.statistics,
      currentCourses,
      recentAchievements,
      skillLevels
    });
  } catch (error) {
    logger.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard',
      message: 'Unable to retrieve dashboard data'
    });
  }
});

module.exports = router;