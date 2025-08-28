export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface ApplicationFilters {
  status?: ApplicationStatus
  scholarshipId?: string
  applicantId?: string
  userId?: string
  page?: number
  limit?: number
}

export interface CreateApplicationData {
  scholarshipId: string
  applicantId: string
  academicInfo?: Record<string, any>
  financialInfo?: Record<string, any>
  documentIds?: string[]
  personalStatement?: string
  status?: ApplicationStatus
}

export interface Application {
  id: string
  scholarshipId: string
  applicantId: string
  scholarshipName: string
  applicantName: string
  applicantEmail: string
  academicInfo: Record<string, any>
  financialInfo: Record<string, any>
  documentIds: string[]
  personalStatement: string
  status: ApplicationStatus
  submittedAt?: Date
  reviewedBy?: string
  reviewComments?: string
  createdAt: Date
  updatedAt: Date
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {
  status?: ApplicationStatus
  reviewComments?: string
}