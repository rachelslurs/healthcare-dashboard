"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class Address(BaseModel):
    """Address schema."""
    street: str
    city: str
    state: str
    zip_code: str = Field(..., alias="zipCode")
    country: str
    
    model_config = ConfigDict(populate_by_name=True)


class EmergencyContact(BaseModel):
    """Emergency contact schema."""
    name: str
    relationship: str
    phone: str
    email: Optional[str] = None


class Medication(BaseModel):
    """Medication schema."""
    id: str
    name: str
    dosage: str
    frequency: str
    prescribed_by: str = Field(..., alias="prescribedBy")
    start_date: str = Field(..., alias="startDate")
    end_date: Optional[str] = Field(None, alias="endDate")
    is_active: bool = Field(..., alias="isActive")
    
    model_config = ConfigDict(populate_by_name=True)


class MedicalInfo(BaseModel):
    """Medical information schema."""
    allergies: List[str]
    current_medications: List[Medication] = Field(..., alias="currentMedications")
    conditions: List[str]
    blood_type: Literal['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] = Field(..., alias="bloodType")
    last_visit: Optional[str] = Field(None, alias="lastVisit")
    status: Literal['active', 'inactive', 'critical']
    
    model_config = ConfigDict(populate_by_name=True)


class InsuranceInfo(BaseModel):
    """Insurance information schema."""
    provider: str
    policy_number: str = Field(..., alias="policyNumber")
    group_number: Optional[str] = Field(None, alias="groupNumber")
    effective_date: str = Field(..., alias="effectiveDate")
    expiration_date: Optional[str] = Field(None, alias="expirationDate")
    copay: float
    deductible: float
    
    model_config = ConfigDict(populate_by_name=True)


class Document(BaseModel):
    """Document schema."""
    id: str
    type: Literal['medical_record', 'insurance_card', 'photo_id', 'test_result', 'other']
    name: str
    upload_date: str = Field(..., alias="uploadDate")
    file_size: int = Field(..., alias="fileSize")
    mime_type: str = Field(..., alias="mimeType")
    url: str
    
    model_config = ConfigDict(populate_by_name=True)


class PatientBase(BaseModel):
    """Base schema with shared patient fields."""
    first_name: str = Field(..., min_length=1, max_length=100, alias="firstName")
    last_name: str = Field(..., min_length=1, max_length=100, alias="lastName")
    date_of_birth: str = Field(..., alias="dateOfBirth")
    email: EmailStr
    phone: str = Field(..., min_length=1, max_length=20)
    status: str = Field(default="active", pattern="^(active|inactive|archived)$")
    address: Address
    emergency_contact: EmergencyContact = Field(..., alias="emergencyContact")
    medical_info: MedicalInfo = Field(..., alias="medicalInfo")
    insurance: InsuranceInfo
    documents: List[Document] = Field(default_factory=list)
    
    model_config = ConfigDict(populate_by_name=True)


class PatientCreate(PatientBase):
    """Schema for creating a new patient."""
    pass


class PatientUpdate(BaseModel):
    """Schema for updating a patient (all fields optional)."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100, alias="firstName")
    last_name: Optional[str] = Field(None, min_length=1, max_length=100, alias="lastName")
    date_of_birth: Optional[str] = Field(None, alias="dateOfBirth")
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=1, max_length=20)
    status: Optional[str] = Field(None, pattern="^(active|inactive|archived)$")
    address: Optional[Address] = None
    emergency_contact: Optional[EmergencyContact] = Field(None, alias="emergencyContact")
    medical_info: Optional[MedicalInfo] = Field(None, alias="medicalInfo")
    insurance: Optional[InsuranceInfo] = None
    documents: Optional[List[Document]] = None
    
    model_config = ConfigDict(populate_by_name=True)


class PatientResponse(PatientBase):
    """Schema for patient response (includes id, timestamps, and calculated fields)."""
    id: str
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")
    age: Optional[int] = None  # Calculated field
    
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class PatientListResponse(BaseModel):
    """Minimal schema for patient list view."""
    id: str
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    status: str
    age: Optional[int] = None
    last_visit: Optional[str] = Field(None, alias="lastVisit")
    
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class PaginatedPatientsResponse(BaseModel):
    """Schema for paginated patient list response."""
    items: List[PatientListResponse]
    total: int
    page: int
    page_size: int = Field(..., alias="pageSize")
    total_pages: int = Field(..., alias="totalPages")
    
    model_config = ConfigDict(populate_by_name=True)


class ActivityResponse(BaseModel):
    """Schema for activity response."""
    id: int
    timestamp: datetime
    action_type: str = Field(..., alias="actionType")
    description: str
    patient_id: Optional[str] = Field(None, alias="patientId")
    
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class PaginatedActivitiesResponse(BaseModel):
    """Schema for paginated activity list response."""
    items: List[ActivityResponse]
    total: int
    page: int
    page_size: int = Field(..., alias="pageSize")
    total_pages: int = Field(..., alias="totalPages")
    
    model_config = ConfigDict(populate_by_name=True)
