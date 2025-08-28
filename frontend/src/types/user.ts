export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SPONSOR = 'SPONSOR',
  REVIEWER = 'REVIEWER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum AcademicLevel {
  UNDERGRADUATE = 'UNDERGRADUATE',
  MASTERS = 'MASTERS',
  PHD = 'PHD',
}

export interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  profile?: UserProfile
  createdAt: Date
  updatedAt: Date
}

// Base profile with common fields for all users
export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  gender?: Gender
  nationality?: string
  phone?: string
  address?: string
  profilePicture?: string
  createdAt: Date
  updatedAt: Date
}

// Role-specific profile interfaces
export interface StudentProfile {
  studentId: string
  program: string
  level: AcademicLevel
  yearOfStudy: number
  gpa?: number
  institution?: string
  expectedGraduation?: string
}

export interface ReviewerProfile {
  expertiseAreas: string[]
  department?: string
  yearsExperience?: number
  certifications?: string[]
  reviewQuota?: number
  isActive?: boolean
}

export interface AdminProfile {
  permissions: string[]
  managedDepartments?: string[]
  accessLevel?: string
  lastLogin?: string
}

export interface SponsorProfile {
  organizationName?: string
  position?: string
  sponsorType: 'INDIVIDUAL' | 'ORGANIZATION'
  totalContributed?: number
  preferredCauses?: string[]
  isVerified?: boolean
}

export interface UserResponseDto {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  gender?: Gender
  dateOfBirth?: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  // Role-specific profile data
  studentProfile?: StudentProfile
  reviewerProfile?: ReviewerProfile
  adminProfile?: AdminProfile
  sponsorProfile?: SponsorProfile
}

export interface UpdateUserProfileDto {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  gender?: Gender
  dateOfBirth?: string
  nationality?: string
  address?: string
  // Role-specific profile updates
  studentProfile?: Partial<StudentProfile>
  reviewerProfile?: Partial<ReviewerProfile>
  adminProfile?: Partial<AdminProfile>
  sponsorProfile?: Partial<SponsorProfile>
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}