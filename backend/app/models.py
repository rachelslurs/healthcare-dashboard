"""SQLAlchemy database models."""

from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Patient(Base):
    """Patient model for storing patient information."""
    
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    date_of_birth = Column(String, nullable=False)  # ISO format string
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="active", index=True)  # Patient status
    
    # JSON columns for complex nested data
    address = Column(JSON, nullable=True)
    emergency_contact = Column(JSON, nullable=True)
    medical_info = Column(JSON, nullable=False)
    insurance = Column(JSON, nullable=False)
    documents = Column(JSON, default=list)
    
    # Timestamps (ISO format strings)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)


class Activity(Base):
    """Activity model for tracking patient-related actions."""
    
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    action_type = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE, etc.
    description = Column(Text, nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=True, index=True)
    
    # Optional relationship (not always needed, but useful for queries)
    # patient = relationship("Patient", backref="activities")
