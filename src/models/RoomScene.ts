export interface WallAreaConfig {
  GUID: string
  BaseWidth?: number
  BaseHeight?: number
  TileRateWidth?: number
  TileRateHeight?: number
  GroutVSize?: number
  GroutHSize?: number
  TopLeft: [number, number]
  TopRight: [number, number]
  BottomRight: [number, number]
  BottomLeft: [number, number]
  Boundary?: [number, number][]
}

export interface RoomSceneCanvasConfig {
  Width: number
  Height: number
  // Some configs wrap themselves in a nested `config` property
  config?: RoomSceneCanvasConfig
  SetDesign?: {
    WallAreas: WallAreaConfig[]
  }
}

export interface RoomSceneDto {
  id: number
  title: string
  thumbnailUrl?: string
  configJson: string
  roomLayerUrl: string
  mattLayerUrl?: string
  glossyLayerUrl?: string
  isActive?: boolean
}

export interface CreateRoomSceneCommand {
  title: string
  thumbnailUrl?: string
  configJson: string
  roomLayerUrl: string
  mattLayerUrl?: string
  glossyLayerUrl?: string
  isActive?: boolean
}

export interface UpdateRoomSceneCommand extends CreateRoomSceneCommand {
  id: number
}
