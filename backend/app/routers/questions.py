from fastapi import APIRouter, HTTPException
from app import storage
from app.models import Question

router = APIRouter()


@router.get("/questions")
async def list_questions():
    """Get all questions"""
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    questions = await storage.store.db.question.find_many()
    return {"questions": questions, "total": len(questions)}


@router.post("/questions")
async def create_question(question: Question):
    """Create a new question"""
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_question(question.QuestID)
    if existing:
        raise HTTPException(status_code=400, detail="Question already exists")
    
    created = await storage.store.create_question(question.dict())
    return {"question": created, "message": "Question created successfully"}


@router.put("/questions/{quest_id}")
async def update_question(quest_id: str, question: Question):
    """Update a question"""
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
async def delete_question(quest_id: str):
    """Delete a question"""
    if storage.store is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    existing = await storage.store.get_question(quest_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Question not found")
    
    await storage.store.db.question.delete(where={"QuestID": quest_id})
    return {"message": "Question deleted successfully"}
