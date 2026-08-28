#!/bin/bash

# RagFloe Backend Setup Script

echo "🚀 RagFloe Backend Setup"
echo "========================"

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p chroma_data

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OPENAI_API_KEY"
echo "2. Run: python main.py"
echo "3. Backend will be available at http://localhost:8000"
