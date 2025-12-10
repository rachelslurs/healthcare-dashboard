#!/bin/sh
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐍 Starting Backend Development Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if requirements.txt exists and if dependencies need to be installed
if [ -f "requirements.txt" ]; then
  echo "📦 Checking Python dependencies..."
  echo ""
  
  # Check for multiple critical dependencies to ensure they're all installed
  # This is more robust than checking just one package
  MISSING_DEPS=false
  for package in fastapi uvicorn sqlalchemy pydantic; do
    if ! python -c "import ${package}" 2>/dev/null; then
      MISSING_DEPS=true
      break
    fi
  done
  
  if [ "$MISSING_DEPS" = true ]; then
    echo "📥 Installing Python dependencies from requirements.txt..."
    echo ""
    pip install --no-cache-dir -r requirements.txt
    echo ""
    echo "✅ Python dependencies installed successfully!"
    echo ""
  else
    # Use pip check to validate the entire dependency tree for conflicts
    # This catches issues like version mismatches or broken dependencies
    echo "🔍 Validating dependency tree..."
    if pip check 2>&1 | grep -q .; then
      echo "⚠️  Dependency conflicts detected:"
      pip check
      echo ""
      echo "📥 Reinstalling dependencies to resolve conflicts..."
      pip install --no-cache-dir -r requirements.txt
      echo ""
      echo "✅ Dependencies reinstalled!"
      echo ""
    else
      echo "✅ Python dependencies are up to date and conflict-free"
      echo ""
    fi
  fi
fi

# Run database migrations with clear feedback
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Running Database Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if the migration module exists and the specific function is available
# This is more explicit than just checking if the module can be imported
MIGRATION_AVAILABLE=false
if python -c "from app.migrations import make_columns_nullable; import inspect; assert callable(make_columns_nullable)" 2>/dev/null; then
  MIGRATION_AVAILABLE=true
fi

if [ "$MIGRATION_AVAILABLE" = true ]; then
  echo "🔄 Running migrations..."
  echo ""
  
  # Set environment variable to indicate migrations are being run by entrypoint
  # This prevents the application startup from running them again
  export MIGRATIONS_RUN_BY_ENTRYPOINT=1
  
  # Capture both stdout and stderr, and preserve the exit code
  MIGRATION_OUTPUT=$(python -m app.migrations 2>&1)
  MIGRATION_EXIT=$?
  
  # Display the migration output
  echo "$MIGRATION_OUTPUT"
  echo ""
  
  # Check exit code to differentiate between success, warnings, and failures
  if [ $MIGRATION_EXIT -eq 0 ]; then
    # Check if output contains warning indicators (case-insensitive)
    if echo "$MIGRATION_OUTPUT" | grep -qi "warning\|warn"; then
      echo "⚠️  Migration completed with warnings (see output above)"
      echo "   The server will still start, but you may want to review any warnings."
      echo ""
    else
      echo "✅ Database migrations completed successfully!"
      echo ""
    fi
  else
    # Non-zero exit code indicates an actual failure
    echo "❌ Migration failed with exit code $MIGRATION_EXIT"
    echo "   Error details are shown above."
    echo "   The server will still start, but the database may be in an inconsistent state."
    echo "   Please review the error messages and fix any issues before proceeding."
    echo ""
  fi
else
  # Check if the module exists but the function is missing (migration was moved/renamed)
  if python -c "import app.migrations" 2>/dev/null; then
    echo "⚠️  Migration module found but 'make_columns_nullable' function is missing"
    echo "   This may indicate migrations were moved or renamed."
    echo "   The server will start, but migrations may need to be updated."
    echo ""
  else
    echo "ℹ️  No migration module found (this is OK if migrations aren't needed)"
    echo ""
  fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Starting Uvicorn server with hot reload..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute the command passed to the entrypoint
exec "$@"
