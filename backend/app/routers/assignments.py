from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app import storage
from app.models import AssignmentCreate
from app.services.auth import get_current_user, oauth2_scheme
from app.services.rbac import require_teacher_or_admin

router = APIRouter()


@router.get("/assignments")
async def list_assignments(
    token: str = Depends(oauth2_scheme)
):
    """
    Get assignments.
    - Teachers/Admins: get all assignments with class and question info.
    - Students: get only assignments for their enrolled class.
    """
    user = await get_current_user(db, token)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    if user.role == "student":
        # Find the student record linked to this user
        student = await storage.store.db.student.find_first(
            where={"UserID": user.id}
        )
        if not student:
            return {"assignments": [], "total": 0}

        assignments = await storage.store.db.assignment.find_many(
            where={"ClassID": student.ClassID},
            include={"classroom": True, "question": True}
        )
    else:
        assignments = await storage.store.db.assignment.find_many(
            include={"classroom": True, "question": True}
        )

    result = []
    for a in assignments:
        result.append({
            "AssignmentID": a.AssignmentID,
            "ClassID": a.ClassID,
            "QuestID": a.QuestID,
            "assigned_at": a.assigned_at.isoformat(),
            "class_name": a.classroom.ClassName if a.classroom else None,
            "class_subject": a.classroom.ClassSubject if a.classroom else None,
            "question_prompt": a.question.prompt[:120] + "..." if a.question and len(a.question.prompt) > 120 else (a.question.prompt if a.question else None),
        })

    return {"assignments": result, "total": len(result)}


@router.post("/assignments")
async def create_assignment(
    assignment: AssignmentCreate,
    token: str = Depends(oauth2_scheme)
):
    """Create a new assignment (assign a question to a class) - Teacher or Admin only"""
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Validate class exists
    cls = await storage.store.db.classroom.find_unique(where={"ClassID": assignment.ClassID})
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    # Validate question exists
    question = await storage.store.db.question.find_unique(where={"QuestID": assignment.QuestID})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Check for duplicate assignment
    existing = await storage.store.db.assignment.find_first(
        where={"ClassID": assignment.ClassID, "QuestID": assignment.QuestID}
    )
    if existing:
        raise HTTPException(status_code=400, detail="This question is already assigned to this class")

    created = await storage.store.db.assignment.create(
        data={
            "ClassID": assignment.ClassID,
            "QuestID": assignment.QuestID,
        },
        include={"classroom": True, "question": True}
    )

    return {
        "assignment": {
            "AssignmentID": created.AssignmentID,
            "ClassID": created.ClassID,
            "QuestID": created.QuestID,
            "assigned_at": created.assigned_at.isoformat(),
            "class_name": created.classroom.ClassName if created.classroom else None,
            "class_subject": created.classroom.ClassSubject if created.classroom else None,
            "question_prompt": created.question.prompt[:120] + "..." if created.question and len(created.question.prompt) > 120 else (created.question.prompt if created.question else None),
        },
        "message": "Assignment created successfully"
    }


@router.delete("/assignments/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    token: str = Depends(oauth2_scheme)
):
    """Delete an assignment - Teacher or Admin only"""
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    existing = await storage.store.db.assignment.find_unique(where={"AssignmentID": assignment_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")

    await storage.store.db.assignment.delete(where={"AssignmentID": assignment_id})
    return {"message": "Assignment deleted successfully"}
