import { apiClient } from './apiClient'
import { ApiResponse } from './apiClient'
import { AuthResponse, LoginRequest, RegisterRequest } from '@/models/Auth'

export const login = async (email: string, password: string): Promise<ApiResponse<AuthResponse> | AuthResponse> => {
  const credentials: LoginRequest = { email, password }
  const response = await apiClient.post<ApiResponse<AuthResponse> | AuthResponse>('/auth/login', credentials)
  
  // Handle both response formats
  const loginData = (response as ApiResponse<AuthResponse>).value || (response as AuthResponse)
  
  // Token will be saved by AuthStore through CommonStore
  // No need to save here anymore
  
  return loginData
}

export const register = async (data: RegisterRequest): Promise<ApiResponse<AuthResponse> | AuthResponse | string> => {
  const response = await apiClient.post<any>('/Auth/register', data)
  // Could be: string token, ApiResponse<string>, AuthResponse, ApiResponse<AuthResponse>
  return response
}

export const refreshToken = async (accessToken: string, refreshToken: string): Promise<ApiResponse<AuthResponse> | AuthResponse> => {
  const payload = { accessToken, refreshToken }
  const response = await apiClient.post<ApiResponse<AuthResponse> | AuthResponse>('/Auth/refresh-token', payload)
  return response
}

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout')
  // Token will be cleared by AuthStore through CommonStore
  // No need to clear here anymore
}

export const getCurrentUser = async (): Promise<ApiResponse<any> | any> => {
  const response = await apiClient.get<ApiResponse<any> | any>('/auth/me')
  // support ApiResponse or direct user object
  if (response && typeof response === 'object' && 'value' in response) return response.value
  return response
}

// export const getCurrentUser = async (): Promise<User> => {
//   const response = await apiClient.get<ApiResponse<User> | User>('/auth/me')
//   // Handle both response formats
//   if ('id' in response && 'name' in response) {
//     return response as User
//   }
//   return (response as ApiResponse<User>).value as User
// }

// export const updateProfile = async (data: Partial<User>): Promise<User> => {
//   const response = await apiClient.put<ApiResponse<User> | User>('/auth/profile', data)
//   // Handle both response formats
//   if ('id' in response && 'name' in response) {
//     return response as User
//   }
//   return (response as ApiResponse<User>).value as User
// }

