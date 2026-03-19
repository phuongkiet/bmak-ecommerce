import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import type { CreateRoomSceneCommand, RoomSceneDto, UpdateRoomSceneCommand } from '@/models/RoomScene'

const EMPTY_FORM: CreateRoomSceneCommand = {
  title: '',
  thumbnailUrl: '',
  configJson: '',
  roomLayerUrl: '',
  mattLayerUrl: '',
  glossyLayerUrl: '',
  isActive: true,
}

const AdminShowcase = observer(() => {
  const { roomSceneStore } = useStore()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateRoomSceneCommand>(EMPTY_FORM)

  useEffect(() => {
    void roomSceneStore.fetchScenes({ onlyActive: false })
  }, [roomSceneStore])

  const isEditMode = editingId !== null
  const submitLabel = isEditMode ? 'Cập nhật phòng mẫu' : 'Tạo phòng mẫu'

  const activeCount = useMemo(
    () => roomSceneStore.scenes.filter((x) => x.isActive !== false).length,
    [roomSceneStore.scenes],
  )

  const onInput = (key: keyof CreateRoomSceneCommand, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const loadToForm = (scene: RoomSceneDto) => {
    setEditingId(scene.id)
    setFormData({
      title: scene.title || '',
      thumbnailUrl: scene.thumbnailUrl || '',
      configJson: scene.configJson || '',
      roomLayerUrl: scene.roomLayerUrl || '',
      mattLayerUrl: scene.mattLayerUrl || '',
      glossyLayerUrl: scene.glossyLayerUrl || '',
      isActive: scene.isActive !== false,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: CreateRoomSceneCommand = {
      title: formData.title.trim(),
      thumbnailUrl: formData.thumbnailUrl?.trim() || '',
      configJson: formData.configJson.trim(),
      roomLayerUrl: formData.roomLayerUrl.trim(),
      mattLayerUrl: formData.mattLayerUrl?.trim() || '',
      glossyLayerUrl: formData.glossyLayerUrl?.trim() || '',
      isActive: Boolean(formData.isActive),
    }

    if (isEditMode && editingId !== null) {
      const ok = await roomSceneStore.updateScene({ id: editingId, ...payload } as UpdateRoomSceneCommand)
      if (ok) {
        alert('Cập nhật phòng mẫu thành công')
        resetForm()
        await roomSceneStore.fetchScenes({ onlyActive: false })
      }
      return
    }

    const id = await roomSceneStore.createScene(payload)
    if (id > 0) {
      alert('Tạo phòng mẫu thành công')
      resetForm()
      await roomSceneStore.fetchScenes({ onlyActive: false })
    }
  }

  const handleDelete = async (scene: RoomSceneDto) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa phòng mẫu "${scene.title}"?`)
    if (!ok) return

    const deleted = await roomSceneStore.deleteScene(scene.id)
    if (deleted) {
      alert('Đã xóa phòng mẫu')
      if (editingId === scene.id) resetForm()
      await roomSceneStore.fetchScenes({ onlyActive: false })
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Showcase</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý phòng mẫu cho trang phối cảnh. Tổng: {roomSceneStore.scenes.length} phòng, đang hoạt
            động: {activeCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Danh sách phòng mẫu</h2>

          {roomSceneStore.isLoading ? (
            <p className="text-sm text-gray-500">Đang tải danh sách...</p>
          ) : roomSceneStore.scenes.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có phòng mẫu nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2">ID</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2">Tên</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2">Trạng thái</th>
                    <th className="text-right text-xs font-semibold text-gray-600 px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {roomSceneStore.scenes.map((scene) => (
                    <tr key={scene.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-sm text-gray-700">{scene.id}</td>
                      <td className="px-3 py-2 text-sm text-gray-800 font-medium">{scene.title}</td>
                      <td className="px-3 py-2 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            scene.isActive !== false
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {scene.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => loadToForm(scene)}
                            className="px-3 py-1.5 text-xs rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => void handleDelete(scene)}
                            className="px-3 py-1.5 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{isEditMode ? 'Sửa phòng mẫu' : 'Thêm phòng mẫu'}</h2>
            {isEditMode && (
              <button
                onClick={resetForm}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Tạo mới
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => onInput('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => onInput('thumbnailUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room layer URL</label>
              <input
                type="url"
                value={formData.roomLayerUrl}
                onChange={(e) => onInput('roomLayerUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matt layer URL</label>
              <input
                type="url"
                value={formData.mattLayerUrl}
                onChange={(e) => onInput('mattLayerUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Glossy layer URL</label>
              <input
                type="url"
                value={formData.glossyLayerUrl}
                onChange={(e) => onInput('glossyLayerUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Config JSON</label>
              <textarea
                value={formData.configJson}
                onChange={(e) => onInput('configJson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-xs"
                rows={8}
                required
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(formData.isActive)}
                onChange={(e) => onInput('isActive', e.target.checked)}
              />
              Hoạt động
            </label>

            {roomSceneStore.error && <p className="text-sm text-red-600">{roomSceneStore.error}</p>}

            <button
              type="submit"
              disabled={roomSceneStore.isSubmitting}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {roomSceneStore.isSubmitting ? 'Đang xử lý...' : submitLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
})

export default AdminShowcase
