const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  targetIndustry: {
    type: String,
    required: true
  },
  currentLevel: {
    type: String,
    enum: ['NSQF Level 1', 'NSQF Level 2', 'NSQF Level 3', 'NSQF Level 4', 
           'NSQF Level 5', 'NSQF Level 6', 'NSQF Level 7', 'NSQF Level 8', 
           'NSQF Level 9', 'NSQF Level 10'],
    required: true
  },
  targetLevel: {
    type: String,
    enum: ['NSQF Level 1', 'NSQF Level 2', 'NSQF Level 3', 'NSQF Level 4', 
           'NSQF Level 5', 'NSQF Level 6', 'NSQF Level 7', 'NSQF Level 8', 
           'NSQF Level 9', 'NSQF Level 10'],
    required: true
  },
  timeframe: {
    planned: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    expectedEndDate: {
      type: Date,
      required: true
    },
    actualEndDate: Date
  },
  phases: [{
    phaseNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: {
      weeks: Number,
      months: Number
    },
    nsqfLevel: String,
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'skipped', 'blocked'],
      default: 'not-started'
    },
    startDate: Date,
    endDate: Date,
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    courses: [{
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      courseName: String,
      provider: String,
      duration: String,
      status: {
        type: String,
        enum: ['pending', 'enrolled', 'in-progress', 'completed', 'dropped'],
        default: 'pending'
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      prerequisites: [String],
      estimatedCompletion: Date,
      actualCompletion: Date
    }],
    skills: [{
      skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
      },
      skillName: String,
      currentLevel: String,
      targetLevel: String,
      priority: String
    }],
    assessments: [{
      assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
      },
      assessmentName: String,
      type: String,
      scheduledDate: Date,
      completedDate: Date,
      score: Number,
      status: String
    }],
    milestones: [{
      title: String,
      description: String,
      targetDate: Date,
      achievedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'achieved', 'missed', 'rescheduled'],
        default: 'pending'
      }
    }]
  }],
  careerProgression: [{
    phase: Number,
    expectedRole: String,
    expectedSalary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    skillsRequired: [String],
    marketReadiness: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  adaptiveElements: {
    aiGenerated: {
      type: Boolean,
      default: true
    },
    lastAiUpdate: Date,
    adaptationReason: String,
    marketDataInfluence: {
      jobDemand: Number,
      salaryTrends: Number,
      skillRelevance: Number
    },
    personalFactors: {
      learningPace: String,
      availableTime: Number,
      preferredFormat: String
    }
  },
  progress: {
    overallCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    currentPhase: {
      type: Number,
      default: 1
    },
    coursesCompleted: {
      type: Number,
      default: 0
    },
    coursesInProgress: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    skillsAcquired: {
      type: Number,
      default: 0
    },
    certificationsEarned: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    }, // in hours
    streakDays: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['course', 'skill', 'assessment', 'career-change', 'timeline-adjustment']
    },
    title: String,
    description: String,
    reasoning: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    actionRequired: String,
    estimatedImpact: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['new', 'viewed', 'accepted', 'rejected', 'implemented'],
      default: 'new'
    }
  }],
  marketAlignment: {
    industryRelevance: {
      type: Number,
      min: 0,
      max: 100
    },
    jobMarketDemand: {
      type: Number,
      min: 0,
      max: 100
    },
    salaryExpectation: {
      realistic: Boolean,
      marketRate: {
        min: Number,
        max: Number
      }
    },
    geographicalFactors: {
      targetLocation: String,
      demandInLocation: String,
      migrationRequired: Boolean
    },
    lastMarketUpdate: Date
  },
  feedback: [{
    source: {
      type: String,
      enum: ['user', 'trainer', 'ai', 'peer', 'industry-expert']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    suggestions: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    generatedBy: {
      type: String,
      enum: ['ai', 'trainer', 'self', 'template']
    },
    template: String,
    version: {
      type: Number,
      default: 1
    },
    lastUpdated: Date,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
roadmapSchema.index({ userId: 1 });
roadmapSchema.index({ targetRole: 1, targetIndustry: 1 });
roadmapSchema.index({ currentLevel: 1, targetLevel: 1 });
roadmapSchema.index({ 'progress.overallCompletion': -1 });
roadmapSchema.index({ isActive: 1, isPublic: 1 });

// Virtual for estimated completion
roadmapSchema.virtual('estimatedCompletion').get(function() {
  if (this.progress.overallCompletion === 0) return null;
  const daysElapsed = Math.floor((Date.now() - this.timeframe.startDate) / (1000 * 60 * 60 * 24));
  const estimatedTotalDays = daysElapsed / (this.progress.overallCompletion / 100);
  return new Date(this.timeframe.startDate.getTime() + estimatedTotalDays * 24 * 60 * 60 * 1000);
});

// Virtual for days remaining
roadmapSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = this.timeframe.expectedEndDate;
  return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
});

// Method to update progress
roadmapSchema.methods.updateProgress = function() {
  let totalCourses = 0;
  let completedCourses = 0;
  let inProgressCourses = 0;
  
  this.phases.forEach(phase => {
    totalCourses += phase.courses.length;
    phase.courses.forEach(course => {
      if (course.status === 'completed') completedCourses++;
      if (course.status === 'in-progress') inProgressCourses++;
    });
  });
  
  this.progress.totalCourses = totalCourses;
  this.progress.coursesCompleted = completedCourses;
  this.progress.coursesInProgress = inProgressCourses;
  this.progress.overallCompletion = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  this.progress.lastActivity = new Date();
  
  return this.save();
};

module.exports = mongoose.model('Roadmap', roadmapSchema);