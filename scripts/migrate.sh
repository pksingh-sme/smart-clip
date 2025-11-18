#!/bin/bash

# StreamHub Database Migration Script

set -e  # Exit on any error

echo "Starting StreamHub database migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Set environment variables
ENV=${1:-development}
echo "Running migrations for $ENV environment..."

# Export environment variables
export NODE_ENV=$ENV

# Run migrations
echo "Running database migrations..."
npx node-pg-migrate up

echo "Database migration completed successfully!"