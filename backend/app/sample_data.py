"""Sample data generation for development and testing."""

import random
from datetime import date, datetime, timedelta
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
        
        # Sample statuses
        statuses = ["active", "inactive", "archived"]
        
        # Generate patients
        patients = []
        for i in range(count):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            # Generate random date of birth (between 18 and 90 years ago)
            years_ago = random.randint(18, 90)
            birth_year = date.today().year - years_ago
            birth_month = random.randint(1, 12)
            birth_day = random.randint(1, 28)  # Use 28 to avoid month-end issues
            date_of_birth = date(birth_year, birth_month, birth_day)
            
            # Generate phone number
            phone = f"{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"
            
            # Generate email
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            
            # Random status (weighted towards active)
            status = random.choices(
                statuses,
                weights=[70, 20, 10]  # 70% active, 20% inactive, 10% archived
            )[0]
            
            # Generate medical history (some patients have it, some don't)
            medical_history = {}
            if random.random() < 0.6:  # 60% have medical history
                conditions = [
                    "Hypertension", "Diabetes", "Asthma", "Arthritis",
                    "High Cholesterol", "Migraine", "Anxiety", "Depression"
                ]
                condition = random.choice(conditions)
                medical_history = {
                    "conditions": [condition],
                    "allergies": random.choice([
                        ["Penicillin", "Peanuts"],
                        ["Latex"],
                        ["Shellfish"],
                        []
                    ]),
                    "medications": random.choice([
                        ["Lisinopril", "Metformin"],
                        ["Albuterol"],
                        ["Ibuprofen"],
                        []
                    ])
                }
            
            # Generate insurance info (some patients have it)
            insurance_info = {}
            if random.random() < 0.8:  # 80% have insurance
                insurance_providers = [
                    "Blue Cross Blue Shield",
                    "Aetna",
                    "UnitedHealthcare",
                    "Cigna",
                    "Humana"
                ]
                insurance_info = {
                    "provider": random.choice(insurance_providers),
                    "policy_number": f"P-{random.randint(100000, 999999)}",
                    "group_number": f"G-{random.randint(1000, 9999)}"
                }
            
            # Generate emergency contacts (some patients have them)
            emergency_contacts = []
            if random.random() < 0.7:  # 70% have emergency contacts
                contact_names = [
                    f"{random.choice(first_names)} {last_name}",  # Family member
                    f"{random.choice(first_names)} {random.choice(last_names)}"  # Friend
                ]
                for contact_name in random.sample(contact_names, random.randint(1, 2)):
                    emergency_contacts.append({
                        "name": contact_name,
                        "relationship": random.choice(["Spouse", "Parent", "Sibling", "Friend", "Child"]),
                        "phone": f"{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"
                    })
            
            # Generate last visit date (some patients have recent visits, some don't)
            last_visit = None
            if random.random() < 0.6:  # 60% have a last visit
                days_ago = random.randint(1, 365)
                last_visit = datetime.now() - timedelta(days=days_ago)
            
            patient = Patient(
                first_name=first_name,
                last_name=last_name,
                date_of_birth=date_of_birth,
                phone=phone,
                email=email,
                status=status,
                medical_history=medical_history,
                insurance_info=insurance_info,
                emergency_contacts=emergency_contacts,
                last_visit=last_visit
            )
            
            patients.append(patient)
        
        # Bulk insert patients
        db.add_all(patients)
        db.commit()
        
        print(f"Successfully generated {count} sample patients.")
        
    except Exception as e:
        print(f"Error generating sample patients: {e}")
        db.rollback()
    finally:
        db.close()
