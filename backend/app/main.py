from fastapi import FastAPI, Depends, Query, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, date
import os
import shutil
from pathlib import Path
from app.database import get_db, init_db
from app.models import Patient, Activity
from app.schemas import (
    PatientListResponse, PaginatedPatientsResponse, PatientResponse, 
    PatientCreate, PatientUpdate, ActivityResponse, PaginatedActivitiesResponse
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


def calculate_age(date_of_birth: date) -> int:
    """Calculate age from date of birth."""
    today = date.today()
    age = today.year - date_of_birth.year
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        age -= 1
    return age


def log_activity(
    db: Session,
    action_type: str,
    description: str,
    patient_id: int = None
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
    return PatientResponse(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        date_of_birth=patient.date_of_birth,
        phone=patient.phone,
        email=patient.email,
        status=patient.status,
        medical_history=patient.medical_history or {},
        insurance_info=patient.insurance_info or {},
        emergency_contacts=patient.emergency_contacts or [],
        photo_url=patient.photo_url,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
        last_visit=patient.last_visit,
        age=age
    )


@app.get("/api/patients", response_model=PaginatedPatientsResponse)
def get_patients(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query(None, description="Search by first name or last name"),
    status: str = Query(None, description="Filter by status (active, inactive, archived)"),
    sort_by: str = Query("last_name", description="Sort by: last_name, age, status, last_visit"),
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
    
    # Apply status filter if provided
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
    
    # Define sort field mappings to column attributes
    sort_field_map = {
        "last_name": Patient.last_name,
        "status": Patient.status,
        "last_visit": Patient.last_visit,
        "age": Patient.date_of_birth,  # Special case: uses date_of_birth with reversed logic
    }
    
    if sort_by not in sort_field_map:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort_by. Must be one of: {', '.join(sort_field_map.keys())}"
        )
    
    # Get the column to sort by
    sort_column = sort_field_map[sort_by]
    
    # Determine sort direction (age uses reversed logic)
    if sort_by == "age":
        # Age sorting: older patients have earlier date_of_birth
        # For descending (oldest first): order by date_of_birth ASC (earliest dates first)
        # For ascending (youngest first): order by date_of_birth DESC (latest dates first)
        actual_order = "asc" if sort_order == "desc" else "desc"
    else:
        actual_order = sort_order
    
    # Apply sorting
    if actual_order == "desc":
        order_expr = sort_column.desc()
    else:
        order_expr = sort_column.asc()
    
    # Handle NULL values for last_visit
    if sort_by == "last_visit":
        order_expr = order_expr.nulls_last()
    
    query = query.order_by(order_expr)
    
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Get total count (after filters)
    total = query.count()
    
    # Get patients for current page
    patients = query.offset(offset).limit(page_size).all()
    
    # Convert to response format with age calculation
    items = []
    for patient in patients:
        age = calculate_age(patient.date_of_birth) if patient.date_of_birth else None
        items.append(PatientListResponse(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            status=patient.status,
            age=age,
            last_visit=patient.last_visit
        ))
    
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
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get a single patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient_to_response(patient)


@app.post("/api/patients", response_model=PatientResponse, status_code=201)
def create_patient(patient_data: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient."""
    # Create patient from schema
    patient = Patient(
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        date_of_birth=patient_data.date_of_birth,
        phone=patient_data.phone,
        email=patient_data.email,
        status=patient_data.status,
        medical_history=patient_data.medical_history or {},
        insurance_info=patient_data.insurance_info or {},
        emergency_contacts=patient_data.emergency_contacts or []
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
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Update only provided fields
    update_data = patient_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
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
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
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


@app.post("/api/patients/{patient_id}/upload-photo", response_model=PatientResponse)
def upload_patient_photo(
    patient_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a photo for a patient."""
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Generate unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{Path(file.filename).name}"
    file_path = UPLOAD_DIR / filename
    
    # Store old photo path for cleanup (don't delete yet)
    old_file_path = None
    if patient.photo_url:
        old_file_path = UPLOAD_DIR / Path(patient.photo_url).name
    
    try:
        # Save the new file first
        with open(file_path, "wb") as dest_file:
            shutil.copyfileobj(file.file, dest_file)
        
        # Update patient photo_url
        patient.photo_url = f"/uploads/{filename}"
        db.commit()
        db.refresh(patient)
        
        # Only delete old photo after successful save and database update
        if old_file_path and old_file_path.exists():
            old_file_path.unlink()
            
    except Exception as e:
        # Rollback database changes
        db.rollback()
        # Clean up the new file if it was created
        if file_path.exists():
            file_path.unlink()
        # Re-raise the exception
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload photo: {str(e)}"
        )
    
    # Log activity
    patient_name = f"{patient.first_name} {patient.last_name}"
    log_activity(
        db=db,
        action_type="UPDATE",
        description=f"Uploaded photo for {patient_name}",
        patient_id=patient.id
    )
    
    return patient_to_response(patient)


@app.post("/api/patients/{patient_id}/upload-document", response_model=PatientResponse)
def upload_patient_document(
    patient_id: int,
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
    
    # Add document metadata to patient.documents array
    documents = patient.documents or []
    document_metadata = {
        "filename": file.filename,
        "url": f"/uploads/{filename}",
        "uploaded_at": datetime.now().isoformat(),
        "size": file_path.stat().st_size
    }
    documents.append(document_metadata)
    
    # Update patient documents
    patient.documents = documents
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
