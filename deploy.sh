#!/bin/bash

# 🚀 Trading Chart Analyzer - Deployment Script
# This script helps you push your code to GitHub for deployment

echo "🚀 Trading Chart Analyzer - Deployment Setup"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: Trading Chart Analyzer - AI-powered chart analysis tool

- Modern React + Next.js application
- OpenAI Vision API integration
- Drag-and-drop file upload
- Beautiful glassmorphism UI
- Responsive design
- Production-ready build"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "🔗 Please add your GitHub repository as remote origin:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/trading-chart-analyzer.git"
    echo ""
    echo "📝 Replace YOUR_USERNAME with your actual GitHub username"
    echo ""
    read -p "Press Enter when you've added the remote..."
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://netlify.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New site from Git'"
echo "4. Select your trading-chart-analyzer repository"
echo "5. Set build command: npm run build"
echo "6. Set publish directory: .next"
echo "7. Add environment variable: OPENAI_API_KEY"
echo "8. Deploy!"
echo ""
echo "🌐 Your site will be live at: https://your-site-name.netlify.app"