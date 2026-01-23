import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { ShoppingBag, Truck, Shield, RefreshCw, ArrowRight } from 'lucide-react'
import { useStore } from '@/store'
import HeroCarousel from '@/components/HeroCarousel'
import CategoryCarousel from '@/components/CategoryCarousel'
import ProductCarousel from '@/components/ProductCarousel'

// 1. Định nghĩa các Interface chi tiết cho các phần tử con
interface HeroSlideData {
  id: string | number
  image: string
  title: string
  subtitle?: string
  badge?: string
  buttonText?: string
  buttonLink?: string
}

interface CarouselConfigData {
  listType?: 'tag' | 'category' | 'newest' | 'bestseller' | 'featured'
  tag?: string
  title: string
}

// 2. Định nghĩa một type mở rộng bao gồm tất cả các trường có thể có
// Để TypeScript hiểu được các thuộc tính riêng biệt của từng section
interface ExtendedSection {
  id: number | string
  type: string
  content?: string
  imageUrl?: string
  imagePosition?: 'left' | 'right'
  heroSlides?: HeroSlideData[]
  carouselConfig?: CarouselConfigData
}

const Home = observer(() => {
  const { pageStore } = useStore()

  useEffect(() => {
    // Reload pages to get latest data
    pageStore.loadPages()
  }, [pageStore])

  // Get page inside render to ensure reactivity
  const homePage = pageStore.getPageBySlug('home')

  const categories = [
    { id: 1, name: 'Điện tử', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', count: 120 },
    { id: 2, name: 'Thời trang', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80', count: 85 },
    { id: 3, name: 'Đồ gia dụng', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', count: 65 },
    { id: 4, name: 'Thể thao', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', count: 45 },
    { id: 5, name: 'Mỹ phẩm', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', count: 90 },
    { id: 6, name: 'Sách', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80', count: 150 },
    { id: 7, name: 'Đồ chơi', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', count: 75 },
    { id: 8, name: 'Nội thất', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', count: 55 },
  ]

  // Render sections from PageStore
  const renderSections = () => {
    if (!homePage || !homePage.sections || homePage.sections.length === 0) {
      // Fallback to default content
      return (
        <>
          <section className="relative text-white overflow-hidden h-[600px] md:h-[700px]">
            <div className="absolute inset-0 z-0">
              <HeroCarousel
                slides={[
                  {
                    id: 1,
                    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
                    title: 'Khám phá bộ sưu tập',
                    subtitle: 'Sản phẩm tuyệt vời',
                  },
                ]}
                autoPlay={true}
                interval={5000}
              />
            </div>
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-20 h-full flex items-center">
              <div className="max-w-3xl w-full">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight break-words">
                  Khám phá bộ sưu tập
                  <span className="text-primary-400 block">sản phẩm tuyệt vời</span>
                </h1>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </section>
        </>
      )
    }

    return homePage.sections.map((s) => {
      // 3. Ép kiểu s sang ExtendedSection để TS nhận diện được heroSlides và carouselConfig
      const section = s as unknown as ExtendedSection

      // Hero Section
      if (section.type === 'hero' && section.heroSlides && section.heroSlides.length > 0) {
        const heroSlides = section.heroSlides.map((slide: HeroSlideData, idx: number) => ({
          // Xử lý id an toàn hơn
          id: typeof slide.id === 'string' ? parseInt(slide.id) : slide.id || idx + 1,
          image: slide.image,
          title: slide.title,
          subtitle: slide.subtitle,
        }))

        return (
          <section
            key={section.id}
            className="relative text-white overflow-hidden h-[600px] md:h-[700px]"
          >
            <div className="absolute inset-0 z-0">
              <HeroCarousel slides={heroSlides} autoPlay={true} interval={5000} />
            </div>
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-20 h-full flex items-center">
              <div className="max-w-3xl w-full">
                {section.heroSlides[0]?.badge && (
                  <div className="inline-block px-4 py-2 bg-primary-500 rounded-full text-sm font-medium mb-6">
                    {section.heroSlides[0].badge}
                  </div>
                )}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight break-words">
                  {section.heroSlides[0]?.title || ''}
                  {section.heroSlides[0]?.subtitle && (
                    <span className="text-primary-400 block">
                      {section.heroSlides[0].subtitle}
                    </span>
                  )}
                </h1>
                {section.heroSlides[0]?.buttonText && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to={section.heroSlides[0].buttonLink || '/products'}
                      className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary-500/50"
                    >
                      {section.heroSlides[0].buttonText}
                      <ArrowRight className="ml-2" size={20} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </section>
        )
      }

      // Product Carousel Section
      if (section.type === 'product-carousel' && section.carouselConfig) {
        return (
          <ProductCarousel
            key={section.id}
            listType={section.carouselConfig.listType || 'newest'}
            title={section.carouselConfig.title}
            showViewAll={true}
            itemsPerView={4}
            autoScroll={false}
            useMockData={false}
          />
        )
      }

      // Text Section
      if (section.type === 'text' && section.content) {
        return (
          <section key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          </section>
        )
      }

      // Image Section
      if (section.type === 'image' && section.imageUrl) {
        return (
          <section key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <img
                src={section.imageUrl}
                alt="Section"
                className="w-full rounded-lg"
              />
            </div>
          </section>
        )
      }

      // Text + Image Section
      if (section.type === 'text-image') {
        return (
          <section key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                  section.imagePosition === 'right' ? 'md:flex-row-reverse' : ''
                }`}
              >
                {section.imagePosition === 'left' && section.imageUrl && (
                  <div>
                    <img
                      src={section.imageUrl}
                      alt="Section"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                {section.content && (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                )}
                {section.imagePosition === 'right' && section.imageUrl && (
                  <div>
                    <img
                      src={section.imageUrl}
                      alt="Section"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      }

      return null
    })
  }

  return (
    <div className="min-h-screen">
      {renderSections()}

      {/* Features Section - Always show */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Truck className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Giao hàng miễn phí</h3>
                <p className="text-sm text-gray-600">Cho đơn hàng trên 500k</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Bảo hành chính hãng</h3>
                <p className="text-sm text-gray-600">Đảm bảo chất lượng</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Đổi trả dễ dàng</h3>
                <p className="text-sm text-gray-600">Trong vòng 7 ngày</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Thanh toán an toàn</h3>
                <p className="text-sm text-gray-600">Bảo mật tuyệt đối</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Always show */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Danh mục sản phẩm
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các danh mục sản phẩm đa dạng của chúng tôi
            </p>
          </div>
          
          <CategoryCarousel 
            categories={categories} 
            autoScroll={categories.length > 4}
            interval={3000}
            itemsPerView={4}
          />
        </div>
      </section>

      {/* Newsletter Section - Always show */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Đăng ký nhận thông tin
            </h2>
            <p className="text-primary-100 mb-8 text-lg">
              Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
})

export default Home