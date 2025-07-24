#!/bin/bash

echo "🚀 Deploying to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - OPENROUTER_API_KEY (for AI features)"
echo "   - DATABASE_URL (optional, for persistent storage)"
echo ""
echo "2. Your app should be live at the provided URL"