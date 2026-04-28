import re
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import UPLOADS_DIR
from app.models import UploadResponse
from app.storage import store
from app.services.pdf_parser import extract_text_from_pdf
from app.services.plagiarism import check_plagiarism

router = APIRouter()

STUDENT_ID_PATTERN = re.compile(r"^(S\d+)[_\-]")


@router.post("/upload", response_model=UploadResponse)
async def upload_submission(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    match = STUDENT_ID_PATTERN.match(file.filename)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Could not extract student ID from filename. Expected format: S<digits>_<name>.pdf",
        )

    student_id = match.group(1)
    quest_id = "Q001"  # Default question ID
    save_path = UPLOADS_DIR / file.filename

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    extracted_text = extract_text_from_pdf(str(save_path))
    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract any text from the PDF. The file may be image-based or empty.",
        )

    other_texts = await store.get_all_texts_except(student_id, quest_id)
    plagiarism_risk_score = check_plagiarism(extracted_text, other_texts)
    plagiarism_flagged = plagiarism_risk_score >= 50.0

    submission_data = {
        "StudentID": student_id,
        "QuestID": quest_id,
        "submission": extracted_text,
        "plagiarism_risk_score": round(plagiarism_risk_score, 1),
        "plagiarism_flagged": plagiarism_flagged,
        "uploaded_at": datetime.now(timezone.utc),
    }
    
    # Check if student exists, if not create a basic record
    existing_student = await store.get_student(student_id)
    if not existing_student:
        # Extract name from filename (e.g., S10485739_Alice.pdf -> Alice)
        name_match = re.search(r"^S\d+[_\-](.+?)\.pdf$", file.filename)
        student_name = name_match.group(1) if name_match else student_id
        await store.create_student({
            "StudentID": student_id,
            "Name": student_name,
            "Class": "Default"
        })
    
    await store.upsert(submission_data)

    return UploadResponse(
        student_id=student_id,
        filename=file.filename,
        plagiarism_risk_score=round(plagiarism_risk_score, 1),
        plagiarism_flagged=plagiarism_flagged,
        message="Submission uploaded successfully",
    )
