const express = require('express');
const User = require('../models/User');
const { generateTokens, refreshAccessToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Register new user
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, phone, password, role, profile } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email 
          ? 'An account with this email already exists' 
          : 'An account with this phone number already exists'
      });
    }
    
    // Create new user
    const userData = {
      name,
      email,
      phone,
      password,
      role: role || 'learner',
      profile: {
        language: profile?.language || 'english',
        state: profile?.state,
        ...profile
      }
    };
    
    const user = new User(userData);
    await user.save();
    
    // Generate tokens
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    logger.info('New user registered:', { userId: user._id, email: user.email, role: user.role });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create user account'
    });
  }
});

// Login user
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Generate tokens
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();
    
    logger.info('User logged in:', { userId: user._id, email: user.email });
    
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate user'
    });
  }
});

// Refresh access token
router.post('/refresh', refreshAccessToken);

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Find user and clear refresh token
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
        logger.info('User logged out:', { userId: user._id });
      }
    }
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to logout user'
    });
  }
});

// Get current user profile
router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skills.skillId', 'name category')
      .populate('learningHistory.courseId', 'title provider nsqfLevel');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Unable to retrieve user profile'
    });
  }
});

// Verify email (placeholder for email verification flow)
router.post('/verify-email', async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    // In a real implementation, you would verify the token
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Invalid verification request'
      });
    }
    
    user.isVerified = true;
    await user.save();
    
    logger.info('Email verified:', { userId: user._id });
    
    res.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Unable to verify email'
    });
  }
});

// Request password reset (placeholder)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        message: 'If an account with this email exists, you will receive password reset instructions'
      });
    }
    
    // In a real implementation, you would:
    // 1. Generate a reset token
    // 2. Send email with reset link
    // 3. Store the token with expiration
    
    logger.info('Password reset requested:', { email });
    
    res.json({
      message: 'If an account with this email exists, you will receive password reset instructions'
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'Unable to process password reset request'
    });
  }
});

module.exports = router;