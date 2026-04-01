#!/usr/bin/env bash
set -e

# Kudu sets DEPLOYMENT_SOURCE to the repository directory
DEPLOYMENT_SOURCE=${DEPLOYMENT_SOURCE:-/home/site/repository}
DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET:-/home/site/wwwroot}

echo "Source directory: $DEPLOYMENT_SOURCE"
echo "Target directory: $DEPLOYMENT_TARGET"

# Navigate to repository
cd "$DEPLOYMENT_SOURCE"

echo "Installing dependencies..."
npm install --production=false

echo "Environment variables:"
echo "VITE_API_URL=${VITE_API_URL}"

echo "Building application..."
VITE_API_URL="${VITE_API_URL}" npm run build

echo "Cleaning wwwroot..."
rm -rf "$DEPLOYMENT_TARGET"/*
mkdir -p "$DEPLOYMENT_TARGET"

echo "Copying dist to wwwroot..."
cp -r dist/* "$DEPLOYMENT_TARGET"/

echo "Installing serve for static hosting..."
cd "$DEPLOYMENT_TARGET"
npm init -y
npm install serve --save

echo "Creating startup script..."
cat > "$DEPLOYMENT_TARGET/server.js" << 'EOF'
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: __dirname,
    rewrites: [
      { source: '**', destination: '/index.html' }
    ]
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log('Running on port', port);
});
EOF

echo "Deployment completed successfully!"
