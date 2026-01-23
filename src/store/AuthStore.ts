import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { User } from '@/models/User'
import * as authApi from '@/agent/api/authApi'

class AuthStore {
  user: User | null = null
  isAuthenticated: boolean = false
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
    
    // Load user from localStorage on init
    this.loadUserFromStorage()
  }

  get userDisplayName(): string {
    return this.user?.name || 'Guest'
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading = true
    this.error = null
    
    try {
      const data = await authApi.login(email, password)
      runInAction(() => {
        this.user = data.user
        this.isAuthenticated = true
        this.isLoading = false
        // Save token to commonStore
        if (data.token) {
          this.rootStore.commonStore.setToken(data.token)
        }
        this.saveUserToStorage()
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Login failed'
        this.isLoading = false
      })
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      runInAction(() => {
        this.user = null
        this.isAuthenticated = false
        // Clear token from commonStore
        this.rootStore.commonStore.clearToken()
        this.clearUserFromStorage()
      })
    }
  }

  private saveUserToStorage(): void {
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('isAuthenticated', 'true')
    }
  }

  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem('user')
      const isAuth = localStorage.getItem('isAuthenticated')
      
      if (userStr && isAuth === 'true') {
        const user = JSON.parse(userStr)
        runInAction(() => {
          this.user = user
          this.isAuthenticated = true
        })
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    }
  }

  private clearUserFromStorage(): void {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
  }
}

export default AuthStore

