const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { logger } = require('./logger');

/**
 * Generate JWT access token
 * @param {Object} user - User object 
 * @returns {String} JWT Token
 */
const generateToken = (user) => {
  try {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  } catch (error) {
    logger.error('Error generating token', { error: error.message });
    throw error;
  }
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {String} Refresh Token
 */
const generateRefreshToken = (user) => {
  try {
    const payload = {
      sub: user.id,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn
    });
  } catch (error) {
    logger.error('Error generating refresh token', { error: error.message });
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    logger.warn('Invalid token', { error: error.message });
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken
};
