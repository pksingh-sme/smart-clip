#!/bin/bash

# StreamHub Build Script

set -e  # Exit on any error

echo "Starting StreamHub build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Build backend
echo "Building backend application..."
npm run build

# Build frontend
echo "Building frontend application..."
cd frontend
npm run build
cd ..

echo "Build process completed successfully!"