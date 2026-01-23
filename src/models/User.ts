export interface User {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  avatar?: string
  role?: 'user' | 'admin'
  createdAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}





