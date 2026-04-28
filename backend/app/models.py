from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Student(BaseModel):
    StudentID: str
    Name: str
    Class: str


class Question(BaseModel):
    QuestID: str
    rubric: str


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "teacher"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class Submission(BaseModel):
    StudentID: str
    QuestID: str
    submission: str
    score: Optional[int] = None
    grade: bool = False
    draft_feedback: Optional[str] = None
    plagiarism_risk_score: float = 0.0
    plagiarism_flagged: bool = False
    uploaded_at: datetime
    graded_at: Optional[datetime] = None


class UploadResponse(BaseModel):
    student_id: str
    filename: str
    plagiarism_risk_score: float
    plagiarism_flagged: bool
    message: str


class GradeResponse(BaseModel):
    student_id: str
    quest_id: str
    score: int
    draft_feedback: str
    graded_at: str


class GradeAllResult(BaseModel):
    student_id: str
    score: Optional[int] = None
    success: bool
    error: Optional[str] = None


class GradeAllResponse(BaseModel):
    graded_count: int
    failed_count: int
    results: list[GradeAllResult]


class SubmissionOut(BaseModel):
    student_id: str
    quest_id: str
    filename: str
    uploaded_at: str
    score: Optional[int] = None
    draft_feedback: Optional[str] = None
    plagiarism_risk_score: float
    plagiarism_flagged: bool
    graded_at: Optional[str] = None


class SubmissionListResponse(BaseModel):
    submissions: list[SubmissionOut]
    total: int
    ungraded_count: int
