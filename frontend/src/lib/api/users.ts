import { supabase } from '../supabase'

export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE'
  nationality?: string
  phone?: string
  address?: string
  studentId?: string
  program?: string
  level?: 'UNDERGRADUATE' | 'MASTERS' | 'PHD'
  yearOfStudy?: number
  gpa?: number
  profilePicture?: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE'
  nationality?: string
  phone?: string
  address?: string
  studentId?: string
  program?: string
  level?: 'UNDERGRADUATE' | 'MASTERS' | 'PHD'
  yearOfStudy?: number
  gpa?: number
}

export class UserService {
  /**
   * Get current user with profile
   */
  static async getCurrentUser(clerkId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        isActive,
        createdAt,
        profiles (
          id,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          nationality,
          phone,
          address,
          studentId,
          program,
          level,
          yearOfStudy,
          gpa,
          profilePicture
        )
      `)
      .eq('clerkId', clerkId)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
    
    return {
      ...data,
      profile: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    }
  }

  /**
   * Create user from Clerk webhook
   */
  static async createUser(clerkId: string, email: string) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        clerkId,
        email,
        role: 'STUDENT',
        isActive: true
      }])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }
    
    return data
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, profileData: UpdateProfileData) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('userId', userId)
      .single()
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('userId', userId)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`)
      }
      
      return data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          userId,
          ...profileData
        }])
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to create profile: ${error.message}`)
      }
      
      return data
    }
  }

  /**
   * Get user's profile completion percentage
   */
  static async getProfileCompletion(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .single()
    
    if (error || !data) {
      return 0
    }
    
    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender',
      'nationality',
      'phone',
      'studentId',
      'program',
      'level',
      'yearOfStudy'
    ]
    
    const completedFields = requiredFields.filter(field => {
      const value = data[field as keyof typeof data]
      return value !== null && value !== undefined && value !== ''
    })
    
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(userId: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/profile.${fileExt}`
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName)
    
    // Update profile with new picture URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ profilePicture: publicUrl })
      .eq('userId', userId)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update profile picture: ${error.message}`)
    }
    
    return { url: publicUrl, profile: data }
  }

  /**
   * Admin: Get all users with profiles
   */
  static async getAllUsers(page = 1, limit = 20, role?: 'STUDENT' | 'ADMIN') {
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        isActive,
        createdAt,
        profiles (
          firstName,
          lastName,
          studentId,
          level,
          program
        )
      `, { count: 'exact' })
    
    if (role) {
      query = query.eq('role', role)
    }
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('createdAt', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }
    
    return {
      data: data?.map(user => ({
        ...user,
        profile: Array.isArray(user.profiles) ? user.profiles[0] : user.profiles
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
   * Admin: Update user role
   */
  static async updateUserRole(userId: string, role: 'STUDENT' | 'ADMIN') {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`)
    }
    
    return data
  }

  /**
   * Admin: Deactivate user
   */
  static async deactivateUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ isActive: false })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`)
    }
    
    return data
  }
}