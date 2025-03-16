const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/config');
const { logger } = require('./logger');
const { serviceRequestCounter, errorCounter } = require('./metrics');

// Proxy middleware error handler
const onProxyError = (serviceName) => (err, req, res) => {
  logger.error({
    message: `Proxy error for ${serviceName} service`,
    error: err.message,
    stack: err.stack,
    requestId: req.requestId
  });
  
  errorCounter.inc({ type: 'proxy_error', service: serviceName });
  
  if (!res.headersSent) {
    res.status(500).json({
      error: `Error communicating with ${serviceName} service`,
      requestId: req.requestId
    });
  }
};

// Create proxy options for a service
const createProxyOptions = (serviceName) => {
  return {
    target: config.services[serviceName].url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: '',
    },
    timeout: config.services[serviceName].timeout,
    onProxyReq: (proxyReq, req, res) => {
      // Add the request ID as a header to the proxied request
      if (req.requestId) {
        proxyReq.setHeader('x-request-id', req.requestId);
      }
      
      // Log proxy request
      logger.debug({
        message: `Proxying request to ${serviceName} service`,
        method: req.method,
        url: req.url,
        targetUrl: `${config.services[serviceName].url}${proxyReq.path}`,
        requestId: req.requestId
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Increment service request counter
      serviceRequestCounter.inc({
        service: serviceName,
        method: req.method,
        status_code: proxyRes.statusCode
      });
      
      // Log proxy response
      logger.debug({
        message: `Received response from ${serviceName} service`,
        statusCode: proxyRes.statusCode,
        method: req.method,
        url: req.url,
        responseTime: Date.now() - req._startTime,
        requestId: req.requestId
      });
    },
    onError: onProxyError(serviceName)
  };
};

// Create proxy middleware for all services
const createServiceProxies = () => {
  const proxyMiddlewares = {};
  
  // Create proxy middleware for each service
  Object.keys(config.services).forEach(serviceName => {
    proxyMiddlewares[serviceName] = createProxyMiddleware(
      `/api/${serviceName}`,
      createProxyOptions(serviceName)
    );
  });
  
  return proxyMiddlewares;
};

module.exports = { createServiceProxies };
