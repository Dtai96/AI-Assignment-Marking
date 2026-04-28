from prisma import Prisma
from datetime import datetime, timezone
from app.database import db


class SubmissionStore:
    def __init__(self, prisma: Prisma):
        self.db = prisma

    async def get(self, student_id: str, quest_id: str = "Q001") -> dict | None:
        """Get a submission by student ID and question ID"""
        submission = await self.db.submission.find_unique(
            where={
                "StudentID_QuestID": {
                    "StudentID": student_id,
                    "QuestID": quest_id
                }
            }
        )
        return submission

    async def get_all(self) -> list:
        """Get all submissions"""
        submissions = await self.db.submission.find_many(
            include={"student": True, "question": True}
        )
        return submissions

    async def upsert(self, submission_data: dict):
        """Create or update a submission"""
        student_id = submission_data["StudentID"]
        quest_id = submission_data.get("QuestID", "Q001")
        
        # Check if submission already exists
        existing = await self.db.submission.find_unique(
            where={
                "StudentID_QuestID": {
                    "StudentID": student_id,
                    "QuestID": quest_id
                }
            }
        )
        
        if existing:
            # Update existing submission
            submission = await self.db.submission.update(
                where={
                    "StudentID_QuestID": {
                        "StudentID": student_id,
                        "QuestID": quest_id
                    }
                },
                data={
                    "score": submission_data.get("score"),
                    "grade": submission_data.get("grade", False),
                    "draft_feedback": submission_data.get("draft_feedback"),
                    "plagiarism_risk_score": submission_data.get("plagiarism_risk_score", 0.0),
                    "plagiarism_flagged": submission_data.get("plagiarism_flagged", False),
                    "graded_at": submission_data.get("graded_at"),
                }
            )
        else:
            # Create new submission (requires all required fields)
            submission = await self.db.submission.create(
                data={
                    "StudentID": student_id,
                    "QuestID": quest_id,
                    "submission": submission_data.get("submission", ""),
                    "score": submission_data.get("score"),
                    "grade": submission_data.get("grade", False),
                    "draft_feedback": submission_data.get("draft_feedback"),
                    "plagiarism_risk_score": submission_data.get("plagiarism_risk_score", 0.0),
                    "plagiarism_flagged": submission_data.get("plagiarism_flagged", False),
                    "graded_at": submission_data.get("graded_at"),
                }
            )
        return submission

    async def get_all_texts_except(self, exclude_id: str, quest_id: str = "Q001") -> list[str]:
        """Get all submission texts except for a specific student"""
        submissions = await self.db.submission.find_many(
            where={
                "StudentID": {"not": exclude_id},
                "QuestID": quest_id
            }
        )
        return [sub.submission for sub in submissions if sub.submission]

    async def create_student(self, student_data: dict):
        """Create a new student"""
        student = await self.db.student.create(data=student_data)
        return student

    async def get_student(self, student_id: str) -> dict | None:
        """Get a student by ID"""
        student = await self.db.student.find_unique(
            where={"StudentID": student_id}
        )
        return student

    async def create_question(self, question_data: dict):
        """Create a new question"""
        question = await self.db.question.create(data=question_data)
        return question

    async def get_question(self, quest_id: str) -> dict | None:
        """Get a question by ID"""
        question = await self.db.question.find_unique(
            where={"QuestID": quest_id}
        )
        return question


# This will be initialized with the Prisma client in main.py
store = None
