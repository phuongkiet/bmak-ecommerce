import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { ProvinceDto } from '@/models/Province'
import { getProvinces } from '@/agent/api/provinceApi'

class ProvinceStore {
  rootStore: RootStore
  provinces: ProvinceDto[] = []
  isLoading = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  setProvinces(provinces: ProvinceDto[]): void {
    this.provinces = provinces
  }

  async fetchProvinces(): Promise<void> {
    this.isLoading = true
    try {
      const data = await getProvinces()
      console.log('Fetched provinces:', data)
      runInAction(() => {
        this.setProvinces(data)
      })
    } catch (error: any) {
      const message = error?.message || 'Không thể tải tỉnh/thành phố'
      this.rootStore.commonStore.showError(message)
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }
}

export default ProvinceStore





