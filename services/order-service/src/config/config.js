require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3004,
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'order_service_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
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
    payment: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
      timeout: parseInt(process.env.PAYMENT_SERVICE_TIMEOUT || '5000'),
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    transports: {
      console: process.env.LOG_CONSOLE !== 'false',
      file: process.env.LOG_FILE === 'true',
      filePath: process.env.LOG_FILE_PATH || 'logs/order-service.log'
    }
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    endpoint: process.env.METRICS_ENDPOINT || '/metrics',
    defaultLabels: {
      service: 'order-service'
    }
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  checkout: {
    taxRate: parseFloat(process.env.TAX_RATE || '0.07'),  // Default 7% tax rate
    shippingFlatRate: parseFloat(process.env.SHIPPING_FLAT_RATE || '5.99'),
  }
};

module.exports = config;
