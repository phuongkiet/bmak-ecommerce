import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import Select, { SingleValue } from 'react-select'
import { useStore } from '@/store'
import { Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon, Type, Save, Layout, ShoppingBag, ArrowLeft } from 'lucide-react'

// Import types
import type { PageSection, HeroSlide, ProductCarouselConfig } from '@/store/PageStore'

interface SelectOption {
  value: string
  label: string
}

const AdminPages = observer(() => {
  const { pageType } = useParams<{ pageType: string }>()
  const navigate = useNavigate()
  const { pageStore } = useStore()
  
  // Local state để edit, tránh mutate trực tiếp store khi chưa bấm Save
  const [localSections, setLocalSections] = useState<PageSection[]>([])

  // 1. Load data ban đầu
  useEffect(() => {
    pageStore.loadPages()
  }, [pageStore])

  // 2. Sync dữ liệu từ store vào local state khi chọn trang
  const currentPage = pageType ? pageStore.getPageBySlug(pageType) : null
  
  useEffect(() => {
    if (currentPage) {
      // Deep clone để ngắt tham chiếu, giúp edit thoải mái không ảnh hưởng store ngay
      setLocalSections(JSON.parse(JSON.stringify(currentPage.sections)))
    }
  }, [currentPage])

  // --- Logic Thêm/Sửa/Xóa Section ---

  const addSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      id: `new_${Date.now()}`,
      type,
      content: '',
      imagePosition: type === 'text-image' ? 'right' : undefined,
      heroSlides: type === 'hero' ? [{
        id: `slide_${Date.now()}`,
        image: '',
        title: 'Tiêu đề Slide mới',
        subtitle: '',
        badge: '',
        buttonText: '',
        buttonLink: ''
      }] : undefined,
      carouselConfig: type === 'product-carousel' ? {
        listType: 'newest',
        title: 'Sản phẩm nổi bật',
        tag: '',
        limit: 8,
      } : undefined
    }

    setLocalSections([...localSections, newSection])
  }

  const removeSection = (id: string) => {
    if(window.confirm('Bạn có chắc muốn xóa phần này?')) {
      setLocalSections(localSections.filter((s) => s.id !== id))
    }
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...localSections]
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
    }
    setLocalSections(newSections)
  }

  const updateSection = (id: string, updates: Partial<PageSection>) => {
    setLocalSections(localSections.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  // --- Logic Hero Slide ---
  const addHeroSlide = (sectionId: string) => {
    const section = localSections.find((s) => s.id === sectionId)
    if (section && section.heroSlides) {
      const newSlide: HeroSlide = {
        id: `slide_${Date.now()}`,
        image: '',
        title: 'Slide mới',
        subtitle: '',
      }
      updateSection(sectionId, {
        heroSlides: [...section.heroSlides, newSlide],
      })
    }
  }

  const removeHeroSlide = (sectionId: string, slideId: string) => {
    const section = localSections.find((s) => s.id === sectionId)
    if (section?.heroSlides && section.heroSlides.length > 1) {
       updateSection(sectionId, {
        heroSlides: section.heroSlides.filter((s) => s.id !== slideId),
      })
    } else {
        alert("Phải giữ lại ít nhất 1 slide!")
    }
  }

  const updateHeroSlide = (sectionId: string, slideId: string, updates: Partial<HeroSlide>) => {
    const section = localSections.find((s) => s.id === sectionId)
    if (section?.heroSlides) {
      updateSection(sectionId, {
        heroSlides: section.heroSlides.map((s) =>
          s.id === slideId ? { ...s, ...updates } : s
        ),
      })
    }
  }

  // --- Handle Image Upload (Preview) ---
  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    // Trong thực tế: Upload file lên server -> Nhận về URL -> gọi callback(url)
    // Demo: dùng CreateObjectURL
    const fakeUrl = URL.createObjectURL(file)
    callback(fakeUrl)
  }

  const handleSave = () => {
    if (currentPage) {
      pageStore.updatePage(currentPage.id, localSections)
      alert('Đã lưu cấu hình trang thành công!')
    }
  }

  // --- RENDER DANH SÁCH TRANG (Dashboard) ---
  if (!pageType) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý giao diện</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pageStore.pages.map((page) => (
            <div
              key={page.id}
              onClick={() => navigate(`/admin/pages/${page.slug}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Layout size={24} />
                 </div>
                 <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">{page.slug}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{page.title}</h2>
              <p className="text-gray-500 text-sm">
                Đang có {page.sections.length} thành phần (sections)
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- RENDER TRANG CHỈNH SỬA CHI TIẾT ---
  if (!currentPage) {
    return <div className="p-6 text-red-500">Trang không tồn tại hoặc chưa được tải.</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/pages')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-600"/>
            </button>
            <div>
                <h1 className="text-xl font-bold text-gray-800">Sửa: {currentPage.title}</h1>
                <p className="text-xs text-gray-500">Slug: {currentPage.slug}</p>
            </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-primary-200"
        >
          <Save size={20} />
          Lưu thay đổi
        </button>
      </div>

      {/* Toolbox thêm section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Thêm thành phần vào trang</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => addSection('hero')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
            <Layout size={18} /> Hero Slider
          </button>
          <button onClick={() => addSection('product-carousel')} className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
            <ShoppingBag size={18} /> Carousel Sản phẩm
          </button>
          <div className="w-px h-8 bg-gray-300 mx-2"></div>
          <button onClick={() => addSection('text')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
            <Type size={18} /> Văn bản
          </button>
          <button onClick={() => addSection('image')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
            <ImageIcon size={18} /> Hình ảnh
          </button>
          <button onClick={() => addSection('text-image')} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
            <Layout size={18} /> Văn bản + Ảnh
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="space-y-6">
        {localSections.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
            <Layout className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Trang này chưa có nội dung nào.</p>
            <p className="text-gray-400 text-sm mt-2">Sử dụng thanh công cụ ở trên để thêm nội dung.</p>
          </div>
        ) : (
          localSections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
              
              {/* Section Header Controls */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold">{index + 1}</span>
                    <span className="text-sm font-bold text-gray-700 uppercase">{section.type} SECTION</span>
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-30 transition-colors">
                    <MoveUp size={18} />
                  </button>
                  <button onClick={() => moveSection(index, 'down')} disabled={index === localSections.length - 1} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-30 transition-colors">
                    <MoveDown size={18} />
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-2"></div>
                  <button onClick={() => removeSection(section.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Section Content Editor */}
              <div className="p-6">
                
                {/* --- 1. HERO SLIDER EDITOR --- */}
                {section.type === 'hero' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-700">Quản lý Slides ({section.heroSlides?.length || 0})</label>
                        <button onClick={() => addHeroSlide(section.id)} className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-md hover:bg-primary-100 font-bold flex items-center gap-1">
                            <Plus size={14}/> Thêm Slide
                        </button>
                    </div>
                    <div className="space-y-4">
                        {section.heroSlides?.map((slide) => (
                        <div key={slide.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                            <button onClick={() => removeHeroSlide(section.id, slide.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white p-1 rounded-full shadow-sm border"><Trash2 size={14}/></button>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Cột Ảnh */}
                                <div className="w-full md:w-1/3">
                                    <label className="block text-xs font-bold text-gray-500 mb-2">HÌNH ẢNH BANNER</label>
                                    {slide.image ? (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group/img">
                                            <img src={slide.image} className="w-full h-full object-cover" alt="Slide" />
                                            <button onClick={() => updateHeroSlide(section.id, slide.id, { image: '' })} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity font-medium text-sm">Xóa ảnh</button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white hover:border-primary-400 transition-colors">
                                            <ImageIcon className="text-gray-400 mb-2" size={24}/>
                                            <span className="text-xs text-gray-500 font-medium">Click upload ảnh</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], (url) => updateHeroSlide(section.id, slide.id, { image: url }))} />
                                        </label>
                                    )}
                                </div>
                                {/* Cột nội dung */}
                                <div className="w-full md:w-2/3 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Tiêu đề chính</label>
                                            <input type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary-200 outline-none" value={slide.title} onChange={(e) => updateHeroSlide(section.id, slide.id, { title: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Badge (Góc trên)</label>
                                            <input type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary-200 outline-none" value={slide.badge || ''} onChange={(e) => updateHeroSlide(section.id, slide.id, { badge: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Tiêu đề phụ</label>
                                        <input type="text" className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary-200 outline-none" value={slide.subtitle} onChange={(e) => updateHeroSlide(section.id, slide.id, { subtitle: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded border border-gray-100">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Text nút bấm</label>
                                            <input type="text" placeholder="Vd: Mua ngay" className="w-full p-2 border rounded text-sm" value={slide.buttonText || ''} onChange={(e) => updateHeroSlide(section.id, slide.id, { buttonText: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Link nút bấm</label>
                                            <input type="text" placeholder="Vd: /products" className="w-full p-2 border rounded text-sm" value={slide.buttonLink || ''} onChange={(e) => updateHeroSlide(section.id, slide.id, { buttonLink: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* --- 2. PRODUCT CAROUSEL EDITOR --- */}
                {section.type === 'product-carousel' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề Carousel</label>
                            <input type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none" value={section.carouselConfig?.title} 
                                onChange={(e) => updateSection(section.id, { carouselConfig: { ...section.carouselConfig!, title: e.target.value } })} />
                        </div>
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng hiển thị</label>
                             <input type="number" className="w-full p-2.5 border rounded-lg" value={section.carouselConfig?.limit || 8} 
                                onChange={(e) => updateSection(section.id, { carouselConfig: { ...section.carouselConfig!, limit: parseInt(e.target.value) } })} />
                         </div>
                    </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Nguồn dữ liệu</label>
                            <Select<SelectOption>
                                className="text-sm"
                                value={[
                                    { value: 'newest', label: 'Sản phẩm Mới nhất' },
                                    { value: 'bestseller', label: 'Sản phẩm Bán chạy' },
                                    { value: 'featured', label: 'Sản phẩm Nổi bật' },
                                    { value: 'tag', label: 'Theo Thẻ (Tag)' },
                                    { value: 'category', label: 'Theo Danh mục' },
                                ].find(o => o.value === section.carouselConfig?.listType)}
                                options={[
                                    { value: 'newest', label: 'Sản phẩm Mới nhất' },
                                    { value: 'bestseller', label: 'Sản phẩm Bán chạy' },
                                    { value: 'featured', label: 'Sản phẩm Nổi bật' },
                                    { value: 'tag', label: 'Theo Thẻ (Tag)' },
                                    { value: 'category', label: 'Theo Danh mục' },
                                ]}
                                onChange={(opt: SingleValue<SelectOption>) => {
                                    if(opt) updateSection(section.id, { carouselConfig: { ...section.carouselConfig!, listType: opt.value as ProductCarouselConfig['listType'] } })
                                }}
                            />
                        </div>
                        {(section.carouselConfig?.listType === 'tag' || section.carouselConfig?.listType === 'category') && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                                    {section.carouselConfig.listType === 'tag' ? 'Nhập Tag' : 'Nhập Slug Danh mục'}
                                </label>
                                <input type="text" className="w-full p-2 border rounded-md text-sm" placeholder={section.carouselConfig.listType === 'tag' ? "vd: sale, iphone..." : "vd: dien-tu, thoi-trang..."}
                                    value={section.carouselConfig.tag || ''}
                                    onChange={(e) => updateSection(section.id, { carouselConfig: { ...section.carouselConfig!, tag: e.target.value } })}
                                />
                            </div>
                        )}
                    </div>
                  </div>
                )}

                {/* --- 3. TEXT & IMAGE EDITOR --- */}
                {(section.type === 'text' || section.type === 'text-image' || section.type === 'image') && (
                  <div className="space-y-4">
                     {section.type === 'text-image' && (
                         <div className="flex items-center gap-4 mb-2">
                             <label className="text-sm font-bold text-gray-700">Vị trí ảnh:</label>
                             <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => updateSection(section.id, { imagePosition: 'left' })} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${section.imagePosition === 'left' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Trái</button>
                                <button onClick={() => updateSection(section.id, { imagePosition: 'right' })} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${section.imagePosition === 'right' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Phải</button>
                             </div>
                         </div>
                     )}
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Editor Text */}
                        {section.type !== 'image' && (
                             <div className={section.type === 'text' ? 'md:col-span-2' : 'md:col-span-1'}>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Nội dung văn bản (HTML)</label>
                                <textarea 
                                    className="w-full p-4 border rounded-lg h-48 text-sm font-mono bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-200 outline-none resize-none" 
                                    placeholder="Nhập nội dung (Hỗ trợ HTML cơ bản như <h2>, <p>...)"
                                    value={section.content} 
                                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                />
                            </div>
                        )}
                       
                       {/* Editor Image */}
                        {(section.type === 'text-image' || section.type === 'image') && (
                            <div className={section.type === 'image' ? 'md:col-span-2' : 'md:col-span-1'}>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Hình ảnh minh họa</label>
                                {section.imageUrl ? (
                                    <div className="relative h-48 bg-gray-100 rounded-lg border flex items-center justify-center group/img">
                                        <img src={section.imageUrl} className="max-h-full max-w-full object-contain" alt="Section" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                             <button onClick={() => updateSection(section.id, { imageUrl: '' })} className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-600">Xóa ảnh</button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                        <ImageIcon className="text-gray-400 mb-2" size={32}/>
                                        <span className="text-sm text-gray-600 font-medium">Tải ảnh lên</span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], (url) => updateSection(section.id, { imageUrl: url }))} />
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