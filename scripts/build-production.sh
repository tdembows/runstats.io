#!/bin/bash
set -e

echo "Starting production build..."

# Run production build
npm run build

# Move to production directory
mv dist dist-build

# Verify build succeeded
if [ ! -d "dist-build/index.html" ]; then
  echo "ERROR: Build failed - dist-build/index.html not found"
  exit 1
fi

echo "Production build complete: dist-build/"
