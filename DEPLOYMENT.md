# StreamHub Deployment Guide

This guide provides instructions for deploying StreamHub, a YouTube-like video streaming platform, in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Deployment](#local-development-deployment)
3. [Production Deployment with Docker](#production-deployment-with-docker)
4. [AWS Deployment](#aws-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Migrations](#database-migrations)
7. [CI/CD Pipeline](#ci-cd-pipeline)
8. [Monitoring and Observability](#monitoring-and-observability)

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL client
- Git
- AWS CLI (for AWS deployment)
- Kubernetes CLI (for Kubernetes deployment)

## Local Development Deployment

### Using Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd streamhub
   ```

2. Create a `.env` file with your configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:3001

### Manual Installation

1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. Start the backend:
   ```bash
   npm run dev
   ```

4. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   cd ..
   ```

## Production Deployment with Docker

### Using Docker Compose

1. Create a `.env.prod` file with production configuration:
   ```bash
   cp .env.example .env.prod
   # Edit .env.prod with production values
   ```

2. Start the production services:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
   ```

### Individual Service Deployment

#### Backend

1. Build the Docker image:
   ```bash
   docker build -t streamhub-backend .
   ```

2. Run the container:
   ```bash
   docker run -d \
     --name streamhub-backend \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e DB_HOST=your-db-host \
     -e DB_PORT=5432 \
     -e DB_NAME=streamhub_prod \
     -e DB_USER=streamhub_user \
     -e DB_PASSWORD=your-db-password \
     -e REDIS_HOST=your-redis-host \
     -e REDIS_PORT=6379 \
     -e JWT_SECRET=your-jwt-secret \
     -e JWT_REFRESH_SECRET=your-jwt-refresh-secret \
     streamhub-backend
   ```

#### Frontend

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the built files using nginx or any static file server.

## AWS Deployment

### ECS Deployment

1. Create an ECR repository:
   ```bash
   aws ecr create-repository --repository-name streamhub-backend
   ```

2. Build and push the Docker image:
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

   # Build and tag the image
   docker build -t streamhub-backend .
   docker tag streamhub-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/streamhub-backend:latest

   # Push the image
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/streamhub-backend:latest
   ```

3. Create ECS task definition using `task-definition.json`:
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```

4. Create ECS service:
   ```bash
   aws ecs create-service \
     --cluster your-cluster-name \
     --service-name streamhub-backend-service \
     --task-definition streamhub-backend \
     --desired-count 1 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"
   ```

### RDS Database Setup

1. Create a PostgreSQL RDS instance:
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier streamhub-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username streamhub_user \
     --master-user-password your-password \
     --allocated-storage 20 \
     --db-name streamhub_prod
   ```

### Elasticache Redis Setup

1. Create an ElastiCache Redis cluster:
   ```bash
   aws elasticache create-cache-cluster \
     --cache-cluster-id streamhub-redis \
     --cache-node-type cache.t3.micro \
     --engine redis \
     --num-cache-nodes 1
   ```

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development, production, test) | Yes |
| `DB_HOST` | PostgreSQL database host | Yes |
| `DB_PORT` | PostgreSQL database port | Yes |
| `DB_NAME` | PostgreSQL database name | Yes |
| `DB_USER` | PostgreSQL database user | Yes |
| `DB_PASSWORD` | PostgreSQL database password | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `REDIS_PORT` | Redis port | Yes |
| `JWT_SECRET` | JWT secret for access tokens | Yes |
| `JWT_REFRESH_SECRET` | JWT secret for refresh tokens | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | No |
| `OPENAI_API_KEY` | OpenAI API key | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## Database Migrations

### Running Migrations

1. Using npm:
   ```bash
   npm run migrate up
   ```

2. Using the migration script:
   ```bash
   ./scripts/migrate.sh
   ```

### Creating New Migrations

1. Generate a new migration:
   ```bash
   npx node-pg-migrate create migration-name
   ```

2. Edit the generated migration file in `migrations/` directory.

3. Run the migration:
   ```bash
   npm run migrate up
   ```

## CI/CD Pipeline

The project includes a GitHub Actions workflow in `.github/workflows/ci-cd.yml` that:

1. Runs on push to `main` and `develop` branches
2. Runs on pull requests to `main` and `develop` branches
3. Performs linting and testing
4. Builds Docker images
5. Deploys to DockerHub
6. Deploys to AWS ECS

### Setting up CI/CD Secrets

For GitHub Actions, set the following secrets in your repository:

- `DOCKERHUB_USERNAME` - DockerHub username
- `DOCKERHUB_TOKEN` - DockerHub access token
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `VERCEL_TOKEN` - Vercel token (for frontend deployment)
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Monitoring and Observability

### Backend

The backend includes built-in observability features:

1. **Logging**: Structured logging with Winston
2. **Metrics**: Prometheus metrics endpoint at `/metrics`
3. **Health Checks**: Health check endpoint at `/health`

### Frontend

The frontend includes error tracking:

1. **Error Boundaries**: React error boundaries for UI errors
2. **Performance Monitoring**: Web Vitals tracking

### External Monitoring

Recommended external monitoring services:

1. **Sentry**: Error tracking for both frontend and backend
2. **Prometheus**: Metrics collection
3. **Grafana**: Metrics visualization
4. **ELK Stack**: Log aggregation and analysis

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env` file
   - Ensure PostgreSQL is running
   - Verify network connectivity to database

2. **Redis Connection Failed**
   - Check Redis configuration in `.env` file
   - Ensure Redis is running
   - Verify network connectivity to Redis

3. **JWT Token Errors**
   - Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
   - Check token expiration settings

4. **Docker Build Failures**
   - Ensure Docker daemon is running
   - Check available disk space
   - Verify Dockerfile syntax

### Logs

Check logs for troubleshooting:

1. **Backend logs**: `logs/` directory or Docker container logs
2. **Database logs**: PostgreSQL logs
3. **Redis logs**: Redis logs
4. **Frontend logs**: Browser developer console

## Rollback Strategy

In case of deployment issues:

1. **Docker Compose**: 
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **AWS ECS**:
   ```bash
   aws ecs update-service \
     --cluster your-cluster-name \
     --service streamhub-backend-service \
     --task-definition streamhub-backend:previous-revision
   ```

3. **Database Rollback**:
   ```bash
   npm run migrate down
   ```

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly for your domain
4. **Rate Limiting**: Enable rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs
6. **Authentication**: Use secure JWT tokens with proper expiration