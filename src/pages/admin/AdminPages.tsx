import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import Select, { SingleValue } from 'react-select'
import { useStore } from '@/store'
import { Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon, Type, Save, Layout, ShoppingBag } from 'lucide-react'

// Import đúng các type đã định nghĩa trong PageStore
import type { PageSection, HeroSlide, ProductCarouselConfig } from '@/store/PageStore'

// Interface cho Select Option
interface SelectOption {
  value: string
  label: string
}

const AdminPages = observer(() => {
  const { pageType } = useParams<{ pageType: string }>()
  const navigate = useNavigate()
  const { pageStore } = useStore()

  // Load pages khi component mount
  useEffect(() => {
    pageStore.loadPages()
  }, [pageStore])

  const currentPage = pageType ? pageStore.getPageBySlug(pageType) : null
  
  const [sections, setSections] = useState<PageSection[]>(currentPage?.sections || [])

  // Sync state khi data từ store thay đổi (ví dụ khi load trang xong)
  useEffect(() => {
    if (currentPage) {
      setSections(currentPage.sections)
    }
  }, [currentPage])

  const addSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      id: Date.now().toString(),
      type,
      content: '',
      // Mặc định imagePosition nếu là text-image
      imagePosition: type === 'text-image' ? 'right' : undefined,
    }

    if (type === 'hero') {
      newSection.heroSlides = [
        {
          id: Date.now().toString(),
          image: '',
          title: 'Tiêu đề Slide',
          subtitle: '',
          badge: '',
          buttonText: '',
          buttonLink: ''
        },
      ]
    }

    if (type === 'product-carousel') {
      newSection.carouselConfig = {
        listType: 'newest',
        title: 'Sản phẩm nổi bật',
        tag: '',
        limit: 8,
      }
    }

    setSections([...sections, newSection])
  }

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id))
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === id)
    if (index === -1) return

    const newSections = [...sections]
    if (direction === 'up' && index > 0) {
      ;[newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]
    } else if (direction === 'down' && index < sections.length - 1) {
      ;[newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
    }
    setSections(newSections)
  }

  // Hàm update generic cho section
  const updateSection = (id: string, updates: Partial<PageSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  // --- Logic Hero Slide ---
  const addHeroSlide = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (section) {
      const newSlide: HeroSlide = {
        id: Date.now().toString(),
        image: '',
        title: 'Slide mới',
        subtitle: '',
      }
      updateSection(sectionId, {
        heroSlides: [...(section.heroSlides || []), newSlide],
      })
    }
  }

  const removeHeroSlide = (sectionId: string, slideId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (section?.heroSlides) {
      updateSection(sectionId, {
        heroSlides: section.heroSlides.filter((s) => s.id !== slideId),
      })
    }
  }

  const updateHeroSlide = (sectionId: string, slideId: string, updates: Partial<HeroSlide>) => {
    const section = sections.find((s) => s.id === sectionId)
    if (section?.heroSlides) {
      updateSection(sectionId, {
        heroSlides: section.heroSlides.map((s) =>
          s.id === slideId ? { ...s, ...updates } : s
        ),
      })
    }
  }

  // --- Logic Image Upload ---
  const handleImageUpload = (id: string, file: File, slideId?: string) => {
    const imageUrl = URL.createObjectURL(file) // Thực tế nên upload lên server và lấy URL
    
    if (slideId) {
      // Upload cho Hero Slide
      updateHeroSlide(id, slideId, { image: imageUrl })
    } else {
      // Upload cho Section Image
      updateSection(id, { imageUrl })
    }
  }

  const handleSave = () => {
    if (currentPage) {
      pageStore.updatePage(currentPage.id, sections)
      alert('Đã lưu thành công!')
    }
  }

  // --- RENDER ---
  if (!pageType) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Quản lý trang</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pageStore.pages.map((page) => (
            <div
              key={page.id}
              onClick={() => navigate(`/admin/pages/${page.slug}`)}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
            >
              <h2 className="text-xl font-semibold mb-2">{page.title}</h2>
              <p className="text-gray-500 text-sm">
                {page.sections.length} sections
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!currentPage) {
    return <div className="p-6">Trang không tồn tại</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Chỉnh sửa: {currentPage.title}</h1>
        <button
          onClick={handleSave}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Save size={20} />
          Lưu thay đổi
        </button>
      </div>

      {/* Toolbar thêm section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Thêm thành phần mới:</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => addSection('text')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm">
            <Type size={16} /> Văn bản
          </button>
          <button onClick={() => addSection('image')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm">
            <ImageIcon size={16} /> Hình ảnh
          </button>
          <button onClick={() => addSection('text-image')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm">
            <Layout size={16} /> Văn bản + Ảnh
          </button>
          {pageType === 'home' && (
            <>
              <button onClick={() => addSection('hero')} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm">
                <Layout size={16} /> Hero Slider
              </button>
              <button onClick={() => addSection('product-carousel')} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm">
                <ShoppingBag size={16} /> Sản phẩm
              </button>
            </>
          )}
        </div>
      </div>

      {/* Danh sách Sections */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
            <p>Trang này chưa có nội dung. Hãy thêm section ở trên.</p>
          </div>
        ) : (
          sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Header Section */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded uppercase">
                    {section.type}
                  </span>
                  <span className="text-sm font-medium text-gray-600">Thứ tự: {index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSection(section.id, 'up')} disabled={index === 0} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-30">
                    <MoveUp size={16} />
                  </button>
                  <button onClick={() => moveSection(section.id, 'down')} disabled={index === sections.length - 1} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-30">
                    <MoveDown size={16} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button onClick={() => removeSection(section.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Body Section */}
              <div className="p-6">
                
                {/* 1. HERO TYPE */}
                {section.type === 'hero' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800">Danh sách Slides</h4>
                        <button onClick={() => addHeroSlide(section.id)} className="text-sm text-primary-600 hover:underline flex items-center gap-1"><Plus size={14}/> Thêm slide</button>
                    </div>
                    {section.heroSlides?.map((slide, sIdx) => (
                      <div key={slide.id} className="border rounded-lg p-4 bg-gray-50 relative group">
                        <button onClick={() => removeHeroSlide(section.id, slide.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Ảnh Banner</label>
                                {slide.image ? (
                                    <div className="relative aspect-video">
                                        <img src={slide.image} className="w-full h-full object-cover rounded border" alt="Slide" />
                                        <button onClick={() => updateHeroSlide(section.id, slide.id, { image: '' })} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"><Trash2 size={12}/></button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-100">
                                        <ImageIcon className="text-gray-400 mb-1" size={24}/>
                                        <span className="text-xs text-gray-500">Upload ảnh</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(section.id, e.target.files[0], slide.id)} />
                                    </label>
                                )}
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <input type="text" placeholder="Tiêu đề chính" className="w-full p-2 border rounded text-sm" value={slide.title} onChange={(e) => updateHeroSlide(section.id, slide.id, { title: e.target.value })} />
                                <input type="text" placeholder="Tiêu đề phụ" className="w-full p-2 border rounded text-sm" value={slide.subtitle} onChange={(e) => updateHeroSlide(section.id, slide.id, { subtitle: e.target.value })} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Text nút (vd: Mua ngay)" className="w-full p-2 border rounded text-sm" value={slide.buttonText || ''} onChange={(e) => updateHeroSlide(section.id, slide.id, { buttonText: e.target.value })} />
                                    <input type="text" placeholder="Link nút (vd: /products)" className="w-full p-2 border rounded text-sm" value={slide.buttonLink || ''} onChange={(e) => updateHeroSlide(section.id, slide.id, { buttonLink: e.target.value })} />
                                </div>
                                <input type="text" placeholder="Badge (vd: Khuyến mãi)" className="w-full p-2 border rounded text-sm" value={slide.badge || ''} onChange={(e) => updateHeroSlide(section.id, slide.id, { badge: e.target.value })} />
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. PRODUCT CAROUSEL TYPE */}
                {section.type === 'product-carousel' && (
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề hiển thị</label>
                        <input type="text" className="w-full p-2 border rounded" value={section.carouselConfig?.title} 
                            onChange={(e) => updateSection(section.id, { carouselConfig: { ...section.carouselConfig!, title: e.target.value } })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại sản phẩm</label>
                            <Select<SelectOption>
                                value={[
                                    { value: 'newest', label: 'Mới nhất' },
                                    { value: 'bestseller', label: 'Bán chạy' },
                                    { value: 'featured', label: 'Nổi bật' },
                                    { value: 'tag', label: 'Theo Tag' },
                                    { value: 'category', label: 'Theo Danh mục' },
                                ].find(o => o.value === section.carouselConfig?.listType)}
                                options={[
                                    { value: 'newest', label: 'Mới nhất' },
                                    { value: 'bestseller', label: 'Bán chạy' },
                                    { value: 'featured', label: 'Nổi bật' },
                                    { value: 'tag', label: 'Theo Tag' },
                                    { value: 'category', label: 'Theo Danh mục' },
                                ]}
                                onChange={(opt: SingleValue<SelectOption>) => {
                                    if(opt) updateSection(section.id, { carouselConfig: { ...section.carouselConfig!, listType: opt.value as ProductCarouselConfig['listType'] } })
                                }}
                            />
                        </div>
                        {(section.carouselConfig?.listType === 'tag' || section.carouselConfig?.listType === 'category') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {section.carouselConfig.listType === 'tag' ? 'Nhập Tag' : 'Nhập Slug Danh mục'}
                                </label>
                                <input type="text" className="w-full p-2 border rounded" placeholder="vd: sale, iphone..."
                                    value={section.carouselConfig.tag || ''}
                                    onChange={(e) => updateSection(section.id, { carouselConfig: { ...section.carouselConfig!, tag: e.target.value } })}
                                />
                            </div>
                        )}
                    </div>
                  </div>
                )}

                {/* 3. TEXT & IMAGE TYPES */}
                {(section.type === 'text' || section.type === 'text-image') && (
                  <div className="space-y-4">
                     {section.type === 'text-image' && (
                         <div className="flex items-center gap-3">
                             <label className="text-sm font-medium text-gray-700">Vị trí ảnh:</label>
                             <div className="flex gap-2">
                                <button onClick={() => updateSection(section.id, { imagePosition: 'left' })} className={`px-3 py-1 text-xs rounded border ${section.imagePosition === 'left' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white'}`}>Trái</button>
                                <button onClick={() => updateSection(section.id, { imagePosition: 'right' })} className={`px-3 py-1 text-xs rounded border ${section.imagePosition === 'right' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white'}`}>Phải</button>
                             </div>
                         </div>
                     )}
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                            <textarea className="w-full p-3 border rounded h-40 text-sm" placeholder="Nhập nội dung (Hỗ trợ HTML cơ bản)"
                                value={section.content} onChange={(e) => updateSection(section.id, { content: e.target.value })}
                            />
                        </div>
                        {section.type === 'text-image' && (
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                                {section.imageUrl ? (
                                    <div className="relative h-40 bg-gray-100 rounded border flex items-center justify-center">
                                        <img src={section.imageUrl} className="max-h-full max-w-full object-contain" alt="Section" />
                                        <button onClick={() => updateSection(section.id, { imageUrl: '' })} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded"><Trash2 size={14}/></button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                                        <ImageIcon className="text-gray-400 mb-1" size={24}/>
                                        <span className="text-xs text-gray-500">Upload ảnh</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(section.id, e.target.files[0])} />
                                    </label>
                                )}
                            </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
})

export default AdminPages