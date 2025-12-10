from fastapi import FastAPI, Depends, Query, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from datetime import datetime
from typing import Optional
import os
import shutil
import uuid
from pathlib import Path
from app.database import get_db, init_db
from app.models import Patient, Activity
from app.schemas import (
    PatientListResponse, PaginatedPatientsResponse, PatientResponse, 
    PatientCreate, PatientUpdate, ActivityResponse, PaginatedActivitiesResponse,
    Address, EmergencyContact, MedicalInfo, InsuranceInfo, Document
)

app = FastAPI()

# Upload directory configuration
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Allowed document extensions
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf"}


@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()
    
    # Generate sample data if configured
    seed_count = int(os.getenv("SEED_PATIENT_COUNT", "0"))
    if seed_count > 0:
        from app.sample_data import generate_sample_patients
        generate_sample_patients(count=seed_count)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/api/")
def read_root():
    return {"message": "Hello, World!"} 

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


def calculate_age(date_of_birth_str: str) -> Optional[int]:
    """Calculate age from date of birth (ISO format string)."""
    try:
        dob = datetime.fromisoformat(date_of_birth_str.replace('Z', '+00:00'))
        today = datetime.now(dob.tzinfo) if dob.tzinfo else datetime.now()
        age = today.year - dob.year
        if (today.month, today.day) < (dob.month, dob.day):
            age -= 1
        return age
    except (ValueError, AttributeError):
        return None


def log_activity(
    db: Session,
    action_type: str,
    description: str,
    patient_id: str = None
):
    """Log an activity to the database."""
    activity = Activity(
        action_type=action_type,
        description=description,
        patient_id=patient_id
    )
    db.add(activity)
    db.commit()


def patient_to_response(patient: Patient) -> PatientResponse:
    """Convert Patient model to PatientResponse schema."""
    age = calculate_age(patient.date_of_birth) if patient.date_of_birth else None
    
    # Parse nested objects through their models to ensure proper alias handling
    address = Address(**patient.address) if patient.address else None
    emergency_contact = EmergencyContact(**patient.emergency_contact) if patient.emergency_contact else None
    medical_info = MedicalInfo(**patient.medical_info) if patient.medical_info else None
    insurance = InsuranceInfo(**patient.insurance) if patient.insurance else None
    documents = [Document(**doc) for doc in (patient.documents or [])]
    
    return PatientResponse(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        date_of_birth=patient.date_of_birth,
        email=patient.email,
        phone=patient.phone,
        status=patient.status,
        address=address,
        emergency_contact=emergency_contact,
        medical_info=medical_info,
        insurance=insurance,
        documents=documents,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
        age=age
    )


def patient_to_list_response(patient: Patient) -> PatientListResponse:
    """Convert Patient model to PatientListResponse schema."""
    age = calculate_age(patient.date_of_birth) if patient.date_of_birth else None
    # Get last_visit from medical_info (using snake_case key)
    last_visit = patient.medical_info.get('last_visit') if patient.medical_info else None
    
    return PatientListResponse(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        status=patient.status,  # Use separate patient status field
        age=age,
        last_visit=last_visit
    )


@app.get("/api/patients", response_model=PaginatedPatientsResponse)
def get_patients(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query(None, description="Search by first name or last name"),
    status: str = Query(None, description="Filter by status (active, inactive, archived)"),
    sort_by: str = Query("lastName", description="Sort by: lastName, status, lastVisit"),
    sort_order: str = Query("asc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """Get paginated list of patients with optional search, filters, and sorting."""
    # Build base query
    query = db.query(Patient)
    
    # Apply search filter if provided
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search_pattern)) |
            (Patient.last_name.ilike(search_pattern))
        )
    
    # Apply status filter if provided (use separate patient status field)
    if status:
        if status not in ["active", "inactive", "archived"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Must be one of: active, inactive, archived"
            )
        query = query.filter(Patient.status == status)
    
    # Apply sorting
    if sort_order not in ["asc", "desc"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort_order. Must be 'asc' or 'desc'"
        )
    
    # Define sort field mappings
    if sort_by == "lastName":
        sort_column = Patient.last_name
        actual_order = sort_order
    elif sort_by == "status":
        # Sort by patient status field
        sort_column = Patient.status
        actual_order = sort_order
    elif sort_by == "lastVisit":
        # Sort by lastVisit in medical_info JSON using JSON_EXTRACT for SQLite compatibility
        sort_column = sql_func.json_extract(Patient.medical_info, '$.last_visit')
        actual_order = sort_order
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort_by. Must be one of: lastName, status, lastVisit"
        )
    
    # Apply sorting
    if actual_order == "desc":
        order_expr = sort_column.desc()
    else:
        order_expr = sort_column.asc()
    
    # Handle NULL values for lastVisit
    if sort_by == "lastVisit":
        order_expr = order_expr.nulls_last()
    
    query = query.order_by(order_expr)
    
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Get total count (after filters)
    total = query.count()
    
    # Get patients for current page
    patients = query.offset(offset).limit(page_size).all()
    
    # Convert to response format
    items = [patient_to_list_response(patient) for patient in patients]
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    
    return PaginatedPatientsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Get a single patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient_to_response(patient)


@app.post("/api/patients", response_model=PatientResponse, status_code=201)
def create_patient(patient_data: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient."""
    # Generate UUID for patient ID
    patient_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    # Create patient from schema (using snake_case field names)
    # model_dump() outputs field names (snake_case) by default, which is what we want for storage
    patient = Patient(
        id=patient_id,
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        date_of_birth=patient_data.date_of_birth,
        phone=patient_data.phone,
        email=patient_data.email,
        status=patient_data.status,
        address=patient_data.address.model_dump(by_alias=False),  # Use field names (snake_case)
        emergency_contact=patient_data.emergency_contact.model_dump(by_alias=False),
        medical_info=patient_data.medical_info.model_dump(by_alias=False),
        insurance=patient_data.insurance.model_dump(by_alias=False),
        documents=[doc.model_dump(by_alias=False) for doc in patient_data.documents],
        created_at=now,
        updated_at=now
    )
    
    db.add(patient)
    db.commit()
    db.refresh(patient)
    
    # Log activity
    patient_name = f"{patient.first_name} {patient.last_name}"
    log_activity(
        db=db,
        action_type="CREATE",
        description=f"Added new patient {patient_name}",
        patient_id=patient.id
    )
    
    return patient_to_response(patient)


@app.put("/api/patients/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Update only provided fields (using snake_case)
    # All fields can be updated directly - simple fields and nested JSON objects
    # are handled the same way since nested objects are already dictionaries from model_dump()
    update_data = patient_data.model_dump(exclude_unset=True, mode='json')
    
    # List of updatable fields (excludes id, created_at, updated_at which are managed separately)
    updatable_fields = [
        "first_name", "last_name", "date_of_birth", "phone", "email", "status",
        "address", "emergency_contact", "medical_info", "insurance", "documents"
    ]
    
    # Update fields using setattr for better maintainability
    for field_name in updatable_fields:
        if field_name in update_data:
            setattr(patient, field_name, update_data[field_name])
    
    # Update timestamp
    patient.updated_at = datetime.now().isoformat()
    
    db.commit()
    db.refresh(patient)
    
    # Log activity
    patient_name = f"{patient.first_name} {patient.last_name}"
    log_activity(
        db=db,
        action_type="UPDATE",
        description=f"Updated details for {patient_name}",
        patient_id=patient.id
    )
    
    return patient_to_response(patient)


@app.delete("/api/patients/{patient_id}", status_code=204)
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    """Delete a patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Log activity before deletion (so we have the patient name and ID)
    patient_name = f"{patient.first_name} {patient.last_name}"
    
    # Log activity before deletion
    log_activity(
        db=db,
        action_type="DELETE",
        description=f"Removed patient {patient_name}",
        patient_id=patient.id
    )
    
    # Delete the patient
    db.delete(patient)
    db.commit()
    
    return


@app.get("/api/activities", response_model=PaginatedActivitiesResponse)
def get_activities(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get paginated list of activities, sorted by most recent first."""
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Get total count
    total = db.query(Activity).count()
    
    # Get activities for current page, sorted by timestamp (most recent first)
    activities = (
        db.query(Activity)
        .order_by(Activity.timestamp.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
    
    # Convert to response format
    items = [
        ActivityResponse(
            id=activity.id,
            timestamp=activity.timestamp,
            action_type=activity.action_type,
            description=activity.description,
            patient_id=activity.patient_id
        )
        for activity in activities
    ]
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    
    return PaginatedActivitiesResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@app.post("/api/patients/{patient_id}/upload-document", response_model=PatientResponse)
def upload_patient_document(
    patient_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a document for a patient."""
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}"
        )
    
    # Generate unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{Path(file.filename).name}"
    file_path = UPLOAD_DIR / filename
    
    # Save the file
    with open(file_path, "wb") as dest_file:
        shutil.copyfileobj(file.file, dest_file)
    
    # Determine document type from filename or default to 'other'
    doc_type = 'other'
    if 'medical' in file.filename.lower() or 'record' in file.filename.lower():
        doc_type = 'medical_record'
    elif 'insurance' in file.filename.lower():
        doc_type = 'insurance_card'
    elif 'photo' in file.filename.lower() or 'id' in file.filename.lower():
        doc_type = 'photo_id'
    elif 'test' in file.filename.lower() or 'result' in file.filename.lower():
        doc_type = 'test_result'
    
    # Add document metadata to patient.documents array
    documents = patient.documents or []
    document_metadata = {
        "id": str(uuid.uuid4()),
        "type": doc_type,
        "name": file.filename,
        "upload_date": datetime.now().isoformat(),
        "file_size": file_path.stat().st_size,
        "mime_type": file.content_type or "application/pdf",
        "url": f"/uploads/{filename}"
    }
    documents.append(document_metadata)
    
    # Update patient documents
    patient.documents = documents
    patient.updated_at = datetime.now().isoformat()
    db.commit()
    db.refresh(patient)
    
    # Log activity
    patient_name = f"{patient.first_name} {patient.last_name}"
    log_activity(
        db=db,
        action_type="UPDATE",
        description=f"Uploaded document '{file.filename}' for {patient_name}",
        patient_id=patient.id
    )
    
    return patient_to_response(patient)
