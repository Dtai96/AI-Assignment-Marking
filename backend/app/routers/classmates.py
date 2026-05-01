from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app import storage
from app.models import ClassmateCreate
from app.services.auth import get_current_user, oauth2_scheme
from app.services.rbac import require_teacher_or_admin, require_admin

router = APIRouter()


@router.get("/classmates/my-classes")
async def get_my_classes(
    token: str = Depends(oauth2_scheme)
):
    """Get all classes the logged-in student is enrolled in"""
    user = await get_current_user(db, token)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Find the student record linked to this user
    student = await storage.store.db.student.find_first(
        where={"UserID": user.id}
    )
    if not student:
        return {"classes": [], "total": 0}

    classmates = await storage.store.db.classmate.find_many(
        where={"StudentID": student.StudentID},
        include={"classroom": True}
    )

    classes = [
        {
            "ClassID": cm.classroom.ClassID,
            "ClassName": cm.classroom.ClassName,
            "ClassSubject": cm.classroom.ClassSubject,
        }
        for cm in classmates if cm.classroom
    ]
    return {"classes": classes, "total": len(classes)}


@router.get("/classmates")
async def list_classmates(
    token: str = Depends(oauth2_scheme)
):
    """Get all classmate enrollment records - Teacher or Admin only"""
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    classmates = await storage.store.db.classmate.find_many(
        include={"student": True, "classroom": True}
    )
    return {"classmates": classmates, "total": len(classmates)}


@router.post("/classmates")
async def add_classmate(
    data: ClassmateCreate,
    token: str = Depends(oauth2_scheme)
):
    """Enroll a student in a class - Teacher or Admin only"""
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Validate student exists
    student = await storage.store.db.student.find_unique(where={"StudentID": data.StudentID})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Validate classroom exists
    cls = await storage.store.db.classroom.find_unique(where={"ClassID": data.ClassroomID})
    if not cls:
        raise HTTPException(status_code=404, detail="Classroom not found")

    # Check for duplicate enrollment
    existing = await storage.store.db.classmate.find_first(
        where={"StudentID": data.StudentID, "ClassroomID": data.ClassroomID}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Student is already enrolled in this class")

    created = await storage.store.db.classmate.create(
        data={"StudentID": data.StudentID, "ClassroomID": data.ClassroomID}
    )
    return {"classmate": created, "message": "Student enrolled successfully"}


@router.delete("/classmates/{mate_id}")
async def remove_classmate(
    mate_id: str,
    token: str = Depends(oauth2_scheme)
):
    """Remove a student from a class - Teacher or Admin only"""
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    existing = await storage.store.db.classmate.find_unique(where={"MateID": mate_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Enrollment record not found")

    await storage.store.db.classmate.delete(where={"MateID": mate_id})
    return {"message": "Student removed from class successfully"}
