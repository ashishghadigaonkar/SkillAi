const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
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
  type: {
    type: String,
    required: true,
    enum: ['skill-assessment', 'course-quiz', 'certification-exam', 'placement-test', 'diagnostic']
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'soft-skills', 'domain-knowledge', 'language', 'aptitude']
  },
  targetSkills: [{
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    skillName: String,
    weightage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  nsqfLevel: {
    type: String,
    enum: ['NSQF Level 1', 'NSQF Level 2', 'NSQF Level 3', 'NSQF Level 4', 
           'NSQF Level 5', 'NSQF Level 6', 'NSQF Level 7', 'NSQF Level 8', 
           'NSQF Level 9', 'NSQF Level 10']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  questions: [{
    id: {
      type: String,
      default: () => require('uuid').v4()
    },
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'single-choice', 'true-false', 'fill-blank', 'essay', 'coding', 'practical'],
      required: true
    },
    options: [{
      id: String,
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // For non-MCQ questions
    points: {
      type: Number,
      default: 1
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    skill: String,
    explanation: String,
    hints: [String],
    tags: [String],
    multimedia: {
      images: [String],
      videos: [String],
      audio: [String]
    }
  }],
  scoring: {
    totalPoints: {
      type: Number,
      required: true
    },
    passingScore: {
      type: Number,
      required: true
    },
    gradingScale: [{
      grade: String,
      minPercentage: Number,
      maxPercentage: Number,
      description: String
    }]
  },
  adaptiveSettings: {
    isAdaptive: {
      type: Boolean,
      default: false
    },
    questionPool: {
      easy: Number,
      medium: Number,
      hard: Number
    },
    adaptationRules: [{
      condition: String,
      action: String
    }]
  },
  accessControl: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowedRoles: [{
      type: String,
      enum: ['learner', 'trainer', 'policymaker', 'admin']
    }],
    prerequisiteAssessments: [{
      assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
      },
      minimumScore: Number
    }],
    maxAttempts: {
      type: Number,
      default: 3
    },
    retakePolicy: {
      cooldownPeriod: Number, // in hours
      allowUnlimitedRetakes: {
        type: Boolean,
        default: false
      }
    }
  },
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    },
    difficultyAnalysis: {
      questionDifficulty: [{
        questionId: String,
        averageScore: Number,
        responseTime: Number
      }]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
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

// Assessment Result Schema (separate collection for attempt tracking)
const assessmentResultSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  timeSpent: Number, // in seconds
  status: {
    type: String,
    enum: ['started', 'in-progress', 'completed', 'abandoned', 'expired'],
    default: 'started'
  },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    timeSpent: Number,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  scoring: {
    totalPoints: Number,
    earnedPoints: Number,
    percentage: Number,
    grade: String,
    passed: Boolean
  },
  skillAnalysis: [{
    skillName: String,
    questionsAnswered: Number,
    correctAnswers: Number,
    skillScore: Number,
    proficiencyLevel: String
  }],
  recommendations: [{
    type: String,
    message: String,
    resources: [String]
  }],
  feedback: {
    strengths: [String],
    improvements: [String],
    nextSteps: [String]
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
assessmentSchema.index({ type: 1, category: 1 });
assessmentSchema.index({ nsqfLevel: 1 });
assessmentSchema.index({ difficulty: 1 });
assessmentSchema.index({ 'accessControl.isPublic': 1 });

assessmentResultSchema.index({ assessmentId: 1, userId: 1 });
assessmentResultSchema.index({ userId: 1, status: 1 });
assessmentResultSchema.index({ 'scoring.percentage': -1 });

// Virtual for pass rate
assessmentSchema.virtual('passRate').get(function() {
  if (this.analytics.totalAttempts === 0) return 0;
  return (this.analytics.completionRate * 100).toFixed(1);
});

const Assessment = mongoose.model('Assessment', assessmentSchema);
const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);

module.exports = { Assessment, AssessmentResult };