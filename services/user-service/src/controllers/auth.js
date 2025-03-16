const { models } = require('../models');
const { sequelize } = require('../utils/database');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { logger } = require('../utils/logger');
const Joi = require('joi');

// Validation schema for registration
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().allow('', null),
  lastName: Joi.string().allow('', null)
});

// Validation schema for login
const loginSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required()
});

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      logger.warn('Registration validation failed', {
        error: error.details[0].message,
        requestId: req.requestId
      });
      
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        requestId: req.requestId
      });
    }
    
    // Check if user already exists
    const existingUser = await models.User.findOne({
      where: {
        [sequelize.Op.or]: [
          { username: value.username },
          { email: value.email }
        ]
      }
    });
    
    if (existingUser) {
      logger.warn('Registration failed: user already exists', {
        username: value.username,
        email: value.email,
        requestId: req.requestId
      });
      
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this username or email already exists',
        requestId: req.requestId
      });
    }
    
    // Create new user
    const user = await models.User.create({
      username: value.username,
      email: value.email,
      password: value.password,
      firstName: value.firstName,
      lastName: value.lastName
    });
    
    logger.info('User registered successfully', {
      userId: user.id,
      username: user.username,
      requestId: req.requestId
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId
    });
    
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration',
      requestId: req.requestId
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      logger.warn('Login validation failed', {
        error: error.details[0].message,
        requestId: req.requestId
      });
      
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        requestId: req.requestId
      });
    }
    
    // Find user by credentials
    const user = await models.User.findByCredentials(value.login, value.password);
    
    if (!user) {
      logger.warn('Login failed: invalid credentials', {
        login: value.login,
        requestId: req.requestId
      });
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username/email or password',
        requestId: req.requestId
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    logger.info('User logged in successfully', {
      userId: user.id,
      username: user.username,
      requestId: req.requestId
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId
    });
    
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login',
      requestId: req.requestId
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    // User is attached to request by auth middleware
    const user = req.user;
    
    logger.debug('Profile retrieved', {
      userId: user.id,
      requestId: req.requestId
    });
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    logger.error('Profile retrieval error', {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId
    });
    
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'An error occurred while retrieving profile',
      requestId: req.requestId
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
