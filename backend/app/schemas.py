"""Pydantic schemas for request/response validation."""

from datetime import date, datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, EmailStr, Field


class PatientBase(BaseModel):
    """Base schema with shared patient fields."""
    
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    status: str = Field(default="active", pattern="^(active|inactive|archived)$")
    medical_history: Dict = Field(default_factory=dict)
    insurance_info: Dict = Field(default_factory=dict)
    emergency_contacts: List[Dict] = Field(default_factory=list)


class PatientCreate(PatientBase):
    """Schema for creating a new patient."""
    pass


class PatientUpdate(BaseModel):
    """Schema for updating a patient (all fields optional)."""
    
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|archived)$")
    medical_history: Optional[Dict] = None
    insurance_info: Optional[Dict] = None
    emergency_contacts: Optional[List[Dict]] = None
    last_visit: Optional[datetime] = None


class PatientResponse(PatientBase):
    """Schema for patient response (includes id, timestamps, and calculated fields)."""
    
    id: int
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_visit: Optional[datetime] = None
    age: Optional[int] = None  # Calculated field
    
    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    """Minimal schema for patient list view."""
    
    id: int
    first_name: str
    last_name: str
    status: str
    age: Optional[int] = None
    last_visit: Optional[datetime] = None
    
    class Config:
        from_attributes = True
