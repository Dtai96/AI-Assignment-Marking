@echo off
echo ========================================
echo Database Setup for AI Assignment Marking
echo ========================================
echo.

echo Step 1: Setting up Python virtual environment...
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        echo Please ensure Python 3.8+ is installed and on your PATH
        pause
        exit /b 1
    )
    echo Virtual environment created.
) else (
    echo Virtual environment already exists, skipping creation.
)
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Step 2: Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 3: Generating Prisma client...
prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo.

echo Step 4: Pushing schema to database...
prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Failed to push schema to database
    echo Please ensure:
    echo 1. MySQL is running on port 3306
    echo 2. Database 'ai_marking' exists
    echo 3. DATABASE_URL in .env is correct
    pause
    exit /b 1
)
echo.

echo Step 5: Seeding database with initial data...
python prisma\seed.py
python prisma/seed_auth.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)
echo.

echo ========================================
echo Database setup completed successfully!
echo ========================================
echo.
echo You can now run the application with:
echo   uvicorn app.main:app --reload
echo.
pause
