#!/bin/bash
# Script to run database migrations in Docker container
# Usage: ./run_migration.sh

echo "Running database migration..."
docker-compose exec backend python -m app.migrations
echo "Migration completed."
