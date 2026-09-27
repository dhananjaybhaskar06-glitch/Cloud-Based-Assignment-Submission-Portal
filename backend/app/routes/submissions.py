from datetime import datetime, timezone
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Assignment, Submission, User
from app.schemas import GradeSubmission
from app.auth import get_current_user, require_student, require_teacher

router = APIRouter(
    prefix="/api",
    tags=["Submissions"]
)

STORAGE_DIR = Path("storage/uploads")
STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".zip",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg"
}

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    student: User = Depends(require_student)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    now = datetime.now(timezone.utc).replace(
        tzinfo=None
    )

    # -------------------------------------------------
    # FILE VALIDATION
    # -------------------------------------------------

    original_filename = (
        file.filename or "uploaded_file.txt"
    )

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "File type not allowed. "
                "Allowed types: PDF, DOC, DOCX, ZIP, "
                "TXT, PNG, JPG, JPEG."
            )
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 10 MB"
        )

    # -------------------------------------------------
    # DETERMINE SUBMISSION STATUS
    # -------------------------------------------------

    if now > assignment.deadline:
        submission_status = "LATE"
    else:
        submission_status = "SUBMITTED"

    # -------------------------------------------------
    # CHECK EXISTING SUBMISSION
    # -------------------------------------------------

    existing = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == student.id
    ).first()

    if existing:

        old_path = Path(
            existing.file_path
        )

        old_path.unlink(
            missing_ok=True
        )

        submission = existing

        submission.status = submission_status
        submission.marks = None
        submission.feedback = None

    else:

        submission = Submission(
            assignment_id=assignment_id,
            student_id=student.id,
            file_name=original_filename,
            file_path="",
            status=submission_status
        )

        db.add(submission)
        db.flush()

    # -------------------------------------------------
    # GENERATE UNIQUE FILE NAME
    # -------------------------------------------------

    filename = (
        f"{assignment_id}_"
        f"{student.id}_"
        f"{submission.id}_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = STORAGE_DIR / filename

    file_path.write_bytes(
        content
    )

    # -------------------------------------------------
    # SAVE SUBMISSION
    # -------------------------------------------------

    submission.file_name = original_filename
    submission.file_path = str(
        file_path
    )
    submission.submitted_at = now
    submission.status = submission_status

    db.commit()
    db.refresh(submission)

    return {
        "message": (
            "Assignment submitted successfully"
        ),
        "submission_id": submission.id,
        "file_name": submission.file_name,
        "status": submission.status,
        "submitted_at": submission.submitted_at
    }


# -----------------------------------------------------
# STUDENT: VIEW OWN SUBMISSIONS
# -----------------------------------------------------

@router.get("/submissions/me")
def my_submissions(
    db: Session = Depends(get_db),
    student: User = Depends(require_student)
):
    return db.query(Submission).filter(
        Submission.student_id == student.id
    ).order_by(
        Submission.submitted_at.desc()
    ).all()


# -----------------------------------------------------
# TEACHER: VIEW ASSIGNMENT SUBMISSIONS
# -----------------------------------------------------

@router.get("/assignments/{assignment_id}/submissions")
def assignment_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    if assignment.teacher_id != teacher.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You can only view submissions "
                "for your assignments"
            )
        )

    return db.query(Submission).filter(
        Submission.assignment_id == assignment_id
    ).order_by(
        Submission.submitted_at.desc()
    ).all()


# -----------------------------------------------------
# DOWNLOAD SUBMISSION
# -----------------------------------------------------

@router.get("/submissions/{submission_id}/download")
def download_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    submission = db.query(Submission).filter(
        Submission.id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    assignment = db.query(Assignment).filter(
        Assignment.id == submission.assignment_id
    ).first()

    allowed = (
        current_user.role == "teacher"
        and assignment.teacher_id == current_user.id
    ) or (
        current_user.role == "student"
        and submission.student_id == current_user.id
    )

    if not allowed:
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not allowed to "
                "download this file"
            )
        )

    path = Path(
        submission.file_path
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(
        path=str(path),
        filename=submission.file_name
    )


# -----------------------------------------------------
# TEACHER: GRADE SUBMISSION
# -----------------------------------------------------

@router.patch("/submissions/{submission_id}/grade")
def grade_submission(
    submission_id: int,
    grade_data: GradeSubmission,
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher)
):
    submission = db.query(Submission).filter(
        Submission.id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    assignment = db.query(Assignment).filter(
        Assignment.id == submission.assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    if assignment.teacher_id != teacher.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You can only grade submissions "
                "for your own assignments"
            )
        )

    if (
        grade_data.marks < 0
        or grade_data.marks > assignment.max_marks
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Marks must be between 0 and "
                f"{assignment.max_marks}"
            )
        )

    submission.marks = grade_data.marks
    submission.feedback = grade_data.feedback

    # A graded submission always gets GRADED status.
    submission.status = "GRADED"

    db.commit()
    db.refresh(submission)

    return {
        "message": (
            "Submission graded successfully"
        ),
        "submission_id": submission.id,
        "marks": submission.marks,
        "feedback": submission.feedback,
        "status": submission.status
    }