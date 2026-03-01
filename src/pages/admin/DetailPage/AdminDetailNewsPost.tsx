import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { ArrowLeft, Save, Trash2, X, Pencil } from 'lucide-react'
import { useStore } from '@/store'
import type { UpdateNewsPostCommand } from '@/models/NewsPost'
import ImageChoser from '@/components/Images/ImageChoser'
import RichTextEditor from '@/components/RichTextEditor'
import EntityFormModal from '@/components/Common/EntityFormModal'
import type { NewsCategoryDto } from '@/models/NewsCategory'

const AdminDetailNewsPost = observer(() => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { newsStore, commonStore } = useStore()

  const postId = Number(id)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'update'>('create')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')

  const [formData, setFormData] = useState<UpdateNewsPostCommand>({
    id: 0,
    categoryId: 0,
    authorId: undefined,
    title: '',
    summary: '',
    content: '',
    thumbnailUrl: '',
    isPublished: true,
  })

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(postId) || postId <= 0) {
        navigate('/admin/news')
        return
      }

      setIsInitialLoading(true)

      try {
        if (newsStore.categories.length === 0) {
          await newsStore.fetchNewsCategories()
        }

        const post = await newsStore.fetchNewsPostById(postId)
        if (!post) {
          commonStore.showError('Không tìm thấy bài viết')
          navigate('/admin/news')
          return
        }

        setFormData({
          id: post.id,
          categoryId: post.categoryId,
          authorId: post.authorId,
          title: post.title || '',
          summary: post.summary || '',
          content: post.content || '',
          thumbnailUrl: post.thumbnailUrl || '',
          isPublished: post.isPublished,
        })
        setThumbnailPreview(post.thumbnailUrl || null)
      } finally {
        setIsInitialLoading(false)
      }
    }

    void load()
  }, [postId, newsStore, navigate])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? (value === '' ? undefined : Number(value))
          : type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value,
    }))
  }

  const handleThumbnailChange = (payload: File[] | string | null) => {
    if (!payload) return

    if (typeof payload === 'string') {
      setThumbnailPreview(payload)
      setFormData((prev) => ({ ...prev, thumbnailUrl: payload }))
      return
    }

    if (Array.isArray(payload)) {
      const file = payload[0]
      if (!file) return

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setThumbnailPreview(result)
        setFormData((prev) => ({ ...prev, thumbnailUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailPreview(null)
    setFormData((prev) => ({ ...prev, thumbnailUrl: '' }))
  }

  const openCreateCategoryModal = () => {
    setCategoryModalMode('create')
    setEditingCategoryId(null)
    setCategoryName('')
    setCategoryDescription('')
    setIsCategoryModalOpen(true)
  }

  const openUpdateCategoryModal = (category: NewsCategoryDto) => {
    setCategoryModalMode('update')
    setEditingCategoryId(category.id)
    setCategoryName(category.name)
    setCategoryDescription(category.description || '')
    setIsCategoryModalOpen(true)
  }

  const handleSubmitCategory = async () => {
    if (!categoryName.trim()) {
      commonStore.showWarning('Vui lòng nhập tên danh mục bài viết')
      return
    }

    try {
      if (categoryModalMode === 'create') {
        const newId = await newsStore.createNewsCategory({
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
        })
        setFormData((prev) => ({ ...prev, categoryId: newId }))
        commonStore.showSuccess('Tạo danh mục bài viết thành công')
      } else {
        if (!editingCategoryId) return
        await newsStore.updateNewsCategory(editingCategoryId, {
          id: editingCategoryId,
          name: categoryName.trim(),
          description: categoryDescription.trim() || undefined,
        })
        commonStore.showSuccess('Cập nhật danh mục bài viết thành công')
      }

      setIsCategoryModalOpen(false)
    } catch (error) {
      commonStore.showError(newsStore.error || 'Không thể lưu danh mục bài viết. Vui lòng thử lại.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      commonStore.showWarning('Vui lòng nhập tiêu đề bài viết')
      return
    }

    if (!formData.content.trim()) {
      commonStore.showWarning('Vui lòng nhập nội dung bài viết')
      return
    }

    if (!formData.categoryId || formData.categoryId <= 0) {
      commonStore.showWarning('Vui lòng chọn danh mục tin tức')
      return
    }

    setIsSubmitting(true)
    try {
      await newsStore.updateNewsPost(postId, {
        ...formData,
        id: postId,
        title: formData.title.trim(),
        summary: formData.summary?.trim() || undefined,
        content: formData.content,
        thumbnailUrl: formData.thumbnailUrl?.trim() || undefined,
        authorId: formData.authorId && formData.authorId > 0 ? formData.authorId : undefined,
      })

      commonStore.showSuccess('Cập nhật bài viết thành công')
      navigate('/admin/news')
    } catch (error) {
      console.error('Failed to update news post:', error)
      commonStore.showError(newsStore.error || 'Có lỗi xảy ra khi cập nhật bài viết. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa bài viết này?')
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      await newsStore.deleteNewsPost(postId)
      commonStore.showSuccess('Xóa bài viết thành công')
      navigate('/admin/news')
    } catch (error) {
      console.error('Failed to delete news post:', error)
      commonStore.showError(newsStore.error || 'Không thể xóa bài viết. Vui lòng thử lại.')
      setIsSubmitting(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Đang tải dữ liệu bài viết...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Chỉnh sửa bài viết</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 size={18} />
            Xóa
          </button>
          <button
            type="submit"
            form="edit-news-post-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <form id="edit-news-post-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập tiêu đề bài viết"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tóm tắt
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập đoạn tóm tắt ngắn"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Nội dung bài viết</h2>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                label="Content"
                placeholder="Nhập nội dung chi tiết bài viết..."
                minHeight={360}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Ảnh đại diện</h2>

              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <ImageChoser
                  previewUrl={thumbnailPreview}
                  onDrop={(files) => handleThumbnailChange(files)}
                  onSelectImage={(url) => handleThumbnailChange(url)}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Thiết lập bài viết</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục tin tức <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId || 0}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Chọn danh mục</option>
                    {newsStore.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={openCreateCategoryModal}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      + Thêm danh mục bài viết
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const selected = newsStore.categories.find((c) => c.id === formData.categoryId)
                        if (!selected) {
                          commonStore.showWarning('Vui lòng chọn danh mục để cập nhật')
                          return
                        }
                        openUpdateCategoryModal(selected)
                      }}
                      className="text-xs text-gray-600 hover:text-primary-700 inline-flex items-center gap-1"
                    >
                      <Pencil size={12} />
                      Sửa danh mục đã chọn
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author ID (tùy chọn)
                  </label>
                  <input
                    type="number"
                    name="authorId"
                    value={formData.authorId ?? ''}
                    onChange={handleInputChange}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập ID tác giả"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Xuất bản</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>

      <EntityFormModal
        isOpen={isCategoryModalOpen}
        modalTitle={categoryModalMode === 'create' ? 'Thêm danh mục bài viết' : 'Cập nhật danh mục bài viết'}
        nameLabel="Tên danh mục"
        namePlaceholder="Nhập tên danh mục bài viết"
        nameValue={categoryName}
        onNameChange={setCategoryName}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleSubmitCategory}
        submitText={categoryModalMode === 'create' ? 'Tạo danh mục' : 'Lưu danh mục'}
        isSubmitting={newsStore.isSubmitting}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            rows={3}
            placeholder="Nhập mô tả ngắn (tùy chọn)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </EntityFormModal>
    </div>
  )
})

export default AdminDetailNewsPost