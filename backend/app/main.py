from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload, grading, submissions, students, questions, auth, users, classes, assignments, classmates
from app.database import connect_db, disconnect_db
from app.storage import SubmissionStore
from app.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to database on startup
    await connect_db()
    
    # Initialize the store with Prisma client
    from app import storage
    storage.store = SubmissionStore(db)
    
    yield
    
    # Disconnect from database on shutdown
    await disconnect_db()


app = FastAPI(title="Automated Tutor Feedback Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(grading.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(classes.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")
app.include_router(classmates.router, prefix="/api")
