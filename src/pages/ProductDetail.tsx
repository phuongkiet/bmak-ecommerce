import { useStore } from '@/store'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { formatPrice } from '@/utils'
import { observer } from 'mobx-react-lite'

const ProductDetail = observer(() => {
  const { id } = useParams()
  const { productStore } = useStore()
  
  useEffect(() => {
    if (id) {
      // Clear old product before fetching new one
      productStore.clearSelectedProduct()
      productStore.fetchProductById(Number(id))
    }
    
    // Cleanup when unmounting
    return () => {
      productStore.clearSelectedProduct()
    }
  }, [id, productStore])

  const product = productStore.selectedProduct

  const mainImage = useMemo(
    () => product?.thumbnail || product?.images?.[0]?.url || '/placeholder-product.png',
    [product]
  )

  const specs = useMemo(() => {
    if (!product?.specificationsJson) return null
    try {
      return JSON.parse(product.specificationsJson) as Record<string, string>
    } catch (e) {
      console.warn('Invalid specificationsJson', e)
      return null
    }
  }, [product?.specificationsJson])

  const hasDiscount = product?.originalPrice && product.originalPrice > (product.price ?? 0)

  if (productStore.isLoading) {
    return <div className="container mx-auto px-4 py-12 text-center text-gray-500">Đang tải...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center text-gray-500">Không tìm thấy sản phẩm</div>
  }
  
  // Warn if product ID doesn't match URL (defensive check)
  if (id && product.id !== Number(id)) {
    console.warn(`Product ID mismatch: URL=${id}, Loaded=${product.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full rounded-lg shadow-md"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-3xl text-primary-600 font-bold">
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice!)}</p>
            )}
          </div>
          
          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          {/* Specs từ attributes */}
          {product.attributes?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Thuộc tính</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                {product.attributes.map((attr) => (
                  <div key={`${attr.code}-${attr.value}`} className="flex justify-between">
                    <span className="font-medium">{attr.name}:</span>
                    <span>{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specs từ JSON */}
          {specs && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span>{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div>SKU: {product.sku}</div>
            <div>Đơn vị bán: {product.salesUnit} ({product.priceUnit})</div>
            <div>Tồn kho: {product.stockQuantity}</div>
            <div>Danh mục: {product.categoryName}</div>
          </div>
          
          <div className="space-y-4">
            <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Thêm vào giỏ hàng
            </button>
            <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ProductDetail





