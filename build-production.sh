#!/bin/bash

# Production Build Script
echo "🚀 Building for production..."

# Build Backend
echo "📦 Building backend..."
cd backend
npm install --production
echo "✅ Backend dependencies installed"

# Build Frontend
echo "📦 Building frontend..."
cd ../frontend
npm install
npm run build
echo "✅ Frontend built successfully"

# Create production directory
echo "📁 Creating production directory..."
cd ..
mkdir -p production-build
cp -r backend production-build/
cp -r frontend/build production-build/frontend-dist
cp package.json production-build/
cp README.md production-build/

# Remove development files
echo "🧹 Cleaning up development files..."
rm -rf production-build/backend/node_modules
rm -rf production-build/backend/.env
rm -rf production-build/backend/serviceAccountKey*.json
rm -rf production-build/backend/firebase_id.json
rm -rf production-build/backend/create-*.js
rm -rf production-build/backend/update-*.js
rm -rf production-build/backend/setup-*.js

echo "✅ Production build completed!"
echo "📁 Production files are in: production-build/"
echo ""
echo "🔒 Security Checklist:"
echo "  ✅ Debug tools removed"
echo "  ✅ Sensitive files excluded"
echo "  ✅ Development dependencies removed"
echo "  ✅ Production build created"
echo ""
echo "⚠️  Remember to:"
echo "  - Set up environment variables in your deployment platform"
echo "  - Configure production database"
echo "  - Update Firebase authorized domains"
echo "  - Enable HTTPS"
