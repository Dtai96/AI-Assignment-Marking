from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app import storage
from app.models import GradeResponse, GradeAllResponse, GradeAllResult
from app.services.grading import grade_submission

router = APIRouter()


@router.post("/grade/{student_id}", response_model=GradeResponse)
async def grade_single(student_id: str, quest_id: str = "Q001"):
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    submission = await storage.store.get(student_id, quest_id)
    if not submission:
        raise HTTPException(
            status_code=404,
            detail=f"Submission not found for student ID: {student_id} and question ID: {quest_id}",
        )

    try:
        print(submission)
        # Fetch the rubric from the database
        question = await storage.store.get_question(quest_id)
        rubric = question.rubric if question else ""
        if question is None or rubric == "":
            raise HTTPException(
                status_code=404,
                detail=f"Question not found for question ID: {quest_id}",
            )

        result = grade_submission(submission.submission, rubric)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API call failed: {str(e)}",
        )

    graded_at = datetime.now(timezone.utc)
    submission_data = {
        "StudentID": student_id,
        "QuestID": quest_id,
        "score": result["score"],
        "grade": True,
        "draft_feedback": result.get("draft_feedback", ""),
        "graded_at": graded_at,
    }
    await storage.store.upsert(submission_data)

    return GradeResponse(
        student_id=student_id,
        quest_id=quest_id,
        score=result["score"],
        draft_feedback=result.get("draft_feedback", ""),
        graded_at=graded_at.isoformat(),
    )


@router.post("/grade-all", response_model=GradeAllResponse)
async def grade_all():
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    all_subs = await storage.store.get_all()
    ungraded = [sub for sub in all_subs if sub.score is None]

    results = []
    graded_count = 0
    failed_count = 0

    for submission in ungraded:
        student_id = submission.StudentID
        quest_id = submission.QuestID
        try:
            # Fetch the rubric from the database
            question = await storage.store.get_question(quest_id)
            rubric = question.rubric if question else ""
            result = grade_submission(submission.submission, rubric)
            graded_at = datetime.now(timezone.utc)
            submission_data = {
                "StudentID": student_id,
                "QuestID": quest_id,
                "score": result["score"],
                "grade": True,
                "draft_feedback": result.get("draft_feedback", ""),
                "graded_at": graded_at,
            }
            await storage.store.upsert(submission_data)
            results.append(
                GradeAllResult(
                    student_id=student_id,
                    score=result["score"],
                    success=True,
                )
            )
            graded_count += 1
        except Exception as e:
            results.append(
                GradeAllResult(
                    student_id=student_id,
                    success=False,
                    error=str(e),
                )
            )
            failed_count += 1

    return GradeAllResponse(
        graded_count=graded_count,
        failed_count=failed_count,
        results=results,
    )
