const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['learner', 'trainer', 'policymaker'])
    .withMessage('Role must be learner, trainer, or policymaker'),
  
  body('profile.language')
    .optional()
    .isIn(['english', 'hindi', 'tamil', 'bengali', 'telugu', 'marathi'])
    .withMessage('Invalid language selection'),
  
  body('profile.state')
    .trim()
    .isLength({ min: 2 })
    .withMessage('State is required'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('profile.language')
    .optional()
    .isIn(['english', 'hindi', 'tamil', 'bengali', 'telugu', 'marathi'])
    .withMessage('Invalid language selection'),
  
  handleValidationErrors
];

// Course validation rules
const validateCourseCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Course title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Course description must be at least 20 characters'),
  
  body('category')
    .isIn(['technology', 'healthcare', 'finance', 'manufacturing', 'agriculture', 'hospitality', 'retail', 'education', 'government', 'other'])
    .withMessage('Invalid course category'),
  
  body('nsqfLevel')
    .matches(/^NSQF Level [1-9]|10$/)
    .withMessage('Invalid NSQF level'),
  
  body('structure.duration.hours')
    .isInt({ min: 1, max: 2000 })
    .withMessage('Course duration must be between 1 and 2000 hours'),
  
  body('structure.format')
    .isIn(['online', 'offline', 'hybrid'])
    .withMessage('Invalid course format'),
  
  handleValidationErrors
];

// Assessment validation rules
const validateAssessmentCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Assessment title must be between 5 and 200 characters'),
  
  body('type')
    .isIn(['skill-assessment', 'course-quiz', 'certification-exam', 'placement-test', 'diagnostic'])
    .withMessage('Invalid assessment type'),
  
  body('category')
    .isIn(['technical', 'soft-skills', 'domain-knowledge', 'language', 'aptitude'])
    .withMessage('Invalid assessment category'),
  
  body('difficulty')
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  body('duration')
    .isInt({ min: 5, max: 480 })
    .withMessage('Duration must be between 5 and 480 minutes'),
  
  handleValidationErrors
];

// Roadmap validation rules
const validateRoadmapGeneration = [
  body('targetRole')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Target role must be between 2 and 100 characters'),
  
  body('targetIndustry')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Target industry must be between 2 and 50 characters'),
  
  body('timeframe')
    .isIn(['6months', '1year', '2years', 'flexible'])
    .withMessage('Invalid timeframe selection'),
  
  body('experience')
    .isIn(['beginner', 'basic', 'intermediate', 'advanced'])
    .withMessage('Invalid experience level'),
  
  handleValidationErrors
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category filter is invalid'),
  
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid UUID format'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCourseCreation,
  validateAssessmentCreation,
  validateRoadmapGeneration,
  validatePagination,
  validateSearch,
  validateObjectId,
  validateUUID
};