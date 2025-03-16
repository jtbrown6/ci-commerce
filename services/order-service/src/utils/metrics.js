const promClient = require('prom-client');
const config = require('../config/config');
const { logger } = require('./logger');

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default labels to all metrics
register.setDefaultLabels(config.metrics.defaultLabels);

// Add default metrics (memory, CPU, etc.) if metrics are enabled
if (config.metrics.enabled) {
  promClient.collectDefaultMetrics({ register });
  logger.info('Default metrics collection enabled');
}

// HTTP request duration metric
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.03, 0.05, 0.07, 0.1, 0.3, 0.5, 1, 3, 5, 10],
  registers: [register]
});

// Order-specific metrics

// Order count by status
const orderCountByStatus = new promClient.Gauge({
  name: 'order_count_by_status',
  help: 'Number of orders by status',
  labelNames: ['status'],
  registers: [register]
});

// Order total value by status
const orderValueByStatus = new promClient.Gauge({
  name: 'order_value_by_status',
  help: 'Total value of orders by status',
  labelNames: ['status'],
  registers: [register]
});

// New orders counter
const newOrdersCounter = new promClient.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  registers: [register]
});

// Order processing time
const orderProcessingDuration = new promClient.Histogram({
  name: 'order_processing_duration_seconds',
  help: 'Time taken to process an order from creation to completion',
  labelNames: ['payment_method'],
  buckets: [1, 5, 15, 30, 60, 180, 300, 600],
  registers: [register]
});

// Failed orders counter
const failedOrdersCounter = new promClient.Counter({
  name: 'orders_failed_total',
  help: 'Total number of failed orders',
  labelNames: ['reason'],
  registers: [register]
});

// Service call metrics
const serviceCallDuration = new promClient.Histogram({
  name: 'service_call_duration_seconds',
  help: 'Duration of external service calls in seconds',
  labelNames: ['service', 'endpoint', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10],
  registers: [register]
});

// Order item metrics
const orderItemsPerOrder = new promClient.Histogram({
  name: 'order_items_per_order',
  help: 'Number of items per order',
  buckets: [1, 2, 3, 5, 10, 15, 20, 30],
  registers: [register]
});

// Update metrics middleware
const updateHttpMetrics = (req, res, next) => {
  const start = Date.now();
  
  // Record metric on response finish
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    
    // Get route pattern if available
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    
    // Record request duration
    httpRequestDurationMicroseconds.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
  });
  
  next();
};

// Function to update order metrics
const updateOrderMetrics = async () => {
  try {
    const { models } = require('../models');
    
    const { sequelize } = require('../utils/database');
    
    // Get order counts by status
    const orderCounts = await models.Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
      ],
      group: ['status']
    });
    
    // Update metrics
    orderCounts.forEach(result => {
      orderCountByStatus.set({ status: result.status }, parseInt(result.get('count')));
      orderValueByStatus.set({ status: result.status }, parseFloat(result.get('total') || 0));
    });
    
    logger.debug('Order metrics updated successfully');
  } catch (error) {
    logger.error('Failed to update order metrics', { error: error.message });
  }
};

// Record service call duration
const recordServiceCall = (service, endpoint, duration, status) => {
  serviceCallDuration.observe({ service, endpoint, status }, duration);
};

module.exports = {
  register,
  httpRequestDurationMicroseconds,
  orderCountByStatus,
  orderValueByStatus,
  newOrdersCounter,
  orderProcessingDuration,
  failedOrdersCounter,
  serviceCallDuration,
  orderItemsPerOrder,
  updateHttpMetrics,
  updateOrderMetrics,
  recordServiceCall
};
