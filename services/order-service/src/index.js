const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { logger, requestLogger } = require('./utils/logger');
const { 
  register, 
  updateHttpMetrics, 
  updateOrderMetrics 
} = require('./utils/metrics');
const { sequelize, testConnection } = require('./utils/database');
const orderRoutes = require('./routes/order');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Track HTTP metrics
app.use(updateHttpMetrics);

// Add request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  
  res.status(200).json({
    status: 'UP',
    service: 'order-service',
    database: dbStatus ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint if enabled
if (config.metrics.enabled) {
  app.get(config.metrics.endpoint, async (req, res) => {
    // Update order metrics before serving metrics
    try {
      await updateOrderMetrics();
    } catch (error) {
      logger.error('Error updating order metrics', {
        error: error.message,
        component: 'metrics-endpoint'
      });
    }
    
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
  
  logger.info(`Metrics endpoint enabled at ${config.metrics.endpoint}`);
}

// API endpoint information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Order Service API',
    version: '1.0.0',
    endpoints: {
      orders: '/orders'
    },
    healthEndpoint: '/health',
    metricsEndpoint: config.metrics.enabled ? config.metrics.endpoint : null
  });
});

// Register routes
app.use('/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`, {
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
  logger.error('Unhandled error', {
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
      logger.info(`Order service started on port ${config.server.port}`, {
        port: config.server.port,
        environment: config.server.environment
      });
    });
    
    // Set up interval to update order metrics if enabled
    if (config.metrics.enabled) {
      // Update order metrics every 5 minutes
      setInterval(async () => {
        try {
          await updateOrderMetrics();
          logger.debug('Order metrics updated successfully');
        } catch (error) {
          logger.error('Failed to update order metrics', { error: error.message });
        }
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    }
  } catch (error) {
    logger.error('Failed to start server', {
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
