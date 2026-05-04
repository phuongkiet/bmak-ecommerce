import { useState, useEffect, useRef, useCallback } from 'react'
import type { RoomSceneDto, WallAreaConfig, RoomSceneCanvasConfig } from '@/models/RoomScene'
import type { ProductSummaryDto } from '@/models/Product'
import * as productApi from '@/agent/api/productApi'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: Window & { PIXI: any }
function getPIXI(): any { return window.PIXI }

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------
const AREA_NAMES: Record<string, string> = {
  F: 'Sàn',
  M: 'Tường giữa',
  L: 'Tường trái',
  R: 'Tường phải',
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function parseTileMM(keySpecs: Record<string, string>): { wMM: number; hMM: number } {
  const sizeKeys = ['Kích thước', 'Kích cỡ', 'Size', 'Dimensions', 'kich-thuoc']
  for (const key of sizeKeys) {
    const val = keySpecs[key]
    if (val) {
      const nums = val.match(/\d+/g)
      if (nums && nums.length >= 2) {
        const w = parseInt(nums[0])
        const h = parseInt(nums[1])
        return { wMM: w < 300 ? w * 10 : w, hMM: h < 300 ? h * 10 : h }
      }
    }
  }
  return { wMM: 600, hMM: 600 }
}

function isCorsSafeImageUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return true

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    if (host.includes('cloudinary.com')) return true

    const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
    if (apiBase) {
      try {
        const apiOrigin = new URL(apiBase).origin
        if (parsed.origin === apiOrigin) return true
      } catch {
        // ignore invalid API base URL
      }
    }

    if (typeof window !== 'undefined') {
      return parsed.origin === window.location.origin
    }

    return false
  } catch {
    return false
  }
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------
interface RoomVisualizerProps {
  scene: RoomSceneDto
}

const RoomVisualizer = ({ scene }: RoomVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<any>(null)

  // PixiJS mutable refs
  const selectedGUIDRef = useRef<string | null>(null)
  const hitAreasMapRef = useRef<Record<string, any>>({})
  const hitAreaOutlinesMapRef = useRef<Record<string, any>>({})
  const activeTileStateRef = useRef<Record<string, string>>({})
  const areaSurfaceStateRef = useRef<Record<string, string>>({})
  const mattMaskRef = useRef<any>(null)
  const glossyMaskRef = useRef<any>(null)
  const changeTileRef = useRef<any>()
  const productImageCacheRef = useRef<Record<number, string>>({})

  // React state for UI
  const [selectedAreaName, setSelectedAreaName] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [products, setProducts] = useState<ProductSummaryDto[]>([])
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [layerError, setLayerError] = useState<string | null>(null)
  const [layerDebugInfo, setLayerDebugInfo] = useState<string[]>([])
  const [useHtmlRoomFallback, setUseHtmlRoomFallback] = useState(false)
  const [activeTileMap, setActiveTileMap] = useState<Record<string, string>>({})
  
  const [isHovering, setIsHovering] = useState(false)

  const roomLayerUrl = scene.roomLayerUrl || ''
  const mattLayerUrl = scene.mattLayerUrl || ''
  const glossyLayerUrl = scene.glossyLayerUrl || ''

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const areaSelectedCbRef = useRef<(guid: string) => void>()
  areaSelectedCbRef.current = (guid) => {
    setSelectedAreaName(AREA_NAMES[guid] ?? guid)
    setSidebarOpen(true)
  }

  // ----------------------------------------------------------------
  // PIXI Initialization
  // ----------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container || !scene) return

    let mounted = true
    const PIXI = getPIXI()
    if (!PIXI) {
      setLayerError('Không tìm thấy PIXI runtime từ CDN.')
      return
    }

    let config: RoomSceneCanvasConfig
    try {
      config = JSON.parse(scene.configJson) as RoomSceneCanvasConfig
      if (config.config) config = config.config!
    } catch {
      setLayerError('Config phòng mẫu không hợp lệ (JSON parse failed).')
      return
    }

    const W = config.Width || 1920
    const H = config.Height || 1080
    const WALLS: WallAreaConfig[] = config.SetDesign?.WallAreas ?? []

    selectedGUIDRef.current = null
    hitAreasMapRef.current = {}
    hitAreaOutlinesMapRef.current = {}
    activeTileStateRef.current = {}
    areaSurfaceStateRef.current = {}
    if (mounted) setActiveTileMap({})

    // ---- PIXI App ----
    const app = new PIXI.Application({
      width: W,
      height: H,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    })
    ;(app.view as HTMLCanvasElement).style.width = '100%'
    ;(app.view as HTMLCanvasElement).style.height = 'auto'
    container.appendChild(app.view as HTMLCanvasElement)
    appRef.current = app

    // ---- QUAN TRỌNG: SỬA LẠI THỨ TỰ LỚP (LAYERS) ----
    const main = new PIXI.Container()
    main.name = 'MAIN'
    app.stage.addChild(main)

    // Lớp Dưới cùng: Chứa Ảnh Gốc, Glossy, Matt
    const bgContainer = new PIXI.Container()
    bgContainer.name = 'BACKGROUND'
    main.addChild(bgContainer)

    // Lớp Giữa: Chứa Gạch (Tiles)
    const surfaces = new PIXI.Container()
    surfaces.name = 'SURFACES'
    main.addChild(surfaces)

    // Lớp Trên cùng: Chứa sự kiện click, Lưới, Viền
    const interactions = new PIXI.Container()
    interactions.name = 'INTERACTIONS'
    main.addChild(interactions)

    const calcPoints = (a: WallAreaConfig) => [
      { x: a.TopLeft[0] * W, y: H - a.TopLeft[1] * H },
      { x: a.TopRight[0] * W, y: H - a.TopRight[1] * H },
      { x: a.BottomRight[0] * W, y: H - a.BottomRight[1] * H },
      { x: a.BottomLeft[0] * W, y: H - a.BottomLeft[1] * H },
    ]

    const fullSprite = (tex: any, blend: any | null = null, alpha = 1) => {
      const s = new PIXI.Sprite(tex)
      s.width = W
      s.height = H
      s.alpha = alpha
      if (blend !== null) s.blendMode = blend
      return s
    }

    const updateSurfaceMasks = () => {
      const mm = mattMaskRef.current
      const gm = glossyMaskRef.current
      if (mm) { mm.clear(); mm.beginFill(0xffffff) }
      if (gm) { gm.clear(); gm.beginFill(0xffffff) }

      WALLS.forEach((area) => {
        const pts = area.Boundary?.length
            ? area.Boundary.flatMap((p) => [p[0] * W, H - p[1] * H])
            : calcPoints(area).flatMap((p) => [p.x, p.y])

        if (areaSurfaceStateRef.current[area.GUID] === 'glossy') {
          gm?.drawPolygon(pts)
        } else {
          mm?.drawPolygon(pts)
        }
      })

      if (mm) mm.endFill()
      if (gm) gm.endFill()
    }

    const createSurface = (area: WallAreaConfig) => {
      const points = calcPoints(area)
      const cont = new PIXI.projection.Container2d()
      cont.name = 'SURFACE_' + area.GUID

      const tile = new PIXI.projection.TilingSprite2d(PIXI.Texture.WHITE, W, H)
      tile.alpha = 0
      tile.tileScale.set(0.1)
      cont.addChild(tile)
      cont.proj.mapSprite(tile, points as any)
      ;(cont as any).savedPoints = points

      const mask = new PIXI.Graphics()
      mask.beginFill(0xffffff)
      const maskPts = area.Boundary?.length
          ? area.Boundary.flatMap((p) => [p[0] * W, H - p[1] * H])
          : points.flatMap((p) => [p.x, p.y])
      mask.drawPolygon(maskPts)
      mask.endFill()

      surfaces.addChild(mask)
      cont.mask = mask
      surfaces.addChild(cont)
    }

    const createHitArea = (area: WallAreaConfig) => {
      const hitPts = area.Boundary?.length
          ? area.Boundary.flatMap((p) => [p[0] * W, H - p[1] * H])
          : calcPoints(area).flatMap((p) => [p.x, p.y])

      // Viền khi hover vào riêng 1 vùng
      const outline = new PIXI.Graphics()
      outline.lineStyle(4, 0x93c5fd, 0.95)
      outline.drawPolygon(hitPts)
      outline.visible = false

      const g = new PIXI.Graphics()
      g.beginFill(0x00ffff, 1)
      g.drawPolygon(hitPts)
      g.endFill()
      g.alpha = 0.001
      ;(g as any).eventMode = 'static'
      g.cursor = 'pointer'

      g.on('pointerover', () => { if (selectedGUIDRef.current !== area.GUID) outline.visible = true })
      g.on('pointerout', () => { if (selectedGUIDRef.current !== area.GUID) outline.visible = false })
      g.on('pointerdown', () => {
        const prev = selectedGUIDRef.current
        if (prev && hitAreaOutlinesMapRef.current[prev]) hitAreaOutlinesMapRef.current[prev].visible = false
        selectedGUIDRef.current = area.GUID
        outline.visible = true
        areaSelectedCbRef.current?.(area.GUID)
      })

      hitAreaOutlinesMapRef.current[area.GUID] = outline
      hitAreasMapRef.current[area.GUID] = g
      interactions.addChild(outline)
      interactions.addChild(g)
    }

    WALLS.sort((a, b) => (a.GUID === 'F' ? -1 : b.GUID === 'F' ? 1 : 0))
    
    WALLS.forEach((area) => {
      // Mặc định luôn set bề mặt là Glossy
      areaSurfaceStateRef.current[area.GUID] = 'glossy'
      createSurface(area)
      createHitArea(area)
    })

    changeTileRef.current = (url: string, tileWidthMM = 600, tileHeightMM = 600, surfaceType = 'matt') => {
      const guid = selectedGUIDRef.current
      if (!guid) return

      if (hitAreaOutlinesMapRef.current[guid]) hitAreaOutlinesMapRef.current[guid].visible = false

      const surfCont = surfaces.getChildByName('SURFACE_' + guid) as any | null
      if (!surfCont) return
      const tile = surfCont.children[0]

      if (activeTileStateRef.current[guid] === url) {
        tile.texture = PIXI.Texture.WHITE
        tile.alpha = 0
        delete activeTileStateRef.current[guid]
        areaSurfaceStateRef.current[guid] = 'glossy'
        updateSurfaceMasks()
        if (mounted) setActiveTileMap((prev) => { const n = { ...prev }; delete n[guid]; return n })
        return
      }

      areaSurfaceStateRef.current[guid] = surfaceType
      updateSurfaceMasks()

      const areaConfig = WALLS.find((w) => w.GUID === guid)!
      const baseW = parseFloat(String(areaConfig.BaseWidth ?? 5000))
      const baseH = parseFloat(String(areaConfig.BaseHeight ?? 2800))
      const rateW = parseFloat(String(areaConfig.TileRateWidth ?? 0.5))
      const rateH = parseFloat(String(areaConfig.TileRateHeight ?? 0.5))
      const rawW = baseW > 2000 ? baseW : baseW / rateW
      const rawH = baseW > 2000 ? baseH : baseH / rateH
      const REAL_ROOM_W = Math.round(rawW)
      const REAL_ROOM_H = Math.round(rawH)

      const img = new Image()
      if (/^https?:\/\//i.test(url)) {
        img.crossOrigin = 'Anonymous'
      }
      img.src = url

      img.onerror = () => {
        setLayerError('Không tải được ảnh gạch. Ảnh có thể bị chặn (403/CORS). Hãy dùng ảnh từ Cloudinary library.')
      }

      img.onload = () => {
        if (!mounted || !appRef.current) return
        const POT_SIZE = 2048
        const rotate90 = guid === 'F' ? tileHeightMM > tileWidthMM : true
        const effectiveW = rotate90 ? tileHeightMM : tileWidthMM
        const effectiveH = rotate90 ? tileWidthMM : tileHeightMM

        let pxGroutW = (parseFloat(String(areaConfig.GroutVSize ?? 1.5)) / effectiveW) * POT_SIZE
        let pxGroutH = (parseFloat(String(areaConfig.GroutHSize ?? 1.5)) / effectiveH) * POT_SIZE
        if (pxGroutW < 8) pxGroutW = 8
        if (pxGroutH < 8) pxGroutH = 8

        const canvas = document.createElement('canvas')
        canvas.width = POT_SIZE
        canvas.height = POT_SIZE
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#DDDDDD'
        ctx.fillRect(0, 0, POT_SIZE, POT_SIZE)

        if (rotate90) {
          ctx.save()
          ctx.translate(POT_SIZE / 2, POT_SIZE / 2)
          ctx.rotate(Math.PI / 2)
          ctx.drawImage(img, -POT_SIZE / 2, -POT_SIZE / 2, POT_SIZE - pxGroutH, POT_SIZE - pxGroutW)
          ctx.restore()
        } else {
          ctx.drawImage(img, 0, 0, POT_SIZE - pxGroutW, POT_SIZE - pxGroutH)
        }

        try {
          const newTex = PIXI.Texture.from(canvas)
          newTex.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
          newTex.baseTexture.mipmap = PIXI.MIPMAP_MODES.POW2

          tile.width = POT_SIZE
          tile.height = POT_SIZE
          tile.texture = newTex
          tile.alpha = 0.95

          let scaleX = effectiveW / REAL_ROOM_W
          let scaleY = effectiveH / REAL_ROOM_H
          if (!isFinite(scaleX) || scaleX <= 0) scaleX = 0.1
          if (!isFinite(scaleY) || scaleY <= 0) scaleY = 0.1

          const remainderMM = REAL_ROOM_H % effectiveH
          const offsetY = (remainderMM / effectiveH) * POT_SIZE
          tile.tilePosition.x = 0
          tile.tilePosition.y = offsetY
          tile.tileScale.set(scaleX, scaleY)

          surfCont.proj.mapSprite(tile, surfCont.savedPoints as any)
          activeTileStateRef.current[guid] = url
          if (mounted) setActiveTileMap((prev) => ({ ...prev, [guid]: url }))
        } catch (error) {
          console.error('[RoomVisualizer] Cannot apply tile texture', { url, guid, error })
          setLayerError('Không thể áp ảnh gạch này lên phối cảnh. Hãy chọn ảnh từ Cloudinary library.')
        }
      }
    }

    const loadLayers = async () => {
      setLayerError(null)
      setLayerDebugInfo([])
      setUseHtmlRoomFallback(false)

      const loadTexture = async (label: 'room' | 'matt' | 'glossy', url?: string): Promise<any | null> => {
        if (!url) return null
        try {
          return await PIXI.Assets.load(url)
        } catch (error) {
          console.warn('[RoomVisualizer] loadTexture failed', { label, url, error })
          setLayerDebugInfo((prev) => [...prev, `[${label}] Không thể load texture: ${url}`])
          return null
        }
      }

      try {
        const roomTex = await loadTexture('room', roomLayerUrl)
        const mattTex = await loadTexture('matt', mattLayerUrl)
        const glossyTex = await loadTexture('glossy', glossyLayerUrl)

        if (!mounted) return

        // Fallback nền: room -> glossy -> matt để tránh mất trần khi room lỗi proxy
        const baseTex = roomTex ?? glossyTex ?? mattTex

        if (baseTex) {
          bgContainer.addChild(fullSprite(baseTex))
          setUseHtmlRoomFallback(false)
        } else if (roomLayerUrl) {
          setUseHtmlRoomFallback(true)
          setLayerError('Không tải được room layer trực tiếp. Đang fallback qua thẻ img.')
          setLayerDebugInfo((prev) => [...prev, `[room] Fallback <img>: ${roomLayerUrl}`])
        }

        if (mattTex && mattTex !== baseTex) {
          const mattSprite = fullSprite(mattTex, PIXI.BLEND_MODES.NORMAL, 1)
          const mattMask = new PIXI.Graphics()
          mattSprite.mask = mattMask
          mattMaskRef.current = mattMask
          bgContainer.addChild(mattSprite)
          bgContainer.addChild(mattMask)
        }
        if (glossyTex && glossyTex !== baseTex) {
          const glossySprite = fullSprite(glossyTex, PIXI.BLEND_MODES.NORMAL, 1)
          const glossyMask = new PIXI.Graphics()
          glossySprite.mask = glossyMask
          glossyMaskRef.current = glossyMask
          bgContainer.addChild(glossySprite)
          bgContainer.addChild(glossyMask)
        }

        updateSurfaceMasks()
      } catch (e) {
        if (!mounted) return
        setLayerError('Lỗi khởi tạo Layers.')
      }
    }

    loadLayers()

    ;(app.view as HTMLCanvasElement).addEventListener('pointerleave', () => {
      Object.entries(hitAreaOutlinesMapRef.current).forEach(([guid, outline]) => {
        outline.visible = selectedGUIDRef.current === guid
      })
    })

    return () => {
      mounted = false
      try { app.destroy(true, { children: true, texture: true }) } catch { /* ignore */ }
      appRef.current = null
      mattMaskRef.current = null
      glossyMaskRef.current = null
      changeTileRef.current = undefined
    }
  }, [scene])

  const loadProducts = useCallback(async (page: number, search: string) => {
    setIsLoadingProducts(true)
    try {
      const response = await productApi.getProductsPaged({ pageIndex: page, pageSize: 6, search })
      const items = response.products.items || []

      const resolvedItems = await Promise.all(
        items.map(async (item) => {
          if (isCorsSafeImageUrl(item.thumbnail)) return item

          const cached = productImageCacheRef.current[item.id]
          if (cached) {
            return { ...item, thumbnail: cached }
          }

          try {
            const detail = await productApi.getProductById(item.id)
            const childUrls = [
              detail.thumbnail,
              ...(detail.images || []).map((img) => img?.url),
            ]
              .filter((u): u is string => Boolean(u))

            const fallbackUrl = childUrls.find((u) => isCorsSafeImageUrl(u))
            if (fallbackUrl) {
              productImageCacheRef.current[item.id] = fallbackUrl
              return { ...item, thumbnail: fallbackUrl }
            }
          } catch (error) {
            console.warn('[RoomVisualizer] Resolve child image failed', { productId: item.id, error })
          }

          return item
        })
      )

      setProducts(resolvedItems)
      setCurrentPage(response.products.pageIndex)
      setTotalPages(response.products.totalPages)
    } catch (error) {
      console.error('[RoomVisualizer] Load products failed', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return
    if (products.length > 0) return
    void loadProducts(1, searchText)
  }, [sidebarOpen, products.length, searchText, loadProducts])

  const handleTileClick = async (product: ProductSummaryDto) => {
    if (!selectedGUIDRef.current) return

    let selectedThumbnail = product.thumbnail
    if (!isCorsSafeImageUrl(selectedThumbnail)) {
      const cached = productImageCacheRef.current[product.id]
      if (cached) {
        selectedThumbnail = cached
      } else {
        try {
          const detail = await productApi.getProductById(product.id)
          const childUrls = [
            detail.thumbnail,
            ...(detail.images || []).map((img) => img?.url),
          ].filter((u): u is string => Boolean(u))

          const fallbackUrl = childUrls.find((u) => isCorsSafeImageUrl(u))
          if (fallbackUrl) {
            selectedThumbnail = fallbackUrl
            productImageCacheRef.current[product.id] = fallbackUrl
            setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, thumbnail: fallbackUrl } : p)))
          }
        } catch (error) {
          console.warn('[RoomVisualizer] Resolve image on click failed', { productId: product.id, error })
        }
      }
    }

    if (!selectedThumbnail) {
      setLayerError('Không tìm thấy ảnh phù hợp để áp vào phối cảnh cho sản phẩm này.')
      return
    }

    const { wMM, hMM } = parseTileMM(product.keySpecs ?? {})
    const rawSpecsStr = JSON.stringify(product.keySpecs ?? {}).toLowerCase()
    const isMatt = rawSpecsStr.includes('matt') || rawSpecsStr.includes('matte') || rawSpecsStr.includes('mờ') || rawSpecsStr.includes('nhám')
    const surface = isMatt ? 'matt' : 'glossy'
    changeTileRef.current?.(selectedThumbnail, wMM, hMM, surface)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchText(val)
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => loadProducts(1, val), 600)
  }

  const handleSidebarOpen = () => {
    setSidebarOpen(true)
  }

  const handleScreenshot = () => {
    const canvas = appRef.current?.view as HTMLCanvasElement | undefined
    if (!canvas) return
    canvas.toBlob((b) => {
      if (!b) return
      const a = document.createElement('a')
      document.body.append(a)
      a.download = 'phoi-canh-gach.png'
      a.href = URL.createObjectURL(b)
      a.click()
      a.remove()
    }, 'image/png')
  }

  const activeUrls = Object.values(activeTileMap)

  return (
    // BẮT SỰ KIỆN RÊ CHUỘT Ở CONTAINER CHÍNH
    <div 
      className="relative bg-gray-900 rounded-lg overflow-hidden select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {useHtmlRoomFallback && roomLayerUrl && (
        <img
          src={roomLayerUrl}
          alt={scene.title || 'Room background'}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
        />
      )}

      <div
        ref={containerRef}
        className="relative z-10 w-full"
        style={{
          background: 'transparent',
          lineHeight: 0,
          cursor: isHovering ? 'crosshair' : 'default',
        }}
      />

      {layerError && (
        <div className="absolute top-3 left-3 z-20 max-w-[72%] bg-amber-100 text-amber-800 border border-amber-300 text-xs px-3 py-2 rounded-md">
          <div className="font-semibold">Loi tai layer anh</div>
          <div className="mt-1 break-words">{layerError}</div>
          {layerDebugInfo.length > 0 && (
            <ul className="mt-2 list-disc pl-4 space-y-1">
              {layerDebugInfo.slice(-3).map((info, idx) => (
                <li key={`${info}-${idx}`} className="break-words">{info}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Top-right controls */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button onClick={handleScreenshot} className="flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-2 rounded backdrop-blur-sm transition">
          <span>📷</span> Lưu ảnh
        </button>
        <button onClick={handleSidebarOpen} className="flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-2 rounded backdrop-blur-sm transition">
          <span>🗃️</span> Chọn gạch
        </button>
      </div>

      {selectedAreaName && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full z-10 pointer-events-none whitespace-nowrap">
          Đang ốp: <strong>{selectedAreaName}</strong>&nbsp;— chọn gạch bên phải
        </div>
      )}

      {/* Sidebar */}
      <div className={`absolute inset-y-0 right-0 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 z-20 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <span className="font-semibold text-sm text-gray-700">{selectedAreaName ? `Gạch → ${selectedAreaName}` : 'Chọn vùng rồi chọn gạch'}</span>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-3 py-2 border-b">
          <input type="text" value={searchText} onChange={handleSearch} placeholder="Tìm kiếm sản phẩm..." className="w-full border border-gray-300 rounded-full px-4 py-1.5 text-sm outline-none focus:border-primary-500 transition" />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center h-24 text-sm text-gray-400">Đang tải...</div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-gray-400">Không có sản phẩm</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {products.map((p) => {
                const isActive = activeUrls.includes(p.thumbnail)
                const isCompatible = isCorsSafeImageUrl(p.thumbnail)
                return (
                  <div
                    key={p.id}
                    onClick={() => handleTileClick(p)}
                    className={`border rounded-md transition-all ${
                      isCompatible
                        ? 'cursor-pointer hover:border-primary-500 hover:shadow-md'
                        : 'cursor-not-allowed opacity-70'
                    } ${isActive ? 'border-primary-500 ring-2 ring-primary-400 ring-offset-1' : 'border-gray-200'}`}
                    title={isCompatible ? '' : 'Ảnh bị chặn CORS/403, không thể áp vào phối cảnh'}
                  >
                    <div className="aspect-square p-2 flex items-center justify-center bg-white rounded-t-md overflow-hidden">
                      <img
                        src={p.thumbnail || '/images/default/no-image.png'}
                        alt={p.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget
                          if (!el.src.endsWith('/images/default/no-image.png')) {
                            el.src = '/images/default/no-image.png'
                          }
                        }}
                      />
                    </div>
                    <div className="px-2 py-1.5 border-t bg-gray-50 rounded-b-md">
                      <p className="text-xs font-medium truncate text-gray-800">{p.name}</p>
                      {!isCompatible && (
                        <p className="text-[10px] text-amber-600 mt-0.5 truncate">Anh khong ho tro CORS</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-3 py-2 border-t bg-gray-50">
            <button disabled={currentPage <= 1} onClick={() => loadProducts(currentPage - 1, searchText)} className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-100 transition">‹</button>
            <span className="text-xs text-gray-500">{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => loadProducts(currentPage + 1, searchText)} className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-100 transition">›</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomVisualizer