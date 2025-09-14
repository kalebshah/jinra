#!/bin/bash

echo "⚡ Jinra Deployment Script"
echo "=========================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Jinra Smart News Feed"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if we're connected to a remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "🔗 Please connect to GitHub first:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "3. Run: git push -u origin main"
    echo ""
    echo "Then run this script again!"
    exit 1
fi

echo ""
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy to cloud platform" || echo "No changes to commit"
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Now deploy to Railway:"
echo "1. Go to https://railway.app"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select your repository"
echo "5. Add PostgreSQL database"
echo "6. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - NEWS_API_KEY=dfff1b70ac824c66a499b0f9ecabb4de"
echo ""
echo "⚡ Jinra will be live at https://your-app-name.railway.app"
