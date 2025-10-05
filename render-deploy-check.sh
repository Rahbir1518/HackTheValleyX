#!/bin/bash
# Render Deployment Quick Setup
# Run this to verify everything before deploying

echo "🚀 RENDER DEPLOYMENT CHECKLIST"
echo "================================"
echo ""

# Check if .env has required variables
echo "📋 Checking .env file..."
if grep -q "BLOB_READ_WRITE_TOKEN" .env; then
    echo "✅ BLOB_READ_WRITE_TOKEN found"
else
    echo "❌ BLOB_READ_WRITE_TOKEN missing"
    exit 1
fi

if grep -q "GEMINI_API_KEY" .env; then
    echo "✅ GEMINI_API_KEY found"
else
    echo "❌ GEMINI_API_KEY missing"
    exit 1
fi

echo ""
echo "📦 Checking dependencies..."
if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt exists"
    if grep -q "requests" requirements.txt; then
        echo "✅ requests library included"
    else
        echo "❌ requests library missing"
        exit 1
    fi
else
    echo "❌ requirements.txt missing"
    exit 1
fi

echo ""
echo "🔧 Running diagnostics..."
python3 test_deployment.py

echo ""
echo "================================"
echo "📝 NEXT STEPS FOR RENDER:"
echo "================================"
echo ""
echo "1. Go to Render Dashboard"
echo "2. Select your service"
echo "3. Go to Environment"
echo "4. Add these environment variables:"
echo ""
echo "   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_uxdTS1xY7jn5A72Y_AntBzyMIH4pO9PnUu0LTGDb4EqmQYq"
echo "   GEMINI_API_KEY=AIzaSyCLftvHPDWsaohLFBKe0nsRybLuFv2K4kk"
echo ""
echo "5. Save Changes"
echo "6. Manual Deploy (or push to GitHub)"
echo ""
echo "7. Check logs for:"
echo "   ✅ Found base.wav in Blob Storage"
echo "   🤖 Starting Gemini analysis comparison..."
echo ""
echo "================================"
echo "🎉 You're ready to deploy!"
echo "================================"
