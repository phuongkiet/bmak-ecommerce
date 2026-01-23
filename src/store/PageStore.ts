import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'

// 1. Định nghĩa Interface chi tiết cho Hero Slide
export interface HeroSlide {
  id: string
  image: string
  title: string
  subtitle?: string
  badge?: string       // Thêm
  buttonText?: string  // Thêm
  buttonLink?: string  // Thêm
}

// 2. Định nghĩa Config cho Product Carousel
export interface ProductCarouselConfig {
  listType: 'tag' | 'category' | 'newest' | 'bestseller' | 'featured'
  tag?: string
  title: string
  limit?: number
}

// 3. Định nghĩa Section (Thêm imageUrl cho loại image/text-image)
export interface PageSection {
  id: string
  type: 'hero' | 'text' | 'image' | 'text-image' | 'product-carousel' // Định nghĩa cứng type string
  content?: string
  imageUrl?: string     // Thêm trường này để lưu ảnh của section
  imagePosition?: 'left' | 'right'
  heroSlides?: HeroSlide[]
  carouselConfig?: ProductCarouselConfig
}

export interface Page {
  id: string
  slug: string
  title: string
  description?: string
  sections: PageSection[] // Bỏ dấu ? để code dễ xử lý hơn (mặc định là mảng rỗng)
}

class PageStore {
  currentPage: string = 'home'
  pages: Page[] = []
  selectedPage: Page | null = null
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  setCurrentPage(page: string): void {
    this.currentPage = page
  }

  getCurrentPage(): string {
    return this.currentPage
  }

  resetPage(): void {
    this.currentPage = 'home'
  }

  async loadPages(): Promise<void> {
    this.isLoading = true
    try {
      // Giả lập API call
      // const data = await pageApi.getPages()
      runInAction(() => {
        // this.pages = data
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load pages'
        this.isLoading = false
      })
    }
  }

  getPageBySlug(slug: string): Page | undefined {
    return this.pages.find(page => page.slug === slug)
  }

  async fetchPageBySlug(slug: string): Promise<Page | null> {
    this.isLoading = true
    this.error = null

    try {
      // TODO: Call API to fetch page by slug
      // const data = await pageApi.getPageBySlug(slug)
      runInAction(() => {
        // this.selectedPage = data
        this.isLoading = false
      })
      return this.selectedPage
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to fetch page'
        this.isLoading = false
      })
      return null
    }
  }

  clearSelectedPage(): void {
    this.selectedPage = null
  }

  // Hàm updatePage mà AdminPages đang gọi
  updatePage(pageId: string, newSections: PageSection[]): void {
    const pageIndex = this.pages.findIndex(p => p.id === pageId)
    if (pageIndex !== -1) {
      // Cập nhật local store (Trong thực tế chỗ này sẽ gọi API PUT)
      this.pages[pageIndex].sections = newSections
      
      // Nếu đang select trang này thì update luôn
      if (this.selectedPage?.id === pageId) {
        this.selectedPage.sections = newSections
      }
    }
  }
}

export default PageStore

