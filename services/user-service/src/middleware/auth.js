const { verifyToken } = require('../utils/jwt');
const { models } = require('../models');
const { logger } = require('../utils/logger');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get the token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No valid authentication token provided',
        requestId: req.requestId
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token',
        requestId: req.requestId
      });
    }
    
    // Get the user from database
    const user = await models.User.findByPk(decoded.sub);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found or inactive',
        requestId: req.requestId
      });
    }
    
    // Attach user to request
    req.user = user;
    
    logger.debug('User authenticated', { 
      userId: user.id, 
      username: user.username,
      requestId: req.requestId
    });
    
    next();
  } catch (error) {
    logger.error('Authentication error', { 
      error: error.message,
      stack: error.stack,
      requestId: req.requestId
    });
    
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication',
      requestId: req.requestId
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn('Admin access denied', { 
      userId: req.user?.id,
      requestId: req.requestId
    });
    
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required',
      requestId: req.requestId
    });
  }
  
  next();
};

module.exports = {
  authenticate,
  requireAdmin
};
