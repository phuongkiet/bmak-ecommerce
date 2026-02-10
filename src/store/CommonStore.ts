import { makeAutoObservable } from 'mobx'
import RootStore from './RootStore'

class CommonStore {
  token: string | null = null
  refreshToken: string | null = null
  theme: 'light' | 'dark' = 'light'
  language: 'vi' | 'en' = 'vi'
  isLoading: boolean = false
  notifications: NotificationItem[] = []
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
    
    // Load token from localStorage on init
    this.loadTokenFromStorage()
    this.loadRefreshTokenFromStorage()
    this.loadThemeFromStorage()
    this.loadLanguageFromStorage()
  }

  // Token management
  setToken(token: string | null): void {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  setRefreshToken(token: string | null): void {
    this.refreshToken = token
    if (token) {
      localStorage.setItem('refreshToken', token)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }

  getToken(): string | null {
    return this.token
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  clearToken(): void {
    this.token = null
    localStorage.removeItem('token')
  }

  clearRefreshToken(): void {
    this.refreshToken = null
    localStorage.removeItem('refreshToken')
  }

  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('token')
    if (token) {
      this.token = token
    }
  }

  private loadRefreshTokenFromStorage(): void {
    const token = localStorage.getItem('refreshToken')
    if (token) this.refreshToken = token
  }

  // Theme management
  setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme
    localStorage.setItem('theme', theme)
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light')
  }

  private loadThemeFromStorage(): void {
    const theme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (theme) {
      this.setTheme(theme)
    }
  }

  // Language management
  setLanguage(language: 'vi' | 'en'): void {
    this.language = language
    localStorage.setItem('language', language)
  }

  private loadLanguageFromStorage(): void {
    const language = localStorage.getItem('language') as 'vi' | 'en' | null
    if (language) {
      this.language = language
    }
  }

  // Loading state
  setLoading(loading: boolean): void {
    this.isLoading = loading
  }

  // Notification management
  addNotification(notification: Omit<NotificationItem, 'id'>): void {
    const newNotification: NotificationItem = {
      id: Date.now(),
      ...notification,
    }
    this.notifications.push(newNotification)

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(newNotification.id)
      }, newNotification.duration)
    }
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id)
  }

  clearNotifications(): void {
    this.notifications = []
  }

  // Show success notification
  showSuccess(message: string, duration: number = 3000): void {
    this.addNotification({
      type: 'success',
      message,
      duration,
    })
  }

  // Show error notification
  showError(message: string, duration: number = 5000): void {
    this.addNotification({
      type: 'error',
      message,
      duration,
    })
  }

  // Show info notification
  showInfo(message: string, duration: number = 3000): void {
    this.addNotification({
      type: 'info',
      message,
      duration,
    })
  }

  // Show warning notification
  showWarning(message: string, duration: number = 4000): void {
    this.addNotification({
      type: 'warning',
      message,
      duration,
    })
  }
}

export interface NotificationItem {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export default CommonStore





