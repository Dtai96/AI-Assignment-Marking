from fastapi import APIRouter, HTTPException, Depends
from prisma import Prisma
from app.database import db
from app import storage
from app.models import Question
from app.services.auth import get_current_user, oauth2_scheme
from app.services.rbac import require_teacher_or_admin, require_admin

router = APIRouter()


@router.get("/questions")
async def list_questions(
    token: str = Depends(oauth2_scheme)
):
    """Get all questions - Available to all authenticated users"""
    # Authenticate user
    user = await get_current_user(db, token)
    
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    questions = await storage.store.db.question.find_many()
    return {"questions": questions, "total": len(questions)}


@router.post("/questions")
async def create_question(
    question: Question,
    token: str = Depends(oauth2_scheme)
):
    """Create a new question - Requires Teacher or Admin role"""
    # Authenticate and authorize user
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)
    
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_question(question.QuestID)
    if existing:
        raise HTTPException(status_code=400, detail="Question already exists")
    
    created = await storage.store.create_question(question.dict())
    return {"question": created, "message": "Question created successfully"}


@router.put("/questions/{quest_id}")
async def update_question(
    quest_id: str, 
    question: Question,
    token: str = Depends(oauth2_scheme)
):
    """Update a question - Requires Teacher or Admin role"""
    # Authenticate and authorize user
    user = await get_current_user(db, token)
    await require_teacher_or_admin(user)
    
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_question(quest_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Question not found")
    
    updated = await storage.store.db.question.update(
        where={"QuestID": quest_id},
        data={
            "rubric": question.rubric
        }
    )
    return {"question": updated, "message": "Question updated successfully"}


@router.delete("/questions/{quest_id}")
async def delete_question(
    quest_id: str,
    token: str = Depends(oauth2_scheme)
):
    """Delete a question - Requires Admin role only"""
    # Authenticate and authorize user
    user = await get_current_user(db, token)
    await require_admin(user)
    
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_question(quest_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Question not found")
    
    await storage.store.db.question.delete(where={"QuestID": quest_id})
    return {"message": "Question deleted successfully"}
