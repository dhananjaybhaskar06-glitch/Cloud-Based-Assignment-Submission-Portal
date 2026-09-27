from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Assignment, User
from app.schemas import AssignmentCreate, AssignmentResponse
from app.auth import get_current_user, require_teacher

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])


@router.post("/", response_model=AssignmentResponse)
def create_assignment(
    assignment_data: AssignmentCreate,
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher)
):
    assignment = Assignment(
        title=assignment_data.title,
        description=assignment_data.description,
        deadline=assignment_data.deadline,
        max_marks=assignment_data.max_marks,
        teacher_id=teacher.id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


@router.get("/", response_model=list[AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Assignment).order_by(
        Assignment.deadline.asc()
    ).all()


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return assignment


@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: int,
    assignment_data: AssignmentCreate,
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
            detail="You can only modify your own assignments"
        )

    assignment.title = assignment_data.title
    assignment.description = assignment_data.description
    assignment.deadline = assignment_data.deadline
    assignment.max_marks = assignment_data.max_marks

    db.commit()
    db.refresh(assignment)

    return assignment


@router.delete("/{assignment_id}")
def delete_assignment(
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
            detail="You can only delete your own assignments"
        )

    db.delete(assignment)
    db.commit()

    return {"message": "Assignment deleted successfully"}
