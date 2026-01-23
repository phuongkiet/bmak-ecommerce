import { apiClient } from './apiClient'
import { User, LoginCredentials, RegisterData } from '@/models/User'
import { ApiResponse } from './apiClient'

interface LoginResponse {
  user: User
  token: string
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const credentials: LoginCredentials = { email, password }
  const response = await apiClient.post<ApiResponse<LoginResponse> | LoginResponse>('/auth/login', credentials)
  
  // Handle both response formats
  const loginData = (response as ApiResponse<LoginResponse>).data || (response as LoginResponse)
  
  // Token will be saved by AuthStore through CommonStore
  // No need to save here anymore
  
  return loginData
}

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse> | LoginResponse>('/auth/register', data)
  
  // Handle both response formats
  const loginData = (response as ApiResponse<LoginResponse>).data || (response as LoginResponse)
  
  // Token will be saved by AuthStore through CommonStore
  // No need to save here anymore
  
  return loginData
}

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout')
  // Token will be cleared by AuthStore through CommonStore
  // No need to clear here anymore
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User> | User>('/auth/me')
  // Handle both response formats
  if ('id' in response && 'name' in response) {
    return response as User
  }
  return (response as ApiResponse<User>).data
}

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User> | User>('/auth/profile', data)
  // Handle both response formats
  if ('id' in response && 'name' in response) {
    return response as User
  }
  return (response as ApiResponse<User>).data
}

