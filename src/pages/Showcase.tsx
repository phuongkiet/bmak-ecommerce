import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import RoomVisualizer from '@/components/Showcase/RoomVisualizer'
import type { RoomSceneDto } from '@/models/RoomScene'
import { toProxiedImageUrl } from '@/utils/imageProxy'

const Showcase = observer(() => {
  const { roomSceneStore } = useStore()

  useEffect(() => {
    roomSceneStore.fetchScenes()
  }, [roomSceneStore])

  const { scenes, selectedScene, isLoading, error } = roomSceneStore

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Phối cảnh</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Chọn phòng mẫu, nhấn vào vùng tường / sàn, rồi chọn gạch để xem thử ngay trực tiếp.
        </p>

        {/* Scene selector — only shown when there are multiple scenes */}
        {scenes.length > 1 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {scenes.map((s: RoomSceneDto) => (
              <button
                key={s.id}
                onClick={() => roomSceneStore.setSelectedScene(s)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 rounded-xl p-2 border-2 transition-all ${
                  selectedScene?.id === s.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                {s.thumbnailUrl ? (
                  <img
                    src={toProxiedImageUrl(s.thumbnailUrl)}
                    alt={s.title || 'Room scene thumbnail'}
                    className="w-20 h-14 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
                <span className="text-xs font-medium text-gray-700 max-w-[80px] truncate">
                  {s.title || `Scene ${s.id}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* States */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            Đang tải phòng mẫu...
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && scenes.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            <p className="text-lg mb-2">Chưa có phòng mẫu nào</p>
            <p className="text-sm">Vui lòng thêm phòng mẫu từ trang quản trị.</p>
          </div>
        )}

        {/* Visualizer */}
        {selectedScene && (
          <RoomVisualizer key={selectedScene.id} scene={selectedScene} />
        )}
      </div>
    </div>
  )
})

export default Showcase





