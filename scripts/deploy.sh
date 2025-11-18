#!/bin/bash

# StreamHub Deployment Script

set -e  # Exit on any error

echo "Starting StreamHub deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Set environment variables
ENV=${1:-development}
echo "Deploying to $ENV environment..."

# Backend deployment
echo "Deploying backend..."
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm ci

# Run database migrations
echo "Running database migrations..."
npm run migrate up

# Build the application
echo "Building backend application..."
npm run build

# Start the application
echo "Starting backend application..."
if [ "$ENV" = "production" ]; then
  npm start
else
  npm run dev
fi

cd ..

# Frontend deployment
echo "Deploying frontend..."
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm ci

# Build the application
echo "Building frontend application..."
npm run build

# Start the application
echo "Starting frontend application..."
if [ "$ENV" = "production" ]; then
  npm run preview
else
  npm run dev
fi

cd ..

echo "StreamHub deployment completed successfully!"