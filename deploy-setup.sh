#!/bin/bash

echo "🚀 HackTheValleyX Deployment Helper"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found for backend"
    echo "   Creating .env file..."
    echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
    echo "ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5175" >> .env
    echo "✅ Created .env file. Please update with your actual Gemini API key."
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found for frontend"
    echo "   Creating .env.local file..."
    echo "VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here" > .env.local
    echo "VITE_API_URL=http://localhost:8000" >> .env.local
    echo "VITE_WS_URL=ws://localhost:8000" >> .env.local
    echo "✅ Created .env.local file. Please update with your actual Clerk key."
fi

echo ""
echo "📋 Pre-Deployment Checklist:"
echo "  1. ✓ Update .env with your Gemini API key"
echo "  2. ✓ Update .env.local with your Clerk publishable key"
echo "  3. ✓ Commit and push your code to GitHub"
echo "  4. ✓ Follow DEPLOYMENT.md for full instructions"
echo ""
echo "📖 Full deployment guide: See DEPLOYMENT.md"
echo ""
echo "🎯 Quick Links:"
echo "   Backend (Render): https://render.com"
echo "   Frontend (Vercel): https://vercel.com"
echo "   Clerk Dashboard: https://dashboard.clerk.com"
echo ""
