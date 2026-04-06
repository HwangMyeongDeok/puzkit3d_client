export const ROUTES = {
  HOME: '/',

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',

  PRODUCTS: '/shop',
  PRODUCT_DETAIL: (slug: string) => `/shop/${slug}` as const,

  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',
  CHECKOUT_SUCCESS_QUOTE: '/checkout/success-quote',

  BRANDS: '/brands',

  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}` as const,

  IMPORT_REQUESTS: '/import-requests',
  IMPORT_REQUEST_NEW: '/import-requests/new',
  IMPORT_REQUEST_DETAIL: (id: string) => `/import-requests/${id}` as const,

  PROFILE: '/profile',
  PROFILE_ADDRESSES: '/profile/addresses',
  PROFILE_SETTINGS: '/profile/settings',

  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',

  CUSTOM_SERVICE: '/custom-service',

  CUSTOM_DESIGN_REQUESTS: '/profile/custom-designs',
  CUSTOM_DESIGN_REQUEST_DETAIL: (id: string) => `/profile/custom-designs/${id}` as const,
} as const;

export const API_ROUTES = {
  AUTH: '/auth',
  PRODUCTS: '/products',
  CART: '/cart',
  ORDERS: '/orders',
  USERS: '/users',
  ADDRESSES: '/addresses',
} as const;
