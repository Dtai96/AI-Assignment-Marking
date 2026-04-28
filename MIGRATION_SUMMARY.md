# MySQL + Prisma Migration Summary

## What Was Changed

### 1. Database Schema (Prisma)
**File**: `backend/prisma/schema.prisma`

Created three tables:
- **Student**: StudentID (PK), Name, Class
- **Question**: QuestID (PK), rubric
- **Submission**: Composite PK (StudentID, QuestID), submission text, score, grade, draft_feedback, plagiarism metrics, timestamps

### 2. Dependencies
**File**: `backend/requirements.txt`

Added:
- `prisma` - Python Prisma client for MySQL

### 3. Database Connection
**New File**: `backend/app/database.py`

- Prisma client initialization
- Async connect/disconnect functions
- Database instance management

### 4. Configuration
**File**: `backend/app/config.py`

Added:
- `DATABASE_URL` environment variable support
- Default: `mysql://root:password@localhost:3306/ai_marking`

### 5. Data Models
**File**: `backend/app/models.py`

Updated:
- Added `Student` and `Question` Pydantic models
- Updated `Submission` model to match database schema
- Changed field names: `student_id` → `StudentID`, etc.
- Added `draft_feedback` field
- Changed datetime from string to datetime objects

### 6. Storage Layer
**File**: `backend/app/storage.py` (replaced old JSON storage)

Changed from:
- JSON file-based storage
- Synchronous operations
- Simple dictionary lookups

To:
- MySQL database via Prisma
- Async operations
- Full CRUD operations
- Relationship handling

Key methods:
- `get(student_id, quest_id)` - Get submission
- `get_all()` - Get all submissions
- `upsert(submission_data)` - Create/update submission
- `get_all_texts_except(exclude_id, quest_id)` - For plagiarism check
- `create_student(student_data)` - Create student record
- `create_question(question_data)` - Create question record

### 7. Routers Updated

#### Upload Router (`backend/app/routers/upload.py`)
- Now async
- Creates student record if not exists
- Extracts student name from filename
- Uses default QuestID "Q001"
- Stores submission text in database

#### Grading Router (`backend/app/routers/grading.py`)
- All endpoints now async
- Updates grade, score, draft_feedback, and graded_at
- Handles composite key (StudentID, QuestID)

#### Submissions Router (`backend/app/routers/submissions.py`)
- Now async
- Returns quest_id in response
- Properly formats datetime objects

### 8. Application Main
**File**: `backend/app/main.py`

Added:
- Database connection on startup
- Store initialization with Prisma client
- Database disconnection on shutdown

### 9. Seeding Script
**New File**: `backend/prisma/seed.py`

Creates sample data:
- 4 students (Alice, Bob, Charlie, David)
- 2 questions with rubrics
- 3 sample submissions (mixed graded/ungraded)

### 10. Setup Scripts & Documentation

**New Files**:
- `.env.example` - Environment variable template
- `setup_database.bat` - Windows automated setup script
- `prisma/create_database.sql` - SQL script to create database
- `DATABASE_SETUP.md` - Quick setup guide
- `MIGRATION_GUIDE.md` - Comprehensive migration documentation

## How to Use

### Quick Start (Windows)

1. **Create Database**:
   ```bash
   mysql -u root -p -e "CREATE DATABASE ai_marking;"
   ```

2. **Configure Environment**:
   Create `backend/.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   DATABASE_URL=mysql://root:your_password@localhost:3306/ai_marking
   ```

3. **Run Setup**:
   ```bash
   cd backend
   setup_database.bat
   ```

4. **Start Application**:
   ```bash
   uvicorn app.main:app --reload
   ```

### Manual Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Generate Prisma client
prisma generate

# Push schema to database
prisma db push

# Seed database
python prisma/seed.py

# Run application
uvicorn app.main:app --reload
```

## Key Differences from Old System

| Feature | Old (JSON) | New (MySQL + Prisma) |
|---------|-----------|---------------------|
| Storage | JSON file | MySQL database |
| Operations | Synchronous | Asynchronous |
| Relationships | None | Full relational |
| Queries | Limited | Full SQL support |
| Scalability | Low | High |
| Data Integrity | Manual | Enforced by DB |
| Student Info | Filename only | Dedicated table |
| Questions | Hardcoded | Database table |
| Primary Key | StudentID only | Composite (StudentID, QuestID) |

## Migration Notes

⚠️ **Important**: 
- Old JSON data is NOT automatically migrated
- Old `storage.py` backed up as `storage_old.py`
- You can manually migrate data if needed by reading from `data/submissions.json`

## Testing the Migration

1. **Check database connection**:
   ```bash
   python -c "from app.database import db; import asyncio; asyncio.run(db.connect()); print('OK'); asyncio.run(db.disconnect())"
   ```

2. **View API documentation**:
   - http://localhost:8000/docs

3. **Test endpoints**:
   - GET http://localhost:8000/api/submissions
   - POST http://localhost:8000/api/upload (with PDF file)
   - POST http://localhost:8000/api-grade/S10485739

## Troubleshooting

### Common Issues

1. **Cannot connect to MySQL**
   - Verify MySQL is running
   - Check DATABASE_URL in .env
   - Test: `mysql -u root -p -h localhost -P 3306`

2. **Prisma generate fails**
   - Run: `prisma generate --force`

3. **Import errors**
   - Reinstall: `pip install -r requirements.txt`

4. **Database push fails**
   - Ensure database exists
   - Check user permissions

## Next Steps

1. ✅ Schema created
2. ✅ Prisma configured
3. ✅ Storage layer migrated
4. ✅ Routers updated
5. ✅ Seeding script created
6. ⏭️ Test with your MySQL instance
7. ⏭️ Migrate old data if needed
8. ⏭️ Deploy to production

## Files Changed Summary

### Modified Files
- `backend/prisma/schema.prisma`
- `backend/requirements.txt`
- `backend/app/config.py`
- `backend/app/models.py`
- `backend/app/storage.py` (completely rewritten)
- `backend/app/main.py`
- `backend/app/routers/upload.py`
- `backend/app/routers/grading.py`
- `backend/app/routers/submissions.py`

### New Files
- `backend/app/database.py`
- `backend/prisma/seed.py`
- `backend/prisma/create_database.sql`
- `backend/.env.example`
- `backend/setup_database.bat`
- `backend/DATABASE_SETUP.md`
- `backend/MIGRATION_GUIDE.md`

### Backed Up Files
- `backend/app/storage_old.py` (old JSON storage)

## Database Schema Diagram

```
Student (1) ────────< (M) Submission (M) >──────── (1) Question
   │                        │
   │                        │
StudentID ──────────► StudentID, QuestID (Composite PK)
Name                               │
Class                              │
                                   ▼
                            submission text
                            score
                            grade
                            draft_feedback
                            plagiarism metrics
                            timestamps
```

## Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/ai_marking
```

## Ports Used

- **MySQL**: 3306 (default)
- **FastAPI**: 8000 (default)
- **Frontend**: 5173 (Vite dev server)

---

**Migration completed successfully!** 🎉

All code is ready to use MySQL with Prisma ORM. Follow the setup instructions to get started.
