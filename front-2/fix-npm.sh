#!/bin/bash

# Fix npm install issues (corporate network / peer-dep conflicts)
echo "Fixing npm configuration for corporate network..."

# Disable strict SSL for corporate proxies
npm config set strict-ssl false

# Remove node_modules only (keep package-lock.json for reproducible builds)
echo "Cleaning node_modules..."
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Install from lock file for exact reproducibility
echo "Installing dependencies from lock file..."
npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

echo "Done! Try running 'npm run dev' now."
