from fastapi import APIRouter, HTTPException, Depends
from prisma import Prisma
from app.database import db
from app import storage
from app.models import SubmissionListResponse, SubmissionOut
from app.services.auth import get_current_user, oauth2_scheme
from app.services.rbac import is_student_role, is_teacher_or_admin

router = APIRouter()


@router.get("/submissions", response_model=SubmissionListResponse)
async def list_submissions(token: str = Depends(oauth2_scheme)):
    """List submissions - Students can only see their own, teachers/admins see all"""
    # Authenticate user
    user = await get_current_user(db, token)
    
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    # Filter submissions based on user role
    if is_student_role(user):
        # Students can only see their own submissions
        # First, get the student record linked to this user
        student = await storage.store.db.student.find_first(where={"UserID": user.id})
        if not student:
            # If no student record found, return empty list
            print(f"Warning: No student record found for user '{user.username}' (id: {user.id})")
            all_subs = []
        else:
            # Filter submissions by the student's StudentID
            all_subs = await storage.store.db.submission.find_many(
                where={"StudentID": student.StudentID}
            )
            print(f"Found {len(all_subs)} submissions for student '{student.StudentID}'")
    else:
        # Teachers and admins can see all submissions
        all_subs = await storage.store.get_all()
    
    submissions_out = []
    ungraded = 0
    for sub in all_subs:
        # Try to get filename from the submission content or use student_id as fallback
        # The filename is not stored in the database, so we'll use student_id for now
        # In a production system, you'd want to store the filename in the database
        submissions_out.append(
            SubmissionOut(
                student_id=sub.StudentID,
                quest_id=sub.QuestID,
                filename=f"{sub.StudentID}_submission.pdf",  # Placeholder - actual filename not stored
                uploaded_at=sub.uploaded_at.isoformat(),
                score=sub.score,
                draft_feedback=sub.draft_feedback,
                plagiarism_risk_score=sub.plagiarism_risk_score,
                plagiarism_flagged=sub.plagiarism_flagged,
                graded_at=sub.graded_at.isoformat() if sub.graded_at else None,
                submission=sub.submission,  # Include submission content
            )
        )
        if sub.score is None:
            ungraded += 1

    return SubmissionListResponse(
        submissions=submissions_out,
        total=len(submissions_out),
        ungraded_count=ungraded,
    )
