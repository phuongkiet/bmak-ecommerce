import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'

const AddPage = observer(() => {
  const { pageStore } = useStore()
  const navigate = useNavigate()

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!slug || !title) {
      setError('Vui lòng nhập slug và tiêu đề')
      return
    }

    try {
      const createdSlug = await pageStore.createNewPage(slug.trim(), title.trim(), description.trim())
      if (createdSlug) {
        navigate(`/admin/pages/${createdSlug}`)
      } else {
        setError(pageStore.error || 'Tạo trang thất bại')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tạo trang')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tạo trang mới</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (ví dụ: home)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề trang</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề trang" className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn" className="w-full border rounded px-3 py-2 h-24" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/pages')} className="px-4 py-2 rounded border hover:bg-gray-50">Hủy</button>
          <button type="submit" disabled={pageStore.isLoading} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
            {pageStore.isLoading ? 'Đang tạo...' : 'Tạo trang'}
          </button>
        </div>
      </form>
    </div>
  )
})

export default AddPage
