import { InstockOrderStatus } from '@/types/api/order.api.types';

export const MATERIAL = {
  PAPER: 'paper',
  PLASTIC: 'plastic',
  WOOD: 'wood',
  METAL: 'metal',
  SCREW: 'screw',
} as const;

export const MATERIAL_LABELS: Record<string, string> = {
  paper: 'Paper',
  plastic: 'Plastic',
  wood: 'Wood',
  metal: 'Metal',
  screw: 'Screw',
};

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

/** Shared config for all order-status UI. Keyed by backend string enum. */
export const ORDER_STATUS_MAP: Record<
  InstockOrderStatus,
  { label: string; color: string; stepIndex: number }
> = {
  Pending: { label: 'Pending', color: 'yellow', stepIndex: 0 },
  Paid: { label: 'Paid', color: 'yellow', stepIndex: 1 },
  Processing: { label: 'Processing', color: 'blue', stepIndex: 2 },
  Waiting: { label: 'Waiting', color: 'yellow', stepIndex: 2 },
  HandedOverToDelivery: { label: 'Handed Over', color: 'indigo', stepIndex: 3 },
  Delivering: { label: 'Delivering', color: 'violet', stepIndex: 4 },
  Delivered: { label: 'Delivered', color: 'emerald', stepIndex: 5 },
  Completed: { label: 'Completed', color: 'green', stepIndex: 6 },
  Cancelled: { label: 'Cancelled', color: 'red', stepIndex: -1 },
  Returned: { label: 'Returned', color: 'orange', stepIndex: -1 },
  Rejected: { label: 'Rejected', color: 'rose', stepIndex: -1 },
} as const;

/** Steps shown in the OrderStepper (happy path only). */
export const ORDER_STEPPER_STEPS = [
  'Pending',
  'Paid',
  'Processing',
  'Handed Over',
  'Delivering',
  'Delivered',
  'Completed',
] as const;

export const IMPORT_REQUEST_STATUS = {
  SUBMITTED: 'submitted',
  REVIEWING: 'reviewing',
  QUOTE_SENT: 'quote_sent',
  DEPOSIT_PAID: 'deposit_paid',
  ORDERED: 'ordered',
  ARRIVED: 'arrived',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const IMPORT_REQUEST_STATUS_LABELS: Record<string, string> = {
  submitted: 'Request Submitted',
  reviewing: 'Under Review',
  quote_sent: 'Quote Sent',
  deposit_paid: 'Deposit Paid',
  ordered: 'Ordered',
  arrived: 'Arrived at Warehouse',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_METHOD = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  MOMO: 'momo',
  VNPAY: 'vnpay',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  momo: 'MoMo E-Wallet',
  vnpay: 'VNPay',
};

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name: A-Z' },
  { value: 'name:desc', label: 'Name: Z-A' },
  { value: 'rating:desc', label: 'Highest Rated' },
] as const;

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
export const APP_CONFIG = {
  APP_NAME: 'PuzKit3D',
  APP_DESCRIPTION: '3D Intellectual Assembly Model Ordering & Custom Design Application',
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
  ADDRESS: 'Ho Chi Minh City, Vietnam',
  WORKING_HOURS: 'Mon - Sat: 8:00 AM - 6:00 PM',
} as const;
