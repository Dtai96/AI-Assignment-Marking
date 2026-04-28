from fastapi import APIRouter, HTTPException
from app import storage
from app.models import SubmissionListResponse, SubmissionOut

router = APIRouter()


@router.get("/submissions", response_model=SubmissionListResponse)
async def list_submissions():
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
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
            )
        )
        if sub.score is None:
            ungraded += 1

    return SubmissionListResponse(
        submissions=submissions_out,
        total=len(submissions_out),
        ungraded_count=ungraded,
    )
