import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'

// 1. Interfaces
export interface HeroSlide {
  id: string
  image: string
  title: string
  subtitle?: string
  badge?: string
  buttonText?: string
  buttonLink?: string
}

export interface ProductCarouselConfig {
  listType: 'tag' | 'category' | 'newest' | 'bestseller' | 'featured'
  tag?: string
  title: string
  limit?: number
}

export interface PageSection {
  id: string
  type: 'hero' | 'text' | 'image' | 'text-image' | 'product-carousel'
  content?: string
  imageUrl?: string
  imagePosition?: 'left' | 'right'
  heroSlides?: HeroSlide[]
  carouselConfig?: ProductCarouselConfig
}

export interface Page {
  id: string
  slug: string
  title: string
  description?: string
  sections: PageSection[]
}

// 2. Mock Data (Dữ liệu mẫu ban đầu)
const INITIAL_PAGES: Page[] = [
  {
    id: '1',
    slug: 'home',
    title: 'Trang chủ',
    sections: [
      {
        id: 'sec_home_1',
        type: 'hero',
        heroSlides: [
          {
            id: 'slide_1',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
            title: 'Khám phá bộ sưu tập',
            subtitle: 'Sản phẩm tuyệt vời mùa hè này',
            badge: 'Mới nhất',
            buttonText: 'Mua ngay',
            buttonLink: '/products'
          }
        ]
      },
      {
        id: 'sec_home_2',
        type: 'product-carousel',
        carouselConfig: {
          title: 'Sản phẩm bán chạy',
          listType: 'bestseller',
          limit: 8
        }
      },
      {
        id: 'sec_home_3',
        type: 'text-image',
        content: '<h2>Về chúng tôi</h2><p>Chúng tôi cung cấp những sản phẩm chất lượng nhất...</p>',
        imageUrl: 'https://images.unsplash.com/photo-1556740758-90de274247d4?w=800&q=80',
        imagePosition: 'right'
      }
    ]
  },
  {
    id: '2',
    slug: 'about',
    title: 'Giới thiệu',
    sections: [
      {
        id: 'sec_about_1',
        type: 'hero',
        heroSlides: [
          {
            id: 'slide_about_1',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
            title: 'Câu chuyện thương hiệu',
            subtitle: 'Hành trình 10 năm phát triển'
          }
        ]
      },
      {
        id: 'sec_about_2',
        type: 'text',
        content: '<h3>Sứ mệnh của chúng tôi</h3><p>Mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng...</p>'
      }
    ]
  }
]

class PageStore {
  // Khởi tạo pages với dữ liệu mẫu ngay lập tức
  pages: Page[] = INITIAL_PAGES
  selectedPage: Page | null = null
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  // Giả lập load pages (reset về mock data nếu cần)
  async loadPages(): Promise<void> {
    this.isLoading = true
    try {
      // Trong thực tế sẽ gọi API ở đây
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake delay
      runInAction(() => {
        if (this.pages.length === 0) {
           this.pages = INITIAL_PAGES;
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

  getPageBySlug(slug: string): Page | undefined {
    return this.pages.find(page => page.slug === slug)
  }

  // Update trang
  updatePage(pageId: string, newSections: PageSection[]): void {
    const pageIndex = this.pages.findIndex(p => p.id === pageId)
    if (pageIndex !== -1) {
      runInAction(() => {
        // Tạo bản copy sâu để tránh lỗi tham chiếu MobX strict mode
        const updatedPage = { ...this.pages[pageIndex], sections: newSections };
        this.pages[pageIndex] = updatedPage;
        
        // Cập nhật selectedPage nếu đang chọn đúng trang đó
        if (this.selectedPage?.id === pageId) {
          this.selectedPage = updatedPage;
        }
      });
    }
  }
}

export default PageStore