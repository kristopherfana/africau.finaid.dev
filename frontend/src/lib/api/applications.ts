import { supabase } from '../supabase'
import { generateApplicationNumber } from '../application-number'

export interface ApplicationFilters {
  status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  scholarshipId?: string
  userId?: string
  year?: string
  page?: number
  limit?: number
}

export interface CreateApplicationData {
  scholarshipId: string
  motivationLetter: string
  additionalInfo?: Record<string, any>
  documentIds?: string[]
}

export interface ApplicationListItem {
  id: string
  applicationNumber: string
  status: string
  submittedAt: string | null
  createdAt: string
  scholarship: {
    name: string
    amount: number
    currency: string
    sponsor: {
      name: string
    }
  }
}

export class ApplicationService {
  /**
   * Get user's applications
   */
  static async getUserApplications(userId: string, filters: ApplicationFilters = {}) {
    const { page = 1, limit = 10, status, year } = filters
    
    let query = supabase
      .from('applications')
      .select(`
        id,
        applicationNumber,
        status,
        submittedAt,
        createdAt,
        scholarships (
          name,
          amount,
          currency,
          sponsors (name)
        )
      `, { count: 'exact' })
      .eq('userId', userId)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('createdAt', startDate).lte('createdAt', endDate)
    }
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('createdAt', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`)
    }
    
    return {
      data: data?.map(app => ({
        ...app,
        scholarship: {
          ...app.scholarships,
          sponsor: app.scholarships?.sponsors
        }
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * Get application by ID with full details
   */
  static async getApplicationById(id: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        applicationNumber,
        status,
        motivationLetter,
        additionalInfo,
        submittedAt,
        reviewedAt,
        decisionAt,
        decisionNotes,
        score,
        createdAt,
        scholarships (
          id,
          name,
          description,
          amount,
          currency,
          sponsors (
            name,
            type
          )
        ),
        application_documents (
          documents (
            id,
            fileName,
            documentType,
            createdAt
          )
        ),
        application_history (
          action,
          notes,
          createdAt,
          users (
            profiles (firstName, lastName)
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch application: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('Application not found')
    }
    
    return {
      ...data,
      scholarship: Array.isArray(data.scholarships) ? data.scholarships[0] : data.scholarships,
      documents: data.application_documents?.map(ad => ad.documents) || [],
      history: data.application_history || []
    }
  }

  /**
   * Create new application
   */
  static async createApplication(userId: string, applicationData: CreateApplicationData) {
    const applicationNumber = await generateApplicationNumber()
    
    // Start transaction
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert([{
        applicationNumber,
        userId,
        scholarshipId: applicationData.scholarshipId,
        motivationLetter: applicationData.motivationLetter,
        additionalInfo: applicationData.additionalInfo,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (appError) {
      throw new Error(`Failed to create application: ${appError.message}`)
    }
    
    // Link documents if provided
    if (applicationData.documentIds && applicationData.documentIds.length > 0) {
      const documentLinks = applicationData.documentIds.map(documentId => ({
        applicationId: application.id,
        documentId,
        isRequired: true
      }))
      
      const { error: docError } = await supabase
        .from('application_documents')
        .insert(documentLinks)
      
      if (docError) {
        throw new Error(`Failed to link documents: ${docError.message}`)
      }
    }
    
    // Create history entry
    await supabase
      .from('application_history')
      .insert([{
        applicationId: application.id,
        action: 'SUBMITTED',
        performedBy: userId,
        notes: 'Application submitted by student'
      }])
    
    // Update scholarship available slots
    await supabase.rpc('decrement_scholarship_slots', {
      scholarship_id: applicationData.scholarshipId
    })
    
    return application
  }

  /**
   * Update draft application
   */
  static async updateApplication(id: string, updates: Partial<CreateApplicationData>) {
    const { data, error } = await supabase
      .from('applications')
      .update({
        motivationLetter: updates.motivationLetter,
        additionalInfo: updates.additionalInfo
      })
      .eq('id', id)
      .eq('status', 'DRAFT') // Only allow updates to draft applications
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update application: ${error.message}`)
    }
    
    return data
  }

  /**
   * Withdraw application
   */
  static async withdrawApplication(id: string, userId: string) {
    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status: 'WITHDRAWN'
      })
      .eq('id', id)
      .eq('userId', userId)
      .in('status', ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to withdraw application: ${error.message}`)
    }
    
    // Create history entry
    await supabase
      .from('application_history')
      .insert([{
        applicationId: id,
        action: 'WITHDRAWN',
        performedBy: userId,
        notes: 'Application withdrawn by student'
      }])
    
    return data
  }

  /**
   * Admin: Get applications for review
   */
  static async getApplicationsForReview(filters: ApplicationFilters = {}) {
    const { page = 1, limit = 20, status = 'SUBMITTED', scholarshipId } = filters
    
    let query = supabase
      .from('applications')
      .select(`
        id,
        applicationNumber,
        status,
        submittedAt,
        score,
        users (
          profiles (
            firstName,
            lastName,
            studentId,
            level,
            gpa
          )
        ),
        scholarships (
          name,
          sponsors (name)
        )
      `, { count: 'exact' })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (scholarshipId) {
      query = query.eq('scholarshipId', scholarshipId)
    }
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('submittedAt', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch applications for review: ${error.message}`)
    }
    
    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * Admin: Update application status
   */
  static async updateApplicationStatus(
    id: string, 
    status: string, 
    adminId: string,
    decisionNotes?: string,
    score?: number
  ) {
    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        decisionNotes,
        score,
        decisionBy: adminId,
        decisionAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`)
    }
    
    // Create history entry
    await supabase
      .from('application_history')
      .insert([{
        applicationId: id,
        action: status,
        performedBy: adminId,
        notes: decisionNotes || `Application ${status.toLowerCase()}`
      }])
    
    return data
  }
}