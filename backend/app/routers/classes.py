from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app import storage
from app.models import ClassroomCreate
from app.services.auth import get_current_user, oauth2_scheme
from app.services.rbac import require_teacher_or_admin, require_admin

router = APIRouter()


@router.get("/classes")
async def list_classes(
    token: str = Depends(oauth2_scheme)
):
    """Get all classes - Available to all authenticated users"""
    user = await get_current_user(db, token)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    classes = await storage.store.db.classroom.find_many()
    return {"classes": classes, "total": len(classes)}


@router.post("/classes")
async def create_class(
    class_data: ClassroomCreate,
    token: str = Depends(oauth2_scheme)
):
    """Create a new class - Requires Teacher or Admin role"""
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    existing = await storage.store.db.classroom.find_unique(where={"ClassID": class_data.ClassID})
    if existing:
        raise HTTPException(status_code=400, detail="Class ID already exists")

    created = await storage.store.db.classroom.create(data={
        "ClassID": class_data.ClassID,
        "ClassName": class_data.ClassName,
        "ClassSubject": class_data.ClassSubject,
    })
    return {"class": created, "message": "Class created successfully"}


@router.put("/classes/{class_id}")
async def update_class(
    class_id: str,
    class_data: ClassroomCreate,
    token: str = Depends(oauth2_scheme)
):
    """Update a class - Requires Teacher or Admin role"""
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    existing = await storage.store.db.classroom.find_unique(where={"ClassID": class_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Class not found")

    updated = await storage.store.db.classroom.update(
        where={"ClassID": class_id},
        data={
            "ClassName": class_data.ClassName,
            "ClassSubject": class_data.ClassSubject,
        }
    )
    return {"class": updated, "message": "Class updated successfully"}


@router.delete("/classes/{class_id}")
async def delete_class(
    class_id: str,
    token: str = Depends(oauth2_scheme)
):
    """Delete a class - Requires Admin role"""
    user = await get_current_user(db, token)
    await require_admin(user)

    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    existing = await storage.store.db.classroom.find_unique(where={"ClassID": class_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Class not found")

    await storage.store.db.classroom.delete(where={"ClassID": class_id})
    return {"message": "Class deleted successfully"}
