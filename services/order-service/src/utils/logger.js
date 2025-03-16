const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Create log directory if using file transport
if (config.logging.transports.file) {
  const logDir = path.dirname(config.logging.transports.filePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, ...rest }) => {
        const restString = Object.keys(rest).length 
          ? `\n${JSON.stringify(rest, null, 2)}` 
          : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message}${restString}`;
      })
);

// Configure transports
const transports = [];

if (config.logging.transports.console) {
  transports.push(new winston.transports.Console());
}

if (config.logging.transports.file) {
  transports.push(
    new winston.transports.File({ 
      filename: config.logging.transports.filePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'order-service' },
  transports,
  exitOnError: false
});

// Add request context middleware
const requestLogger = (req, res, next) => {
  // Generate a unique request ID or use one from headers if present
  req.requestId = req.headers['x-request-id'] || uuidv4();
  
  // Add request ID to response headers
  res.setHeader('x-request-id', req.requestId);
  
  // Log the request
  logger.info('Request received', {
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id // If user is authenticated
  });
  
  // Log the response
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    
    // Log level based on status code
    let logLevel = 'info';
    if (res.statusCode >= 500) {
      logLevel = 'error';
    } else if (res.statusCode >= 400) {
      logLevel = 'warn';
    }
    
    logger[logLevel]('Response sent', {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      requestId: req.requestId
    });
  });
  
  next();
};

// Helper to log service calls
const logServiceCall = (serviceName, endpoint, duration, status, error) => {
  const logInfo = {
    service: serviceName,
    endpoint,
    duration,
    status
  };
  
  if (error) {
    logInfo.error = error;
    logger.error(`Service call to ${serviceName} failed`, logInfo);
  } else {
    logger.debug(`Service call to ${serviceName} completed`, logInfo);
  }
};

module.exports = { 
  logger, 
  requestLogger,
  logServiceCall
};
