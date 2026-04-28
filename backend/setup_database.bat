@echo off
echo ========================================
echo Database Setup for AI Assignment Marking
echo ========================================
echo.

echo Step 1: Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Generating Prisma client...
prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo.

echo Step 3: Pushing schema to database...
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

echo Step 4: Seeding database with initial data...
python prisma\seed.py
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
