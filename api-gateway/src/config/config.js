require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
  services: {
    user: {
      url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.USER_SERVICE_TIMEOUT || '5000'),
    },
    product: {
      url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.PRODUCT_SERVICE_TIMEOUT || '5000'),
    },
    cart: {
      url: process.env.CART_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.CART_SERVICE_TIMEOUT || '5000'),
    },
    order: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.ORDER_SERVICE_TIMEOUT || '5000'),
    },
    payment: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
      timeout: parseInt(process.env.PAYMENT_SERVICE_TIMEOUT || '5000'),
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    endpoint: process.env.METRICS_ENDPOINT || '/metrics',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

module.exports = config;
