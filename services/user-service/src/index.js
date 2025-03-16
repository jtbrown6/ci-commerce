const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { logger, requestLogger } = require('./utils/logger');
const { sequelize, testConnection } = require('./utils/database');
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Add request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  
  res.status(200).json({
    status: 'UP',
    service: 'user-service',
    database: dbStatus ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString()
  });
});

// API endpoint information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'User Service API',
    version: '1.0.0',
    endpoints: [
      { path: '/register', method: 'POST', description: 'Register a new user' },
      { path: '/login', method: 'POST', description: 'Authenticate and get token' },
      { path: '/profile', method: 'GET', description: 'Get user profile (requires auth)' }
    ],
    healthEndpoint: '/health'
  });
});

// Register routes
app.use('/', authRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn({
    message: 'Route not found',
    method: req.method,
    url: req.url,
    requestId: req.requestId
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.path} does not exist`,
    requestId: req.requestId
  });
});

// Error handler
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

// Sync database models and start server
const startServer = async () => {
  try {
    // Test DB connection before syncing
    const dbStatus = await testConnection();
    
    if (!dbStatus) {
      logger.warn('Starting server without database connection');
    } else {
      // Sync all models with database
      await sequelize.sync();
      logger.info('Database synced successfully');
    }
    
    // Start the server
    app.listen(config.server.port, () => {
      logger.info({
        message: `User service started on port ${config.server.port}`,
        port: config.server.port,
        environment: config.server.environment
      });
    });
  } catch (error) {
    logger.error({
      message: 'Failed to start server',
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  try {
    await sequelize.close();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
});

// Start the server
startServer();

module.exports = app;
