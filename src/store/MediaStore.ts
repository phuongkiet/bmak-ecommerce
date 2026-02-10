import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import * as mediaApi from '@/agent/api/mediaApi'
import type { AppImageDto, ImageParams } from '@/models/Image'
import type { PaginatedResult } from '@/models/Common'

class MediaStore {
  images: AppImageDto[] = []
  metaData: PaginatedResult<AppImageDto[]>['metaData'] | null = null
  isLoading = false
  isUploading = false
  error: string | null = null
  query: ImageParams = {
    pageIndex: 1,
    pageSize: 80,
    search: '',
  }
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async fetchImages(params?: Partial<ImageParams>, append: boolean = false): Promise<void> {
    this.isLoading = true
    this.error = null

    const nextQuery: ImageParams = {
      ...this.query,
      ...params,
    }

    try {
      const result = await mediaApi.getImages(nextQuery)
      runInAction(() => {
        this.query = nextQuery
        this.metaData = result.metaData
        this.images = append ? [...this.images, ...result.items] : result.items
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch images'
        this.isLoading = false
      })
    }
  }

  async loadMore(): Promise<void> {
    if (!this.metaData) return
    if (this.metaData.currentPage >= this.metaData.totalPages) return

    const nextPage = this.metaData.currentPage + 1
    await this.fetchImages({ pageIndex: nextPage }, true)
  }

  async uploadImage(file: File): Promise<AppImageDto | null> {
    this.isUploading = true
    this.error = null

    try {
      const image = await mediaApi.uploadImage(file)
      runInAction(() => {
        this.images = [image, ...this.images]
        this.isUploading = false
      })
      return image
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Upload failed'
        this.isUploading = false
      })
      return null
    }
  }

  async deleteImage(id: number): Promise<boolean> {
    this.isLoading = true
    this.error = null

    try {
      const ok = await mediaApi.deleteImage(id)
      runInAction(() => {
        if (ok) this.images = this.images.filter((img) => img.id !== id)
        this.isLoading = false
      })
      return ok
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Delete failed'
        this.isLoading = false
      })
      return false
    }
  }

  clearError(): void {
    this.error = null
  }
}

export default MediaStore
