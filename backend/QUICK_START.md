# Quick Start Guide

## Prerequisites
- ✅ MySQL server running on port 3306
- ✅ Python 3.8+ installed
- ✅ pip installed

## 5-Minute Setup

### Step 1: Create Database (1 minute)
Open MySQL command line or MySQL Workbench:
```sql
CREATE DATABASE ai_marking;
```

### Step 2: Configure Environment (1 minute)
Create `backend/.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/ai_marking
```
⚠️ Replace `YOUR_PASSWORD` with your actual MySQL password

### Step 3: Run Setup (2 minutes)
```bash
cd backend
setup_database.bat
```

This will automatically:
- Install all dependencies
- Generate Prisma client
- Create database tables
- Seed sample data

### Step 4: Start Application (1 minute)
```bash
uvicorn app.main:app --reload
```

### Step 5: Test It!
Open browser to:
- **API Docs**: http://localhost:8000/docs
- **Submissions**: http://localhost:8000/api/submissions

## That's It! 🎉

Your AI Assignment Marking system is now running with MySQL database!

## What's Included

### Sample Data Created
- 4 Students: Alice, Bob, Charlie, David
- 2 Questions with grading rubrics
- 3 Submissions (2 graded, 1 ungraded)

### API Endpoints Available
- `GET /api/submissions` - View all submissions
- `POST /api/upload` - Upload new PDF submission
- `POST /api/grade/{student_id}` - Grade a submission
- `POST /api/grade-all` - Grade all ungraded submissions

## Common Commands

### View Database Tables
```bash
mysql -u root -p ai_marking -e "SHOW TABLES;"
```

### View Submissions
```bash
mysql -u root -p ai_marking -e "SELECT StudentID, score, plagiarism_flagged FROM Submission;"
```

### Reset Database
```bash
prisma db push --force-reset
python prisma/seed.py
```

### View Logs
The application will show:
- "Connected to MySQL database" on startup
- Database operations in console

## Need Help?

- 📖 Full guide: See `MIGRATION_GUIDE.md`
- 🔧 Troubleshooting: See `DATABASE_SETUP.md`
- 📋 Summary: See `../MIGRATION_SUMMARY.md`

## Next Steps

1. Upload your own PDF assignments
2. Configure your Gemini API key for AI grading
3. Customize rubrics in the Question table
4. Add more students and questions via the seed script

Enjoy your MySQL-powered AI Assignment Marking system! 🚀
