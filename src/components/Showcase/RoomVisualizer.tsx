import { useState, useEffect, useRef, useCallback } from 'react'
import type { RoomSceneDto, WallAreaConfig, RoomSceneCanvasConfig } from '@/models/RoomScene'
import type { ProductSummaryDto } from '@/models/Product'
import * as productApi from '@/agent/api/productApi'
import { toProxiedImageUrl } from '@/utils/imageProxy'
// pixi.js and pixi-projection are loaded via CDN <script> tags in index.html.
// Access them through the window object at runtime.
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
        // If values look like cm (< 300), multiply by 10 to get mm
        return { wMM: w < 300 ? w * 10 : w, hMM: h < 300 ? h * 10 : h }
      }
    }
  }
  return { wMM: 600, hMM: 600 }
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

  // PixiJS mutable refs — do NOT put in React state to avoid re-renders
  const selectedGUIDRef = useRef<string | null>(null)
  const hitAreasMapRef = useRef<Record<string, any>>({})
  const hitAreaOutlinesMapRef = useRef<Record<string, any>>({})
  const activeTileStateRef = useRef<Record<string, string>>({})
  const areaSurfaceStateRef = useRef<Record<string, string>>({})
  const mattMaskRef = useRef<any>(null)
  const glossyMaskRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeTileRef = useRef<any>()

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
  // Track which areas have an active tile (for highlight in sidebar)
  const [activeTileMap, setActiveTileMap] = useState<Record<string, string>>({})

  const proxiedRoomLayerUrl = toProxiedImageUrl(scene.roomLayerUrl)
  const proxiedMattLayerUrl = toProxiedImageUrl(scene.mattLayerUrl)
  const proxiedGlossyLayerUrl = toProxiedImageUrl(scene.glossyLayerUrl)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Keep callbacks fresh so PixiJS closures don't go stale
  const areaSelectedCbRef = useRef<(guid: string) => void>()
  areaSelectedCbRef.current = (guid) => {
    setSelectedAreaName(AREA_NAMES[guid] ?? guid)
    setSidebarOpen(true)
  }

  // ----------------------------------------------------------------
  // PIXI Initialization — re-runs every time `scene` changes
  // ----------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container || !scene) return

    let mounted = true
  // Resolve PIXI from CDN global at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PIXI = getPIXI()
  if (!PIXI) {
    setLayerError('Không tìm thấy PIXI runtime từ CDN.')
    console.error('[RoomVisualizer] PIXI is undefined. Check CDN scripts in index.html.')
    return
  }

    // Parse config JSON
    let config: RoomSceneCanvasConfig
    try {
      config = JSON.parse(scene.configJson) as RoomSceneCanvasConfig
      // Some configs wrap themselves in a nested `config` property
      if (config.config) config = config.config!
    } catch {
      setLayerError('Config phòng mẫu không hợp lệ (JSON parse failed).')
      console.error('[RoomVisualizer] Invalid scene.configJson', { sceneId: scene.id, configJson: scene.configJson })
      return
    }

    console.info('[RoomVisualizer] Scene layer URLs', {
      sceneId: scene.id,
      roomLayerUrl: scene.roomLayerUrl,
      mattLayerUrl: scene.mattLayerUrl,
      glossyLayerUrl: scene.glossyLayerUrl,
      proxiedRoomLayerUrl,
      proxiedMattLayerUrl,
      proxiedGlossyLayerUrl,
    })

    const W = config.Width || 1920
    const H = config.Height || 1080
    const WALLS: WallAreaConfig[] = config.SetDesign?.WallAreas ?? []

    // Reset mutable refs for new scene
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

    // ---- Containers ----
    const main = new PIXI.Container()
    main.name = 'MAIN'
    app.stage.addChild(main)

    const surfaces = new PIXI.Container()
    surfaces.name = 'SURFACES'
    main.addChild(surfaces)

    const interactions = new PIXI.Container()
    interactions.name = 'INTERACTIONS'
    main.addChild(interactions)

    // ---- Helper: 4 pixel corners from normalised percentage coords ----
    const calcPoints = (a: WallAreaConfig) => [
      { x: a.TopLeft[0] * W, y: H - a.TopLeft[1] * H },
      { x: a.TopRight[0] * W, y: H - a.TopRight[1] * H },
      { x: a.BottomRight[0] * W, y: H - a.BottomRight[1] * H },
      { x: a.BottomLeft[0] * W, y: H - a.BottomLeft[1] * H },
    ]

    const fullSprite = (
      tex: any,
      blend: any | null = null,
      alpha = 1,
    ) => {
      const s = new PIXI.Sprite(tex)
      s.width = W
      s.height = H
      s.alpha = alpha
      if (blend !== null) s.blendMode = blend
      return s
    }

    // ---- Glossy mask (shown for glossy surface areas) ----
    const updateSurfaceMasks = () => {
      const mm = mattMaskRef.current
      const gm = glossyMaskRef.current
      if (mm) {
        mm.clear()
        mm.beginFill(0xffffff)
      }
      if (gm) {
        gm.clear()
        gm.beginFill(0xffffff)
      }

      WALLS.forEach((area) => {
        const pts =
          area.Boundary?.length
            ? area.Boundary.flatMap((p) => [p[0] * W, H - p[1] * H])
            : calcPoints(area).flatMap((p) => [p.x, p.y])

        if (areaSurfaceStateRef.current[area.GUID] === 'glossy') {
          gm?.drawPolygon(pts)
        } else {
          mm?.drawPolygon(pts)
        }
      })

      if (mm) {
        mm.endFill()
      }
      if (gm) {
        gm.endFill()
      }
    }

    // ---- Create projected tiling surface ----
    const createSurface = (area: WallAreaConfig) => {
      const points = calcPoints(area)
      const cont = new PIXI.projection.Container2d()
      cont.name = 'SURFACE_' + area.GUID

      const tile = new PIXI.projection.TilingSprite2d(PIXI.Texture.WHITE, W, H)
      tile.alpha = 0
      tile.tileScale.set(0.1)
      cont.addChild(tile)
      cont.proj.mapSprite(tile, points as any)
      // Store original corner points so we can re-map after texture swap
      ;(cont as any).savedPoints = points

      // Polygon mask so the tile only paints inside this wall area
      const mask = new PIXI.Graphics()
      mask.beginFill(0xffffff)
      const maskPts =
        area.Boundary?.length
          ? area.Boundary.flatMap((p) => [p[0] * W, H - p[1] * H])
          : points.flatMap((p) => [p.x, p.y])
      mask.drawPolygon(maskPts)
      mask.endFill()

      surfaces.addChild(mask)
      cont.mask = mask
      surfaces.addChild(cont)
    }

    // ---- Clickable hit area per wall zone ----
    const createHitArea = (area: WallAreaConfig) => {
      const hitPts =
        area.Boundary?.length
          ? area.Boundary.flatMap((p) => [p[0] * W, H - p[1] * H])
          : calcPoints(area).flatMap((p) => [p.x, p.y])

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

      g.on('pointerover', () => {
        if (selectedGUIDRef.current !== area.GUID) outline.visible = true
      })
      g.on('pointerout', () => {
        if (selectedGUIDRef.current !== area.GUID) outline.visible = false
      })
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

    // Floor first, then walls
    WALLS.sort((a, b) => (a.GUID === 'F' ? -1 : b.GUID === 'F' ? 1 : 0))
    WALLS.forEach((area) => {
      areaSurfaceStateRef.current[area.GUID] = 'glossy'
      createSurface(area)
      createHitArea(area)
    })

    // ---- changeTile ---- (exposed via ref so sidebar can call it)
    changeTileRef.current = (url: string, tileWidthMM = 600, tileHeightMM = 600, surfaceType = 'matt') => {
      const guid = selectedGUIDRef.current
      if (!guid) return

      // Deselect highlight
      if (hitAreaOutlinesMapRef.current[guid]) hitAreaOutlinesMapRef.current[guid].visible = false

      const surfCont = surfaces.getChildByName('SURFACE_' + guid) as
        | any
        | null
      if (!surfCont) return
      const tile = surfCont.children[0]

      // Toggle same tile off
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

      // Room real-world dimensions from area config
      const areaConfig = WALLS.find((w) => w.GUID === guid)!
      const baseW = parseFloat(String(areaConfig.BaseWidth ?? 5000))
      const baseH = parseFloat(String(areaConfig.BaseHeight ?? 2800))
      const rateW = parseFloat(String(areaConfig.TileRateWidth ?? 0.5))
      const rateH = parseFloat(String(areaConfig.TileRateHeight ?? 0.5))
      const rawW = baseW > 2000 ? baseW : baseW / rateW
      const rawH = baseW > 2000 ? baseH : baseH / rateH
      const REAL_ROOM_W = Math.round(rawW)
      const REAL_ROOM_H = Math.round(rawH)

      // Load texture image via proxy, then bake tile + grout onto a canvas
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = toProxiedImageUrl(url)

      img.onerror = () => {
        const msg = `Không tải được ảnh gạch qua proxy image: ${img.src}`
        setLayerError(msg)
        console.error('[RoomVisualizer] Tile image load failed', { originalUrl: url, proxiedUrl: img.src })
      }

      img.onload = () => {
        if (!mounted || !appRef.current) return

        const POT_SIZE = 2048
        // Rotate tile for floor or landscape tiles
        const rotate90 = guid === 'F' ? tileHeightMM > tileWidthMM : true
        const effectiveW = rotate90 ? tileHeightMM : tileWidthMM
        const effectiveH = rotate90 ? tileWidthMM : tileHeightMM

        // Grout line widths in pixels
        let pxGroutW = (parseFloat(String(areaConfig.GroutVSize ?? 1.5)) / effectiveW) * POT_SIZE
        let pxGroutH = (parseFloat(String(areaConfig.GroutHSize ?? 1.5)) / effectiveH) * POT_SIZE
        if (pxGroutW < 8) pxGroutW = 8
        if (pxGroutH < 8) pxGroutH = 8

        // Bake tile + grout into a canvas
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

        const newTex = PIXI.Texture.from(canvas)
        newTex.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT
        newTex.baseTexture.mipmap = PIXI.MIPMAP_MODES.POW2

        tile.width = POT_SIZE
        tile.height = POT_SIZE
        tile.texture = newTex
        tile.alpha = 0.95

        // Scale so one "tile pixel block" = one real tile in the room
        let scaleX = effectiveW / REAL_ROOM_W
        let scaleY = effectiveH / REAL_ROOM_H
        if (!isFinite(scaleX) || scaleX <= 0) scaleX = 0.1
        if (!isFinite(scaleY) || scaleY <= 0) scaleY = 0.1

        // Offset to pin grout rows to the floor (căn ron đáy)
        const remainderMM = REAL_ROOM_H % effectiveH
        const offsetY = (remainderMM / effectiveH) * POT_SIZE
        tile.tilePosition.x = 0
        tile.tilePosition.y = offsetY
        tile.tileScale.set(scaleX, scaleY)

        // Re-project the sprite onto the wall quad
        surfCont.proj.mapSprite(tile, surfCont.savedPoints as any)

        activeTileStateRef.current[guid] = url
        if (mounted) setActiveTileMap((prev) => ({ ...prev, [guid]: url }))
      }
    }

    // ---- Load optional matt/glossy overlays independently ----
    const loadLayers = async () => {
      setLayerError(null)
      setLayerDebugInfo([])
      setUseHtmlRoomFallback(false)

      const loadTexture = async (label: 'room' | 'matt' | 'glossy', url?: string): Promise<any | null> => {
        if (!url) return null
        try {
          const probeResponse = await fetch(url, { method: 'GET' })
          if (!probeResponse.ok) {
            const message = `[${label}] HTTP ${probeResponse.status} ${probeResponse.statusText} - ${url}`
            setLayerDebugInfo((prev) => [...prev, message])
            console.error('[RoomVisualizer] Layer probe failed', { label, url, status: probeResponse.status, statusText: probeResponse.statusText })
            return null
          }

          const contentType = probeResponse.headers.get('content-type') || ''
          if (contentType && !contentType.toLowerCase().startsWith('image/')) {
            const message = `[${label}] Content-Type không phải ảnh: ${contentType} - ${url}`
            setLayerDebugInfo((prev) => [...prev, message])
            console.error('[RoomVisualizer] Layer content-type invalid', { label, url, contentType })
            return null
          }

          return await PIXI.Assets.load(url)
        } catch (error) {
          const message = `[${label}] Exception khi load texture: ${url}`
          setLayerDebugInfo((prev) => [...prev, message])
          console.error('[RoomVisualizer] Layer texture load exception', { label, url, error })
          return null
        }
      }

      try {
        const roomTex = await loadTexture('room', proxiedRoomLayerUrl)
        const mattTex = await loadTexture('matt', proxiedMattLayerUrl)
        const glossyTex = await loadTexture('glossy', proxiedGlossyLayerUrl)

        if (!mounted) return

        if (roomTex) {
          main.addChild(fullSprite(roomTex))
          setUseHtmlRoomFallback(false)
        } else if (proxiedRoomLayerUrl) {
          setUseHtmlRoomFallback(true)
          setLayerDebugInfo((prev) => [...prev, `[room] Pixi load fail, fallback sang <img>: ${proxiedRoomLayerUrl}`])
        }

        if (mattTex) {
          const mattSprite = fullSprite(mattTex, PIXI.BLEND_MODES.NORMAL, 1)
          const mattMask = new PIXI.Graphics()
          mattSprite.mask = mattMask
          mattMaskRef.current = mattMask
          main.addChild(mattSprite)
        }
        if (glossyTex) {
          const glossySprite = fullSprite(glossyTex, PIXI.BLEND_MODES.NORMAL, 1)
          const glossyMask = new PIXI.Graphics()
          glossySprite.mask = glossyMask
          glossyMaskRef.current = glossyMask
          main.addChild(glossySprite)
        }

        updateSurfaceMasks()
      } catch (e) {
        if (!mounted) return
        const msg = e instanceof Error ? e.message : 'Không tải được layer phòng mẫu qua proxy image'
        setLayerError(msg)
        console.error('[RoomVisualizer] loadLayers fatal error', e)
      }
    }

    loadLayers()

    // Reset all hit-area highlights on cursor leaving canvas
    ;(app.view as HTMLCanvasElement).addEventListener('pointerleave', () => {
      Object.entries(hitAreaOutlinesMapRef.current).forEach(([guid, outline]) => {
        outline.visible = selectedGUIDRef.current === guid
      })
    })

    // Cleanup
    return () => {
      mounted = false
      try {
        app.destroy(true, { children: true, texture: true })
      } catch {
        /* ignore */
      }
      appRef.current = null
      mattMaskRef.current = null
      glossyMaskRef.current = null
      changeTileRef.current = undefined
    }
  }, [scene])

  // ----------------------------------------------------------------
  // Product loading for the tile sidebar
  // ----------------------------------------------------------------
  const loadProducts = useCallback(async (page: number, search: string) => {
    setIsLoadingProducts(true)
    try {
      const response = await productApi.getProductsPaged({ pageIndex: page, pageSize: 6, search })
      setProducts(response.products.items)
      setCurrentPage(response.products.pageIndex)
      setTotalPages(response.products.totalPages)
    } catch (error) {
      console.error('[RoomVisualizer] Load products failed', { page, search, error })
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // ----------------------------------------------------------------
  // Event handlers
  // ----------------------------------------------------------------
  const handleTileClick = (product: ProductSummaryDto) => {
    if (!selectedGUIDRef.current) return
    const { wMM, hMM } = parseTileMM(product.keySpecs ?? {})
    // Determine surface type from product name / keySpecs
    const rawSpecsStr = JSON.stringify(product.keySpecs ?? {}).toLowerCase()
    const isMatt =
      rawSpecsStr.includes('matt') ||
      rawSpecsStr.includes('matte') ||
      rawSpecsStr.includes('mờ') ||
      rawSpecsStr.includes('nhám')
    const surface = isMatt ? 'matt' : 'glossy'
    changeTileRef.current?.(toProxiedImageUrl(product.thumbnail), wMM, hMM, surface)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchText(val)
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => loadProducts(1, val), 600)
  }

  const handleSidebarOpen = () => {
    setSidebarOpen(true)
    if (products.length === 0) loadProducts(1, '')
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

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  const activeUrls = Object.values(activeTileMap)

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden select-none">
      {/* Base room image as HTML layer to avoid WebGL/CORS hard-fail on main background */}
      {useHtmlRoomFallback && proxiedRoomLayerUrl && (
        <img
          src={proxiedRoomLayerUrl}
          alt={scene.title || 'Room background'}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
          onError={() => {
            const msg = `Fallback <img> cũng không tải được: ${proxiedRoomLayerUrl}`
            setLayerError(msg)
            console.error('[RoomVisualizer] HTML fallback image failed', { sceneId: scene.id, proxiedRoomLayerUrl })
          }}
        />
      )}

      {/* PixiJS canvas mount point */}
      <div
        ref={containerRef}
        className="relative z-10 w-full"
        style={{ background: 'transparent', lineHeight: 0 }}
      />

      {layerError && (
        <div className="absolute top-3 left-3 z-20 max-w-[70%] bg-amber-100 text-amber-800 border border-amber-300 text-xs px-3 py-2 rounded-md">
          <div className="font-semibold">Lỗi tải layer ảnh</div>
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
        <button
          onClick={handleScreenshot}
          className="flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-2 rounded backdrop-blur-sm transition"
        >
          <span>📷</span> Lưu ảnh
        </button>
        <button
          onClick={handleSidebarOpen}
          className="flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-2 rounded backdrop-blur-sm transition"
        >
          <span>🗃️</span> Chọn gạch
        </button>
      </div>

      {/* Selected area indicator */}
      {selectedAreaName && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full z-10 pointer-events-none whitespace-nowrap">
          Đang ốp: <strong>{selectedAreaName}</strong>&nbsp;— chọn gạch bên phải
        </div>
      )}

      {/* Tile Sidebar */}
      <div
        className={`absolute inset-y-0 right-0 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 z-20 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <span className="font-semibold text-sm text-gray-700">
            {selectedAreaName ? `Gạch → ${selectedAreaName}` : 'Chọn vùng rồi chọn gạch'}
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-red-500 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b">
          <input
            type="text"
            value={searchText}
            onChange={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full border border-gray-300 rounded-full px-4 py-1.5 text-sm outline-none focus:border-primary-500 transition"
          />
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center h-24 text-sm text-gray-400">
              Đang tải...
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-gray-400">
              Không có sản phẩm
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {products.map((p) => {
                const isActive = activeUrls.includes(p.thumbnail)
                return (
                  <div
                    key={p.id}
                    onClick={() => handleTileClick(p)}
                    className={`border rounded-md cursor-pointer hover:border-primary-500 hover:shadow-md transition-all ${
                      isActive
                        ? 'border-primary-500 ring-2 ring-primary-400 ring-offset-1'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square p-2 flex items-center justify-center bg-white rounded-t-md overflow-hidden">
                      <img
                        src={toProxiedImageUrl(p.thumbnail)}
                        alt={p.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="px-2 py-1.5 border-t bg-gray-50 rounded-b-md">
                      <p className="text-xs font-medium truncate text-gray-800">{p.name}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-3 py-2 border-t bg-gray-50">
            <button
              disabled={currentPage <= 1}
              onClick={() => loadProducts(currentPage - 1, searchText)}
              className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-100 transition"
            >
              ‹
            </button>
            <span className="text-xs text-gray-500">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => loadProducts(currentPage + 1, searchText)}
              className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-100 transition"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomVisualizer
