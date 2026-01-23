import { Link } from 'react-router-dom'

// Mock data - sẽ thay thế bằng API sau
const products = [
  { id: 1, name: 'Sản phẩm 1', price: 299000, image: 'https://via.placeholder.com/300' },
  { id: 2, name: 'Sản phẩm 2', price: 399000, image: 'https://via.placeholder.com/300' },
  { id: 3, name: 'Sản phẩm 3', price: 499000, image: 'https://via.placeholder.com/300' },
  { id: 4, name: 'Sản phẩm 4', price: 599000, image: 'https://via.placeholder.com/300' },
]

const Products = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tất cả sản phẩm</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-primary-600 font-bold">
                {product.price.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Products





