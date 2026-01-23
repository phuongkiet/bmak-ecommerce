// Base API client configuration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7228/api'

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

class ApiClient {
  private baseURL: string
  private tokenGetter: (() => string | null) | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Set token getter function (from store)
  setTokenGetter(getter: () => string | null): void {
    this.tokenGetter = getter
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get token from tokenGetter, or localStorage as fallback
    const token = this.tokenGetter ? this.tokenGetter() : localStorage.getItem('token')
    
    const config: RequestInit = {
      ...options,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      // Check if response is empty
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get text first to see if there's any content
        const text = await response.text()
        if (!text || text.trim() === '') {
          throw {
            message: 'Empty response from server',
            status: response.status,
          } as ApiError
        }
        // If there's text but not JSON, try to parse as JSON anyway
        try {
          return JSON.parse(text) as T
        } catch {
          throw {
            message: `Unexpected response format. Expected JSON but got: ${contentType || 'unknown'}`,
            status: response.status,
          } as ApiError
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          errors: errorData.errors,
        } as ApiError
      }

      const data = await response.json()
      return data
    } catch (error) {
      // Handle network errors (CORS, connection issues, etc.)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          message: 'Cannot connect to server. Please check if backend is running and CORS is configured.',
          status: 0,
        } as ApiError
      }
      // Re-throw ApiError
      if (error && typeof error === 'object' && 'status' in error) {
        throw error
      }
      // Unknown error
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
      } as ApiError
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Special method to get response with headers (for pagination)
  async getWithHeaders<T>(endpoint: string): Promise<{ data: T; headers: Headers }> {
    const url = `${this.baseURL}${endpoint}`
    
    const token = this.tokenGetter ? this.tokenGetter() : localStorage.getItem('token')
    
    const config: RequestInit = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          errors: errorData.errors,
        } as ApiError
      }

      const data = await response.json()
      return { data, headers: response.headers }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          message: 'Cannot connect to server. Please check if backend is running and CORS is configured.',
          status: 0,
        } as ApiError
      }
      if (error && typeof error === 'object' && 'status' in error) {
        throw error
      }
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
      } as ApiError
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

