from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student")
    created_at = Column(DateTime, default=datetime.utcnow)

    assignments = relationship("Assignment", back_populates="teacher")
    submissions = relationship("Submission", back_populates="student")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    deadline = Column(DateTime, nullable=False)
    max_marks = Column(Float, default=100)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(30), default="SUBMITTED")
    marks = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
