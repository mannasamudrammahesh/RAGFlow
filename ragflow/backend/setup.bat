@echo off
REM RagFloe Backend Setup Script for Windows

echo 🚀 RagFloe Backend Setup
echo ========================

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo ✅ Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env and add your OPENAI_API_KEY
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist uploads mkdir uploads
if not exist chroma_data mkdir chroma_data

echo.
echo ✨ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env and add your OPENAI_API_KEY
echo 2. Run: python main.py
echo 3. Backend will be available at http://localhost:8000
