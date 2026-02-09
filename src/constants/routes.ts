/**
 * Application routes
 * Use these constants instead of hardcoding paths
 */

export const ROUTES = {
  // Public
  HOME: '/',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}` as const,

  // Cart & Checkout
  CART: '/cart',
  CHECKOUT: '/checkout',

  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}` as const,

  // Import Request (overseas ordering)
  IMPORT_REQUESTS: '/import-requests',
  IMPORT_REQUEST_NEW: '/import-requests/new',
  IMPORT_REQUEST_DETAIL: (id: string) => `/import-requests/${id}` as const,

  // Profile
  PROFILE: '/profile',
  PROFILE_ADDRESSES: '/profile/addresses',
  PROFILE_SETTINGS: '/profile/settings',

  // Static pages
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
} as const;

// API endpoints base paths
export const API_ROUTES = {
  AUTH: '/auth',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  ORDERS: '/orders',
  IMPORT_REQUESTS: '/import-requests',
  USERS: '/users',
  ADDRESSES: '/addresses',
} as const;
