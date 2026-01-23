# BMak Ecommerce Client

Dự án ecommerce được xây dựng với React, TypeScript và Tailwind CSS.

## 🚀 Tính năng

- ⚛️ React 18 với TypeScript
- 🎨 Tailwind CSS cho styling
- 🛣️ React Router cho routing
- 📦 Vite cho build tool nhanh chóng
- 🔧 ESLint cho code quality
- 🗄️ MobX cho state management
- 🌐 API client với error handling
- 📝 TypeScript models và interfaces

## 📋 Yêu cầu

- Node.js >= 18.0.0
- npm hoặc yarn hoặc pnpm

## 🛠️ Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy development server:
```bash
npm run dev
```

3. Build cho production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 📁 Cấu trúc thư mục

```
src/
├── agent/          # API client và API functions
│   └── api/
│       ├── apiClient.ts    # Base API client
│       ├── productApi.ts   # Product API
│       ├── authApi.ts      # Authentication API
│       ├── cartApi.ts      # Cart API
│       ├── orderApi.ts     # Order API
│       └── index.ts
├── layout/         # Layout components
│   ├── Layout.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── models/         # TypeScript models và interfaces
│   ├── Product.ts
│   ├── CartItem.ts
│   ├── User.ts
│   └── Order.ts
├── pages/          # Các trang của ứng dụng
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   └── Checkout.tsx
├── store/          # MobX stores
│   ├── index.ts           # Store provider và hook
│   ├── RootStore.ts       # Root store
│   ├── CartStore.ts       # Cart store
│   ├── ProductStore.ts    # Product store
│   └── AuthStore.ts       # Auth store
├── utils/          # Utility functions
│   ├── format.ts          # Format functions (currency, date)
│   ├── validation.ts      # Validation functions
│   ├── constants.ts       # App constants
│   └── index.ts
├── App.tsx         # Component chính
├── main.tsx        # Entry point
└── index.css       # Global styles với Tailwind
```

## 🎯 Các trang hiện có

- **Trang chủ** (`/`) - Landing page với hero section
- **Sản phẩm** (`/products`) - Danh sách tất cả sản phẩm
- **Chi tiết sản phẩm** (`/products/:id`) - Thông tin chi tiết sản phẩm
- **Giỏ hàng** (`/cart`) - Quản lý giỏ hàng
- **Thanh toán** (`/checkout`) - Trang thanh toán

## 🏗️ Kiến trúc

### State Management (MobX)
- **RootStore**: Quản lý tất cả các stores
- **CartStore**: Quản lý giỏ hàng
- **ProductStore**: Quản lý sản phẩm và danh sách sản phẩm
- **AuthStore**: Quản lý authentication và user session

### API Layer
- **apiClient**: Base HTTP client với error handling và token management
- **API Functions**: Các functions riêng biệt cho từng resource (products, auth, cart, orders)

### Models
- TypeScript interfaces cho tất cả data types
- Đảm bảo type safety trong toàn bộ ứng dụng

### Utils
- Format functions: currency, date formatting
- Validation functions: email, phone, password validation
- Constants: API endpoints, app constants

## ⚙️ Cấu hình

Tạo file `.env` trong root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🔜 Tính năng sắp tới

- [x] State management (MobX)
- [x] API integration
- [x] Authentication store
- [ ] Product search & filter
- [ ] User dashboard
- [ ] Order management UI
- [ ] Image upload
- [ ] Payment integration

## 📝 License

MIT

