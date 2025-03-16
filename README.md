# CI-Commerce: Microservices E-commerce Platform for DevOps Learning

This repository contains a microservices-based e-commerce application specifically designed for learning and practicing DevOps and CI/CD concepts. The application is structured to facilitate implementation of GitLab CI/CD pipelines, Kubernetes deployments, and various DevOps best practices.

## Overview

This project simulates a production-ready e-commerce platform divided into independent microservices, each with its own responsibility, database, and API. The application is designed with cloud-native principles and containerization in mind, making it an ideal candidate for Kubernetes deployment.

## Application Components

### Backend Services

- **API Gateway**: Central entry point for all client requests, routing to appropriate backend services
- **User Service**: Handles authentication, user profiles, and authorization
- **Product Service**: Manages product catalog, categories, and inventory
- **Cart Service**: Handles shopping cart functionality
- **Order Service**: Processes orders with enhanced observability features

### Frontend

- React-based single-page application
- Responsive UI using Bootstrap
- Modular component architecture

## Technical Stack

- **Backend**: Node.js with Express
- **Frontend**: React with React Bootstrap
- **Database**: PostgreSQL with Sequelize ORM
- **Containerization**: Docker with multi-stage builds
- **Local Orchestration**: Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ci-commerce
   ```

2. Start all services using Docker Compose:
   ```
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost
   - API Gateway: http://localhost:3000

### Service Ports

| Service       | Port |
|---------------|------|
| Frontend      | 80   |
| API Gateway   | 3000 |
| User Service  | 3001 |
| Product Service| 3002 |
| Cart Service  | 3003 |
| Order Service | 3004 |

## Project Structure

```
ci-commerce/
├── api-gateway/        # API Gateway service
├── services/
│   ├── user-service/   # Authentication and user management
│   ├── product-service/# Product catalog management
│   ├── cart-service/   # Shopping cart functionality
│   └── order-service/  # Order processing with observability
├── frontend/           # React frontend application
├── docker-compose.yml  # Local development orchestration
├── architecture.md     # Detailed architecture documentation
└── next-steps.md       # DevOps implementation guide
```

## DevOps Learning Path

This project is designed to help you learn various DevOps concepts and tools:

1. **CI/CD Pipeline Implementation**:
   - Multi-stage builds and deployments
   - Branch/tag-based automation
   - Test integration

2. **Kubernetes Deployment**:
   - Helm chart development
   - Ingress configuration
   - Service mesh implementation

3. **Observability**:
   - Logging with FluentD
   - Metrics collection with Prometheus
   - Distributed tracing

4. **Security**:
   - CIS benchmarks implementation
   - Certificate management
   - RBAC configuration

For a detailed guide on implementing these DevOps practices, see [next-steps.md](next-steps.md).

## Documentation

- [Architecture Overview](architecture.md): Detailed information about the application architecture and Kubernetes deployment design
- [DevOps Implementation Guide](next-steps.md): Step-by-step guide for implementing CI/CD and Kubernetes infrastructure

## License

This project is for educational purposes only.

## Acknowledgements

This project was created as a learning tool for DevOps practices, specifically for implementing CI/CD pipelines, Kubernetes deployments, and microservices management.
