import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { CategoryDto } from '@/models/Category'
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

