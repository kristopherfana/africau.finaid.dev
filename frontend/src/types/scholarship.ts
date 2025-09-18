export interface Scholarship {
  id: string
  name: string
  description: string
  amount: number
  sponsor: string
  type: 'FULL' | 'PARTIAL' | 'MERIT_BASED' | 'NEED_BASED'
  applicationStartDate: string
  applicationDeadline: string
  eligibilityCriteria: string[]
  maxRecipients: number
  currentApplications: number
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

export interface ScholarshipFilters {
  search?: string
  category?: string
  level?: string
  status?: string
  type?: string
  page?: number
  limit?: number
}

export interface ScholarshipResponse {
  data: Scholarship[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}