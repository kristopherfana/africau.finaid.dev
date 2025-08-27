import { toast } from 'sonner'

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

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, skipAuth, headers = {}, ...fetchConfig } = config
    const url = this.buildURL(endpoint, params)

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (this.token && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`
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
  getProfile: () => apiClient.get('/users/profile'),
  getAll: (params?: any) => apiClient.get('/users', { params }),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  activate: (id: string) => apiClient.patch(`/users/${id}/activate`),
  deactivate: (id: string) => apiClient.patch(`/users/${id}/deactivate`),
  changePassword: (id: string, data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch(`/users/${id}/change-password`, data),
}

// Scholarships API
export const scholarshipsAPI = {
  getAll: (params?: any) => apiClient.get('/scholarships', { params }),
  getById: (id: string) => apiClient.get(`/scholarships/${id}`),
  create: (data: any) => apiClient.post('/scholarships', data),
  update: (id: string, data: any) => apiClient.put(`/scholarships/${id}`, data),
  delete: (id: string) => apiClient.delete(`/scholarships/${id}`),
}

// Applications API
export const applicationsAPI = {
  getAll: (params?: any) => apiClient.get('/applications', { params }),
  getById: (id: string) => apiClient.get(`/applications/${id}`),
  create: (data: any) => apiClient.post('/applications', data),
  update: (id: string, data: any) => apiClient.put(`/applications/${id}`, data),
  updateStatus: (id: string, status: string, reason?: string) =>
    apiClient.patch(`/applications/${id}/status`, { status, reason }),
  submit: (id: string) => apiClient.post(`/applications/${id}/submit`),
  withdraw: (id: string) => apiClient.post(`/applications/${id}/withdraw`),
}