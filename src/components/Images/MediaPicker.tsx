import React, { useEffect, useState } from 'react'
import { getImages, uploadImage } from '@/agent/api/mediaApi'
import type { AppImageDto } from '@/models/Image'
import ImageDropZone from './ImageDropZone'

interface MediaPickerProps {
  onClose: () => void
  onSelect: (img: any | any[]) => void
  multiSelect?: boolean
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onClose, onSelect, multiSelect = false }) => {
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [images, setImages] = useState<AppImageDto[]>([])
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadImages(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadImages = async (page = 1) => {
    setLoading(true)
    try {
      const res = await getImages({ pageIndex: page, pageSize: 48, search })
      if (page === 1) setImages(res.items || [])
      else setImages((s) => [...s, ...(res.items || [])])
      setPageIndex(page)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const [selected, setSelected] = useState<AppImageDto[]>([])

  const handleSelect = (img: AppImageDto) => {
    if (multiSelect) {
      setSelected((s) => (s.some((x) => x.id === img.id) ? s.filter((x) => x.id !== img.id) : [...s, img]))
    } else {
      onSelect(img)
      onClose()
    }
  }

  const handleUpload = async (files: File[]) => {
    if (!files || files.length === 0) return
    const file = files[0]
    try {
      setLoading(true)
      const uploaded = await uploadImage(file)
      if (uploaded && uploaded.url) {
        if (multiSelect) {
          // add to selected list
          setSelected((s) => [...s, uploaded])
        } else {
          onSelect(uploaded)
          onClose()
        }
      }
    } catch (e) {
      console.error(e)
      alert('Upload thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Chọn ảnh</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-6">
          <div className="flex gap-3 mb-4">
            <button className={`px-3 py-1 rounded ${tab === 'library' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} onClick={() => setTab('library')}>Chọn từ thư viện</button>
            <button className={`px-3 py-1 rounded ${tab === 'upload' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} onClick={() => setTab('upload')}>Tải ảnh lên</button>
          </div>

          {tab === 'library' && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm" className="border p-2 rounded flex-1" />
                <button onClick={() => loadImages(1)} className="px-3 py-2 bg-primary-600 text-white rounded">Tìm</button>
              </div>
              <div className="grid grid-cols-6 gap-3 max-h-[60vh] overflow-auto p-1">
                {images.map((img) => (
                  <div key={img.id} className="border rounded overflow-hidden cursor-pointer hover:shadow" onClick={() => handleSelect(img)}>
                    <img src={img.url} alt={img.fileName} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <button onClick={() => loadImages(pageIndex + 1)} className="px-3 py-2 bg-gray-100 rounded">Tải thêm</button>
                {multiSelect && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">Đã chọn: {selected.length}</div>
                    <button
                      onClick={() => {
                        if (selected.length > 0) {
                          onSelect(selected)
                          onClose()
                        }
                      }}
                      className="px-3 py-2 bg-primary-600 text-white rounded disabled:opacity-50"
                      disabled={selected.length === 0}
                    >
                      Chọn ảnh ({selected.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="border rounded p-4">
              <ImageDropZone onDrop={handleUpload} />
              {loading && <p className="text-sm text-gray-500 mt-2">Đang tải...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MediaPicker
