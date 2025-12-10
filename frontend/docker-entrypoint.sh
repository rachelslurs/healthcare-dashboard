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
  npm install --legacy-peer-deps
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
