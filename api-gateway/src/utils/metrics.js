const promClient = require('prom-client');
const config = require('../config/config');

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (memory, CPU, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP request duration metric
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

// Request counter by service
const serviceRequestCounter = new promClient.Counter({
  name: 'service_requests_total',
  help: 'Total number of requests to downstream services',
  labelNames: ['service', 'method', 'status_code'],
  registers: [register]
});

// Error counter
const errorCounter = new promClient.Counter({
  name: 'gateway_errors_total',
  help: 'Total number of errors in the API Gateway',
  labelNames: ['type', 'service'],
  registers: [register]
});

// Request size
const requestSizeBytes = new promClient.Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route', 'service'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register]
});

// Response size
const responseSizeBytes = new promClient.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'service', 'status_code'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register]
});

// API Gateway specific metrics
const activeConnectionsGauge = new promClient.Gauge({
  name: 'gateway_active_connections',
  help: 'Current active connections to the API Gateway',
  registers: [register]
});

module.exports = {
  register,
  httpRequestDurationMicroseconds,
  serviceRequestCounter,
  errorCounter,
  requestSizeBytes,
  responseSizeBytes,
  activeConnectionsGauge,
};
