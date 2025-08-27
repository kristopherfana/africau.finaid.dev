import Cookies from 'js-cookie'
import { create } from 'zustand'
import { authAPI } from '@/lib/api'

const ACCESS_TOKEN = 'auth_token'

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
  user: AuthUser | null
  accessToken: string
  setUser: (user: AuthUser | null) => void
  setAccessToken: (accessToken: string) => void
  resetAccessToken: () => void
  reset: () => void
  login: (email: string, password: string) => Promise<AuthUser | null>
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<AuthUser | null>
  logout: () => void
  isAuthenticated: () => boolean
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    login: (email: string, password: string) => Promise<AuthUser | null>
    register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<AuthUser | null>
    logout: () => void
    isAuthenticated: () => boolean
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  // Load user from localStorage if exists
  const savedUser = localStorage.getItem('user')
  const initUser = savedUser ? JSON.parse(savedUser) : null
  
  const setUserHandler = (user: AuthUser | null) => {
    set((state) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
      return { ...state, user, auth: { ...state.auth, user } }
    })
  }

  const setAccessTokenHandler = (accessToken: string) => {
    set((state) => {
      Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
      return { ...state, accessToken, auth: { ...state.auth, accessToken } }
    })
  }

  const resetAccessTokenHandler = () => {
    set((state) => {
      Cookies.remove(ACCESS_TOKEN)
      return { ...state, accessToken: '', auth: { ...state.auth, accessToken: '' } }
    })
  }

  const resetHandler = () => {
    set((state) => {
      Cookies.remove(ACCESS_TOKEN)
      localStorage.removeItem('user')
      return {
        ...state,
        user: null,
        accessToken: '',
        auth: { ...state.auth, user: null, accessToken: '' },
      }
    })
  }

  const loginHandler = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      
      const user: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role as UserRole,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        profilePicture: undefined
      }
      
      setUserHandler(user)
      setAccessTokenHandler(response.access_token)
      
      return user
    } catch (error) {
      console.error('Login failed:', error)
      return null
    }
  }

  const registerHandler = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const response = await authAPI.register(data)
      
      const user: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role as UserRole,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        profilePicture: undefined
      }
      
      setUserHandler(user)
      setAccessTokenHandler(response.access_token)
      
      return user
    } catch (error) {
      console.error('Registration failed:', error)
      return null
    }
  }

  const logoutHandler = () => {
    authAPI.logout()
    resetHandler()
  }

  const isAuthenticatedHandler = () => {
    const state = get()
    return !!state.user && !!state.accessToken
  }

  return {
    user: initUser,
    accessToken: initToken,
    setUser: setUserHandler,
    setAccessToken: setAccessTokenHandler,
    resetAccessToken: resetAccessTokenHandler,
    reset: resetHandler,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
    isAuthenticated: isAuthenticatedHandler,
    auth: {
      user: initUser,
      setUser: setUserHandler,
      accessToken: initToken,
      setAccessToken: setAccessTokenHandler,
      resetAccessToken: resetAccessTokenHandler,
      reset: resetHandler,
      login: loginHandler,
      register: registerHandler,
      logout: logoutHandler,
      isAuthenticated: isAuthenticatedHandler,
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
