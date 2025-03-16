const axios = require('axios');
const config = require('../config/config');
const { logger, logServiceCall } = require('./logger');
const { recordServiceCall } = require('./metrics');

// Create HTTP clients for each service
const createServiceClient = (serviceName) => {
  // Get service config
  const serviceConfig = config.services[serviceName];
  
  if (!serviceConfig) {
    logger.error(`Configuration for service "${serviceName}" not found`, {
      component: 'httpClient'
    });
    throw new Error(`Configuration for service "${serviceName}" not found`);
  }
  
  // Create axios instance
  const client = axios.create({
    baseURL: serviceConfig.url,
    timeout: serviceConfig.timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Add request interceptor for logging and tracing
  client.interceptors.request.use(
    (config) => {
      // Add request start time for metrics
      config.metadata = { startTime: Date.now() };
      
      // Add request ID if available in the current context
      const requestId = getRequestId();
      if (requestId) {
        config.headers['x-request-id'] = requestId;
      }
      
      // Log request
      logger.debug(`Request to ${serviceName} service`, {
        service: serviceName,
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        component: 'httpClient'
      });
      
      return config;
    },
    (error) => {
      logger.error(`Request error to ${serviceName} service`, {
        service: serviceName,
        error: error.message,
        stack: error.stack,
        component: 'httpClient'
      });
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor for logging and metrics
  client.interceptors.response.use(
    (response) => {
      // Calculate request duration
      const duration = (Date.now() - response.config.metadata.startTime) / 1000;
      const endpoint = response.config.url;
      
      // Log service call
      logServiceCall(serviceName, endpoint, duration);
      
      // Record service call metrics
      recordServiceCall(serviceName, endpoint, duration, 'success');
      
      // Log response
      logger.debug(`Response from ${serviceName} service`, {
        service: serviceName,
        method: response.config.method?.toUpperCase(),
        url: `${response.config.baseURL}${response.config.url}`,
        status: response.status,
        duration: `${duration.toFixed(3)}s`,
        component: 'httpClient'
      });
      
      return response;
    },
    (error) => {
      // Calculate request duration if possible
      let duration = 0;
      let endpoint = '';
      
      if (error.config && error.config.metadata) {
        duration = (Date.now() - error.config.metadata.startTime) / 1000;
        endpoint = error.config.url;
      }
      
      // Determine status code
      const status = error.response ? error.response.status : 'network-error';
      
      // Log service call error
      logServiceCall(serviceName, endpoint, duration, status, error.message);
      
      // Record service call metrics
      recordServiceCall(serviceName, endpoint, duration, 'error');
      
      // Log detailed error
      logger.error(`Error from ${serviceName} service`, {
        service: serviceName,
        method: error.config?.method?.toUpperCase(),
        url: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
        status,
        duration: `${duration.toFixed(3)}s`,
        error: error.message,
        response: error.response?.data,
        component: 'httpClient'
      });
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Function to get the current request ID from async context
// In a real app, you'd use a proper async context solution like cls-hooked
// For simplicity, we'll just return undefined here
const getRequestId = () => {
  // This would typically use async context to get the current request ID
  return undefined;
};

// Create client instances for each service
const serviceClients = {
  user: createServiceClient('user'),
  product: createServiceClient('product'),
  cart: createServiceClient('cart'),
  payment: createServiceClient('payment')
};

module.exports = serviceClients;
