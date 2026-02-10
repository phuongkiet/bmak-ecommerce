import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import HeroCarousel from '@/components/HeroCarousel'
import ProductCarousel from '@/components/ProductCarousel'
import type { PageSectionDto } from '@/models/Page'

interface PageSectionsRendererProps {
  sections?: PageSectionDto[]
  fallback?: ReactNode
}

const PageSectionsRenderer = ({ sections, fallback }: PageSectionsRendererProps) => {
  if (!sections || sections.length === 0) {
    return <>{fallback ?? null}</>
  }

  return (
    <>
      {sections.map((section) => {
        // Hero Section
        if (section.type === 'hero' && section.heroSlides && section.heroSlides.length > 0) {
          const heroSlides = section.heroSlides.map((slide, idx) => ({
            id: typeof slide.id === 'string' ? parseInt(slide.id, 10) : slide.id || idx + 1,
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
              tag={section.carouselConfig.tag}
              limit={section.carouselConfig.limit}
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
      })}
    </>
  )
}

export default PageSectionsRenderer
