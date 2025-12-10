// Patient-related types

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  copay: number;
  deductible?: number;
}

export interface Document {
  id: string;
  type: 'medical_record' | 'insurance_card' | 'photo_id' | 'test_result' | 'other';
  name: string;
  uploadDate: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

// Full patient type (for detail/edit views)
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'archived';  // Patient status (separate from medicalInfo.status)
  address?: Address;
  emergencyContact?: EmergencyContact;
  medicalInfo: {
    allergies: string[];
    currentMedications: Medication[];
    conditions: string[];
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    lastVisit: string;
    status: 'active' | 'inactive' | 'critical';  // Medical status
  };
  insurance: InsuranceInfo;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
  age?: number;  // Calculated field from backend
}

// Patient list item type (for list views)
export interface PatientListItem {
  id: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'archived';
  age?: number;
  lastVisit?: string;
}
