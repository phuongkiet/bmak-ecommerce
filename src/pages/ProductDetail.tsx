import { useParams } from 'react-router-dom'

const ProductDetail = () => {
  const { id } = useParams()

  // Mock data - sẽ thay thế bằng API sau
  const product = {
    id: Number(id),
    name: `Sản phẩm ${id}`,
    price: 299000,
    description: 'Mô tả chi tiết về sản phẩm này. Sản phẩm chất lượng cao, đáng tin cậy.',
    image: 'https://via.placeholder.com/600',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg shadow-md"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl text-primary-600 font-bold mb-6">
            {product.price.toLocaleString('vi-VN')} đ
          </p>
          
          <p className="text-gray-700 mb-6">{product.description}</p>
          
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
}

export default ProductDetail





