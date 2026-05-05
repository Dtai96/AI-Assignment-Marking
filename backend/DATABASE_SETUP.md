# Database Setup Instructions

## Prerequisites
- MySQL server running on port 3306
- Python 3.8+
- pip installed

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

Edit `.env` and set your MySQL credentials:
```
DATABASE_URL="postgresql://postgres:ZyX-WtbZgzcc+9Y@db.sgkkwpstixxqyillskax.supabase.co:5432/postgres"
```

### 3. Create Database
Login to MySQL and create the database:
```sql
CREATE DATABASE ai_marking;
```

### 4. Run Prisma Migration
```bash
cd backend
prisma db push
```

Or generate Prisma client:
```bash
prisma generate
```

### 5. Seed the Database
```bash
cd backend
python prisma/seed.py
```

### 6. Run the Application
```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Troubleshooting

### Connection Issues
- Ensure MySQL is running on port 3306
- Check your DATABASE_URL in `.env` file
- Verify MySQL user has permissions to create/access the database

### Prisma Errors
- Make sure Prisma client is generated: `prisma generate`
- Check that the database exists before running migrations

### Import Errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check that you're running commands from the `backend` directory
