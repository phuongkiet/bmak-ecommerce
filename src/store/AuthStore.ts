import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import * as authApi from '@/agent/api/authApi'
import { AuthResponse } from '@/models/Auth'
import { apiClient } from '@/agent/api/apiClient'
import { clearCompareStorage } from '@/utils/compareStorage'

class AuthStore {
  user: AuthResponse | null = null
  isAuthenticated: boolean = false
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)

    apiClient.setTokenGetter(() => this.rootStore.commonStore.getToken());
    apiClient.setRefreshTokenGetter(() => this.rootStore.commonStore.getRefreshToken());
    
    // Khi refresh thành công, apiClient tự động cập nhật token vào Store
    apiClient.setTokenSetter((token) => {
      if(token) this.rootStore.commonStore.setToken(token);
    });
    apiClient.setRefreshTokenSetter((token) => {
      if(token) this.rootStore.commonStore.setRefreshToken(token);
    });
    
    // Load user from localStorage on init
    this.loadUserFromStorage()
    void this.validateSessionOnStartup()
  }

  get userDisplayName(): string {
    return this.user?.fullName || 'Khách hàng'
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
        clearCompareStorage()
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
      const accessToken = this.rootStore.commonStore.getToken()

      if (userStr && isAuth === 'true') {
        if (!accessToken) {
          this.clearUserFromStorage()
          return
        }

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

  private isJwtExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1]
      if (!payloadPart) return true

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
      const payload = JSON.parse(atob(padded))

      const expValue = typeof payload?.exp === 'number' ? payload.exp : Number(payload?.exp)
      if (!Number.isFinite(expValue)) return true

      const expMs = expValue > 1_000_000_000_000 ? expValue : expValue * 1000
      return Date.now() >= expMs
    } catch {
      return true
    }
  }

  private clearLocalSession(): void {
    this.user = null
    this.isAuthenticated = false
    this.rootStore.commonStore.clearToken()
    this.rootStore.commonStore.clearRefreshToken()
    this.clearUserFromStorage()
  }

  private async validateSessionOnStartup(): Promise<void> {
    const accessToken = this.rootStore.commonStore.getToken()
    const refreshToken = this.rootStore.commonStore.getRefreshToken()

    console.debug('[auth] startup check', {
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
    })

    if (!accessToken) {
      this.clearLocalSession()
      return
    }

    if (!this.isJwtExpired(accessToken)) {
      console.debug('[auth] access token still valid')
      return
    }

    console.debug('[auth] access token expired, attempting refresh')

    if (!refreshToken) {
      this.clearLocalSession()
      return
    }

    try {
      const response = await authApi.refreshToken(accessToken, refreshToken)
      const auth = (response && typeof response === 'object' && 'value' in response) ? (response as any).value : response

      const newAccessToken = (auth as any)?.token || (auth as any)?.accessToken || null
      const newRefreshToken = (auth as any)?.refreshToken || refreshToken

      if (!newAccessToken) {
        console.debug('[auth] refresh failed: missing access token in response')
        runInAction(() => {
          this.clearLocalSession()
        })
        return
      }

      runInAction(() => {
        this.rootStore.commonStore.setToken(newAccessToken)
        this.rootStore.commonStore.setRefreshToken(newRefreshToken)

        if (this.user) {
          this.user = {
            ...this.user,
            token: newAccessToken,
            refreshToken: newRefreshToken,
          }
          this.isAuthenticated = true
          this.saveUserToStorage()
        }
      })
      console.debug('[auth] refresh success')
    } catch {
      console.debug('[auth] refresh failed: request error')
      runInAction(() => {
        this.clearLocalSession()
      })
    }
  }

  private clearUserFromStorage(): void {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
  }
}

export default AuthStore

