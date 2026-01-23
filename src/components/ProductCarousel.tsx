import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { useStore } from '@/store'

// Interface Local dùng cho hiển thị (UI Model)
interface CarouselItem {
  id: number
  name: string
  image: string
  price: number
  originalPrice?: number
  rating?: number
}

export interface ProductCarouselProps {
  // Không bắt buộc truyền products nữa
  products?: CarouselItem[] 
  autoScroll?: boolean
  interval?: number
  itemsPerView?: number
  title?: string
  showViewAll?: boolean
  viewAllLink?: string
  useMockData?: boolean
  className?: string
  // Các loại list cần fetch
  listType?: 'tag' | 'category' | 'newest' | 'bestseller' | 'featured'
  tag?: string
}

const ProductCarousel = ({ 
  products: initialProducts, 
  autoScroll = true, 
  interval = 4000,
  itemsPerView = 4,
  title,
  showViewAll,
  viewAllLink = '/products',
  listType = 'newest',
  tag,
  className
}: ProductCarouselProps) => {
  const { productStore } = useStore()
  
  // State lưu trữ dữ liệu
  const [products, setProducts] = useState<CarouselItem[]>(initialProducts || [])
  const [isLoading, setIsLoading] = useState(false)

  // Logic Scroll
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Data Effect
  useEffect(() => {
    // Nếu cha truyền props vào thì ưu tiên dùng, không fetch
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        let rawData: any[] = []

        // Gọi các hàm mới trong ProductStore
        switch (listType) {
          case 'newest':
             // Gọi hàm loadProducts (không ảnh hưởng global state)
             rawData = await productStore.loadProducts({ 
                pageIndex: 1, 
                pageSize: 8, 
                sort: 'dateDesc' 
             })
             break

          case 'bestseller':
             // Gọi hàm getTopSelling
             rawData = await productStore.getTopSelling()
             break

          case 'featured':
             // Giả sử có logic featured (ví dụ sort theo giá hoặc tiêu chí khác)
             rawData = await productStore.loadProducts({ 
                pageIndex: 1, 
                pageSize: 8, 
                sort: 'priceDesc' // Ví dụ
             })
             break

          case 'tag':
             if (tag) {
                rawData = await productStore.fetchProductsByTag(tag)
             }
             break

          case 'category':
             // Logic category (tận dụng loadProducts với params search/filter)
             // Ở đây cần BE hỗ trợ filter theo CategoryId hoặc Slug trong params
             rawData = await productStore.loadProducts({ 
                pageIndex: 1, 
                pageSize: 8,
                search: tag // Tạm thời giả định tag là tên category
             })
             break

          default:
             rawData = await productStore.loadProducts({ pageIndex: 1, pageSize: 8 })
        }

        // Map về UI Model của Carousel
        const mappedItems: CarouselItem[] = rawData.map(p => ({
            id: p.id,
            name: p.name,
            image: p.image || '/placeholder.png',
            price: p.price,
            originalPrice: undefined, // Nếu Model Product của bạn có thì map vào
            rating: 5 // Default hoặc lấy từ p.rating
        }))

        setProducts(mappedItems)
      } catch (error) {
        console.error("Carousel fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [listType, tag, initialProducts, productStore])

  // --- PHẦN RENDER GIỮ NGUYÊN ---
  // (Copy phần render UI, scroll logic của bạn vào đây)
  
  const maxIndex = Math.max(0, products.length - itemsPerView)

  useEffect(() => {
    if (!autoScroll || products.length <= itemsPerView) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1))
    }, interval)
    return () => clearInterval(timer)
  }, [autoScroll, interval, products.length, itemsPerView, maxIndex])

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const firstChild = container.firstElementChild as HTMLElement
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth + 24 // 24 là gap-6
        container.scrollTo({ left: currentIndex * itemWidth, behavior: 'smooth' })
      }
    }
  }, [currentIndex])

  const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1))
  const handleNext = () => setCurrentIndex(prev => (prev === maxIndex ? 0 : prev + 1))

  if (isLoading) return <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">Đang tải...</div>
  if (!products || products.length === 0) return null

  return (
    <div className={`relative py-8 ${className}`}>
        {/* Header Title */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mb-6 flex justify-between items-end">
            {title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>}
            {showViewAll && (
            <Link to={viewAllLink} className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                Xem tất cả <ChevronRight size={16} />
            </Link>
            )}
        </div>

        {/* Carousel Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
            <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
            {products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-64 group relative">
                    <Link to={`/products/${product.id}`}>
                        <div className="bg-gray-100 rounded-xl overflow-hidden h-64 mb-4 relative border border-gray-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    </Link>
                    <div className="space-y-2">
                        <Link to={`/products/${product.id}`}>
                            <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors h-12">
                                {product.name}
                            </h3>
                        </Link>
                        <div className="flex items-end justify-between">
                            <div className="text-lg font-bold text-primary-600">
                                {product.price.toLocaleString('vi-VN')}đ
                            </div>
                            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            </div>

            {/* Navigation Buttons */}
            {products.length > itemsPerView && (
                <>
                    <button onClick={handlePrev} className="absolute -left-4 top-[40%] -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white text-gray-800 transition-all border border-gray-100 hidden md:block">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={handleNext} className="absolute -right-4 top-[40%] -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white text-gray-800 transition-all border border-gray-100 hidden md:block">
                        <ChevronRight size={24} />
                    </button>
                </>
            )}
        </div>
    </div>
  )
}

export default ProductCarousel