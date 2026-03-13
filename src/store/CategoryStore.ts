import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { CategoryDto, CreateCategoryCommand, UpdateCategoryCommand } from '@/models/Category'
import * as categoryApi from '@/agent/api/categoryApi'
import { categories as mockCategories } from '@/data/mockCategories'

class CategoryStore {
  categories: CategoryDto[] = []
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async fetchCategories(parentId?: number, useMockDataOnError: boolean = true): Promise<void> {
    this.isLoading = true
    this.error = null
    
    try {
      const data = await categoryApi.getAllCategories(parentId)
      runInAction(() => {
        this.categories = data
        this.isLoading = false
      })
    } catch (error: any) {
      runInAction(() => {
        const errorMessage = error?.message || 'Failed to fetch categories'
        this.error = errorMessage
        this.isLoading = false
        
        // Fallback to mock data if API fails and no categories loaded yet
        if (useMockDataOnError && this.categories.length === 0) {
          // Convert mock categories to CategoryDto format
          this.categories = mockCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            parentId: null,
            parentName: null,
          }))
        }
      })
    }
  }

  async fetchAdminCategories(params?: { pageIndex?: number; pageSize?: number; search?: string }): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const data = await categoryApi.getAdminCategories({
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 1000,
        search: params?.search,
      })

      runInAction(() => {
        this.categories = data.items
        this.isLoading = false
      })
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Failed to fetch categories'
        this.isLoading = false
      })
    }
  }

  async createAdminCategory(command: CreateCategoryCommand): Promise<boolean> {
    this.isLoading = true
    this.error = null
    try {
      const id = await categoryApi.createAdminCategory(command)
      runInAction(() => {
        this.categories = [
          {
            id,
            name: command.name,
            slug: command.slug,
            description: command.description,
            parentId: command.parentId ?? null,
            parentName: this.categories.find(c => c.id === command.parentId)?.name ?? null,
            image: command.image,
            sortOrder: command.sortOrder,
            isActive: command.isActive ?? true,
          },
          ...this.categories,
        ]
        this.isLoading = false
      })
      return true
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Failed to create category'
        this.isLoading = false
      })
      return false
    }
  }

  async updateAdminCategory(id: number, command: UpdateCategoryCommand): Promise<boolean> {
    this.isLoading = true
    this.error = null
    try {
      const success = await categoryApi.updateAdminCategory(id, { ...command, id })
      runInAction(() => {
        if (success) {
          this.categories = this.categories.map(category =>
            category.id === id
              ? {
                  ...category,
                  ...command,
                  parentName:
                    command.parentId != null
                      ? this.categories.find(c => c.id === command.parentId)?.name ?? null
                      : null,
                }
              : category
          )
        }
        this.isLoading = false
      })
      return success
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Failed to update category'
        this.isLoading = false
      })
      return false
    }
  }

  async deleteAdminCategory(id: number): Promise<boolean> {
    this.isLoading = true
    this.error = null
    try {
      const success = await categoryApi.deleteAdminCategory(id)
      runInAction(() => {
        if (success) {
          this.categories = this.categories.filter(category => category.id !== id)
        }
        this.isLoading = false
      })
      return success
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Failed to delete category'
        this.isLoading = false
      })
      return false
    }
  }

  getCategoriesByParent(parentId?: number): CategoryDto[] {
    if (!parentId) {
      // Return root categories (no parent)
      return this.categories.filter(cat => !cat.parentId)
    }
    return this.categories.filter(cat => cat.parentId === parentId)
  }

  getCategoryById(id: number): CategoryDto | undefined {
    return this.categories.find(cat => cat.id === id)
  }

  clearCategories(): void {
    this.categories = []
  }
}

export default CategoryStore

