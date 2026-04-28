from fastapi import APIRouter, HTTPException
from app import storage
from app.models import Student

router = APIRouter()


@router.get("/students")
async def list_students():
    """Get all students"""
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    students = await storage.store.db.student.find_many()
    return {"students": students, "total": len(students)}


@router.post("/students")
async def create_student(student: Student):
    """Create a new student"""
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_student(student.StudentID)
    if existing:
        raise HTTPException(status_code=400, detail="Student already exists")
    
    created = await storage.store.create_student(student.dict())
    return {"student": created, "message": "Student created successfully"}


@router.put("/students/{student_id}")
async def update_student(student_id: str, student: Student):
    """Update a student"""
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_student(student_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")
    
    updated = await storage.store.db.student.update(
        where={"StudentID": student_id},
        data={
            "Name": student.Name,
            "Class": student.Class
        }
    )
    return {"student": updated, "message": "Student updated successfully"}


@router.delete("/students/{student_id}")
async def delete_student(student_id: str):
    """Delete a student"""
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_student(student_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")
    
    await storage.store.db.student.delete(where={"StudentID": student_id})
    return {"message": "Student deleted successfully"}
