import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store";
import {
  Trash2,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  Type,
  Save,
  Layout,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import type { PageSection } from "@/store/PageStore";
import ImageDropZone from "@/components/Images/ImageDropZone";
import Select from "react-select";
import RichTextEditor from '@/components/RichTextEditor'
// import { HeroSlideDto } from '@/models/Page'

const AdminDetailPage = observer(() => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { pageStore } = useStore();

  const [localSections, setLocalSections] = useState<PageSection[]>([]);

  useEffect(() => {
    console.log("AdminDetailPage mounted or slug changed:", slug);
    if (slug) {
      pageStore.getPageBySlugFromApi(slug);
    }
  }, [slug, pageStore]);

  const currentPageDetail = pageStore.selectedPage;
  const currentPageSummary = slug ? pageStore.getPageBySlug(slug) : null;
  const currentPage = currentPageDetail || currentPageSummary;

  useEffect(() => {
    if (currentPageDetail && currentPageDetail.sections)
      setLocalSections(JSON.parse(JSON.stringify(currentPageDetail.sections)));
  }, [currentPageDetail]);

  const addSection = (type: PageSection["type"]) => {
    const newSection: PageSection = {
      id: `new_${Date.now()}`,
      type,
      content: "",
      imagePosition: type === "text-image" ? "right" : undefined,
      heroSlides:
        type === "hero"
          ? [
              {
                id: `slide_${Date.now()}`,
                image: "",
                title: "Tiêu đề Slide mới",
                subtitle: "",
              },
            ]
          : undefined,
      carouselConfig:
        type === "product-carousel"
          ? { listType: "newest", title: "Sản phẩm nổi bật", tag: "", limit: 8 }
          : undefined,
    };
    setLocalSections((s) => [...s, newSection]);
  };

  const removeSection = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa phần này?"))
      setLocalSections((s) => s.filter((x) => x.id !== id));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    setLocalSections((s) => {
      const arr = [...s];
      if (direction === "up" && index > 0)
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      if (direction === "down" && index < arr.length - 1)
        [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const updateSection = (id: string, updates: Partial<PageSection>) =>
    setLocalSections((s) => s.map((x) => (x.id === id ? { ...x, ...updates } : x)));

  const addHeroSlide = (sectionId: string) => {
    const newSlide = { id: `slide_${Date.now()}`, image: '', title: 'Tiêu đề slide mới', subtitle: '' };
    const sec = localSections.find((s) => s.id === sectionId);
    if (sec) {
      const slides = sec.heroSlides ? [...sec.heroSlides, newSlide] : [newSlide];
      updateSection(sectionId, { heroSlides: slides });
    }
  };

  const removeHeroSlide = (sectionId: string, slideId: string) => {
    const sec = localSections.find((s) => s.id === sectionId);
    if (sec?.heroSlides && sec.heroSlides.length > 1) updateSection(sectionId, { heroSlides: sec.heroSlides.filter((h) => h.id !== slideId) });
    else alert('Phải giữ lại ít nhất 1 slide!');
  };

  const updateHeroSlide = (sectionId: string, slideId: string, updates: Partial<any>) => {
    const sec = localSections.find((s) => s.id === sectionId);
    if (sec?.heroSlides) updateSection(sectionId, { heroSlides: sec.heroSlides.map((h) => (h.id === slideId ? { ...h, ...updates } : h)) });
  };

  const handleSectionImageChange = (sectionId: string, files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    updateSection(sectionId, { imageUrl: url });
  };

  const handleHeroSlideImageChange = (sectionId: string, slideId: string, files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    updateHeroSlide(sectionId, slideId, { image: url });
  };

  const imagePositionOptions = [
    { value: 'left', label: 'Trái' },
    { value: 'right', label: 'Phải' },
  ];

  const handleSave = async () => {
    if (!currentPage) return;
    try {
      console.log("Saving page with Id: ", currentPage.id, "Sections:", localSections);
      const success = await pageStore.savePage(currentPage.id, localSections);
      if (success) {
        alert("Đã lưu thay đổi");
        pageStore.loadPages();
      } else alert("Lưu thất bại: " + (pageStore.error || ""));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (pageStore.isLoading && !currentPageDetail)
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu trang...</p>
        </div>
      </div>
    );

  if (pageStore.error && !currentPageDetail)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-semibold mb-4">❌ Lỗi tải trang</p>
          <p className="text-red-600 mb-4">{pageStore.error}</p>
          <button
            onClick={() => navigate("/admin/pages")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );

  if (!currentPage)
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 font-medium mb-4">Trang không tồn tại</p>
          <button
            onClick={() => navigate("/admin/pages")}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/pages")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Sửa: {currentPage.title}
            </h1>
            <p className="text-xs text-gray-500">Slug: {currentPage.slug}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={pageStore.isLoading}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pageStore.isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={20} />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Thêm thành phần vào trang
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => addSection("hero")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Layout size={18} /> Hero Slider
          </button>
          <button
            onClick={() => addSection("product-carousel")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            <ShoppingBag size={18} /> Carousel Sản phẩm
          </button>
          <div className="w-px h-8 bg-gray-300 mx-2"></div>
          <button
            onClick={() => addSection("text")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <Type size={18} /> Văn bản
          </button>
          <button
            onClick={() => addSection("image")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <ImageIcon size={18} /> Hình ảnh
          </button>
          <button
            onClick={() => addSection("text-image")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <Layout size={18} /> Văn bản + Ảnh
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {localSections.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
            <Layout className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">
              Trang này chưa có nội dung nào.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Sử dụng thanh công cụ ở trên để thêm nội dung.
            </p>
          </div>
        ) : (
          localSections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
            >
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-gray-700 uppercase">
                    {section.type} SECTION
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveSection(index, "up")}
                    disabled={index === 0}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <MoveUp size={18} />
                  </button>
                  <button
                    onClick={() => moveSection(index, "down")}
                    disabled={index === localSections.length - 1}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <MoveDown size={18} />
                  </button>
                  <div className="w-px h-5 bg-gray-300 mx-2"></div>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {section.type === 'text' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nội dung</label>
                      <div className="mt-2">
                        <RichTextEditor
                          value={section.content || ''}
                          onChange={(val) => updateSection(section.id, { content: val })}
                          placeholder="Nhập nội dung cho phần văn bản..."
                        />
                      </div>
                    </div>
                  )}

                  {section.type === 'image' && (
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <ImageDropZone onDrop={(files) => handleSectionImageChange(section.id, files)} isLoading={false} />
                        {section.imageUrl && (
                          <img src={section.imageUrl} alt="preview" className="mt-3 max-h-40 rounded shadow-sm" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">Chú thích (tuỳ chọn)</label>
                        <input
                          type="text"
                          value={section.content || ''}
                          onChange={(e) => updateSection(section.id, { content: e.target.value })}
                          className="mt-2 w-full border border-gray-200 rounded-lg p-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {section.type === 'text-image' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nội dung</label>
                        <div className="mt-2">
                          <RichTextEditor
                            value={section.content || ''}
                            onChange={(val) => updateSection(section.id, { content: val })}
                            placeholder="Nhập nội dung cho phần văn bản + ảnh..."
                          />
                        </div>
                        <div className="mt-2 flex items-center">
                          <label className="text-sm font-medium text-gray-700 mr-2">Vị trí ảnh</label>
                          <div className="mt-1 w-40">
                            <Select
                              options={imagePositionOptions}
                              value={imagePositionOptions.find(o => o.value === (section.imagePosition || 'right'))}
                              onChange={(opt: any) => updateSection(section.id, { imagePosition: opt?.value })}
                              className="react-select-container"
                              classNamePrefix="react-select"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Hình ảnh</label>
                        <ImageDropZone onDrop={(files) => handleSectionImageChange(section.id, files)} isLoading={false} />
                        {section.imageUrl && <img src={section.imageUrl} alt="preview" className="mt-3 max-h-40 rounded shadow-sm" />}
                      </div>
                    </div>
                  )}

                  {section.type === 'hero' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Hero Slides</h3>
                        <button onClick={() => addHeroSlide(section.id)} className="text-primary-600 text-sm">+ Thêm slide</button>
                      </div>
                      {(section.heroSlides || []).map((slide) => (
                        <div key={slide.id} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex gap-4 items-start">
                            <div className="w-36">
                              <ImageDropZone onDrop={(files) => handleHeroSlideImageChange(section.id, slide.id, files)} isLoading={false} />
                              {slide.image && <img src={slide.image} alt="slide" className="mt-2 max-h-24 rounded" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => updateHeroSlide(section.id, slide.id, { title: e.target.value })}
                                placeholder="Tiêu đề"
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                              />
                              <input
                                type="text"
                                value={slide.subtitle || ''}
                                onChange={(e) => updateHeroSlide(section.id, slide.id, { subtitle: e.target.value })}
                                placeholder="Phụ đề (tuỳ chọn)"
                                className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <button onClick={() => removeHeroSlide(section.id, slide.id)} className="text-red-600">Xóa</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'product-carousel' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
                        <input
                          type="text"
                          value={section.carouselConfig?.title || ''}
                          onChange={(e) => updateSection(section.id, { carouselConfig: { ...(section.carouselConfig || { listType: 'newest' }), title: e.target.value } })}
                          className="mt-2 w-full border border-gray-200 rounded-lg p-2 text-sm"
                        />
                        <div className="mt-2">
                          <label className="text-sm font-medium text-gray-700">Loại danh sách</label>
                          <select
                            value={section.carouselConfig?.listType || 'newest'}
                            onChange={(e) => updateSection(section.id, { carouselConfig: { ...(section.carouselConfig || { listType: 'newest', title: '' }), listType: e.target.value as any } })}
                            className="mt-1 w-48 border border-gray-200 rounded-lg p-2 text-sm"
                          >
                            <option value="newest">Mới nhất</option>
                            <option value="bestseller">Bán chạy</option>
                            <option value="featured">Nổi bật</option>
                            <option value="tag">Theo tag</option>
                            <option value="category">Theo danh mục</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Tag / Limit</label>
                        <input
                          type="text"
                          placeholder="Tag (nếu có)"
                          value={section.carouselConfig?.tag || ''}
                          onChange={(e) => updateSection(section.id, { carouselConfig: { ...(section.carouselConfig || { listType: 'newest', title: '' }), tag: e.target.value } })}
                          className="mt-2 w-full border border-gray-200 rounded-lg p-2 text-sm"
                        />
                        <input
                          type="number"
                          min={1}
                          value={section.carouselConfig?.limit || 8}
                          onChange={(e) => updateSection(section.id, { carouselConfig: { ...(section.carouselConfig || { listType: 'newest', title: '' }), limit: Number(e.target.value) } })}
                          className="mt-2 w-32 border border-gray-200 rounded-lg p-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default AdminDetailPage;
