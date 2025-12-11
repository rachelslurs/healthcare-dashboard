import type { PaginatedData } from '@/components/layout/data-table'
import { transformPaginatedResponse, handleApiError } from '@/lib/api-utils'
import { API_BASE_URL } from '@/lib/constants'

import type { PatientListItem, Patient } from './types'


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
    await handleApiError(response, 'Failed to fetch patients')
  }

  const data = await response.json()
  return transformPaginatedResponse<PatientListItem>(data)
}

/**
 * Get a single patient by ID
 */
export async function getPatient(id: string): Promise<Patient> {
  const response = await fetch(`${API_BASE_URL}/api/patients/${id}`)

  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch patient', `Patient with ID ${id} not found`)
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
    await handleApiError(response, 'Failed to add patient')
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
    await handleApiError(response, 'Failed to edit patient', `Patient with ID ${id} not found`)
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
    await handleApiError(response, 'Failed to delete patient', `Patient with ID ${id} not found`)
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
    await handleApiError(response, 'Failed to upload photo', `Patient with ID ${id} not found`)
  }

  return await response.json()
}
