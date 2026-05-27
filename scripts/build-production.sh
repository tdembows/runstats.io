#!/bin/bash
set -e

echo "Starting production build..."

# Run production build
npm run build -- --base=/runstats.io/

# Verify build succeeded
if [ ! -f "dist/index.html" ]; then
  echo "ERROR: Build failed - dist/index.html not found"
  exit 1
fi

echo "Production build complete: dist/"
