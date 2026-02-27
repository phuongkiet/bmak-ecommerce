import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { Attribute, CreateAttributeCommand } from '@/models/Attribute'
import * as attributeApi from '@/agent/api/attributeApi'

class AttributeStore {
  attributes: Attribute[] = []
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async fetchAttributes(): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const data = await attributeApi.getAttributes()
      runInAction(() => {
        this.attributes = data
        this.isLoading = false
      })
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể tải thuộc tính'
        this.isLoading = false
      })
    }
  }

  async createAttribute(command: CreateAttributeCommand): Promise<number> {
    this.isLoading = true
    this.error = null

    try {
      const id = await attributeApi.createAttribute(command)
      await this.fetchAttributes()
      return id
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể tạo thuộc tính'
        this.isLoading = false
      })
      throw error
    }
  }

  getAttributeById(id: number): Attribute | undefined {
    return this.attributes.find((a) => a.id === id)
  }

  getAttributeByCode(code: string): Attribute | undefined {
    return this.attributes.find((a) => a.code === code)
  }

  clearAttributes(): void {
    this.attributes = []
  }
}

export default AttributeStore
