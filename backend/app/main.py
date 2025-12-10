from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from app.database import get_db, init_db
from app.models import Patient
from app.schemas import PatientListResponse, PaginatedPatientsResponse

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
