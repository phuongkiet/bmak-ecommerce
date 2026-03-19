import { makeAutoObservable, runInAction } from 'mobx'
import RootStore from './RootStore'
import { CreateRoomSceneCommand, RoomSceneDto, UpdateRoomSceneCommand } from '@/models/RoomScene'
import * as roomSceneApi from '@/agent/api/roomSceneApi'

class RoomSceneStore {
  scenes: RoomSceneDto[] = []
  selectedScene: RoomSceneDto | null = null
  isLoading = false
  isSubmitting = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async fetchScenes(options?: { onlyActive?: boolean }) {
    if (this.isLoading) return
    this.isLoading = true
    this.error = null
    const onlyActive = options?.onlyActive ?? true

    try {
      const data = await roomSceneApi.getRoomScenes()
      runInAction(() => {
        const allScenes = data ?? []
        this.scenes = onlyActive ? allScenes.filter((x) => x.isActive !== false) : allScenes
        // Auto-select first scene
        if (!this.selectedScene && this.scenes.length > 0) {
          this.selectedScene = this.scenes[0]
        } else if (
          this.selectedScene &&
          !this.scenes.some((x) => x.id === this.selectedScene?.id)
        ) {
          this.selectedScene = this.scenes[0] ?? null
        }
        this.isLoading = false
      })
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Lỗi tải danh sách phòng mẫu'
        this.isLoading = false
      })
    }
  }

  setSelectedScene(scene: RoomSceneDto | null) {
    this.selectedScene = scene
  }

  async fetchSceneDetail(id: number): Promise<RoomSceneDto | null> {
    this.isLoading = true
    this.error = null
    try {
      const data = await roomSceneApi.getRoomSceneById(id)
      runInAction(() => {
        this.selectedScene = data
        this.isLoading = false
      })
      return data
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Lỗi tải chi tiết phòng mẫu'
        this.isLoading = false
      })
      return null
    }
  }

  async createScene(command: CreateRoomSceneCommand): Promise<number> {
    this.isSubmitting = true
    this.error = null
    try {
      const id = await roomSceneApi.createRoomScene(command)
      await this.fetchScenes({ onlyActive: false })
      runInAction(() => {
        if (id > 0) {
          const created = this.scenes.find((x) => x.id === id)
          if (created) this.selectedScene = created
        }
        this.isSubmitting = false
      })
      return id
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Lỗi tạo phòng mẫu'
        this.isSubmitting = false
      })
      return 0
    }
  }

  async updateScene(command: UpdateRoomSceneCommand): Promise<boolean> {
    this.isSubmitting = true
    this.error = null
    try {
      const ok = await roomSceneApi.updateRoomScene(command)
      if (ok) {
        await this.fetchScenes({ onlyActive: false })
      }
      runInAction(() => {
        this.isSubmitting = false
      })
      return ok
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Lỗi cập nhật phòng mẫu'
        this.isSubmitting = false
      })
      return false
    }
  }

  async deleteScene(id: number): Promise<boolean> {
    this.isSubmitting = true
    this.error = null
    try {
      const ok = await roomSceneApi.deleteRoomScene(id)
      if (ok) {
        await this.fetchScenes({ onlyActive: false })
      }
      runInAction(() => {
        if (this.selectedScene?.id === id) {
          this.selectedScene = this.scenes[0] ?? null
        }
        this.isSubmitting = false
      })
      return ok
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Lỗi xóa phòng mẫu'
        this.isSubmitting = false
      })
      return false
    }
  }
}

export default RoomSceneStore
