const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { sequelize, testConnection } = require('./utils/database');
const cartRoutes = require('./routes/cart');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] [INFO] ${req.method} ${req.url} - Request received`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    console.log(`[${new Date().toISOString()}] [${logLevel}] ${req.method} ${req.url} - Response sent: ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  
  res.status(200).json({
    status: 'UP',
    service: 'cart-service',
    database: dbStatus ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString()
  });
});

// API endpoint information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Cart Service API',
    version: '1.0.0',
    endpoints: {
      carts: '/carts',
      userCart: '/carts/user/:userId',
      cartItems: '/carts/:cartId/items'
    },
    healthEndpoint: '/health'
  });
});

// Register routes
app.use('/carts', cartRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] [WARN] Route not found: ${req.method} ${req.url}`);
  
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.path} does not exist`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] [ERROR] Unhandled error:`, err.message);
  console.error(err.stack);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// Sync database models and start server
const startServer = async () => {
  try {
    // Test DB connection before syncing
    const dbStatus = await testConnection();
    
    if (!dbStatus) {
      console.warn(`[${new Date().toISOString()}] [WARN] Starting server without database connection`);
    } else {
      // Sync all models with database
      await sequelize.sync();
      console.log(`[${new Date().toISOString()}] [INFO] Database synced successfully`);
    }
    
    // Start the server
    app.listen(config.server.port, () => {
      console.log(`[${new Date().toISOString()}] [INFO] Cart service started on port ${config.server.port}`);
      console.log(`[${new Date().toISOString()}] [INFO] Environment: ${config.server.environment}`);
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Failed to start server:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log(`[${new Date().toISOString()}] [INFO] SIGTERM signal received: closing HTTP server`);
  
  try {
    await sequelize.close();
    console.log(`[${new Date().toISOString()}] [INFO] Database connection closed`);
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error during shutdown:`, error.message);
    process.exit(1);
  }
});

// Start the server
startServer();

module.exports = app;
