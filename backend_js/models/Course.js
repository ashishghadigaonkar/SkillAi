const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
  shortDescription: {
    type: String,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'healthcare', 'finance', 'manufacturing', 'agriculture', 
           'hospitality', 'retail', 'education', 'government', 'other']
  },
  subcategory: {
    type: String,
    required: true
  },
  nsqfLevel: {
    type: String,
    required: true,
    enum: ['NSQF Level 1', 'NSQF Level 2', 'NSQF Level 3', 'NSQF Level 4', 
           'NSQF Level 5', 'NSQF Level 6', 'NSQF Level 7', 'NSQF Level 8', 
           'NSQF Level 9', 'NSQF Level 10']
  },
  provider: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['government', 'private', 'ngo', 'international'],
      required: true
    },
    accreditation: {
      body: String,
      certificateNumber: String,
      validTill: Date
    },
    contact: {
      email: String,
      phone: String,
      website: String
    }
  },
  structure: {
    duration: {
      hours: {
        type: Number,
        required: true
      },
      weeks: {
        type: Number,
        required: true
      }
    },
    format: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true
    },
    languages: [{
      type: String,
      enum: ['english', 'hindi', 'tamil', 'bengali', 'telugu', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi', 'urdu']
    }],
    modules: [{
      title: String,
      description: String,
      duration: Number, // in hours
      order: Number,
      topics: [String],
      assessmentRequired: {
        type: Boolean,
        default: false
      }
    }],
    prerequisites: [{
      skillName: String,
      minimumLevel: String,
      mandatory: {
        type: Boolean,
        default: false
      }
    }]
  },
  learning: {
    objectives: [String],
    outcomes: [String],
    skillsAcquired: [{
      skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
      },
      skillName: String,
      proficiencyLevel: String
    }],
    assessmentMethods: [{
      type: {
        type: String,
        enum: ['quiz', 'assignment', 'project', 'practical', 'viva', 'external-exam']
      },
      weightage: Number, // percentage
      description: String
    }],
    resources: [{
      type: {
        type: String,
        enum: ['video', 'document', 'interactive', 'external-link', 'book']
      },
      title: String,
      url: String,
      description: String,
      mandatory: Boolean
    }]
  },
  enrollment: {
    capacity: {
      type: Number,
      default: 100
    },
    currentEnrollment: {
      type: Number,
      default: 0
    },
    eligibility: {
      minAge: Number,
      maxAge: Number,
      education: [String],
      experience: String
    },
    fees: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      subsidyAvailable: {
        type: Boolean,
        default: false
      },
      subsidyPercentage: Number
    },
    schedule: {
      startDate: Date,
      endDate: Date,
      batchSize: Number,
      timings: String
    }
  },
  certification: {
    available: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      enum: ['completion', 'competency', 'government-recognized', 'industry-recognized']
    },
    issuingBody: String,
    validityPeriod: Number, // in years
    renewalRequired: {
      type: Boolean,
      default: false
    }
  },
  quality: {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    employmentRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    industryRelevance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  marketRelevance: {
    demandScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    trendingStatus: {
      type: String,
      enum: ['rising', 'stable', 'declining'],
      default: 'stable'
    },
    jobRoles: [String],
    averageSalary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    geographicalDemand: [{
      state: String,
      demandLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'very-high']
      }
    }]
  },
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
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdated: Date,
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, subcategory: 1 });
courseSchema.index({ nsqfLevel: 1 });
courseSchema.index({ 'provider.type': 1 });
courseSchema.index({ 'structure.format': 1 });
courseSchema.index({ 'marketRelevance.demandScore': -1 });
courseSchema.index({ 'quality.rating': -1 });

// Virtual for available slots
courseSchema.virtual('availableSlots').get(function() {
  return this.enrollment.capacity - this.enrollment.currentEnrollment;
});

// Virtual for course URL slug
courseSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
});

module.exports = mongoose.model('Course', courseSchema);