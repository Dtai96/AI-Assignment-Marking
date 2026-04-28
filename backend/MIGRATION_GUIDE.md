# MySQL Database Migration Guide

## Overview
This guide walks you through migrating the AI Assignment Marking system from JSON-based storage to MySQL database using Prisma ORM.

## Database Schema

### Tables Created

#### 1. Student Table
- **StudentID** (String, Primary Key): Unique student identifier
- **Name** (String): Student's name
- **Class** (String): Student's class/course

#### 2. Question Table
- **QuestID** (String, Primary Key): Unique question identifier
- **rubric** (String): Grading rubric for the question

#### 3. Submission Table
- **StudentID** (String, Foreign Key): References Student table
- **QuestID** (String, Foreign Key): References Question table
- **submission** (String): The actual submission text
- **score** (Int, Nullable): Grading score
- **grade** (Boolean): Whether the submission has been graded
- **draft_feedback** (String, Nullable): Feedback from grading
- **plagiarism_risk_score** (Float): Plagiarism detection score
- **plagiarism_flagged** (Boolean): Whether plagiarism was detected
- **uploaded_at** (DateTime): Upload timestamp
- **graded_at** (DateTime, Nullable): Grading timestamp
- **Primary Key**: Composite (StudentID, QuestID)

## Quick Setup (Windows)

### Prerequisites
1. MySQL server running on port 3306
2. Python 3.8+ installed
3. pip installed

### Step-by-Step Setup

#### 1. Create the Database
Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE ai_marking;
```

Or use the provided SQL script:
```bash
mysql -u root -p < prisma/create_database.sql
```

#### 2. Configure Environment Variables
Create a `.env` file in the `backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=mysql://root:your_password@localhost:3306/ai_marking
```

**Important**: Replace `your_password` with your actual MySQL root password.

#### 3. Run the Setup Script
Double-click `setup_database.bat` or run:
```bash
cd backend
setup_database.bat
```

This will:
- Install all dependencies
- Generate Prisma client
- Push schema to database
- Seed initial data

#### 4. Start the Application
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Manual Setup

If you prefer to run commands manually:

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Generate Prisma Client
```bash
prisma generate
```

### 3. Push Schema to Database
```bash
prisma db push
```

### 4. Seed the Database
```bash
python prisma/seed.py
```

### 5. Run the Application
```bash
uvicorn app.main:app --reload
```

## Seeding Data

The seeding script (`prisma/seed.py`) creates:

### Sample Students
- S10485739 - Alice (CS101)
- S10492811 - David (CS101)
- S10499221 - Bob (CS101)
- S10511334 - Charlie (CS101)

### Sample Questions
- Q001: Machine Learning assignment with comprehensive rubric
- Q002: Essay assignment with argument-based rubric

### Sample Submissions
- Alice: Scored 85, low plagiarism risk (12.5%)
- David: Not yet graded, very low plagiarism risk (5%)
- Bob: Scored 78, high plagiarism risk (65%) - flagged

## Verification

### Check Database Connection
```bash
python -c "from prisma import Prisma; import asyncio; db = Prisma(); asyncio.run(db.connect()); print('Connected!'); asyncio.run(db.disconnect())"
```

### View Submissions
After starting the server, visit:
- http://localhost:8000/api/submissions

### Test Upload
```bash
curl -X POST http://localhost:8000/api/upload -F "file=@path/to/your/file.pdf"
```

## Troubleshooting

### Issue: Cannot connect to MySQL
**Solution:**
1. Verify MySQL is running: `net start MySQL` (Windows)
2. Check port 3306 is not blocked
3. Verify credentials in `.env` file
4. Test connection: `mysql -u root -p -h localhost -P 3306`

### Issue: Prisma generate fails
**Solution:**
```bash
# Clean and regenerate
prisma generate --force
```

### Issue: Database push fails
**Solution:**
1. Ensure database exists: `SHOW DATABASES;`
2. Check user permissions
3. Verify DATABASE_URL format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

### Issue: Import errors
**Solution:**
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Issue: Old JSON data not migrated
**Note:** The new system doesn't automatically migrate from JSON. If you need to preserve old data, you'll need to:
1. Read from `data/submissions.json`
2. Insert into MySQL using Prisma client
3. Update the storage.py to handle migration

## Database Management

### View All Submissions
```sql
USE ai_marking;
SELECT s.StudentID, st.Name, s.QuestID, s.score, s.plagiarism_risk_score, s.uploaded_at
FROM Submission s
JOIN Student st ON s.StudentID = st.StudentID;
```

### View Ungraded Submissions
```sql
SELECT * FROM Submission WHERE grade = FALSE;
```

### View Flagged Submissions
```sql
SELECT * FROM Submission WHERE plagiarism_flagged = TRUE;
```

### Reset Database
```bash
# Drop and recreate
prisma db push --force-reset
python prisma/seed.py
```

## Architecture Changes

### Before (JSON Storage)
- Data stored in `data/submissions.json`
- Simple key-value store
- No relational data
- Limited querying capabilities

### After (MySQL + Prisma)
- Relational database with proper schema
- Student, Question, and Submission tables
- Foreign key relationships
- Complex queries supported
- Better data integrity
- Scalable for production

## API Changes

The API endpoints remain the same, but now use async database operations:
- `POST /api/upload` - Upload submission
- `GET /api/submissions` - List all submissions
- `POST /api/grade/{student_id}` - Grade single submission
- `POST /api/grade-all` - Grade all ungraded submissions

All operations now properly handle:
- Student creation on first upload
- Question relationships
- Composite primary keys
- Timestamps in UTC

## Next Steps

1. Customize the seeding data in `prisma/seed.py`
2. Add more questions/rubrics as needed
3. Set up proper MySQL user with limited privileges
4. Configure backup strategy for production
5. Consider adding indexes for performance optimization

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Prisma documentation: https://www.prisma.io/docs/
3. Check MySQL logs for connection issues
4. Verify all environment variables are set correctly
