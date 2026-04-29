"""
Database seeding script
Run this after migrations to populate initial data
"""
from prisma import Prisma
import asyncio
import os
import sys
from datetime import datetime, timezone

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


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
                print(
                    f"  Created student: {student_data['Name']} ({student_data['StudentID']})")
            else:
                print(
                    f"  Student already exists: {student_data['Name']} ({student_data['StudentID']})")

        # Create sample questions
        questions = [
            {
                "QuestID": "Q001",
                "prompt": "Discuss the fundamentals of machine learning and its applications in real-world scenarios.",
                "rubric": """
### 1. Task Response (0-30 points)
Award points based on:
- Addressing all parts of the prompt: Providing a clear explanation of machine learning fundamentals (e.g., supervised/unsupervised learning, algorithms) and identifying diverse real-world applications (up to 12 points).
- Development of ideas: Supporting technical concepts with relevant evidence, logic, or case studies (e.g., recommendation engines, healthcare diagnostics, or autonomous systems) (up to 10 points).
- Clarity of position: Maintaining a consistent, informative viewpoint on the significance and impact of the technology throughout the essay (up to 5 points).
- Word count: Meeting the minimum requirement of 250 words (up to 3 points).

### 2. Coherence and Cohesion (0-25 points)
Award points based on:
- Logical organization: Information is presented in a clear sequence, typically moving from theoretical definitions to practical implementations (up to 10 points).
- Paragraphing: Effective use of paragraphing to distinguish between theoretical "fundamentals" and "real-world applications" (up to 7 points).
- Cohesive devices: Using transition words (e.g., "specifically," "parallel to this," "by extension") to connect technical concepts naturally (up to 8 points).

### 3. Lexical Resource (0-20 points)
Award points based on:
- Range of vocabulary: Using technical terminology accurately (e.g., neural networks, datasets, predictive modeling, bias, optimization) (up to 8 points).
- Precision and Style: Choosing the right technical terms for the context and avoiding repetitive "buzzwords" (up to 6 points).
- Spelling and Word Formation: Accuracy in spelling complex technical terms and correct usage of field-specific nomenclature (up to 6 points).

### 4. Grammatical Range and Accuracy (0-25 points)
Award points based on:
- Sentence variety: Using a mix of simple, compound, and complex sentence structures to explain both basic definitions and intricate processes (up to 10 points).
- Grammatical accuracy: The frequency of "error-free" sentences and control over complex tenses (up to 10 points).
- Punctuation: Correct use of commas, full stops, and capitalization (up to 5 points)."""
            },
            {
                "QuestID": "Q002",
                "prompt": "Write an essay on the impact of artificial intelligence on modern society with a critical analysis of both positive and negative aspects.",
                "rubric": """
### 1. Task Response (0-30 points)
Award points based on:
- Addressing all parts of the prompt: Providing clear reasons for the trend and practical measures to counter it (up to 12 points).
- Development of ideas: Supporting points with relevant evidence, logic, or examples from personal experience (up to 10 points).
- Clarity of position: Maintaining a consistent viewpoint throughout the entire essay (up to 5 points).
- Word count: Meeting the minimum requirement of 250 words (up to 3 points).

### 2. Coherence and Cohesion (0-25 points)
Award points based on:
- Logical organization: Information and ideas are presented in a clear, flowing sequence (up to 10 points).
- Paragraphing: Effective use of paragraphing to separate the "reasons" section from the "measures" section (up to 7 points).
- Cohesive devices: Using transition words (e.g., furthermore, consequently, in contrast) naturally without overusing them (up to 8 points).

### 3. Lexical Resource (0-20 points)
Award points based on:
- Range of vocabulary: Using a wide variety of words related to urban/rural life, economics, and social trends (up to 8 points).
- Precision and Style: Choosing the right words for the context and using less common lexical items (up to 6 points).
- Spelling and Word Formation: Accuracy in spelling and the correct use of prefixes/suffixes (up to 6 points).

### 4. Grammatical Range and Accuracy (0-25 points)
Award points based on:
- Sentence variety: Using a mix of simple, compound, and complex sentence structures (up to 10 points).
- Grammatical accuracy: The frequency of "error-free" sentences and the level of control over grammar (up to 10 points).
- Punctuation: Correct use of commas, full stops, and capitalization (up to 5 points).
"""
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
                print(
                    f"  Created submission: {submission_data['StudentID']} - {submission_data['QuestID']}")
            else:
                print(
                    f"  Submission already exists: {submission_data['StudentID']} - {submission_data['QuestID']}")

        print("\n✅ Database seeding completed successfully!")

    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed_database())
