#!/bin/bash
# Script to upload coverage reports to Codecov
# This script aggregates coverage from all packages and uploads to Codecov

set -e

echo "📊 Aggregating coverage reports..."

# Create coverage directory at root
COVERAGE_DIR="./coverage"
mkdir -p "$COVERAGE_DIR"

# Copy coverage files from packages
if [ -d "packages/web/coverage" ]; then
  echo "📦 Copying web package coverage..."
  cp -r packages/web/coverage/* "$COVERAGE_DIR/" 2>/dev/null || true
fi

if [ -d "packages/eslint-plugin-fsd/coverage" ]; then
  echo "📦 Copying eslint-plugin-fsd package coverage..."
  cp -r packages/eslint-plugin-fsd/coverage/* "$COVERAGE_DIR/" 2>/dev/null || true
fi

# Upload to Codecov if CODECOV_TOKEN is set
if [ -n "$CODECOV_TOKEN" ]; then
  echo "🚀 Uploading to Codecov..."
  
  # Upload web package coverage
  if [ -f "packages/web/coverage/lcov.info" ]; then
    echo "  📤 Uploading web package..."
    codecov -f packages/web/coverage/lcov.info -F web -t "$CODECOV_TOKEN" || true
  fi
  
  # Upload eslint-plugin-fsd package coverage
  if [ -f "packages/eslint-plugin-fsd/coverage/lcov.info" ]; then
    echo "  📤 Uploading eslint-plugin-fsd package..."
    codecov -f packages/eslint-plugin-fsd/coverage/lcov.info -F eslint-plugin-fsd -t "$CODECOV_TOKEN" || true
  fi
else
  echo "⚠️  CODECOV_TOKEN not set, skipping upload"
  echo "   Set CODECOV_TOKEN environment variable to enable uploads"
fi

echo "✅ Coverage aggregation complete!"

