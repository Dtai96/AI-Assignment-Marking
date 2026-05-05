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
        all_subs = await storage.store.get_all()
        # Filter by matching StudentID with user's username
        # Note: Student usernames must match their StudentID (e.g., "S10485739")
        user_student_id = user.username
        all_subs = [sub for sub in all_subs if sub.StudentID == user_student_id]
        
        # Log for debugging (remove in production)
        if len(all_subs) == 0:
            print(f"Warning: Student user '{user.username}' has no matching submissions in database")
    else:
        # Teachers and admins can see all submissions
        all_subs = await storage.store.get_all()
    
    submissions_out = []
    ungraded = 0
    for sub in all_subs:
        submissions_out.append(
            SubmissionOut(
                student_id=sub.StudentID,
                quest_id=sub.QuestID,
                filename=sub.StudentID,  # We'll need to adjust this
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
