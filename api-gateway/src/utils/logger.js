const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.Console()
  ],
});

// Add request context middleware
const requestLogger = (req, res, next) => {
  // Generate a unique request ID or use one from headers if present
  req.requestId = req.headers['x-request-id'] || uuidv4();
  
  // Add request ID to response headers
  res.setHeader('x-request-id', req.requestId);
  
  // Log the request
  logger.info({
    message: 'Request received',
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  // Log the response
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      message: 'Response sent',
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: Date.now() - start,
      requestId: req.requestId
    });
  });
  
  next();
};

module.exports = { logger, requestLogger };
