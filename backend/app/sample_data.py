"""Sample data generation for development and testing."""

import random
import uuid
from datetime import datetime, timedelta
from app.models import Patient
from app.database import SessionLocal


def generate_sample_patients(count: int = 20):
    """Generate sample patients for development and testing."""
    db = SessionLocal()
    try:
        # Check if patients already exist
        existing_count = db.query(Patient).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} patients. Skipping sample data generation.")
            return
        
        print(f"Generating {count} sample patients...")
        
        # Sample first names
        first_names = [
            "James", "Mary", "John", "Patricia", "Robert", "Jennifer",
            "Michael", "Linda", "William", "Elizabeth", "David", "Barbara",
            "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah",
            "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
            "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
            "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily",
            "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol",
            "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa"
        ]
        
        # Sample last names
        last_names = [
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
            "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
            "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson",
            "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
            "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
            "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
            "Hill", "Flores", "Green", "Adams", "Nelson", "Baker",
            "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
        ]
        
        # Sample patient statuses
        patient_statuses = ["active", "inactive", "archived"]
        
        # Sample blood types
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        
        # Sample conditions
        conditions = [
            "Hypertension", "Diabetes", "Asthma", "Arthritis",
            "High Cholesterol", "Migraine", "Anxiety", "Depression",
            "COPD", "Heart Disease", "Osteoporosis", "Sleep Apnea"
        ]
        
        # Sample allergies
        allergies_list = [
            ["Penicillin", "Peanuts"],
            ["Latex"],
            ["Shellfish"],
            ["Dust", "Pollen"],
            ["Aspirin"],
            []
        ]
        
        # Sample insurance providers
        insurance_providers = [
            "Blue Cross Blue Shield",
            "Aetna",
            "UnitedHealthcare",
            "Cigna",
            "Humana",
            "Kaiser Permanente"
        ]
        
        # Sample cities and states
        cities_states = [
            ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"),
            ("Houston", "TX"), ("Phoenix", "AZ"), ("Philadelphia", "PA"),
            ("San Antonio", "TX"), ("San Diego", "CA"), ("Dallas", "TX"),
            ("San Jose", "CA"), ("Austin", "TX"), ("Jacksonville", "FL")
        ]
        
        # Generate patients
        patients = []
        for i in range(count):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            # Generate random date of birth (between 18 and 90 years ago)
            years_ago = random.randint(18, 90)
            birth_year = datetime.now().year - years_ago
            birth_month = random.randint(1, 12)
            birth_day = random.randint(1, 28)  # Use 28 to avoid month-end issues
            date_of_birth = datetime(birth_year, birth_month, birth_day).isoformat()
            
            # Generate phone number
            phone = f"{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"
            
            # Generate email
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            
            # Random patient status (weighted towards active)
            patient_status = random.choices(
                patient_statuses,
                weights=[70, 20, 10]  # 70% active, 20% inactive, 10% archived
            )[0]
            
            # Generate address (using snake_case)
            city, state = random.choice(cities_states)
            street_number = random.randint(100, 9999)
            street_names = ["Main St", "Oak Ave", "Park Blvd", "Elm St", "Maple Dr", "Cedar Ln"]
            address = {
                "street": f"{street_number} {random.choice(street_names)}",
                "city": city,
                "state": state,
                "zip_code": f"{random.randint(10000, 99999)}",
                "country": "USA"
            }
            
            # Generate emergency contact
            contact_first = random.choice(first_names)
            contact_relationship = random.choice(["Spouse", "Parent", "Sibling", "Friend", "Child"])
            emergency_contact = {
                "name": f"{contact_first} {last_name if contact_relationship in ['Spouse', 'Child'] else random.choice(last_names)}",
                "relationship": contact_relationship,
                "phone": f"{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}",
                "email": f"{contact_first.lower()}.{random.choice(last_names).lower()}@example.com" if random.random() < 0.7 else None
            }
            
            # Generate medical info (using snake_case)
            num_conditions = random.randint(0, 3)
            patient_conditions = random.sample(conditions, min(num_conditions, len(conditions)))
            allergies = random.choice(allergies_list)
            
            # Generate last visit date (some patients have recent visits, some don't)
            last_visit = None
            if random.random() < 0.6:  # 60% have a last visit
                days_ago = random.randint(1, 365)
                last_visit = (datetime.now() - timedelta(days=days_ago)).isoformat()
            
            medical_info = {
                "allergies": allergies,
                "conditions": patient_conditions,
                "blood_type": random.choice(blood_types),
                "last_visit": last_visit
            }
            
            # Generate insurance info (using snake_case)
            effective_date = (datetime.now() - timedelta(days=random.randint(30, 1095))).isoformat()
            expiration_date = (datetime.now() + timedelta(days=random.randint(30, 365))).isoformat()
            
            insurance = {
                "provider": random.choice(insurance_providers),
                "policy_number": f"POL-{random.randint(100000, 999999)}",
                "group_number": f"GRP-{random.randint(1000, 9999)}" if random.random() < 0.8 else None,
                "effective_date": effective_date,
                "expiration_date": expiration_date if random.random() < 0.9 else None,
                "copay": round(random.uniform(10, 50), 2),
                "deductible": round(random.uniform(500, 5000), 2)
            }
            
            # Generate timestamps
            created_at = (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat()
            updated_at = (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()
            
            patient = Patient(
                id=str(uuid.uuid4()),
                first_name=first_name,
                last_name=last_name,
                date_of_birth=date_of_birth,
                phone=phone,
                email=email,
                status=patient_status,  # Separate patient status field
                address=address,
                emergency_contact=emergency_contact,
                medical_info=medical_info,
                insurance=insurance,
                documents=[],
                created_at=created_at,
                updated_at=updated_at
            )
            
            patients.append(patient)
        
        # Bulk insert patients
        db.add_all(patients)
        db.commit()
        
        print(f"Successfully generated {count} sample patients.")
        
    except Exception as e:
        print(f"Error generating sample patients: {e}")
        db.rollback()
        raise
    finally:
        db.close()
