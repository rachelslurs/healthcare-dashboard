from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from app.database import get_db, init_db
from app.models import Patient, Activity
from app.schemas import PatientListResponse, PaginatedPatientsResponse, PatientResponse, PatientCreate

app = FastAPI()


@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    db: Session = Depends(get_db)
):
    """Get paginated list of patients."""
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Get total count
    total = db.query(Patient).count()
    
    # Get patients for current page
    patients = db.query(Patient).offset(offset).limit(page_size).all()
    
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
