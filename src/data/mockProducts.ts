import { Product } from '@/models/Product'

// Mock data cho sản phẩm nổi bật
export const featuredProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    description: 'Điện thoại thông minh cao cấp với chip A17 Pro',
    price: 29990000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
    rating: 4.8,
    reviewCount: 1250,
    stock: 50,
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship với camera 200MP và S Pen',
    price: 24990000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
    rating: 4.7,
    reviewCount: 980,
    stock: 35,
  },
  {
    id: 3,
    name: 'MacBook Pro 14" M3',
    description: 'Laptop chuyên nghiệp với chip Apple M3',
    price: 45990000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80',
    rating: 4.9,
    reviewCount: 650,
    stock: 20,
  },
  {
    id: 4,
    name: 'AirPods Pro 2',
    description: 'Tai nghe không dây với chống ồn chủ động',
    price: 5990000,
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80',
    rating: 4.6,
    reviewCount: 2100,
    stock: 100,
  },
  {
    id: 5,
    name: 'iPad Pro 12.9" M2',
    description: 'Máy tính bảng cao cấp với màn hình Liquid Retina',
    price: 32990000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
    rating: 4.8,
    reviewCount: 750,
    stock: 30,
  },
  {
    id: 6,
    name: 'Sony WH-1000XM5',
    description: 'Tai nghe chống ồn tốt nhất thế giới',
    price: 8990000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    rating: 4.9,
    reviewCount: 1850,
    stock: 45,
  },
]

// Mock data cho sản phẩm giảm giá
export const saleProducts: Product[] = [
  {
    id: 7,
    name: 'Laptop Dell XPS 13',
    description: 'Laptop siêu mỏng với màn hình OLED',
    price: 24990000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
    rating: 4.5,
    reviewCount: 420,
    stock: 15,
  },
  {
    id: 8,
    name: 'Samsung 55" QLED TV',
    description: 'Smart TV 4K với công nghệ Quantum Dot',
    price: 18990000,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80',
    rating: 4.6,
    reviewCount: 680,
    stock: 25,
  },
  {
    id: 9,
    name: 'Nike Air Max 270',
    description: 'Giày thể thao với đệm Air Max',
    price: 2990000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    rating: 4.4,
    reviewCount: 950,
    stock: 80,
  },
  {
    id: 10,
    name: 'Canon EOS R6 Mark II',
    description: 'Máy ảnh mirrorless full-frame',
    price: 54990000,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&q=80',
    rating: 4.8,
    reviewCount: 320,
    stock: 12,
  },
  {
    id: 11,
    name: 'Dyson V15 Detect',
    description: 'Máy hút bụi không dây công nghệ laser',
    price: 19990000,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80',
    rating: 4.7,
    reviewCount: 550,
    stock: 18,
  },
  {
    id: 12,
    name: 'Apple Watch Series 9',
    description: 'Đồng hồ thông minh với chip S9',
    price: 10990000,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80',
    rating: 4.6,
    reviewCount: 1200,
    stock: 60,
  },
]

// Mock data cho sản phẩm Pre-order
export const preOrderProducts: Product[] = [
  {
    id: 13,
    name: 'iPhone 16 Pro (Pre-order)',
    description: 'Đặt trước iPhone 16 Pro - Giao hàng tháng 9/2024',
    price: 32990000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
    rating: 0,
    reviewCount: 0,
    stock: 0,
  },
  {
    id: 14,
    name: 'PlayStation 6 (Pre-order)',
    description: 'Đặt trước PS6 - Giao hàng Q4/2024',
    price: 15990000,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=80',
    rating: 0,
    reviewCount: 0,
    stock: 0,
  },
  {
    id: 15,
    name: 'Tesla Model 3 2025 (Pre-order)',
    description: 'Đặt trước Tesla Model 3 phiên bản 2025',
    price: 1200000000,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80',
    rating: 0,
    reviewCount: 0,
    stock: 0,
  },
  {
    id: 16,
    name: 'Meta Quest 4 (Pre-order)',
    description: 'Kính thực tế ảo thế hệ mới - Giao hàng 2025',
    price: 8990000,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80',
    rating: 0,
    reviewCount: 0,
    stock: 0,
  },
  {
    id: 17,
    name: 'Samsung Galaxy Z Fold 7 (Pre-order)',
    description: 'Đặt trước smartphone gập mới nhất',
    price: 39990000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
    rating: 0,
    reviewCount: 0,
    stock: 0,
  },
  {
    id: 18,
    name: 'MacBook Air M4 (Pre-order)',
    description: 'Laptop siêu mỏng với chip M4 mới nhất',
    price: 32990000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80',
    rating: 0,
    reviewCount: 0,
    stock: 0,
  },
]

// Helper function để lấy products theo tag
export const getProductsByTag = (tag: string): Product[] => {
  switch (tag.toLowerCase()) {
    case 'featured':
    case 'hot':
      return featuredProducts
    case 'sale':
      return saleProducts
    case 'pre-order':
    case 'preorder':
      return preOrderProducts
    default:
      return []
  }
}





