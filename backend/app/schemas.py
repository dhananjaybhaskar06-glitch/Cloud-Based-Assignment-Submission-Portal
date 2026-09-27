from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class AssignmentCreate(BaseModel):
    title: str
    description: str
    deadline: datetime
    max_marks: float = 100


class AssignmentResponse(BaseModel):
    id: int
    title: str
    description: str
    deadline: datetime
    max_marks: float
    teacher_id: int

    model_config = ConfigDict(from_attributes=True)


class GradeSubmission(BaseModel):
    marks: float
    feedback: Optional[str] = None
