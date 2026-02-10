import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { WardDto } from '@/models/Ward'
import { getWards, getWardsByProvinceId } from '@/agent/api/wardApi'

class WardStore {
  rootStore: RootStore
  wards: WardDto[] = []
  isLoading = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  setWards(wards: WardDto[]): void {
    this.wards = wards
  }

  clearWards(): void {
    this.wards = []
  }

  async fetchWards(pageIndex: number = 1, pageSize: number = 1000): Promise<void> {
    this.isLoading = true
    try {
      const data = await getWards(pageIndex, pageSize)
      runInAction(() => {
        this.setWards(data)
      })
    } catch (error: any) {
      const message = error?.message || 'Không thể tải xã/phường/đặc khu'
      this.rootStore.commonStore.showError(message)
      runInAction(() => {
        this.clearWards()
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async fetchWardsByProvinceId(provinceId: string, pageIndex: number = 1, pageSize: number = 1000): Promise<void> {
    this.isLoading = true
    try {
      const data = await getWardsByProvinceId(provinceId, pageIndex, pageSize)
      runInAction(() => {
        this.setWards(data)
      })
    } catch (error: any) {
      const message = error?.message || 'Không thể tải xã/phường/đặc khu'
      this.rootStore.commonStore.showError(message)
      runInAction(() => {
        this.clearWards()
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }
}

export default WardStore





