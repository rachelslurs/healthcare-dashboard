import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import { getPatient } from './api'
import type { Patient } from './types'
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/components/ui/description-list'
import { Badge } from '@/components/ui/badge'

// Format date for display
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '—'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

// Get badge color based on status
const getStatusColor = (status: 'active' | 'inactive' | 'archived'): 'green' | 'orange' | 'zinc' => {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'orange'
    case 'archived':
      return 'zinc'
    default:
      return 'zinc'
  }
}

// Get badge color based on medical status
const getMedicalStatusColor = (status: 'active' | 'inactive' | 'critical'): 'green' | 'orange' | 'red' => {
  switch (status) {
    case 'active':
      return 'green'
    case 'inactive':
      return 'orange'
    case 'critical':
      return 'red'
    default:
      return 'orange'
  }
}

export default function PatientDetail() {
  const { patientId } = useParams({ strict: false })
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!patientId) {
      setError(new Error('Patient ID is required'))
      setIsLoading(false)
      return
    }

    const fetchPatient = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await getPatient(patientId)
        setPatient(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch patient'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [patientId])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600" />
            <p className="text-sm text-gray-600">Loading patient information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Patient Detail</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800 font-medium">Error loading patient</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Patient Detail</h1>
        <p className="text-gray-600">Patient not found</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {patient.firstName} {patient.lastName}
        </h1>
        <div className="flex items-center gap-2">
          <Badge color={getStatusColor(patient.status)}>
            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
          </Badge>
          {patient.age && (
            <span className="text-sm text-gray-600">Age: {patient.age}</span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <DescriptionList>
            <DescriptionTerm>Patient ID</DescriptionTerm>
            <DescriptionDetails>{patient.id}</DescriptionDetails>

            <DescriptionTerm>Date of Birth</DescriptionTerm>
            <DescriptionDetails>{formatDate(patient.dateOfBirth)}</DescriptionDetails>

            <DescriptionTerm>Email</DescriptionTerm>
            <DescriptionDetails>{patient.email}</DescriptionDetails>

            <DescriptionTerm>Phone</DescriptionTerm>
            <DescriptionDetails>{patient.phone}</DescriptionDetails>
          </DescriptionList>
        </section>

        {/* Address */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <DescriptionList>
            <DescriptionTerm>Street</DescriptionTerm>
            <DescriptionDetails>{patient.address.street}</DescriptionDetails>

            <DescriptionTerm>City</DescriptionTerm>
            <DescriptionDetails>{patient.address.city}</DescriptionDetails>

            <DescriptionTerm>State</DescriptionTerm>
            <DescriptionDetails>{patient.address.state}</DescriptionDetails>

            <DescriptionTerm>ZIP Code</DescriptionTerm>
            <DescriptionDetails>{patient.address.zipCode}</DescriptionDetails>

            <DescriptionTerm>Country</DescriptionTerm>
            <DescriptionDetails>{patient.address.country}</DescriptionDetails>
          </DescriptionList>
        </section>

        {/* Emergency Contact */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
          <DescriptionList>
            <DescriptionTerm>Name</DescriptionTerm>
            <DescriptionDetails>{patient.emergencyContact.name}</DescriptionDetails>

            <DescriptionTerm>Relationship</DescriptionTerm>
            <DescriptionDetails>{patient.emergencyContact.relationship}</DescriptionDetails>

            <DescriptionTerm>Phone</DescriptionTerm>
            <DescriptionDetails>{patient.emergencyContact.phone}</DescriptionDetails>

            {patient.emergencyContact.email && (
              <>
                <DescriptionTerm>Email</DescriptionTerm>
                <DescriptionDetails>{patient.emergencyContact.email}</DescriptionDetails>
              </>
            )}
          </DescriptionList>
        </section>

        {/* Medical Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
          <DescriptionList>
            <DescriptionTerm>Medical Status</DescriptionTerm>
            <DescriptionDetails>
              <Badge color={getMedicalStatusColor(patient.medicalInfo.status)}>
                {patient.medicalInfo.status.charAt(0).toUpperCase() + patient.medicalInfo.status.slice(1)}
              </Badge>
            </DescriptionDetails>

            <DescriptionTerm>Blood Type</DescriptionTerm>
            <DescriptionDetails>{patient.medicalInfo.bloodType}</DescriptionDetails>

            <DescriptionTerm>Allergies</DescriptionTerm>
            <DescriptionDetails>
              {patient.medicalInfo.allergies.length > 0 
                ? patient.medicalInfo.allergies.join(', ')
                : 'None'}
            </DescriptionDetails>

            <DescriptionTerm>Conditions</DescriptionTerm>
            <DescriptionDetails>
              {patient.medicalInfo.conditions.length > 0
                ? patient.medicalInfo.conditions.join(', ')
                : 'None'}
            </DescriptionDetails>

            <DescriptionTerm>Current Medications</DescriptionTerm>
            <DescriptionDetails>
              {patient.medicalInfo.currentMedications.length > 0
                ? patient.medicalInfo.currentMedications.map(med => med.name).join(', ')
                : 'None'}
            </DescriptionDetails>

            <DescriptionTerm>Last Visit</DescriptionTerm>
            <DescriptionDetails>{formatDate(patient.medicalInfo.lastVisit)}</DescriptionDetails>
          </DescriptionList>
        </section>

        {/* Insurance Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Insurance Information</h2>
          <DescriptionList>
            <DescriptionTerm>Provider</DescriptionTerm>
            <DescriptionDetails>{patient.insurance.provider}</DescriptionDetails>

            <DescriptionTerm>Policy Number</DescriptionTerm>
            <DescriptionDetails>{patient.insurance.policyNumber}</DescriptionDetails>

            {patient.insurance.groupNumber && (
              <>
                <DescriptionTerm>Group Number</DescriptionTerm>
                <DescriptionDetails>{patient.insurance.groupNumber}</DescriptionDetails>
              </>
            )}

            <DescriptionTerm>Effective Date</DescriptionTerm>
            <DescriptionDetails>{formatDate(patient.insurance.effectiveDate)}</DescriptionDetails>

            {patient.insurance.expirationDate && (
              <>
                <DescriptionTerm>Expiration Date</DescriptionTerm>
                <DescriptionDetails>{formatDate(patient.insurance.expirationDate)}</DescriptionDetails>
              </>
            )}

            <DescriptionTerm>Copay</DescriptionTerm>
            <DescriptionDetails>${patient.insurance.copay.toFixed(2)}</DescriptionDetails>

            <DescriptionTerm>Deductible</DescriptionTerm>
            <DescriptionDetails>${patient.insurance.deductible.toFixed(2)}</DescriptionDetails>
          </DescriptionList>
        </section>

        {/* Metadata */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Record Information</h2>
          <DescriptionList>
            <DescriptionTerm>Created At</DescriptionTerm>
            <DescriptionDetails>{formatDate(patient.createdAt)}</DescriptionDetails>

            <DescriptionTerm>Last Updated</DescriptionTerm>
            <DescriptionDetails>{formatDate(patient.updatedAt)}</DescriptionDetails>
          </DescriptionList>
        </section>
      </div>
    </div>
  )
}
