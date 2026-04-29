# AI Assignment Marking System

An AI-powered automated grading system that evaluates student PDF submissions using Google Gemini, with built-in plagiarism detection and MySQL database storage.

## ✨ Features

- **📄 PDF Upload**: Upload student submissions with automatic text extraction from PDFs
- **🤖 AI Grading**: Google Gemini-powered intelligent grading with detailed constructive feedback
- **🔍 Plagiarism Detection**: Built-in BM25 similarity checking across all submissions
- **📊 Dashboard**: Modern React UI to view and manage all submissions
- **💾 MySQL Database**: Robust data storage with Prisma ORM for production-ready scalability
- **👥 Student Management**: Track students, classes, and their submissions
- **📝 Question & Rubric System**: Configurable grading rubrics per question
- **🔐 Role-Based Access Control**: Three-tier authentication system (Admin, Teacher, Student)

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **MySQL 5.7+** (running on port 3306)
- **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/Dtai96/AI-Assignment-Marking.git
cd marking-engine
```

### 2. Setup MySQL Database

Create the database:

```bash
mysql -u root -p -e "CREATE DATABASE ai_marking;"
```

### 3. Configure Environment Variables

Create `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=mysql://root:your_password@localhost:3306/ai_marking
```

⚠️ **Important**: Replace `your_password` with your actual MySQL root password.

### 4. Install Dependencies & Setup Database

**Windows (Automated):** Run from the `backend/` folder — this will create & activate the Python virtual environment, install all Python dependencies, generate the Prisma client, push the schema, and seed the database:
```bash
cd backend
setup_database.bat
```

**Manual Setup:**
```bash
cd backend

# Create and activate Python virtual environment
python -m venv venv
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Generate Prisma client
prisma generate

# Push schema to database
prisma db push

# Seed database with sample data
python prisma/seed.py
python prisma/seed_auth.py
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 6. Run the Application

**Option A — One-click (Recommended):** From the project root, run the provided batch script which opens both servers in separate terminal windows:
```bash
run.bat
```

**Option B — Manual (two terminals):**

_Terminal 1 — Backend (FastAPI):_
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

_Terminal 2 — Frontend (React + Vite):_
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- 🌐 **Frontend Dashboard**: http://localhost:5173
- 📚 **API Documentation**: http://localhost:8000/docs
- 🔧 **API Health Check**: http://localhost:8000/api/submissions

## 📖 Usage Guide

### Uploading Submissions

1. Prepare PDF files with student ID in filename: `S{student_id}_{name}.pdf`
   - Example: `S10485739_Alice.pdf`, `S10492811_Bob.pdf`
2. Upload via the dashboard or API endpoint
3. System automatically extracts text and checks for plagiarism

### Grading Submissions

- **Grade All**: Click "Grade All" button to grade all ungraded submissions at once
- **Individual Grading**: Click "Grade" on specific submissions
- AI will provide:
  - Score (0-100)
  - Detailed feedback for improvement
  - Plagiarism risk assessment

### Viewing Results

- Dashboard shows all submissions with:
  - Student ID and name
  - Upload and grading timestamps
  - Scores and feedback
  - Plagiarism risk scores and flags

## 🗄️ Database Schema

### Tables

**Student**
- `StudentID` (Primary Key) - Unique student identifier
- `Name` - Student's full name
- `Class` - Course/class name

**Question**
- `QuestID` (Primary Key) - Unique question identifier
- `prompt` - Question prompt/description
- `rubric` - Grading rubric and criteria

**Submission**
- `StudentID` (Foreign Key) - References Student
- `QuestID` (Foreign Key) - References Question
- `submission` - Full text of student's submission
- `score` - AI-assigned score (0-100)
- `grade` - Boolean indicating if graded
- `draft_feedback` - Detailed AI feedback
- `plagiarism_risk_score` - Similarity percentage
- `plagiarism_flagged` - High plagiarism indicator
- `uploaded_at` - Upload timestamp
- `graded_at` - Grading timestamp

### Sample Data

The seeding script creates:
- 4 students (Alice, Bob, Charlie, David)
- 2 questions with comprehensive rubrics
- 3 sample submissions with varying plagiarism scores

## 🏗️ Project Structure

```
marking-engine/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── routers/           # API endpoints
│   │   │   ├── upload.py      # File upload handling
│   │   │   ├── grading.py     # Grading operations
│   │   │   └── submissions.py # Submission listing
│   │   ├── services/
│   │   │   ├── grading.py     # Gemini AI grading
│   │   │   ├── pdf_parser.py  # PDF text extraction
│   │   │   └── plagiarism.py  # Plagiarism detection
│   │   ├── database.py        # Prisma client setup
│   │   ├── storage.py         # Database operations
│   │   ├── models.py          # Pydantic models
│   │   ├── config.py          # Configuration
│   │   └── main.py            # FastAPI app entry
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.py            # Database seeding
│   ├── uploads/               # Uploaded PDF files
│   ├── requirements.txt       # Python dependencies
│   └── setup_database.bat     # Windows setup script
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── api/               # API client
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # CSS styles
│   └── package.json
├── screenshots/               # App screenshots
├── run.bat                    # One-click launcher (backend + frontend)
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL 5.7+
- **ORM**: Prisma
- **AI**: Google Gemini API
- **PDF Processing**: PyPDF2
- **Plagiarism**: rank-bm25

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS

### Development
- **Package Management**: pip (Python), npm (Node.js)
- **API Documentation**: Swagger/OpenAPI (auto-generated)

## 📸 Screenshots

### Dashboard
![Dashboard](/screenshots/dashboard.png)

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a PDF submission |
| GET | `/api/submissions` | List all submissions |
| POST | `/api/grade/{student_id}` | Grade a specific submission |
| POST | `/api/grade-all` | Grade all ungraded submissions |

### Example: Upload Submission

```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@S10485739_Alice.pdf"
```

### Example: Grade Submission

```bash
curl -X POST http://localhost:8000/api/grade/S10485739
```

## 📝 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `DATABASE_URL` | MySQL connection string | `mysql://root:pass@localhost:3306/ai_marking` |

### 🔐 Role-Based Access Control (RBAC)

The system implements a three-tier role system:

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: manage users, students, questions, grade, upload |
| **Teacher** | Operational access: manage students/questions, grade, upload |
| **Student** | Read-only: view own submissions only |

**Key Features:**
- Students can only see their own submissions (matched by username = StudentID)
- Students cannot upload, grade, or manage content
- Teachers and Admins have full operational capabilities
- Only Admins can delete students/questions and manage user accounts

**Migration from Old Versions:**

If upgrading from a version with TA (Teaching Assistant) role, run:
```bash
cd backend
python migrate_ta_to_student.py
```

📖 **See [ROLE_MIGRATION.md](./ROLE_MIGRATION.md) for detailed migration guide**

### Database Management

**Reset Database:**
```bash
cd backend
prisma db push --force-reset
python prisma/seed.py
```

**View Submissions (MySQL):**
```sql
USE ai_marking;
SELECT StudentID, score, plagiarism_flagged FROM Submission;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to MySQL | Verify MySQL is running: `net start MySQL` (Windows) |
| Database push fails | Ensure database exists: `CREATE DATABASE ai_marking;` |
| Missing API key error | Add `GEMINI_API_KEY` to `backend/.env` |
| PDF parsing fails | Use PDFs with selectable text (not scanned images) |
| Invalid filename format | Use format: `S{student_id}_{name}.pdf` |
| Port 8000 in use | Change port: `uvicorn app.main:app --reload --port 8001` |
| Port 5173 in use | Vite will automatically use next available port |
| Prisma generate fails | Run: `prisma generate --force` |
| Student sees no submissions | Ensure username matches StudentID (e.g., username="S10485739") |
| TA users can't login | Run migration: `python migrate_ta_to_student.py` |
| `venv` not found on run | Run `setup_database.bat` first to create the virtual environment |
| `python` not recognized | Ensure Python 3.8+ is installed and added to your system PATH |

## 📚 Documentation

- **[Quick Start Guide](backend/QUICK_START.md)** - 5-minute setup
- **[Database Setup](backend/DATABASE_SETUP.md)** - Detailed DB configuration
- **[Migration Guide](backend/MIGRATION_GUIDE.md)** - Comprehensive migration docs
- **[Migration Summary](MIGRATION_SUMMARY.md)** - Overview of changes

## 🔐 Security Notes

- Never commit `.env` file (contains database credentials and API keys)
- Use strong passwords for MySQL root account
- Consider creating a dedicated MySQL user with limited privileges
- Keep Gemini API key secure and rotate periodically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**dqduong2003**

## 🙏 Acknowledgments

- Google Gemini for AI grading capabilities
- FastAPI for the excellent Python web framework
- Prisma for modern database ORM
- React and Vite for the frontend stack

---

⭐ **If you find this project helpful, please give it a star on GitHub!**