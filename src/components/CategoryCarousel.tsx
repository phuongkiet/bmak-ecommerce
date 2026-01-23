import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface Category {
  id: number
  name: string
  image: string
  count: number
}

interface CategoryCarouselProps {
  categories: Category[]
  autoScroll?: boolean
  interval?: number
  itemsPerView?: number
}

const CategoryCarousel = ({ 
  categories, 
  autoScroll = true, 
  interval = 3000,
  itemsPerView = 4 
}: CategoryCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const maxIndex = Math.max(0, categories.length - itemsPerView)

  useEffect(() => {
    if (!autoScroll || categories.length <= itemsPerView) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        return next > maxIndex ? 0 : next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [autoScroll, interval, categories.length, itemsPerView, maxIndex])

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const firstChild = container.firstElementChild as HTMLElement
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth + 24 // width + gap (1.5rem = 24px)
        const scrollPosition = currentIndex * itemWidth
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }
    }
  }, [currentIndex])

  const goToIndex = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
  }

  if (categories.length === 0) return null

  return (
    <div className="relative">
      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-hidden scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.id}`}
            className="group relative flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            style={{ minWidth: `calc((100% - ${(itemsPerView - 1) * 1.5}rem) / ${itemsPerView})` }}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-white/80">{category.count} sản phẩm</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Dots - Only show if more than itemsPerView */}
      {categories.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-primary-600'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to category group ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryCarousel

