#!/bin/bash

# StreamHub Start Script

set -e  # Exit on any error

echo "Starting StreamHub application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Set environment variables
ENV=${1:-production}
echo "Starting application in $ENV environment..."

# Export environment variables
export NODE_ENV=$ENV

# Start backend
echo "Starting backend application..."
npm start &

# Wait for backend to start
sleep 5

# Start frontend (in production, this would be served by nginx)
echo "Starting frontend application..."
cd frontend
npx serve -s dist -l 3001 &
cd ..

echo "StreamHub application started successfully!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"