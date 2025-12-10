import type { PaginatedData } from '@/components/layout/data-table'
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
