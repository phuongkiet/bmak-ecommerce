import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import * as adminSettingApi from '@/agent/api/adminSettingApi'
import type { AdminSettingDto, UpsertAdminSettingCommand } from '@/models/AdminSetting'

class AdminSettingStore {
  rootStore: RootStore
  setting: AdminSettingDto | null = null
  isLoading = false
  isSubmitting = false
  error: string | null = null

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  clearError(): void {
    this.error = null
  }

  async fetchSetting(): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const data = await adminSettingApi.getAdminSetting()
      runInAction(() => {
        this.setting = data
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Khong the tai cai dat he thong'
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async upsertSetting(command: UpsertAdminSettingCommand): Promise<AdminSettingDto | null> {
    this.isSubmitting = true
    this.error = null

    try {
      const data = await adminSettingApi.upsertAdminSetting(command)
      runInAction(() => {
        this.setting = data
      })
      return data
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Khong the luu cai dat he thong'
      })
      return null
    } finally {
      runInAction(() => {
        this.isSubmitting = false
      })
    }
  }
}

export default AdminSettingStore
