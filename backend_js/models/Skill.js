const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => require('uuid').v4()
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'soft-skill', 'domain-specific', 'language', 'certification', 'tool']
  },
  subcategory: {
    type: String,
    required: true
  },
  nsqfMapping: {
    minimumLevel: {
      type: String,
      enum: ['NSQF Level 1', 'NSQF Level 2', 'NSQF Level 3', 'NSQF Level 4', 
             'NSQF Level 5', 'NSQF Level 6', 'NSQF Level 7', 'NSQF Level 8', 
             'NSQF Level 9', 'NSQF Level 10']
    },
    maximumLevel: {
      type: String,
      enum: ['NSQF Level 1', 'NSQF Level 2', 'NSQF Level 3', 'NSQF Level 4', 
             'NSQF Level 5', 'NSQF Level 6', 'NSQF Level 7', 'NSQF Level 8', 
             'NSQF Level 9', 'NSQF Level 10']
    }
  },
  proficiencyLevels: [{
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    description: String,
    criteria: [String],
    nsqfEquivalent: String
  }],
  prerequisites: [{
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    skillName: String,
    minimumLevel: String
  }],
  relatedSkills: [{
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    skillName: String,
    relationship: {
      type: String,
      enum: ['complementary', 'prerequisite', 'alternative', 'advanced']
    },
    strength: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  jobRoles: [{
    title: String,
    industry: String,
    minimumRequiredLevel: String,
    importance: {
      type: String,
      enum: ['critical', 'important', 'good-to-have']
    }
  }],
  courses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseName: String,
    expectedProficiency: String,
    isCore: Boolean
  }],
  assessmentMethods: [{
    type: {
      type: String,
      enum: ['multiple-choice', 'practical', 'portfolio', 'interview', 'project', 'certification-exam']
    },
    description: String,
    duration: Number, // in minutes
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    }
  }],
  marketData: {
    demandLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'very-high'],
      default: 'medium'
    },
    trendDirection: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    },
    averageSalaryImpact: {
      percentage: Number, // how much this skill increases salary
      currency: {
        type: String,
        default: 'INR'
      }
    },
    regionalDemand: [{
      state: String,
      demandLevel: String,
      jobOpenings: Number
    }],
    industryRelevance: [{
      industry: String,
      relevanceScore: {
        type: Number,
        min: 0,
        max: 100
      }
    }]
  },
  validationCriteria: [{
    type: {
      type: String,
      enum: ['certification', 'experience', 'project', 'endorsement']
    },
    description: String,
    acceptedProviders: [String]
  }],
  tags: [String],
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
    lastUpdated: Date,
    version: {
      type: Number,
      default: 1
    },
    sources: [String] // Where the skill data came from
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
skillSchema.index({ name: 'text', description: 'text' });
skillSchema.index({ category: 1, subcategory: 1 });
skillSchema.index({ 'marketData.demandLevel': 1 });
skillSchema.index({ 'nsqfMapping.minimumLevel': 1 });
skillSchema.index({ tags: 1 });

// Virtual for skill popularity
skillSchema.virtual('popularity').get(function() {
  return this.courses?.length || 0;
});

module.exports = mongoose.model('Skill', skillSchema);