import { supabase } from '../supabase'

// Types based on your Prisma schema
export interface ScholarshipFilters {
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  sponsorId?: string
  search?: string
  page?: number
  limit?: number
}

export interface ScholarshipListItem {
  id: string
  name: string
  description: string | null
  amount: number
  currency: string
  availableSlots: number
  applicationEndDate: string
  status: string
  sponsor: {
    name: string
  }
}

export interface ScholarshipDetail extends ScholarshipListItem {
  totalSlots: number
  applicationStartDate: string
  academicYear: string
  durationMonths: number
  disbursementSchedule: string
  sponsor: {
    id: string
    name: string
    type: string
    website?: string
  }
  criteria: Array<{
    criteriaType: string
    criteriaValue: any
    isMandatory: boolean
  }>
}

export class ScholarshipService {
  /**
   * Get paginated list of scholarships with filters
   */
  static async getScholarships(filters: ScholarshipFilters = {}) {
    const { page = 1, limit = 10, status, sponsorId, search } = filters
    
    let query = supabase
      .from('scholarships')
      .select(`
        id,
        name,
        description,
        amount,
        currency,
        availableSlots,
        applicationEndDate,
        status,
        sponsors!inner (
          name
        )
      `, { count: 'exact' })
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (sponsorId) {
      query = query.eq('sponsorId', sponsorId)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('createdAt', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch scholarships: ${error.message}`)
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
   * Get active scholarships (currently open for applications)
   */
  static async getActiveScholarships() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('scholarships')
      .select(`
        id,
        name,
        description,
        amount,
        currency,
        availableSlots,
        applicationEndDate,
        sponsors (name)
      `)
      .eq('status', 'ACTIVE')
      .gte('applicationEndDate', today)
      .gt('availableSlots', 0)
      .order('applicationEndDate', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch active scholarships: ${error.message}`)
    }
    
    return data || []
  }

  /**
   * Get scholarship details by ID
   */
  static async getScholarshipById(id: string): Promise<ScholarshipDetail> {
    const { data, error } = await supabase
      .from('scholarships')
      .select(`
        id,
        name,
        description,
        amount,
        currency,
        totalSlots,
        availableSlots,
        applicationStartDate,
        applicationEndDate,
        academicYear,
        durationMonths,
        disbursementSchedule,
        status,
        sponsors (
          id,
          name,
          type,
          website
        ),
        scholarship_criteria (
          criteriaType,
          criteriaValue,
          isMandatory
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch scholarship: ${error.message}`)
    }
    
    if (!data) {
      throw new Error('Scholarship not found')
    }
    
    return {
      ...data,
      sponsor: Array.isArray(data.sponsors) ? data.sponsors[0] : data.sponsors,
      criteria: data.scholarship_criteria || []
    } as ScholarshipDetail
  }

  /**
   * Check if user has already applied for a scholarship
   */
  static async hasUserApplied(scholarshipId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('scholarshipId', scholarshipId)
      .eq('userId', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check application status: ${error.message}`)
    }
    
    return !!data
  }

  /**
   * Admin: Create new scholarship
   */
  static async createScholarship(scholarshipData: any) {
    const { data, error } = await supabase
      .from('scholarships')
      .insert([scholarshipData])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create scholarship: ${error.message}`)
    }
    
    return data
  }

  /**
   * Admin: Update scholarship
   */
  static async updateScholarship(id: string, updates: any) {
    const { data, error } = await supabase
      .from('scholarships')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update scholarship: ${error.message}`)
    }
    
    return data
  }
}