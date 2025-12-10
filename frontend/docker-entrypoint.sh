#!/bin/sh
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Frontend Development Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NEED_INSTALL=false

# Check if node_modules exists and has content
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "📦 node_modules directory is empty or missing"
  NEED_INSTALL=true
elif [ ! -f "node_modules/@tanstack/react-query/package.json" ]; then
  echo "⚠️  Key dependencies appear to be missing"
  NEED_INSTALL=true
elif [ ! -f "node_modules/react-hook-form/package.json" ]; then
  echo "⚠️  Key dependencies appear to be missing"
  NEED_INSTALL=true
elif [ ! -f "node_modules/date-fns/package.json" ]; then
  echo "⚠️  Key dependencies appear to be missing"
  NEED_INSTALL=true
fi

if [ "$NEED_INSTALL" = true ]; then
  echo "📥 Installing dependencies..."
  echo ""
  
  # Use npm ci if package-lock.json exists - it respects the lock file exactly
  # and doesn't require --legacy-peer-deps since the lock file was already
  # created with those resolutions. Only use --legacy-peer-deps if there's no lock file.
  if [ -f "package-lock.json" ]; then
    npm ci
  else
    # Note: --legacy-peer-deps is only used here if no lock file exists.
    # This matches the Dockerfile behavior, but ideally package-lock.json should exist.
    # If you see this message, consider committing package-lock.json to the repository.
    echo "⚠️  No package-lock.json found, using --legacy-peer-deps"
    npm install --legacy-peer-deps
  fi
  
  echo ""
  echo "✅ Dependencies installed successfully!"
  echo ""
else
  echo "✅ Dependencies are up to date"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Starting Vite development server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute the command passed to the entrypoint
exec "$@"
