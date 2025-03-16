const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const { logger, requestLogger } = require('./utils/logger');
const { register } = require('./utils/metrics');
const { createServiceProxies } = require('./utils/proxy');

// Initialize Express app
const app = express();

// Add request start time for metrics
app.use((req, res, next) => {
  req._startTime = Date.now();
  next();
});

// Add security headers
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Parse JSON bodies
app.use(express.json());

// Add request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Metrics endpoint if enabled
if (config.metrics.enabled) {
  app.get(config.metrics.endpoint, async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}

// API endpoint information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'E-Commerce API Gateway',
    version: '1.0.0',
    services: Object.keys(config.services).map(service => ({
      name: service,
      endpoint: `/api/${service}`
    })),
    healthEndpoint: '/health',
    metricsEndpoint: config.metrics.enabled ? config.metrics.endpoint : null
  });
});

// Set up service proxies
const serviceProxies = createServiceProxies();

// Register proxy middleware for each service
Object.keys(serviceProxies).forEach(serviceName => {
  app.use(`/api/${serviceName}`, serviceProxies[serviceName]);
});

// Handle 404 errors
app.use((req, res) => {
  logger.warn({
    message: 'Route not found',
    method: req.method,
    url: req.url,
    requestId: req.requestId
  });
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource at ${req.path} was not found`,
    requestId: req.requestId
  });
});

// Handle errors
app.use((err, req, res, next) => {
  logger.error({
    message: 'Unhandled error',
    error: err.message,
    stack: err.stack,
    requestId: req.requestId
  });
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    requestId: req.requestId
  });
});

// Start the server
const server = app.listen(config.server.port, () => {
  logger.info({
    message: `API Gateway started on port ${config.server.port}`,
    port: config.server.port,
    environment: config.server.environment
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
