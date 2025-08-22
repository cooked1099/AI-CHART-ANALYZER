#!/bin/bash

echo "🔐 OpenAI API Key Setup"
echo "======================="
echo ""
echo "⚠️  IMPORTANT: Never share your API key publicly!"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
else
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
fi

echo ""
echo "🔑 To set up your API key:"
echo "1. Go to https://platform.openai.com/api-keys"
echo "2. Create a NEW API key (delete the old one you shared)"
echo "3. Copy the new key"
echo "4. Edit .env.local and replace 'your_new_openai_api_key_here'"
echo ""
echo "📝 Or run this command (replace YOUR_NEW_KEY):"
echo "   sed -i 's/your_new_openai_api_key_here/YOUR_NEW_KEY/g' .env.local"
echo ""

# Check if API key is set
if grep -q "your_new_openai_api_key_here" .env.local; then
    echo "❌ API key not set yet"
    echo "   Please update .env.local with your new API key"
else
    echo "✅ API key appears to be set"
fi

echo ""
echo "🚀 After setting the API key:"
echo "   npm run dev"
echo ""
echo "🌐 For deployment, add the same key to your hosting platform's environment variables"