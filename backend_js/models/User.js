const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['learner', 'trainer', 'policymaker', 'admin'],
    default: 'learner'
  },
  profile: {
    language: {
      type: String,
      default: 'english',
      enum: ['english', 'hindi', 'tamil', 'bengali', 'telugu', 'marathi']
    },
    state: {
      type: String,
      required: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    education: {
      qualification: String,
      institution: String,
      yearOfCompletion: Number,
      percentage: Number
    },
    socioEconomic: {
      category: {
        type: String,
        enum: ['general', 'obc', 'sc', 'st', 'ews']
      },
      annualIncome: {
        type: String,
        enum: ['below-1lakh', '1-3lakh', '3-5lakh', '5-10lakh', 'above-10lakh']
      },
      employmentStatus: {
        type: String,
        enum: ['student', 'employed', 'unemployed', 'self-employed', 'retired']
      }
    },
    aspirations: {
      targetRole: String,
      targetIndustry: String,
      targetSalary: String,
      timeframe: String,
      preferredLearningMode: {
        type: String,
        enum: ['online', 'offline', 'hybrid']
      },
      availableHoursPerWeek: Number
    }
  },
  currentLevel: {
    type: String,
    enum: ['NSQF Level 1', 'NSQF Level 2', 'NSQF Level 3', 'NSQF Level 4', 
           'NSQF Level 5', 'NSQF Level 6', 'NSQF Level 7', 'NSQF Level 8', 
           'NSQF Level 9', 'NSQF Level 10'],
    default: 'NSQF Level 1'
  },
  skills: [{
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    lastAssessed: Date,
    certifications: [{
      name: String,
      issuer: String,
      dateObtained: Date,
      credentialId: String,
      verified: {
        type: Boolean,
        default: false
      }
    }]
  }],
  learningHistory: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseName: String,
    status: {
      type: String,
      enum: ['enrolled', 'in-progress', 'completed', 'dropped']
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    startDate: Date,
    completionDate: Date,
    certificateIssued: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }],
  achievements: [{
    type: {
      type: String,
      enum: ['certification', 'milestone', 'badge', 'streak', 'completion']
    },
    title: String,
    description: String,
    dateAchieved: Date,
    points: {
      type: Number,
      default: 0
    },
    icon: String,
    visible: {
      type: Boolean,
      default: true
    }
  }],
  statistics: {
    totalCoursesCompleted: {
      type: Number,
      default: 0
    },
    totalHoursLearned: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly', 'monthly'],
        default: 'daily'
      }
    },
    privacy: {
      shareProgress: {
        type: Boolean,
        default: false
      },
      shareAchievements: {
        type: Boolean,
        default: true
      },
      allowAnalytics: {
        type: Boolean,
        default: true
      }
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
  lastLogin: Date,
  refreshToken: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.state': 1 });
userSchema.index({ currentLevel: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

module.exports = mongoose.model('User', userSchema);