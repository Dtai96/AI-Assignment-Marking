# Database Setup Script for PowerShell
# Run this script from the backend directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Setup for AI Assignment Marking" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# Step 2: Generate Prisma Client
Write-Host "Step 2: Generating Prisma client..." -ForegroundColor Yellow
prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma client" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

# Step 3: Push Schema to Database
Write-Host "Step 3: Pushing schema to database..." -ForegroundColor Yellow
prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push schema to database" -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. MySQL is running on port 3306" -ForegroundColor Yellow
    Write-Host "  2. Database 'ai_marking' exists" -ForegroundColor Yellow
    Write-Host "  3. DATABASE_URL in .env is correct" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host ""

# Step 4: Seed Database
Write-Host "Step 4: Seeding database with initial data..." -ForegroundColor Yellow
python prisma\seed.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to seed database" -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run the application with:" -ForegroundColor Cyan
Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
pause
