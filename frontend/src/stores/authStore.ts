import Cookies from 'js-cookie'
import { create } from 'zustand'

const ACCESS_TOKEN = 'thisisjustarandomstring'

export type UserRole = 'STUDENT' | 'ADMIN' | 'SPONSOR'

interface AuthUser {
  id: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  profilePicture?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    login: (email: string, password: string) => AuthUser | null
    isAuthenticated: () => boolean
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  // Load user from localStorage if exists
  const savedUser = localStorage.getItem('user')
  const initUser = savedUser ? JSON.parse(savedUser) : null
  
  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            localStorage.setItem('user', JSON.stringify(user))
          } else {
            localStorage.removeItem('user')
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          localStorage.removeItem('user')
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
      login: (email: string, password: string) => {
        // Mock login based on email pattern
        let role: UserRole = 'STUDENT'
        let firstName = ''
        let lastName = ''
        
        if (email.toLowerCase().includes('admin@')) {
          role = 'ADMIN'
          firstName = 'Admin'
          lastName = 'User'
        } else if (email.toLowerCase().includes('sponsor@')) {
          role = 'SPONSOR'
          firstName = 'Sponsor'
          lastName = 'Organization'
        } else if (email.toLowerCase().includes('student@')) {
          role = 'STUDENT'
          firstName = 'Student'
          lastName = 'User'
        } else {
          // Default to student for any other email
          role = 'STUDENT'
          const emailParts = email.split('@')[0].split('.')
          firstName = emailParts[0] || 'User'
          lastName = emailParts[1] || 'Account'
        }
        
        const user: AuthUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          role,
          firstName,
          lastName,
          profilePicture: undefined
        }
        
        get().auth.setUser(user)
        get().auth.setAccessToken('mock-token-' + role.toLowerCase())
        
        return user
      },
      isAuthenticated: () => {
        const state = get()
        return !!state.auth.user && !!state.auth.accessToken
      }
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
