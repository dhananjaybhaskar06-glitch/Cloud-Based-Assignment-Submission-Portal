from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    if user_data.role not in ["student", "teacher"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be student or teacher"
        )

    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user or not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        user.id,
        user.role
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
