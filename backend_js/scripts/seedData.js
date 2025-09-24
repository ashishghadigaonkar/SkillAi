#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const { Assessment } = require('../models/Assessment');

const logger = require('../utils/logger');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Sample skills data
const skillsData = [
  {
    name: 'Python Programming',
    description: 'Programming language used for web development, data science, automation, and more',
    category: 'technical',
    subcategory: 'programming',
    nsqfMapping: {
      minimumLevel: 'NSQF Level 4',
      maximumLevel: 'NSQF Level 8'
    },
    proficiencyLevels: [
      {
        level: 'beginner',
        description: 'Basic syntax and simple programs',
        criteria: ['Variables and data types', 'Control structures', 'Functions'],
        nsqfEquivalent: 'NSQF Level 4'
      },
      {
        level: 'intermediate',
        description: 'Object-oriented programming and libraries',
        criteria: ['OOP concepts', 'Working with libraries', 'File handling'],
        nsqfEquivalent: 'NSQF Level 5'
      },
      {
        level: 'advanced',
        description: 'Complex applications and frameworks',
        criteria: ['Web frameworks', 'Database integration', 'Testing'],
        nsqfEquivalent: 'NSQF Level 6'
      }
    ],
    jobRoles: [
      {
        title: 'Python Developer',
        industry: 'Technology',
        minimumRequiredLevel: 'intermediate',
        importance: 'critical'
      },
      {
        title: 'Data Scientist',
        industry: 'Technology',
        minimumRequiredLevel: 'intermediate',
        importance: 'critical'
      }
    ],
    marketData: {
      demandLevel: 'very-high',
      trendDirection: 'increasing',
      averageSalaryImpact: {
        percentage: 25,
        currency: 'INR'
      },
      regionalDemand: [
        { state: 'Karnataka', demandLevel: 'very-high', jobOpenings: 5000 },
        { state: 'Maharashtra', demandLevel: 'high', jobOpenings: 4500 }
      ]
    },
    tags: ['programming', 'python', 'development', 'data-science'],
    isActive: true,
    isVerified: true
  },
  {
    name: 'Data Analysis',
    description: 'Extracting insights from data using statistical methods and tools',
    category: 'technical',
    subcategory: 'data-science',
    nsqfMapping: {
      minimumLevel: 'NSQF Level 4',
      maximumLevel: 'NSQF Level 7'
    },
    proficiencyLevels: [
      {
        level: 'beginner',
        description: 'Basic data manipulation and visualization',
        criteria: ['Excel proficiency', 'Basic statistics', 'Chart creation'],
        nsqfEquivalent: 'NSQF Level 4'
      },
      {
        level: 'intermediate',
        description: 'Advanced analysis and reporting',
        criteria: ['SQL queries', 'Statistical analysis', 'Dashboard creation'],
        nsqfEquivalent: 'NSQF Level 5'
      }
    ],
    jobRoles: [
      {
        title: 'Data Analyst',
        industry: 'Technology',
        minimumRequiredLevel: 'intermediate',
        importance: 'critical'
      }
    ],
    marketData: {
      demandLevel: 'high',
      trendDirection: 'increasing',
      averageSalaryImpact: {
        percentage: 20,
        currency: 'INR'
      }
    },
    tags: ['data', 'analysis', 'statistics', 'excel'],
    isActive: true,
    isVerified: true
  },
  {
    name: 'Communication Skills',
    description: 'Effective verbal and written communication in professional settings',
    category: 'soft-skill',
    subcategory: 'interpersonal',
    nsqfMapping: {
      minimumLevel: 'NSQF Level 1',
      maximumLevel: 'NSQF Level 10'
    },
    proficiencyLevels: [
      {
        level: 'beginner',
        description: 'Basic communication abilities',
        criteria: ['Clear speaking', 'Active listening', 'Basic writing'],
        nsqfEquivalent: 'NSQF Level 3'
      },
      {
        level: 'intermediate',
        description: 'Professional communication',
        criteria: ['Presentation skills', 'Business writing', 'Team collaboration'],
        nsqfEquivalent: 'NSQF Level 5'
      }
    ],
    jobRoles: [
      {
        title: 'Team Lead',
        industry: 'All',
        minimumRequiredLevel: 'intermediate',
        importance: 'important'
      }
    ],
    marketData: {
      demandLevel: 'high',
      trendDirection: 'stable'
    },
    tags: ['soft-skills', 'communication', 'leadership'],
    isActive: true,
    isVerified: true
  }
];

// Sample courses data
const coursesData = [
  {
    title: 'Python Programming Fundamentals',
    description: 'Learn Python programming from basics to intermediate level with hands-on projects',
    shortDescription: 'Master Python programming fundamentals with practical exercises',
    category: 'technology',
    subcategory: 'programming',
    nsqfLevel: 'NSQF Level 4',
    provider: {
      name: 'Skill India Digital',
      type: 'government',
      accreditation: {
        body: 'NSDC',
        certificateNumber: 'SID001',
        validTill: new Date('2025-12-31')
      },
      contact: {
        email: 'contact@skillindia.gov.in',
        website: 'https://skillindia.gov.in'
      }
    },
    structure: {
      duration: {
        hours: 120,
        weeks: 8
      },
      format: 'hybrid',
      languages: ['english', 'hindi'],
      modules: [
        {
          title: 'Python Basics',
          description: 'Variables, data types, and basic operations',
          duration: 20,
          order: 1,
          topics: ['Variables', 'Data Types', 'Operators', 'Input/Output'],
          assessmentRequired: true
        },
        {
          title: 'Control Structures',
          description: 'Conditional statements and loops',
          duration: 25,
          order: 2,
          topics: ['If-else statements', 'Loops', 'Break and Continue'],
          assessmentRequired: true
        },
        {
          title: 'Functions and Modules',
          description: 'Creating reusable code with functions',
          duration: 30,
          order: 3,
          topics: ['Function definition', 'Parameters', 'Modules', 'Packages'],
          assessmentRequired: true
        }
      ],
      prerequisites: [
        {
          skillName: 'Basic Computer Skills',
          minimumLevel: 'beginner',
          mandatory: true
        }
      ]
    },
    learning: {
      objectives: [
        'Understand Python syntax and structure',
        'Write basic Python programs',
        'Use Python for problem-solving'
      ],
      outcomes: [
        'Can write Python programs independently',
        'Understands object-oriented programming basics',
        'Ready for advanced Python concepts'
      ],
      skillsAcquired: [
        {
          skillName: 'Python Programming',
          proficiencyLevel: 'intermediate'
        }
      ]
    },
    enrollment: {
      capacity: 100,
      currentEnrollment: 45,
      eligibility: {
        minAge: 16,
        maxAge: 60,
        education: ['10th Pass', '12th Pass', 'Graduate'],
        experience: 'No prior programming experience required'
      },
      fees: {
        amount: 5000,
        currency: 'INR',
        subsidyAvailable: true,
        subsidyPercentage: 80
      },
      schedule: {
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-03-30'),
        batchSize: 25,
        timings: 'Weekdays 6-8 PM'
      }
    },
    quality: {
      rating: 4.6,
      totalReviews: 234,
      completionRate: 78,
      employmentRate: 65,
      industryRelevance: 92
    },
    marketRelevance: {
      demandScore: 95,
      trendingStatus: 'rising',
      jobRoles: ['Python Developer', 'Software Engineer', 'Data Analyst'],
      averageSalary: {
        min: 400000,
        max: 800000,
        currency: 'INR'
      },
      geographicalDemand: [
        { state: 'Karnataka', demandLevel: 'very-high' },
        { state: 'Maharashtra', demandLevel: 'high' }
      ]
    },
    tags: ['python', 'programming', 'beginner-friendly', 'government-certified'],
    isActive: true,
    isVerified: true
  },
  {
    title: 'Data Analysis with Excel and SQL',
    description: 'Comprehensive course on data analysis using Excel and SQL for business insights',
    shortDescription: 'Learn data analysis using Excel and SQL',
    category: 'technology',
    subcategory: 'data-analysis',
    nsqfLevel: 'NSQF Level 4',
    provider: {
      name: 'TechSkill Academy',
      type: 'private',
      accreditation: {
        body: 'NASSCOM',
        certificateNumber: 'TSA002'
      }
    },
    structure: {
      duration: {
        hours: 80,
        weeks: 6
      },
      format: 'online',
      languages: ['english'],
      modules: [
        {
          title: 'Excel for Data Analysis',
          description: 'Advanced Excel functions and pivot tables',
          duration: 30,
          order: 1,
          topics: ['Advanced Formulas', 'Pivot Tables', 'Charts and Graphs'],
          assessmentRequired: true
        },
        {
          title: 'SQL Fundamentals',
          description: 'Database querying with SQL',
          duration: 35,
          order: 2,
          topics: ['SELECT queries', 'JOINs', 'Aggregations', 'Subqueries'],
          assessmentRequired: true
        }
      ]
    },
    learning: {
      objectives: [
        'Master Excel for data analysis',
        'Write efficient SQL queries',
        'Create meaningful data visualizations'
      ],
      skillsAcquired: [
        {
          skillName: 'Data Analysis',
          proficiencyLevel: 'intermediate'
        },
        {
          skillName: 'SQL',
          proficiencyLevel: 'beginner'
        }
      ]
    },
    enrollment: {
      capacity: 150,
      currentEnrollment: 89,
      fees: {
        amount: 8000,
        currency: 'INR'
      }
    },
    quality: {
      rating: 4.3,
      totalReviews: 167,
      completionRate: 82,
      employmentRate: 71
    },
    marketRelevance: {
      demandScore: 88,
      trendingStatus: 'stable',
      jobRoles: ['Data Analyst', 'Business Analyst', 'Research Analyst']
    },
    tags: ['data-analysis', 'excel', 'sql', 'business-intelligence'],
    isActive: true,
    isVerified: true
  }
];

// Sample assessments data
const assessmentsData = [
  {
    title: 'Python Programming Skills Assessment',
    description: 'Evaluate your Python programming knowledge from basic to intermediate level',
    type: 'skill-assessment',
    category: 'technical',
    targetSkills: [
      {
        skillName: 'Python Programming',
        weightage: 100
      }
    ],
    nsqfLevel: 'NSQF Level 4',
    difficulty: 'medium',
    duration: 45,
    questions: [
      {
        id: 'py_001',
        questionText: 'What is the output of the following Python code?\n\nprint(type(5/2))',
        questionType: 'single-choice',
        options: [
          { id: 'a', text: '<class \'int\'>', isCorrect: false },
          { id: 'b', text: '<class \'float\'>', isCorrect: true },
          { id: 'c', text: '<class \'str\'>', isCorrect: false },
          { id: 'd', text: 'Error', isCorrect: false }
        ],
        points: 5,
        difficulty: 'easy',
        skill: 'Python Programming',
        explanation: 'In Python 3, the / operator performs floating-point division, so 5/2 returns 2.5, which is a float.',
        tags: ['python', 'operators', 'data-types']
      },
      {
        id: 'py_002',
        questionText: 'Which of the following is the correct way to define a function in Python?',
        questionType: 'single-choice',
        options: [
          { id: 'a', text: 'function myFunc():', isCorrect: false },
          { id: 'b', text: 'def myFunc():', isCorrect: true },
          { id: 'c', text: 'define myFunc():', isCorrect: false },
          { id: 'd', text: 'func myFunc():', isCorrect: false }
        ],
        points: 3,
        difficulty: 'easy',
        skill: 'Python Programming',
        explanation: 'Functions in Python are defined using the \'def\' keyword.',
        tags: ['python', 'functions', 'syntax']
      },
      {
        id: 'py_003',
        questionText: 'What will be the output of the following code?\n\nlist1 = [1, 2, 3]\nlist2 = list1\nlist2.append(4)\nprint(list1)',
        questionType: 'single-choice',
        options: [
          { id: 'a', text: '[1, 2, 3]', isCorrect: false },
          { id: 'b', text: '[1, 2, 3, 4]', isCorrect: true },
          { id: 'c', text: 'Error', isCorrect: false },
          { id: 'd', text: '[4]', isCorrect: false }
        ],
        points: 8,
        difficulty: 'medium',
        skill: 'Python Programming',
        explanation: 'list2 = list1 creates a reference, not a copy. Both variables point to the same list object.',
        tags: ['python', 'lists', 'references']
      }
    ],
    scoring: {
      totalPoints: 16,
      passingScore: 60,
      gradingScale: [
        { grade: 'A', minPercentage: 90, maxPercentage: 100, description: 'Excellent' },
        { grade: 'B', minPercentage: 80, maxPercentage: 89, description: 'Good' },
        { grade: 'C', minPercentage: 70, maxPercentage: 79, description: 'Satisfactory' },
        { grade: 'D', minPercentage: 60, maxPercentage: 69, description: 'Needs Improvement' },
        { grade: 'F', minPercentage: 0, maxPercentage: 59, description: 'Fail' }
      ]
    },
    accessControl: {
      isPublic: true,
      allowedRoles: ['learner'],
      maxAttempts: 3,
      retakePolicy: {
        cooldownPeriod: 24,
        allowUnlimitedRetakes: false
      }
    },
    analytics: {
      totalAttempts: 156,
      averageScore: 72.5,
      completionRate: 89.1,
      averageTimeSpent: 32
    },
    isActive: true,
    isVerified: true
  }
];

// Sample users data
const usersData = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 9876543210',
    password: 'password123',
    role: 'learner',
    profile: {
      language: 'english',
      state: 'Karnataka',
      dateOfBirth: new Date('1995-06-15'),
      gender: 'female',
      education: {
        qualification: 'Bachelor of Engineering',
        institution: 'Bangalore University',
        yearOfCompletion: 2017,
        percentage: 75
      },
      socioEconomic: {
        category: 'general',
        annualIncome: '3-5lakh',
        employmentStatus: 'employed'
      },
      aspirations: {
        targetRole: 'Data Scientist',
        targetIndustry: 'technology',
        targetSalary: '8-12lakh',
        timeframe: '2years',
        preferredLearningMode: 'hybrid',
        availableHoursPerWeek: 15
      }
    },
    currentLevel: 'NSQF Level 4',
    skills: [
      {
        name: 'Python Programming',
        level: 'beginner',
        score: 65,
        lastAssessed: new Date()
      },
      {
        name: 'Data Analysis',
        level: 'beginner',
        score: 58,
        lastAssessed: new Date()
      },
      {
        name: 'Communication Skills',
        level: 'intermediate',
        score: 78,
        lastAssessed: new Date()
      }
    ],
    learningHistory: [],
    achievements: [
      {
        type: 'milestone',
        title: 'First Course Enrollment',
        description: 'Enrolled in your first course',
        dateAchieved: new Date(),
        points: 50,
        icon: 'graduation-cap',
        visible: true
      }
    ],
    statistics: {
      totalCoursesCompleted: 0,
      totalHoursLearned: 0,
      currentStreak: 5,
      longestStreak: 12,
      totalPoints: 50,
      lastActivity: new Date()
    },
    isActive: true,
    isVerified: true
  },
  {
    name: 'Dr. Anjali Gupta',
    email: 'anjali.gupta@example.com',
    phone: '+91 9876543211',
    password: 'trainer123',
    role: 'trainer',
    profile: {
      language: 'english',
      state: 'Maharashtra',
      education: {
        qualification: 'PhD in Computer Science',
        institution: 'IIT Mumbai',
        yearOfCompletion: 2010
      }
    },
    currentLevel: 'NSQF Level 8',
    isActive: true,
    isVerified: true
  },
  {
    name: 'Mr. Rajesh Kumar',
    email: 'rajesh.kumar@gov.in',
    phone: '+91 9876543212',
    password: 'policy123',
    role: 'policymaker',
    profile: {
      language: 'english',
      state: 'Delhi',
      education: {
        qualification: 'Master in Public Administration',
        institution: 'JNU Delhi',
        yearOfCompletion: 2005
      }
    },
    currentLevel: 'NSQF Level 9',
    isActive: true,
    isVerified: true
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Skill.deleteMany({}),
      Assessment.deleteMany({})
    ]);
    console.log('Cleared existing data');
    
    // Insert skills first (needed for references)
    const skills = await Skill.insertMany(skillsData);
    console.log(`Inserted ${skills.length} skills`);
    
    // Update courses with skill references
    const updatedCoursesData = coursesData.map(course => ({
      ...course,
      learning: {
        ...course.learning,
        skillsAcquired: course.learning.skillsAcquired.map(skillAcq => ({
          ...skillAcq,
          skillId: skills.find(s => s.name === skillAcq.skillName)?._id
        }))
      }
    }));
    
    // Insert courses
    const courses = await Course.insertMany(updatedCoursesData);
    console.log(`Inserted ${courses.length} courses`);
    
    // Update assessments with skill references
    const updatedAssessmentsData = assessmentsData.map(assessment => ({
      ...assessment,
      targetSkills: assessment.targetSkills.map(targetSkill => ({
        ...targetSkill,
        skillId: skills.find(s => s.name === targetSkill.skillName)?._id
      }))
    }));
    
    // Insert assessments
    const assessments = await Assessment.insertMany(updatedAssessmentsData);
    console.log(`Inserted ${assessments.length} assessments`);
    
    // Hash passwords and insert users
    console.log('Preparing users with hashed passwords...');
    const usersWithHashedPasswords = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
        skills: user.skills ? user.skills.map(userSkill => ({
          ...userSkill,
          skillId: skills.find(s => s.name === userSkill.name)?._id
        })) : []
      }))
    );
    
    console.log('Inserting users...');
    const users = await User.insertMany(usersWithHashedPasswords);
    console.log(`Inserted ${users.length} users`);
    
    console.log('Database seeding completed successfully!');
    console.log('\nTest Users Created:');
    console.log('1. Learner: priya.sharma@example.com / password123');
    console.log('2. Trainer: anjali.gupta@example.com / trainer123');
    console.log('3. Policymaker: rajesh.kumar@gov.in / policy123');
    
    // Update course metadata with creator references
    await Promise.all(
      courses.map(async (course, index) => {
        const trainer = users.find(u => u.role === 'trainer');
        if (trainer) {
          course.metadata.createdBy = trainer._id;
          await course.save();
        }
      })
    );
    
    console.log('Database seeding completed successfully!');
    console.log('\nTest Users Created:');
    console.log('1. Learner: priya.sharma@example.com / password123');
    console.log('2. Trainer: anjali.gupta@example.com / trainer123');
    console.log('3. Policymaker: rajesh.kumar@gov.in / policy123');
    
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

// Run seeding
async function main() {
  try {
    await connectDB();
    await seedDatabase();
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedDatabase };