#!/bin/sh
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Frontend Development Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# NOTE: Dependencies are installed during Docker build, so this check is primarily
# for edge cases where the volume mount overrides node_modules or when the
# container is started without a proper build. The /app/node_modules volume
# should preserve build-time dependencies, but this provides a safety net.
#
# When does this install run?
# - When node_modules is empty or missing (volume mount issue or first run)
# - When package-lock.json changes but container wasn't rebuilt (rare edge case)
# - When node_modules is out of sync with package-lock.json
#
# To avoid unnecessary installs:
# - Ensure /app/node_modules volume is properly mounted (configured in docker-compose.yml)
# - Let watch mode rebuild containers when package-lock.json changes
# - Don't manually delete node_modules inside the container

NEED_INSTALL=false

# Quick check: if node_modules doesn't exist or is empty, we need to install
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "📦 node_modules directory is empty or missing"
  echo "   (This can happen if the volume mount overrides the build-time installation)"
  NEED_INSTALL=true
elif [ -f "package-lock.json" ]; then
  # If package-lock.json exists, check if node_modules is out of sync
  # by verifying the lock file marker exists in node_modules
  # This marker is created by npm when dependencies are installed from a lock file
  if [ ! -f "node_modules/.package-lock.json" ]; then
    echo "⚠️  node_modules appears out of sync with package-lock.json"
    echo "   (This can happen if package-lock.json was updated outside the container)"
    NEED_INSTALL=true
  else
    # Lightweight check: verify critical dependencies exist
    # This is fast and catches most cases where dependencies are missing
    # We skip the slower npm ls check to avoid slowing down container startup
    CRITICAL_DEPS="react react-dom"
    for dep in $CRITICAL_DEPS; do
      if [ ! -f "node_modules/$dep/package.json" ]; then
        echo "⚠️  Critical dependency '$dep' is missing"
        NEED_INSTALL=true
        break
      fi
    done
  fi
else
  # No lock file - check for critical runtime dependencies
  # This is a fallback for when package-lock.json doesn't exist
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
  echo "   (This may take a moment - dependencies are typically installed during build)"
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
  echo "✅ Dependencies are up to date (using build-time installation)"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Starting Vite development server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute the command passed to the entrypoint
exec "$@"
