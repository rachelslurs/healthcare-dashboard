import type { PaginatedData } from '@/components/layout/data-table'
import type { PatientListItem, Patient } from './types'
import { API_BASE_URL } from '@/lib/constants'

// API parameter types
export interface GetPatientsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: 'active' | 'inactive' | 'archived'
  sortBy?: 'lastName' | 'firstName' | 'lastVisit' | 'status' | 'age'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Get paginated list of patients with optional search, filtering, and sorting
 */
export async function getPatients(
  params: GetPatientsParams = {}
): Promise<PaginatedData<PatientListItem>> {
  const {
    page = 1,
    pageSize = 10,
    search,
    status,
    sortBy = 'lastName',
    sortOrder = 'asc',
  } = params

  const searchParams = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  if (search) {
    searchParams.append('search', search)
  }

  if (status) {
    searchParams.append('status', status)
  }

  const response = await fetch(`${API_BASE_URL}/api/patients?${searchParams}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch patients: ${response.statusText}`)
  }

  const data = await response.json()

  // Transform backend response to match frontend PaginatedData format
  // Backend may return camelCase (pageSize, totalPages) or snake_case (page_size, total_pages)
  return {
    items: data.items,
    total: data.total,
    page: data.page,
    page_size: data.pageSize || data.page_size,
    total_pages: data.totalPages || data.total_pages,
  }
}

/**
 * Get a single patient by ID
 */
export async function getPatient(id: string): Promise<Patient> {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Patient with ID ${id} not found`)
    }
    throw new Error(`Failed to fetch patient: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Create a new patient
 */
export async function createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'age'>): Promise<Patient> {
  const response = await fetch(`${API_BASE_URL}/api/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to create patient: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Update an existing patient
 */
export async function updatePatient(id: string, patientData: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'age'>>): Promise<Patient> {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Patient with ID ${id} not found`)
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to update patient: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Delete a patient by ID
 */
export async function deletePatient(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Patient with ID ${id} not found`)
    }
    throw new Error(`Failed to delete patient: ${response.statusText}`)
  }
}

/**
 * Upload a photo for a patient
 */
export async function uploadPatientPhoto(id: string, file: File): Promise<Patient> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/patients/${id}/upload-photo`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Patient with ID ${id} not found`)
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Failed to upload photo: ${response.statusText}`)
  }

  return await response.json()
}
