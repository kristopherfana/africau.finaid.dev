import { toast } from 'sonner'
import type { Scholarship, ScholarshipFilters, ScholarshipResponse } from '@/types/scholarship'
import type { Application, ApplicationFilters, CreateApplicationData, UpdateApplicationData } from '@/types/application'
import type { UserResponseDto, UpdateUserProfileDto } from '@/types/user'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface RequestConfig extends RequestInit {
  params?: Record<string, any>
  skipAuth?: boolean
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from cookie or localStorage
    this.token = this.getStoredToken()
  }

  private getStoredToken(): string | null {
    try {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      if (cookieToken) {
        try {
          return JSON.parse(decodeURIComponent(cookieToken))
        } catch {
          return decodeURIComponent(cookieToken)
        }
      }
    } catch (e) {
      console.error('Error parsing token from cookie:', e)
    }
    return localStorage.getItem('access_token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('access_token')
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private isMockEnabled: boolean = import.meta.env.VITE_MOCK_API === 'true'

  private async mockRequest<T>(\n    endpoint: string,\n    config: RequestConfig = {},\n  ): Promise<T> {\n    console.log('Mock API call:', endpoint, config)\n    // Simulate network delay\n    await new Promise((resolve) => setTimeout(resolve, 500))\n\n    // Basic mock responses\n    if (endpoint === '/auth/login' || endpoint === '/auth/register') {\n      const mockToken = 'mock-jwt-token'\n      const mockUser = {\n        id: 'mock-user-1',\n        email: 'mock@example.com',\n        firstName: 'Mock',\n        lastName: 'User',\n        role: 'applicant',\n        createdAt: '2024-01-01T00:00:00Z',\n        updatedAt: '2024-01-01T00:00:00Z',\n      }\n      this.setToken(mockToken) // Simulate setting the token\n      return Promise.resolve({ access_token: mockToken, user: mockUser } as T)\n    } else if (endpoint === '/auth/logout') {\n      this.clearToken() // Simulate clearing the token\n      return Promise.resolve({ message: 'Logged out successfully' } as T)\n    } else if (endpoint.startsWith('/users')) {\n      const userIdMatch = endpoint.match(/\/users\\/(.+)/)\n      if (userIdMatch && userIdMatch[1] !== 'profile') {\n        const userId = userIdMatch[1]\n        // Handle specific user actions (update, activate, deactivate, changePassword)\n        if (config.method === 'PUT' || config.method === 'PATCH') {\n          return Promise.resolve({\n            id: userId,\n            email: `mock-user-${userId}@example.com`,\n            firstName: 'UpdatedMock',\n            lastName: `User ${userId}`,\n            role: 'applicant',\n            createdAt: '2024-01-01T00:00:00Z',\n            updatedAt: new Date().toISOString(),\n          } as T)\n        }\n        return Promise.resolve({\n          id: userId,\n          email: `mock-user-${userId}@example.com`,\n          firstName: 'Mock',\n          lastName: `User ${userId}`,\n          role: 'applicant',\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        } as T)\n      }\n      return Promise.resolve([\n        {\n          id: 'mock-user-1',\n          email: 'mock@example.com',\n          firstName: 'Mock',\n          lastName: 'User',\n          role: 'applicant',\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        },\n        {\n          id: 'mock-user-2',\n          email: 'admin@example.com',\n          firstName: 'Admin',\n          lastName: 'User',\n          role: 'admin',\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        },\n        {\n          id: 'mock-user-3',\n          email: 'dev@example.com',\n          firstName: 'Dev',\n          lastName: 'Office',\n          role: 'dev-office',\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/scholarships')) {\n      const scholarshipIdMatch = endpoint.match(/\/scholarships\\/(.+)/)\n      if (scholarshipIdMatch) {\n        const scholarshipId = scholarshipIdMatch[1]\n        if (config.method === 'PUT' || config.method === 'PATCH') {\n          return Promise.resolve({\n            id: scholarshipId,\n            name: `Updated Mock Scholarship ${scholarshipId}`,\n            description: `Updated description for mock scholarship ${scholarshipId}.`,\n            amount: 2500,\n            status: 'Closed',\n            eligibility: 'All students',\n            applicationDeadline: '2025-12-31T23:59:59Z',\n            createdAt: '2024-01-01T00:00:00Z',\n            updatedAt: new Date().toISOString(),\n          } as T)\n        } else if (config.method === 'DELETE') {\n          return Promise.resolve({ message: `Scholarship ${scholarshipId} deleted` } as T)\n        }\n        return Promise.resolve({\n          id: scholarshipId,\n          name: `Mock Scholarship ${scholarshipId}`,\n          description: `Description for mock scholarship ${scholarshipId}.`,\n          amount: 2000,\n          status: 'Open',\n          eligibility: 'All students',\n          applicationDeadline: '2025-12-31T23:59:59Z',\n          createdAt: '2024-01-01T00:00:00Z',\n            updatedAt: '2024-01-01T00:00:00Z',\n        } as T)\n      } else if (config.method === 'POST') {\n        return Promise.resolve({\n          id: 'mock-scholarship-new',\n          name: 'New Mock Scholarship',\n          description: 'A newly created mock scholarship.',\n          amount: 3000,\n          status: 'Draft',\n          eligibility: 'New applicants',\n          applicationDeadline: '2026-01-01T00:00:00Z',\n          createdAt: new Date().toISOString(),\n          updatedAt: new Date().toISOString(),\n        } as T)\n      }\n      return Promise.resolve([\n        {\n          id: 'mock-scholarship-1',\n          name: 'Mock Scholarship A',\n          description: 'This is a mock scholarship.',\n          amount: 1000,\n          status: 'Open',\n          eligibility: 'Students',\n          applicationDeadline: '2025-12-31T23:59:59Z',\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        },\n        {\n          id: 'mock-scholarship-2',\n          name: 'Mock Scholarship B',\n          description: 'Another mock scholarship.',\n          amount: 1500,\n          status: 'Closed',\n          eligibility: 'Graduates',\n          applicationDeadline: '2024-06-30T23:59:59Z',\n          createdAt: '2023-05-01T00:00:00Z',\n          updatedAt: '2023-05-01T00:00:00Z',\n        },\n        {\n          id: 'mock-scholarship-3',\n          name: 'Mock Scholarship C',\n          description: 'A third mock scholarship.',\n          amount: 2000,\n          status: 'Open',\n          eligibility: 'Undergraduates',\n          applicationDeadline: '2025-10-15T23:59:59Z',\n          createdAt: '2024-03-01T00:00:00Z',\n          updatedAt: '2024-03-01T00:00:00Z',\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/applications')) {\n      const applicationIdMatch = endpoint.match(/\/applications\\/(.+)/)\n      if (applicationIdMatch) {\n        const applicationId = applicationIdMatch[1]\n        if (config.method === 'PUT' || config.method === 'PATCH') {\n          return Promise.resolve({\n            id: applicationId,\n            scholarshipId: 'mock-scholarship-1',\n            userId: 'mock-user-1',\n            status: 'Reviewed',\n            submittedAt: '2024-07-01T10:00:00Z',\n            createdAt: '2024-06-25T00:00:00Z',\n            updatedAt: new Date().toISOString(),\n          } as T)\n        } else if (config.method === 'DELETE') {\n          return Promise.resolve({ message: `Application ${applicationId} deleted` } as T)\n        }\n        return Promise.resolve({\n          id: applicationId,\n          scholarshipId: 'mock-scholarship-1',\n          userId: 'mock-user-1',\n          status: 'Pending',\n          submittedAt: '2024-07-01T10:00:00Z',\n          createdAt: '2024-06-25T00:00:00Z',\n          updatedAt: '2024-06-25T00:00:00Z',\n        } as T)\n      } else if (config.method === 'POST') {\n        return Promise.resolve({\n          id: 'mock-application-new',\n          scholarshipId: 'mock-scholarship-1',\n          userId: 'mock-user-1',\n          status: 'Draft',\n          submittedAt: null,\n          createdAt: new Date().toISOString(),\n          updatedAt: new Date().toISOString(),\n        } as T)\n      }\n      return Promise.resolve([\n        {\n          id: 'mock-application-1',\n          scholarshipId: 'mock-scholarship-1',\n          userId: 'mock-user-1',\n          status: 'Pending',\n          submittedAt: '2024-07-01T10:00:00Z',\n          createdAt: '2024-06-25T00:00:00Z',\n          updatedAt: '2024-06-25T00:00:00Z',\n        },\n        {\n          id: 'mock-application-2',\n          scholarshipId: 'mock-scholarship-2',\n          userId: 'mock-user-2',\n          status: 'Approved',\n          submittedAt: '2024-05-15T11:00:00Z',\n          createdAt: '2024-05-10T00:00:00Z',\n          updatedAt: '2024-05-10T00:00:00Z',\n        },\n        {\n          id: 'mock-application-3',\n          scholarshipId: 'mock-scholarship-3',\n          userId: 'mock-user-3',\n          status: 'Rejected',\n          submittedAt: '2024-04-01T09:00:00Z',\n          createdAt: '2024-03-20T00:00:00Z',\n          updatedAt: '2024-03-20T00:00:00Z',\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/documents')) {\n      const documentIdMatch = endpoint.match(/\/documents\\/(.+)/)\n      if (documentIdMatch) {\n        const documentId = documentIdMatch[1]\n        if (config.method === 'DELETE') {\n          return Promise.resolve({ message: `Document ${documentId} deleted` } as T)\n        }\n        return Promise.resolve({\n          id: documentId,\n          applicationId: 'mock-application-1',\n          documentType: 'Transcript',\n          fileName: `transcript-${documentId}.pdf`,\n          url: `http://mock-cdn.com/documents/${documentId}.pdf`,\n          uploadedAt: '2024-07-01T10:30:00Z',\n        } as T)\n      }\n      return Promise.resolve([\n        {\n          id: 'mock-document-1',\n          applicationId: 'mock-application-1',\n          documentType: 'Transcript',\n          fileName: 'transcript-1.pdf',\n          url: 'http://mock-cdn.com/documents/transcript-1.pdf',\n          uploadedAt: '2024-07-01T10:30:00Z',\n        },\n        {\n          id: 'mock-document-2',\n          applicationId: 'mock-application-1',\n          documentType: 'Essay',\n          fileName: 'essay-1.docx',\n          url: 'http://mock-cdn.com/documents/essay-1.docx',\n          uploadedAt: '2024-07-01T10:45:00Z',\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/sponsors')) {\n      const sponsorIdMatch = endpoint.match(/\/sponsors\\/(.+)/)\n      if (sponsorIdMatch) {\n        const sponsorId = sponsorIdMatch[1]\n        if (config.method === 'PUT' || config.method === 'PATCH') {\n          return Promise.resolve({\n            id: sponsorId,\n            name: `Updated Sponsor ${sponsorId}`,\n            contactEmail: `updated-${sponsorId}@example.com`,\n            createdAt: '2024-01-01T00:00:00Z',\n            updatedAt: new Date().toISOString(),\n          } as T)\n        } else if (config.method === 'DELETE') {\n          return Promise.resolve({ message: `Sponsor ${sponsorId} deleted` } as T)\n        }\n        return Promise.resolve({\n          id: sponsorId,\n          name: `Mock Sponsor ${sponsorId}`,\n          contactEmail: `${sponsorId}@example.com`,\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        } as T)\n      } else if (config.method === 'POST') {\n        return Promise.resolve({\n          id: 'mock-sponsor-new',\n          name: 'New Mock Sponsor',\n          contactEmail: 'new-sponsor@example.com',\n          createdAt: new Date().toISOString(),\n          updatedAt: new Date().toISOString(),\n        } as T)\n      }\n      return Promise.resolve([\n        {\n          id: 'mock-sponsor-1',\n          name: 'Global Corp',\n          contactEmail: 'contact@globalcorp.com',\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        },\n        {\n          id: 'mock-sponsor-2',\n          name: 'Local Charity',\n          contactEmail: 'info@localcharity.org',\n          createdAt: '2024-01-01T00:00:00Z',\n          updatedAt: '2024-01-01T00:00:00Z',\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/reports/dashboard-stats')) {\n      return Promise.resolve({\n        totalScholarships: 50,\n        totalApplications: 120,\n        approvedApplications: 80,\n        pendingApplications: 30,\n        totalUsers: 200,\n        activeUsers: 150,\n        totalFunding: 500000,\n        monthlyStats: {\n          newApplications: 15,\n          approvedThisMonth: 10,\n          newScholarships: 5, // Added for dashboard\n        },\n        draftScholarships: 10, // Added for dashboard\n      } as T)\n    } else if (endpoint.startsWith('/reports/demographics')) {\n      return Promise.resolve({\n        genderDistribution: { female: 60, male: 40 },\n        academicLevels: { undergraduate: 70, masters: 20, phd: 10 },\n        topPrograms: [{ name: 'Computer Science', percentage: 30 }, { name: 'Business Admin', percentage: 25 }],\n        totalFunding: 1000000,\n        totalBeneficiaries: 500,\n      } as T)\n    } else if (endpoint.startsWith('/reports/featured-scholarships')) {\n      return Promise.resolve([\n        {\n          id: 'featured-scholarship-1',\n          title: 'Global Impact Scholarship',\n          description: 'For students making a global impact.',\n          beneficiaries: 10,\n          totalApplicants: 100,\n          totalDisbursed: 50000,\n          startYear: 2023,\n          status: 'ACTIVE',\n        },\n        {\n          id: 'featured-scholarship-2',\n          title: 'Community Leader Grant',\n          description: 'Supporting future community leaders.',\n          beneficiaries: 5,\n          totalApplicants: 60,\n          totalDisbursed: 25000,\n          startYear: 2024,\n          status: 'ACTIVE',\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/reports/applications-report')) {\n      return Promise.resolve([\n        {\n          applicationId: 'app-report-1',\n          scholarshipName: 'Scholarship X',\n          applicantName: 'John Doe',\n          status: 'Approved',\n          submissionDate: '2024-07-01',\n        },\n        {\n          applicationId: 'app-report-2',\n          scholarshipName: 'Scholarship Y',\n          applicantName: 'Jane Smith',\n          status: 'Pending',\n          submissionDate: '2024-07-05',\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/reports/scholarships-report')) {\n      return Promise.resolve([\n        {\n          scholarshipName: 'Scholarship Y',\n          totalApplicants: 50,\n          totalAwards: 10,\n          totalFunding: 100000,\n        },\n        {\n          scholarshipName: 'Scholarship Z',\n          totalApplicants: 30,\n          totalAwards: 5,\n          totalFunding: 50000,\n        },\n      ] as T)\n    } else if (endpoint.startsWith('/reports/financial-report')) {\n      return Promise.resolve({\n        totalFunding: 1000000,\n        totalAwarded: 800000,\n        totalDisbursed: 750000,\n        pendingAmount: 50000,\n        monthlyBreakdown: [\n          { month: 'Jan', funded: 100000, awarded: 80000, disbursed: 70000 },\n          { month: 'Feb', funded: 150000, awarded: 120000, disbursed: 100000 },\n        ],\n        sponsorBreakdown: [\n          { sponsorName: 'Global Corp', amount: 500000, percentage: 50 },\n          { sponsorName: 'Local Charity', amount: 200000, percentage: 20 },\n        ],\n        programBreakdown: [\n          { programName: 'STEM', amount: 400000, recipientCount: 200 },\n          { programName: 'Arts', amount: 100000, recipientCount: 50 },\n        ],\n      } as T)\n    } else if (endpoint.startsWith('/reports/users-report')) {\n      return Promise.resolve([\n        {\n          userId: 'user-report-1',\n          userName: 'Jane Doe',\n          role: 'applicant',\n          status: 'Active',\n          registrationDate: '2023-01-15',\n        },\n        {\n          userId: 'user-report-2',\n          userName: 'Peter Jones',\n          role: 'admin',\n          status: 'Active',\n          registrationDate: '2022-11-01',\n        },\n      ] as T)\n    }\n\n    // Default mock response for unhandled endpoints\n    return Promise.resolve({ message: `Mock data for ${endpoint}` } as T)\n  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    if (this.isMockEnabled) {
      return this.mockRequest<T>(endpoint, config)
    }

    const { params, skipAuth, headers = {}, ...fetchConfig } = config
    const url = this.buildURL(endpoint, params)

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (this.token && !skipAuth) {
      ;(requestHeaders as any)['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: requestHeaders,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      access_token: string
      user: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: string
      }
    }>('/auth/login', { email, password }, { skipAuth: true })
    
    // Store token
    apiClient.setToken(response.access_token)
    
    return response
  },

  register: async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: string
  }) => {
    const response = await apiClient.post<{
      access_token: string
      user: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: string
      }
    }>('/auth/register', data, { skipAuth: true })
    
    // Store token
    apiClient.setToken(response.access_token)
    
    return response
  },

  logout: () => {
    apiClient.clearToken()
  },
}

// Users API
export const usersAPI = {
  getProfile: (): Promise<UserResponseDto> => apiClient.get('/users/profile'),
  getAll: (params?: any): Promise<UserResponseDto[]> => apiClient.get('/users', { params }),
  getById: (id: string): Promise<UserResponseDto> => apiClient.get(`/users/${id}`),
  update: (id: string, data: UpdateUserProfileDto): Promise<UserResponseDto> => apiClient.put(`/users/${id}`, data),
  activate: (id: string): Promise<UserResponseDto> => apiClient.patch(`/users/${id}/activate`),
  deactivate: (id: string): Promise<UserResponseDto> => apiClient.patch(`/users/${id}/deactivate`),
  changePassword: (id: string, data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    apiClient.patch(`/users/${id}/change-password`, data),
}

// Scholarships API
export const scholarshipsAPI = {
  getAll: (params?: ScholarshipFilters): Promise<ScholarshipResponse> => 
    apiClient.get('/scholarships', { params }),
  getById: (id: string): Promise<Scholarship> => 
    apiClient.get(`/scholarships/${id}`),
  create: (data: any): Promise<Scholarship> => 
    apiClient.post('/scholarships', data),
  update: (id: string, data: any): Promise<Scholarship> => 
    apiClient.put(`/scholarships/${id}`, data),
  delete: (id: string): Promise<void> => 
    apiClient.delete(`/scholarships/${id}`),
}

// Applications API
export const applicationsAPI = {
  getAll: (params?: ApplicationFilters): Promise<Application[]> => 
    apiClient.get('/applications', { params }),
  getById: (id: string): Promise<Application> => 
    apiClient.get(`/applications/${id}`),
  getMyApplications: (): Promise<Application[]> =>
    apiClient.get('/applications/my-applications'),
  create: (data: CreateApplicationData): Promise<Application> => 
    apiClient.post('/applications', data),
  update: (id: string, data: UpdateApplicationData): Promise<Application> => 
    apiClient.put(`/applications/${id}`, data),
  updateStatus: (id: string, data: { status: string; reason?: string }): Promise<Application> =>
    apiClient.patch(`/applications/${id}/review`, data),
  submit: (id: string): Promise<Application> => 
    apiClient.patch(`/applications/${id}/submit`),
  withdraw: (id: string): Promise<Application> => 
    apiClient.patch(`/applications/${id}/withdraw`),
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/applications/${id}`),
}

// Documents API
export const documentsAPI = {
  getAll: (params?: { documentType?: string; applicationId?: string }): Promise<any[]> =>
    apiClient.get('/documents', { params }),
  getById: (id: string): Promise<any> =>
    apiClient.get(`/documents/${id}`),
  download: async (id: string): Promise<{ document: any; url: string }> => {
    // For now, return a mock download URL since backend returns mock data
    const document = await apiClient.get(`/documents/${id}`)
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    return { document, url: `${API_BASE_URL}/documents/${id}/download` }
  },
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/documents/${id}`),
}

// Reports API
export const reportsAPI = {
  getDashboardStats: (): Promise<{
    totalScholarships: number
    totalApplications: number
    approvedApplications: number
    pendingApplications: number
    totalUsers: number
    activeUsers: number
    totalFunding: number
    monthlyStats: {
      newApplications: number
      approvedThisMonth: number
    }
  }> => apiClient.get('/reports/dashboard-stats'),

  getDemographicsData: (): Promise<{
    genderDistribution: { female: number; male: number }
    academicLevels: { undergraduate: number; masters: number; phd: number }
    topPrograms: { name: string; percentage: number }[]
    totalFunding: number
    totalBeneficiaries: number
  }> => apiClient.get('/reports/demographics'),

  getFeaturedScholarships: (): Promise<{
    id: string
    title: string
    description: string
    beneficiaries: number
    totalApplicants: number
    totalDisbursed: number
    startYear: number
    status: string
  }[]> => apiClient.get('/reports/featured-scholarships'),

  getApplicationsReport: (params?: {
    startDate?: string
    endDate?: string
    scholarshipId?: string
    status?: string
    format?: string
  }): Promise<any> => apiClient.get('/reports/applications-report', { params }),

  getScholarshipsReport: (params?: {
    startDate?: string
    endDate?: string
    format?: string
  }): Promise<any> => apiClient.get('/reports/scholarships-report', { params }),

  getFinancialReport: (params?: {
    year?: number
    format?: string
  }): Promise<{
    totalFunding: number
    totalAwarded: number
    totalDisbursed: number
    pendingAmount: number
    monthlyBreakdown: Array<{
      month: string
      funded: number
      awarded: number
      disbursed: number
    }>
    sponsorBreakdown: Array<{
      sponsorName: string
      amount: number
      percentage: number
    }>
    programBreakdown: Array<{
      programName: string
      amount: number
      recipientCount: number
    }>
  }> => apiClient.get('/reports/financial-report', { params }),

  getUsersReport: (params?: {
    role?: string
    department?: string
    format?: string
  }): Promise<any> => apiClient.get('/reports/users-report', { params }),
}