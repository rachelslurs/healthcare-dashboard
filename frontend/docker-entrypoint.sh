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
elif [ -f "package-lock.json" ]; then
  # If package-lock.json exists, check if node_modules is out of sync
  # by verifying the lock file marker exists in node_modules
  # This marker is created by npm when dependencies are installed from a lock file
  if [ ! -f "node_modules/.package-lock.json" ]; then
    echo "⚠️  node_modules appears out of sync with package-lock.json"
    NEED_INSTALL=true
  else
    # Verify that package.json dependencies are actually installed
    # Check for a few critical dependencies that should always be present
    # This is a lightweight check - if these core deps are missing, others likely are too
    CRITICAL_DEPS="react react-dom"
    for dep in $CRITICAL_DEPS; do
      if [ ! -f "node_modules/$dep/package.json" ]; then
        echo "⚠️  Critical dependency '$dep' is missing"
        NEED_INSTALL=true
        break
      fi
    done
    
    # If critical deps are present, do a quick validation with npm
    # This catches cases where dependencies are partially installed or corrupted
    if [ "$NEED_INSTALL" = false ] && ! npm ls --depth=0 --silent >/dev/null 2>&1; then
      echo "⚠️  Dependency tree validation failed - reinstalling dependencies"
      NEED_INSTALL=true
    fi
  fi
else
  # No lock file - check for critical runtime dependencies
  # This is a fallback for when package-lock.json doesn't exist
  # Check a broader set of dependencies to ensure the install is complete
  CRITICAL_DEPS="react react-dom vite @tanstack/react-router"
  for dep in $CRITICAL_DEPS; do
    if [ ! -f "node_modules/$dep/package.json" ]; then
      echo "⚠️  Critical dependency '$dep' appears to be missing"
      NEED_INSTALL=true
      break
    fi
  done
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
