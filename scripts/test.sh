#!/bin/bash

# StreamHub Test Script

set -e  # Exit on any error

echo "Starting StreamHub tests..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Set environment variables
ENV=${1:-test}
echo "Running tests for $ENV environment..."

# Export environment variables
export NODE_ENV=$ENV

# Run backend tests
echo "Running backend tests..."
npm run test

# Run frontend tests
echo "Running frontend tests..."
cd frontend
npm run test
cd ..

echo "All tests completed successfully!"