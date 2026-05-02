import re
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from prisma import Prisma
from app.database import db
from app.config import UPLOADS_DIR
from app.models import UploadResponse
from app import storage
from app.services.pdf_parser import extract_text_from_pdf
from app.services.plagiarism import check_plagiarism
from app.services.auth import get_current_user, oauth2_scheme
from app.services.rbac import is_student_role

router = APIRouter()

STUDENT_ID_PATTERN = re.compile(r"^(S\d+)[_\-]")


@router.post("/upload", response_model=UploadResponse)
async def upload_submission(
    file: UploadFile = File(...), 
    quest_id: str = Form(default="Q001"),
    token: str = Depends(oauth2_scheme)
):
    """Upload a submission - Only teachers and admins can upload"""
    # Authenticate user
    user = await get_current_user(db, token)
    
    # Check if user has permission to upload
    if is_student_role(user):
        raise HTTPException(
            status_code=403,
            detail="Students cannot upload submissions"
        )
    
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    match = STUDENT_ID_PATTERN.match(file.filename)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Could not extract student ID from filename. Expected format: S<digits>_<name>.pdf",
        )

    student_id = match.group(1)
    save_path = UPLOADS_DIR / file.filename

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    extracted_text = extract_text_from_pdf(str(save_path))
    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract any text from the PDF. The file may be image-based or empty.",
        )

    other_texts = await storage.store.get_all_texts_except(student_id, quest_id)
    plagiarism_risk_score = check_plagiarism(extracted_text, other_texts)
    plagiarism_flagged = plagiarism_risk_score >= 50.0

    submission_data = {
        "StudentID": student_id,
        "QuestID": quest_id,
        "submission": extracted_text,
        "plagiarism_risk_score": round(plagiarism_risk_score, 1),
        "plagiarism_flagged": plagiarism_flagged,
        "uploaded_at": datetime.now(timezone.utc),
    }
    
    # Check if student exists, if not create a basic record
    existing_student = await storage.store.get_student(student_id)
    if not existing_student:
        # Extract name from filename (e.g., S10485739_Alice.pdf -> Alice)
        name_match = re.search(r"^S\d+[_\-](.+?)\.pdf$", file.filename)
        student_name = name_match.group(1) if name_match else student_id
        await storage.store.create_student({
            "StudentID": student_id,
            "Name": student_name,
            "Class": "Default"
        })
    
    await storage.store.upsert(submission_data)

    return UploadResponse(
        student_id=student_id,
        filename=file.filename,
        plagiarism_risk_score=round(plagiarism_risk_score, 1),
        plagiarism_flagged=plagiarism_flagged,
        message="Submission uploaded successfully",
    )


@router.post("/student/submit", response_model=UploadResponse)
async def submit_student_assignment(
    file: UploadFile = File(...),
    assignment_id: str = Form(),
    token: str = Depends(oauth2_scheme)
):
    """Student submission endpoint - Students can submit assignments for their enrolled classes"""
    # Authenticate user
    user = await get_current_user(db, token)
    
    # Check if user is a student
    if not is_student_role(user):
        raise HTTPException(
            status_code=403,
            detail="Only students can submit assignments"
        )
    
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    
    # Get student record
    student = await storage.store.db.student.find_first(where={"UserID": user.id})
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student record not found. Please contact administrator."
        )
    
    # Validate assignment belongs to student's enrolled classes
    assignment = await storage.store.db.assignment.find_unique(where={"AssignmentID": assignment_id})
    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )
    
    # Check if student is enrolled in the class
    classmate = await storage.store.db.classmate.find_first(
        where={"StudentID": student.StudentID, "ClassroomID": assignment.ClassID}
    )
    if not classmate:
        raise HTTPException(
            status_code=403,
            detail="You are not enrolled in the class for this assignment"
        )
    
    # Extract student ID from filename
    match = STUDENT_ID_PATTERN.match(file.filename)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Could not extract student ID from filename. Expected format: S<digits>_<name>.pdf",
        )
    
    # Ensure student ID matches the authenticated student
    submitted_student_id = match.group(1)
    if submitted_student_id != student.StudentID:
        raise HTTPException(
            status_code=403,
            detail="Student ID in filename does not match your account"
        )
    
    # Due date validation - check if assignment was assigned before now
    # Note: The current schema doesn't include due_date, so we're validating against assignment creation time
    # In production, you would add a due_date field to the Assignment model
    current_time = datetime.now(timezone.utc)
    if assignment.assigned_at > current_time:
        raise HTTPException(
            status_code=400,
            detail="Assignment has not been assigned yet. Cannot submit before assignment date."
        )
    
    # Save file
    save_path = UPLOADS_DIR / file.filename
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)
    
    # Extract text
    extracted_text = extract_text_from_pdf(str(save_path))
    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract any text from the PDF. The file may be image-based or empty.",
        )
    
    # Check plagiarism
    other_texts = await storage.store.get_all_texts_except(submitted_student_id, assignment.QuestID)
    plagiarism_risk_score = check_plagiarism(extracted_text, other_texts)
    plagiarism_flagged = plagiarism_risk_score >= 50.0
    
    # Create submission data
    submission_data = {
        "StudentID": submitted_student_id,
        "QuestID": assignment.QuestID,
        "submission": extracted_text,
        "plagiarism_risk_score": round(plagiarism_risk_score, 1),
        "plagiarism_flagged": plagiarism_flagged,
        "uploaded_at": datetime.now(timezone.utc),
    }
    
    # Store submission
    await storage.store.upsert(submission_data)
    
    return UploadResponse(
        student_id=submitted_student_id,
        filename=file.filename,
        plagiarism_risk_score=round(plagiarism_risk_score, 1),
        plagiarism_flagged=plagiarism_flagged,
        message="Assignment submitted successfully",
    )
