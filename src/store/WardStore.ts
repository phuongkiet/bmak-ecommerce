import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { WardDto } from '@/models/Ward'
import { getWardsByProvinceId } from '@/agent/api/wardApi'

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

  async fetchWardsByProvinceId(provinceId: string): Promise<void> {
    this.isLoading = true
    try {
      const data = await getWardsByProvinceId(provinceId)
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





