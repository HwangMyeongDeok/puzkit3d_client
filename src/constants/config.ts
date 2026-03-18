export const APP_CONFIG = {
  APP_NAME: 'PuzKit3D',
  APP_DESCRIPTION: 'Ứng dụng Đặt mua Mô hình Lắp ráp Trí tuệ 3D & Thiết kế theo yêu cầu',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  API_TIMEOUT: 15000,

  ACCESS_TOKEN_KEY: 'puzkit3d_access_token',
  REFRESH_TOKEN_KEY: 'puzkit3d_refresh_token',
  AUTH_STORAGE_KEY: 'puzkit3d_auth_storage_key',

  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,

  DEFAULT_PRODUCT_IMAGE: '/images/placeholder-product.png',
  DRAFT_KEY: 'puzkit_checkout_draft',
  DEFAULT_AVATAR: '/images/placeholder-avatar.png',

  CURRENCY: 'VND',
  CURRENCY_LOCALE: 'vi-VN',

  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
} as const;

export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/puzkit3d',
  INSTAGRAM: 'https://instagram.com/puzkit3d',
  YOUTUBE: 'https://youtube.com/@puzkit3d',
  TIKTOK: 'https://tiktok.com/@puzkit3d',
} as const;

export const CONTACT_INFO = {
  EMAIL: 'contact@puzkit3d.com',
  PHONE: '1900-xxxx',
  ADDRESS: 'TP. Hồ Chí Minh, Việt Nam',
  WORKING_HOURS: 'Thứ 2 - Thứ 7: 8:00 - 18:00',
} as const;
