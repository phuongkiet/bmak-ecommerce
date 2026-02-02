import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import * as pageApi from '@/agent/api/pageApi'
import type { CreatePageCommand, PageDto, PageSectionDto, PageSummaryDto, UpdatePageCommand } from '@/models/Page'

// Type alias cho Page store
export type PageSection = PageSectionDto
export interface Page extends PageDto {}

// // 2. Mock Data (Dữ liệu mẫu ban đầu)
// const INITIAL_PAGES: PageSummaryDto[] = [
//   {
//     id: 1,
//     slug: 'home',
//     title: 'Trang chủ',
//     description: 'Trang chủ của cửa hàng',
//     status: 'Published' as PageStatusType,
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: 2,
//     slug: 'about',
//     title: 'Giới thiệu',
//     description: 'Trang giới thiệu về cửa hàng',
//     status: 'Published' as PageStatusType,
//     updatedAt: new Date().toISOString()
//   }
// ]

class PageStore {
  // Khởi tạo pages với dữ liệu mẫu ngay lập tức
  pages: PageSummaryDto[] = []
  selectedPage: PageDto | null = null
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  // Load pages từ API
  async loadPages(): Promise<void> {
    this.isLoading = true
    this.error = null
    try {
      const result = await pageApi.getPages()
      runInAction(() => {
        if (result.isSuccess && result.value) {
          // Backend trả về object có items array, cần extract
          const items = (result.value as any).items || result.value
          const pagesList = Array.isArray(items) ? items : [items]
          this.pages = pagesList.map((item: any) => ({
            ...item,
            updatedAt: item.updatedAt || new Date().toISOString()
          }))
        } else {
          this.error = result.error || 'Không thể tải được danh sách trang'
        }
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load pages'
        this.isLoading = false
      })
    }
  }

  // Lấy chi tiết page từ API theo slug
  async getPageBySlugFromApi(slug: string): Promise<PageDto | null> {
    this.isLoading = true
    this.error = null
    try {
      const result = await pageApi.getPageBySlug(slug)
      runInAction(() => {
        if (result.isSuccess && result.value) {
          this.selectedPage = result.value
        } else {
          this.error = result.error || 'Failed to load page'
        }
        this.isLoading = false
      })
      return result.isSuccess ? result.value || null : null
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load page'
        this.isLoading = false
      })
      return null
    }
  }

  // Tìm page summary theo slug (từ local cache)
  getPageBySlug(slug: string): PageSummaryDto | undefined {
    return this.pages.find(page => page.slug === slug)
  }

  // Lưu page lên server (cập nhật)
  async savePage(pageId: number, newSections: PageSection[]): Promise<boolean> {
    const pageSummary = this.pages.find(p => p.id === pageId)
    if (!pageSummary) {
      this.error = 'Page not found'
      return false
    }

    this.isLoading = true
    this.error = null

    try {
      const updateCommand: UpdatePageCommand = {
        id: pageId,
        slug: pageSummary.slug,
        title: pageSummary.title,
        description: pageSummary.description,
        sections: newSections,
        isPublished: pageSummary.status
      }

      const result = await pageApi.updatePage(updateCommand)

      runInAction(() => {
        if (result.isSuccess) {
          // Cập nhật local state
          if (this.selectedPage?.id === pageId) {
            this.selectedPage = {
              ...this.selectedPage,
              sections: newSections
            }
          }
        } else {
          this.error = result.error || 'Failed to save page'
        }
        this.isLoading = false
      })

      return result.isSuccess
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to save page'
        this.isLoading = false
      })
      return false
    }
  }

  // Tạo page mới
  async createNewPage(slug: string, title: string, description?: string): Promise<string | null> {
    this.isLoading = true
    this.error = null

    try {
      const createCommand: CreatePageCommand = {
        slug,
        title,
        description,
        sections: []
      }

      const result = await pageApi.createPage(createCommand)

      runInAction(() => {
        if (result.isSuccess) {
          // Reload pages sau khi tạo thành công
          this.loadPages()
        } else {
          this.error = result.error || 'Failed to create page'
        }
        this.isLoading = false
      })

      return result.isSuccess ? (result.value?.slug ?? null) : null
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to create page'
        this.isLoading = false
      })
      return null
    }
  }

  // Update trang (lưu local state - dùng cho editing trước khi save)
  updatePageLocally(pageId: number, newSections: PageSection[]): void {
    if (this.selectedPage?.id === pageId) {
      runInAction(() => {
        this.selectedPage = {
          ...this.selectedPage!,
          sections: newSections
        }
      })
    }
  }
}

export default PageStore