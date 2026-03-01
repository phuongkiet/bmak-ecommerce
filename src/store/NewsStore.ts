import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import type {
  NewsCategoryDto,
  CreateNewsCategoryCommand,
  UpdateNewsCategoryCommand,
} from '@/models/NewsCategory'
import type {
  NewsPostDto,
  NewsPostSummaryDto,
  CreateNewsPostCommand,
  UpdateNewsPostCommand,
} from '@/models/NewsPost'
import * as newsCategoryApi from '@/agent/api/newsCategoryApi'
import * as newsPostApi from '@/agent/api/newsPostApi'

class NewsStore {
  rootStore: RootStore

  categories: NewsCategoryDto[] = []
  posts: NewsPostSummaryDto[] = []
  selectedPost: NewsPostDto | null = null

  isLoadingCategories = false
  isLoadingPosts = false
  isLoadingPostDetail = false
  isSubmitting = false
  error: string | null = null

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  clearError(): void {
    this.error = null
  }

  clearSelectedPost(): void {
    this.selectedPost = null
  }

  async fetchNewsCategories(): Promise<void> {
    this.isLoadingCategories = true
    this.error = null

    try {
      const data = await newsCategoryApi.getNewsCategories()
      runInAction(() => {
        this.categories = data
        this.isLoadingCategories = false
      })
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể tải danh mục tin tức'
        this.isLoadingCategories = false
      })
    }
  }

  async fetchNewsPosts(): Promise<void> {
    this.isLoadingPosts = true
    this.error = null

    try {
      const data = await newsPostApi.getNewsPosts()
      runInAction(() => {
        this.posts = data
        this.isLoadingPosts = false
      })
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể tải danh sách bài viết'
        this.isLoadingPosts = false
      })
    }
  }

  async fetchNewsPostById(id: number): Promise<NewsPostDto | null> {
    this.isLoadingPostDetail = true
    this.error = null

    try {
      const data = await newsPostApi.getNewsPostById(id)
      runInAction(() => {
        this.selectedPost = data
        this.isLoadingPostDetail = false
      })
      return data
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể tải chi tiết bài viết'
        this.isLoadingPostDetail = false
      })
      return null
    }
  }

  async createNewsCategory(command: CreateNewsCategoryCommand): Promise<number> {
    this.isSubmitting = true
    this.error = null

    try {
      const id = await newsCategoryApi.createNewsCategory(command)
      await this.fetchNewsCategories()
      runInAction(() => {
        this.isSubmitting = false
      })
      return id
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể tạo danh mục tin tức'
        this.isSubmitting = false
      })
      throw error
    }
  }

  async updateNewsCategory(id: number, command: UpdateNewsCategoryCommand): Promise<boolean> {
    this.isSubmitting = true
    this.error = null

    try {
      const success = await newsCategoryApi.updateNewsCategory(id, command)
      if (success) {
        await this.fetchNewsCategories()
      }
      runInAction(() => {
        this.isSubmitting = false
      })
      return success
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể cập nhật danh mục tin tức'
        this.isSubmitting = false
      })
      throw error
    }
  }

  async deleteNewsCategory(id: number): Promise<boolean> {
    this.isSubmitting = true
    this.error = null

    try {
      const success = await newsCategoryApi.deleteNewsCategory(id)
      if (success) {
        await this.fetchNewsCategories()
      }
      runInAction(() => {
        this.isSubmitting = false
      })
      return success
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể xóa danh mục tin tức'
        this.isSubmitting = false
      })
      throw error
    }
  }

  async createNewsPost(command: CreateNewsPostCommand): Promise<number> {
    this.isSubmitting = true
    this.error = null

    try {
      const id = await newsPostApi.createNewsPost(command)
      await this.fetchNewsPosts()
      runInAction(() => {
        this.isSubmitting = false
      })
      return id
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể tạo bài viết'
        this.isSubmitting = false
      })
      throw error
    }
  }

  async updateNewsPost(id: number, command: UpdateNewsPostCommand): Promise<boolean> {
    this.isSubmitting = true
    this.error = null

    try {
      const success = await newsPostApi.updateNewsPost(id, command)
      if (success) {
        await this.fetchNewsPosts()
      }
      runInAction(() => {
        this.isSubmitting = false
      })
      return success
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể cập nhật bài viết'
        this.isSubmitting = false
      })
      throw error
    }
  }

  async deleteNewsPost(id: number): Promise<boolean> {
    this.isSubmitting = true
    this.error = null

    try {
      const success = await newsPostApi.deleteNewsPost(id)
      if (success) {
        await this.fetchNewsPosts()
      }
      runInAction(() => {
        this.isSubmitting = false
      })
      return success
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Không thể xóa bài viết'
        this.isSubmitting = false
      })
      throw error
    }
  }
}

export default NewsStore