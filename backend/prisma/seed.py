"""
Database seeding script
Run this after migrations to populate initial data
"""
import asyncio
import os
import sys
from datetime import datetime, timezone

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from prisma import Prisma


async def seed_database():
    """Seed the database with initial data"""
    db = Prisma()
    await db.connect()
    
    try:
        # Create sample students
        students = [
            {"StudentID": "S10485739", "Name": "Alice", "Class": "CS101"},
            {"StudentID": "S10492811", "Name": "David", "Class": "CS101"},
            {"StudentID": "S10499221", "Name": "Bob", "Class": "CS101"},
            {"StudentID": "S10511334", "Name": "Charlie", "Class": "CS101"},
        ]
        
        print("Creating students...")
        for student_data in students:
            existing = await db.student.find_unique(where={"StudentID": student_data["StudentID"]})
            if not existing:
                await db.student.create(data=student_data)
                print(f"  Created student: {student_data['Name']} ({student_data['StudentID']})")
            else:
                print(f"  Student already exists: {student_data['Name']} ({student_data['StudentID']})")
        
        # Create sample questions
        questions = [
            {
                "QuestID": "Q001",
                "prompt": "Discuss the fundamentals of machine learning and its applications in real-world scenarios.",
                "rubric": """Grade the following student submission based on:
1. Content quality and depth (40%)
2. Structure and organization (30%)
3. Language and grammar (20%)
4. Originality and critical thinking (10%)

Provide a score out of 100 and detailed feedback."""
            },
            {
                "QuestID": "Q002", 
                "prompt": "Write an essay on the impact of artificial intelligence on modern society with a critical analysis of both positive and negative aspects.",
                "rubric": """Grade the following essay based on:
1. Thesis statement clarity (25%)
2. Argument development (35%)
3. Evidence and examples (25%)
4. Conclusion effectiveness (15%)

Provide a score out of 100 and constructive feedback."""
            }
        ]
        
        print("\nCreating questions...")
        for question_data in questions:
            existing = await db.question.find_unique(where={"QuestID": question_data["QuestID"]})
            if not existing:
                await db.question.create(data=question_data)
                print(f"  Created question: {question_data['QuestID']}")
            else:
                print(f"  Question already exists: {question_data['QuestID']}")
        
        # Create sample submissions
        submissions = [
            {
                "StudentID": "S10485739",
                "QuestID": "Q001",
                "submission": "This is a sample submission from Alice discussing machine learning fundamentals and applications.",
                "score": 85,
                "grade": True,
                "plagiarism_risk_score": 12.5,
                "plagiarism_flagged": False,
                "uploaded_at": datetime.now(timezone.utc),
                "graded_at": datetime.now(timezone.utc),
            },
            {
                "StudentID": "S10492811",
                "QuestID": "Q001",
                "submission": "David's submission on artificial intelligence and its impact on modern society with critical analysis.",
                "score": None,
                "grade": False,
                "plagiarism_risk_score": 5.0,
                "plagiarism_flagged": False,
                "uploaded_at": datetime.now(timezone.utc),
                "graded_at": None,
            },
            {
                "StudentID": "S10499221",
                "QuestID": "Q001",
                "submission": "Bob's essay covering deep learning neural networks and their practical applications in industry.",
                "score": 78,
                "grade": True,
                "plagiarism_risk_score": 65.0,
                "plagiarism_flagged": True,
                "uploaded_at": datetime.now(timezone.utc),
                "graded_at": datetime.now(timezone.utc),
            },
        ]
        
        print("\nCreating submissions...")
        for submission_data in submissions:
            existing = await db.submission.find_unique(
                where={
                    "StudentID_QuestID": {
                        "StudentID": submission_data["StudentID"],
                        "QuestID": submission_data["QuestID"]
                    }
                }
            )
            if not existing:
                await db.submission.create(data=submission_data)
                print(f"  Created submission: {submission_data['StudentID']} - {submission_data['QuestID']}")
            else:
                print(f"  Submission already exists: {submission_data['StudentID']} - {submission_data['QuestID']}")
        
        print("\n✅ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed_database())
