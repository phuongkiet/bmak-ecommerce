import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import * as authApi from '@/agent/api/authApi'
import { AuthResponse } from '@/models/Auth'

class AuthStore {
  user: AuthResponse | null = null
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
    return this.user?.fullName || 'Guest'
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading = true
    this.error = null
    
    try {
      const response = await authApi.login(email, password)
      // response may be ApiResponse<AuthResponse> or AuthResponse
      const auth = (response && 'value' in response) ? response.value : response

      runInAction(() => {
        if (auth) {
          // Map AuthResponse -> User model
          // Ensure role is strictly 'user' | 'admin' | undefined
          let role: 'user' | 'admin' | undefined = undefined
          if ((auth as any).roles && Array.isArray((auth as any).roles)) {
            const rolesArr = (auth as any).roles.map((r: any) => String(r).toLowerCase())
            role = rolesArr.includes('admin') ? 'admin' : 'user'
          } else if ((auth as any).role !== undefined && (auth as any).role !== null) {
            const r = String((auth as any).role).toLowerCase()
            role = r === 'admin' ? 'admin' : 'user'
          } else {
            role = 'user'
          }

          this.user = {
            id: (auth as any).id,
            fullName: (auth as any).fullName || (auth as any).name || '',
            email: (auth as any).email,
            phoneNumber: (auth as any).phoneNumber || undefined,
            roles: (auth as any).roles || [],
            token: (auth as any).token,
            refreshToken: (auth as any).refreshToken,
          }
          this.isAuthenticated = true
          // Save token to commonStore
          if ((auth as any).token) {
            this.rootStore.commonStore.setToken((auth as any).token)
          }
          if ((auth as any).refreshToken) {
            this.rootStore.commonStore.setRefreshToken((auth as any).refreshToken)
          }
        }
        this.isLoading = false
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
        // Clear token + refresh from commonStore
        this.rootStore.commonStore.clearToken()
        this.rootStore.commonStore.clearRefreshToken()
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
      // Once-only fix: clear stored user/token so client picks up corrected role mapping
      const alreadyDone = localStorage.getItem('auth_role_fix_done')
      if (!alreadyDone) {
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
        this.rootStore.commonStore.clearToken()
        this.rootStore.commonStore.clearRefreshToken()
        localStorage.setItem('auth_role_fix_done', '1')
        return
      }

      const userStr = localStorage.getItem('user')
      const isAuth = localStorage.getItem('isAuthenticated')

      if (userStr && isAuth === 'true') {
        const user = JSON.parse(userStr)
        // Normalize role to lowercase if present
        if (user && user.role) {
          try {
            user.role = String(user.role).toLowerCase()
          } catch (e) {
            // ignore
          }
        }
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

