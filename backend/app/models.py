"""SQLAlchemy database models."""

from sqlalchemy import Column, Integer, String, Date, DateTime, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Patient(Base):
    """Patient model for storing patient information."""
    
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    status = Column(String(20), nullable=False, default="active", index=True)
    
    # JSON columns for complex data
    medical_history = Column(JSON, default=dict)
    insurance_info = Column(JSON, default=dict)
    emergency_contacts = Column(JSON, default=list)
    documents = Column(JSON, default=list)
    
    # File uploads
    photo_url = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_visit = Column(DateTime(timezone=True))


class Activity(Base):
    """Activity model for tracking patient-related actions."""
    
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    action_type = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE, etc.
    description = Column(Text, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True, index=True)
    
    # Optional relationship (not always needed, but useful for queries)
    # patient = relationship("Patient", backref="activities")
