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

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Starting Uvicorn server with hot reload..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute the command passed to the entrypoint
exec "$@"
