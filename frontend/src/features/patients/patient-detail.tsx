import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { getPatient, deletePatient } from './api'
import type { Patient } from './types'
import { toast } from '@/lib/toast'
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/components/ui/description-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/ui/dialog'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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


export default function PatientDetail() {
  const { patientId } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleEdit = () => {
    navigate({ to: `/patients/${patientId}/edit` })
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!patientId) return

    setIsDeleting(true)
    try {
      await deletePatient(patientId)
      
      // Invalidate activities query cache to refresh the activities list
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      
      toast({
        title: 'Patient deleted',
        description: `${patient.firstName} ${patient.lastName} has been successfully removed from the system.`,
      })
      
      // Navigate back to patients list after successful deletion
      navigate({ to: '/patients' })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient'
      console.error('Failed to delete patient:', err)
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      
      toast({
        title: 'Failed to delete patient',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  // Generate initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0).toUpperCase() || ''
    const last = lastName?.charAt(0).toUpperCase() || ''
    return `${first}${last}` || '?'
  }

  const photoUrl = patient.photoUrl 
    ? `${API_BASE_URL}${patient.photoUrl.startsWith('/') ? patient.photoUrl : `/${patient.photoUrl}`}`
    : null

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-4">
            {/* Patient Photo or Avatar */}
            <div className="shrink-0 relative">
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt={`${patient.firstName} ${patient.lastName}`}
                    className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200 shadow-sm"
                    onError={(e) => {
                      // Fallback to avatar if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const avatar = target.nextElementSibling as HTMLElement
                      if (avatar) avatar.style.display = 'flex'
                    }}
                  />
                  <div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm hidden"
                  >
                    {getInitials(patient.firstName, patient.lastName)}
                  </div>
                </>
              ) : (
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                >
                  {getInitials(patient.firstName, patient.lastName)}
                </div>
              )}
            </div>
            
            <div>
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
          </div>
          <div className="flex items-center gap-2">
            <Button outline onClick={handleEdit}>
              Edit
            </Button>
            <Button color="red" onClick={handleDeleteClick}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
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
        {patient.address ? (
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
        ) : null}

        {/* Emergency Contact */}
        {patient.emergencyContact ? (
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
        ) : null}

        {/* Medical Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
          <DescriptionList>
            <DescriptionTerm>Blood Type</DescriptionTerm>
            <DescriptionDetails>{patient.medicalInfo.bloodType || '—'}</DescriptionDetails>

            <DescriptionTerm>Allergies</DescriptionTerm>
            <DescriptionDetails>
              {patient.medicalInfo.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.medicalInfo.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                'None'
              )}
            </DescriptionDetails>

            <DescriptionTerm>Conditions</DescriptionTerm>
            <DescriptionDetails>
              {patient.medicalInfo.conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.medicalInfo.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                'None'
              )}
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
            <DescriptionDetails>{formatDate(patient.insurance.effectiveDate) || '—'}</DescriptionDetails>

            {patient.insurance.expirationDate && (
              <>
                <DescriptionTerm>Expiration Date</DescriptionTerm>
                <DescriptionDetails>{formatDate(patient.insurance.expirationDate)}</DescriptionDetails>
              </>
            )}

            <DescriptionTerm>Copay</DescriptionTerm>
            <DescriptionDetails>${patient.insurance.copay.toFixed(2)}</DescriptionDetails>

            <DescriptionTerm>Deductible</DescriptionTerm>
            <DescriptionDetails>{patient.insurance.deductible ? `$${patient.insurance.deductible.toFixed(2)}` : '—'}</DescriptionDetails>
          </DescriptionList>
        </section>
      </div>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {patient ? `${patient.firstName} ${patient.lastName}` : 'this patient'}? This action cannot be undone.
        </DialogDescription>
        <DialogBody>
          <p className="text-sm text-neutral-600">
            This will permanently remove the patient from the system.
          </p>
        </DialogBody>
        <DialogActions>
          <Button outline onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
