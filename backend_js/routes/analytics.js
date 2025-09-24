const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { AssessmentResult } = require('../models/Assessment');
const Roadmap = require('../models/Roadmap');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get user dashboard analytics (for learners)
router.get('/dashboard/learner', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select('statistics learningHistory achievements skills currentLevel');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    // Get active roadmaps
    const activeRoadmaps = await Roadmap.countDocuments({
      userId,
      isActive: true,
      'progress.overallCompletion': { $lt: 100 }
    });
    
    // Get recent assessments
    const recentAssessments = await AssessmentResult.countDocuments({
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Calculate learning pace
    const coursesThisMonth = user.learningHistory.filter(course => {
      const startDate = new Date(course.startDate);
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return startDate >= oneMonthAgo;
    }).length;
    
    // Get skill level distribution
    const skillLevels = user.skills.reduce((acc, skill) => {
      acc[skill.level] = (acc[skill.level] || 0) + 1;
      return acc;
    }, {});
    
    const analytics = {
      learningProgress: {
        totalCourses: user.statistics.totalCoursesCompleted,
        hoursLearned: user.statistics.totalHoursLearned,
        currentStreak: user.statistics.currentStreak,
        longestStreak: user.statistics.longestStreak
      },
      currentActivity: {
        activeRoadmaps,
        coursesInProgress: user.learningHistory.filter(c => c.status === 'in-progress').length,
        recentAssessments,
        coursesThisMonth
      },
      achievements: {
        totalAchievements: user.achievements.length,
        totalPoints: user.statistics.totalPoints,
        recentAchievements: user.achievements
          .filter(a => a.dateAchieved >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .length
      },
      skillProfile: {
        totalSkills: user.skills.length,
        skillLevels,
        averageScore: user.skills.length > 0 
          ? Math.round(user.skills.reduce((sum, s) => sum + (s.score || 0), 0) / user.skills.length)
          : 0
      },
      progression: {
        currentLevel: user.currentLevel,
        nextLevel: `NSQF Level ${Math.min(10, parseInt(user.currentLevel.match(/\d+/)[0]) + 1)}`
      }
    };
    
    res.json({
      analytics,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Get learner analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'Unable to retrieve dashboard analytics'
    });
  }
});

// Get trainer dashboard analytics
router.get('/dashboard/trainer', authenticateToken, authorizeRoles('trainer'), async (req, res) => {
  try {
    const trainerId = req.user._id;
    
    // Get courses created by trainer
    const trainerCourses = await Course.find({
      'metadata.createdBy': trainerId,
      isActive: true
    }).select('_id title enrollment quality');
    
    const courseIds = trainerCourses.map(c => c._id);
    
    // Get learner enrollments in trainer's courses
    const learnerEnrollments = await User.aggregate([
      {
        $match: {
          'learningHistory.courseId': { $in: courseIds }
        }
      },
      {
        $unwind: '$learningHistory'
      },
      {
        $match: {
          'learningHistory.courseId': { $in: courseIds }
        }
      },
      {
        $group: {
          _id: '$learningHistory.courseId',
          totalEnrollments: { $sum: 1 },
          completedEnrollments: {
            $sum: {
              $cond: [{ $eq: ['$learningHistory.status', 'completed'] }, 1, 0]
            }
          },
          inProgressEnrollments: {
            $sum: {
              $cond: [{ $eq: ['$learningHistory.status', 'in-progress'] }, 1, 0]
            }
          },
          averageProgress: { $avg: '$learningHistory.progress' },
          averageRating: { $avg: '$learningHistory.rating' }
        }
      }
    ]);
    
    // Calculate overall statistics
    const totalLearners = learnerEnrollments.reduce((sum, course) => sum + course.totalEnrollments, 0);
    const totalCompletions = learnerEnrollments.reduce((sum, course) => sum + course.completedEnrollments, 0);
    const overallCompletionRate = totalLearners > 0 ? Math.round((totalCompletions / totalLearners) * 100) : 0;
    
    const analytics = {
      courseMetrics: {
        totalCourses: trainerCourses.length,
        totalLearners,
        overallCompletionRate,
        averageRating: trainerCourses.length > 0 
          ? Math.round(trainerCourses.reduce((sum, c) => sum + (c.quality?.rating || 0), 0) / trainerCourses.length * 10) / 10
          : 0
      },
      learnerProgress: {
        totalEnrollments: totalLearners,
        completedCourses: totalCompletions,
        inProgressCourses: learnerEnrollments.reduce((sum, course) => sum + course.inProgressEnrollments, 0)
      },
      coursePerformance: trainerCourses.map(course => {
        const enrollment = learnerEnrollments.find(e => e._id.toString() === course._id.toString());
        return {
          courseId: course._id,
          title: course.title,
          enrollments: enrollment?.totalEnrollments || 0,
          completionRate: enrollment?.totalEnrollments > 0 
            ? Math.round((enrollment.completedEnrollments / enrollment.totalEnrollments) * 100)
            : 0,
          averageProgress: Math.round(enrollment?.averageProgress || 0),
          rating: course.quality?.rating || 0
        };
      })
    };
    
    res.json({
      analytics,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Get trainer analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch trainer analytics',
      message: 'Unable to retrieve trainer dashboard analytics'
    });
  }
});

// Get policy analytics (for policymakers and admins)
router.get('/dashboard/policy', authenticateToken, authorizeRoles('policymaker', 'admin'), async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '1year'; // 1month, 3months, 1year, all
    const state = req.query.state; // Filter by state
    
    let dateFilter = {};
    if (timeRange !== 'all') {
      const days = timeRange === '1month' ? 30 : timeRange === '3months' ? 90 : 365;
      dateFilter.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }
    
    // User demographics and distribution
    let userQuery = dateFilter;
    if (state) {
      userQuery['profile.state'] = state;
    }
    
    const userStats = await User.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          learners: {
            $sum: { $cond: [{ $eq: ['$role', 'learner'] }, 1, 0] }
          },
          trainers: {
            $sum: { $cond: [{ $eq: ['$role', 'trainer'] }, 1, 0] }
          },
          averageSkillsPerUser: { $avg: { $size: '$skills' } },
          averageCoursesCompleted: { $avg: '$statistics.totalCoursesCompleted' }
        }
      }
    ]);
    
    // State-wise distribution
    const stateDistribution = await User.aggregate([
      { $match: { role: 'learner', ...dateFilter } },
      {
        $group: {
          _id: '$profile.state',
          count: { $sum: 1 },
          averageCoursesCompleted: { $avg: '$statistics.totalCoursesCompleted' },
          averageStreak: { $avg: '$statistics.currentStreak' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Course statistics
    const courseStats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          verifiedCourses: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          totalEnrollments: { $sum: '$enrollment.currentEnrollment' },
          averageRating: { $avg: '$quality.rating' },
          averageCompletionRate: { $avg: '$quality.completionRate' }
        }
      }
    ]);
    
    // NSQF level progression
    const nsqfProgression = await User.aggregate([
      { $match: { role: 'learner' } },
      {
        $group: {
          _id: '$currentLevel',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Employment outcomes (based on completed courses and assessments)
    const employmentOutcomes = await User.aggregate([
      {
        $match: {
          role: 'learner',
          'profile.socioEconomic.employmentStatus': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$profile.socioEconomic.employmentStatus',
          count: { $sum: 1 },
          averageCoursesCompleted: { $avg: '$statistics.totalCoursesCompleted' }
        }
      }
    ]);
    
    // Skill demand analysis
    const skillDemandStats = await User.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills.name',
          learnerCount: { $sum: 1 },
          averageScore: { $avg: '$skills.score' }
        }
      },
      { $sort: { learnerCount: -1 } },
      { $limit: 20 }
    ]);
    
    // Assessment performance
    const assessmentStats = await AssessmentResult.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          averageScore: { $avg: '$scoring.percentage' },
          passRate: {
            $avg: { $cond: [{ $eq: ['$scoring.passed', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    const analytics = {
      overview: {
        totalUsers: userStats[0]?.totalUsers || 0,
        totalLearners: userStats[0]?.learners || 0,
        totalTrainers: userStats[0]?.trainers || 0,
        totalCourses: courseStats[0]?.totalCourses || 0,
        totalEnrollments: courseStats[0]?.totalEnrollments || 0,
        overallCompletionRate: Math.round(courseStats[0]?.averageCompletionRate || 0),
        averageAssessmentScore: Math.round(assessmentStats[0]?.averageScore || 0)
      },
      geographical: {
        stateDistribution,
        topStates: stateDistribution.slice(0, 5)
      },
      education: {
        nsqfProgression,
        skillDemand: skillDemandStats.slice(0, 10),
        employmentOutcomes
      },
      performance: {
        courseCompletionRate: Math.round(courseStats[0]?.averageCompletionRate || 0),
        assessmentPassRate: Math.round((assessmentStats[0]?.passRate || 0) * 100),
        averageCourseRating: Math.round((courseStats[0]?.averageRating || 0) * 10) / 10,
        learnerEngagement: {
          averageSkillsPerUser: Math.round(userStats[0]?.averageSkillsPerUser || 0),
          averageCoursesCompleted: Math.round(userStats[0]?.averageCoursesCompleted || 0)
        }
      },
      trends: {
        timeRange,
        filteredByState: state || null
      }
    };
    
    res.json({
      analytics,
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Get policy analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch policy analytics',
      message: 'Unable to retrieve policy dashboard analytics'
    });
  }
});

// Get skill gap analysis across regions
router.get('/skill-gaps/regional', authenticateToken, authorizeRoles('policymaker', 'admin'), async (req, res) => {
  try {
    const targetRole = req.query.targetRole;
    
    // Analyze skill gaps by state
    const skillGapsByState = await User.aggregate([
      {
        $match: {
          role: 'learner',
          'profile.state': { $exists: true, $ne: null }
        }
      },
      { $unwind: '$skills' },
      {
        $group: {
          _id: {
            state: '$profile.state',
            skill: '$skills.name',
            level: '$skills.level'
          },
          count: { $sum: 1 },
          averageScore: { $avg: '$skills.score' }
        }
      },
      {
        $group: {
          _id: '$_id.state',
          skillDistribution: {
            $push: {
              skill: '$_id.skill',
              level: '$_id.level',
              count: '$count',
              averageScore: '$averageScore'
            }
          },
          totalLearners: { $sum: '$count' }
        }
      },
      { $sort: { totalLearners: -1 } }
    ]);
    
    // Calculate skill gaps (skills that are underrepresented)
    const skillGapAnalysis = skillGapsByState.map(state => {
      const skillLevelCounts = {};
      
      state.skillDistribution.forEach(skill => {
        if (!skillLevelCounts[skill.skill]) {
          skillLevelCounts[skill.skill] = {
            beginner: 0,
            intermediate: 0,
            advanced: 0,
            expert: 0
          };
        }
        skillLevelCounts[skill.skill][skill.level] = skill.count;
      });
      
      // Identify skills with gaps (low advanced/expert levels)
      const skillGaps = Object.entries(skillLevelCounts).map(([skillName, levels]) => {
        const total = Object.values(levels).reduce((sum, count) => sum + count, 0);
        const advancedPercentage = total > 0 ? ((levels.advanced + levels.expert) / total) * 100 : 0;
        
        return {
          skill: skillName,
          levels,
          total,
          advancedPercentage: Math.round(advancedPercentage),
          hasGap: advancedPercentage < 30 // Less than 30% advanced/expert
        };
      });
      
      return {
        state: state._id,
        totalLearners: state.totalLearners,
        skillGaps: skillGaps.filter(sg => sg.hasGap).slice(0, 10),
        strengthAreas: skillGaps.filter(sg => !sg.hasGap).slice(0, 5)
      };
    });
    
    res.json({
      skillGapAnalysis,
      summary: {
        totalStates: skillGapsByState.length,
        targetRole: targetRole || 'All roles',
        analysisDate: new Date()
      }
    });
  } catch (error) {
    logger.error('Get regional skill gaps error:', error);
    res.status(500).json({
      error: 'Failed to analyze skill gaps',
      message: 'Unable to retrieve regional skill gap analysis'
    });
  }
});

// Get learning outcome trends
router.get('/outcomes/trends', authenticateToken, authorizeRoles('policymaker', 'admin'), async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Monthly completion trends
    const monthlyTrends = await User.aggregate([
      { $unwind: '$learningHistory' },
      {
        $match: {
          'learningHistory.completionDate': {
            $gte: startDate,
            $lte: endDate
          },
          'learningHistory.status': 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$learningHistory.completionDate' },
            month: { $month: '$learningHistory.completionDate' }
          },
          completions: { $sum: 1 },
          uniqueLearners: { $addToSet: '$_id' },
          averageRating: { $avg: '$learningHistory.rating' }
        }
      },
      {
        $addFields: {
          uniqueLearnersCount: { $size: '$uniqueLearners' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Assessment performance trends
    const assessmentTrends = await AssessmentResult.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAssessments: { $sum: 1 },
          averageScore: { $avg: '$scoring.percentage' },
          passRate: {
            $avg: { $cond: [{ $eq: ['$scoring.passed', true] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      trends: {
        courseCompletions: monthlyTrends,
        assessmentPerformance: assessmentTrends
      },
      period: {
        months,
        startDate,
        endDate
      },
      generatedAt: new Date()
    });
  } catch (error) {
    logger.error('Get outcome trends error:', error);
    res.status(500).json({
      error: 'Failed to fetch outcome trends',
      message: 'Unable to retrieve learning outcome trends'
    });
  }
});

module.exports = router;