import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react'
import { useStore } from '@/store'
import CategoryCarousel from '@/components/CategoryCarousel'
import HeroCarousel from '@/components/HeroCarousel'
import PageSectionsRenderer from '@/components/PageSectionsRenderer'

const Home = observer(() => {
  const { pageStore } = useStore()

  useEffect(() => {
    pageStore.getPageBySlugFromApi('home')
  }, [pageStore])

  const homePage = pageStore.selectedPage?.slug === 'home' ? pageStore.selectedPage : undefined

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

  const fallback = (
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
  )

  return (
    <div className="min-h-screen">
      <PageSectionsRenderer sections={homePage?.sections} fallback={fallback} />

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