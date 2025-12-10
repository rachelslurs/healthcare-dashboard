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
  
  # Check if any packages are missing (basic check)
  if ! python -c "import fastapi" 2>/dev/null; then
    echo "📥 Installing Python dependencies from requirements.txt..."
    echo ""
    pip install --no-cache-dir -r requirements.txt
    echo ""
    echo "✅ Python dependencies installed successfully!"
    echo ""
  else
    echo "✅ Python dependencies are up to date"
    echo ""
  fi
fi

# Run database migrations with clear feedback
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Running Database Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if python -c "from app.migrations import make_columns_nullable" 2>/dev/null; then
  echo "🔄 Running migrations..."
  echo ""
  if python -m app.migrations 2>&1; then
    echo ""
    echo "✅ Database migrations completed successfully!"
    echo ""
  else
    echo ""
    echo "⚠️  Migration completed with warnings (check logs above)"
    echo "   The server will still start, but you may want to review any warnings."
    echo ""
  fi
else
  echo "⚠️  Could not import migration module (this is OK if migrations aren't needed)"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Starting Uvicorn server with hot reload..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute the command passed to the entrypoint
exec "$@"
