// API Configuration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: number) => `/products/${id}`,
    SEARCH: '/products/search',
    BY_CATEGORY: (categoryId: number) => `/products?categoryId=${categoryId}`,
  },
  CART: {
    LIST: '/cart',
    ADD: '/cart',
    UPDATE: (id: number) => `/cart/${id}`,
    DELETE: (id: number) => `/cart/${id}`,
    CLEAR: '/cart',
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: number) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: number) => `/orders/${id}/cancel`,
  },
} as const

// App Constants
export const APP_NAME = 'BMak Store'
export const APP_VERSION = '1.0.0'

// Pagination
export const ITEMS_PER_PAGE = 12

// Cart
export const MAX_CART_QUANTITY = 99
export const MIN_CART_QUANTITY = 1

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const





