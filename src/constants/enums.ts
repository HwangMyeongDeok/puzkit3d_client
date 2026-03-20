export const MATERIAL = {
  PAPER: 'paper',
  PLASTIC: 'plastic',
  WOOD: 'wood',
  METAL: 'metal',
  SCREW: 'screw',
} as const;

export const MATERIAL_LABELS: Record<string, string> = {
  paper: 'Giấy',
  plastic: 'Nhựa',
  wood: 'Gỗ',
  metal: 'Kim loại',
  screw: 'Ốc vít',
};

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
  expert: 'Chuyên gia',
};

import type { InstockOrderStatus } from '@/types/order.types';

/** Shared config for all order-status UI. Keyed by backend string enum. */
export const ORDER_STATUS_MAP: Record<
  InstockOrderStatus,
  { label: string; color: string; stepIndex: number }
> = {
  Pending: { label: 'Chờ xác nhận', color: 'yellow', stepIndex: 0 },
  Paid: { label: 'Đã thanh toán', color: 'yellow', stepIndex: 1 },
  Processing: { label: 'Đang xử lý', color: 'blue', stepIndex: 2 },
  Waiting: { label: 'Đang chờ', color: 'yellow', stepIndex: 2 },
  HandedOverToDelivery: { label: 'Bàn giao vận chuyển', color: 'indigo', stepIndex: 3 },
  Shipping: { label: 'Đang giao', color: 'violet', stepIndex: 4 },
  Delivered: { label: 'Đã giao', color: 'emerald', stepIndex: 5 },
  Completed: { label: 'Hoàn thành', color: 'green', stepIndex: 6 },
  Cancelled: { label: 'Đã hủy', color: 'red', stepIndex: -1 },
  Returned: { label: 'Trả hàng', color: 'orange', stepIndex: -1 },
  Rejected: { label: 'Bị từ chối', color: 'rose', stepIndex: -1 },
} as const;

/** Steps shown in the OrderStepper (happy path only). */
export const ORDER_STEPPER_STEPS = [
  'Chờ xác nhận',
  'Đã thanh toán',
  'Đang xử lý',
  'Bàn giao vận chuyển',
  'Đang giao',
  'Đã giao',
  'Hoàn thành',
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
  submitted: 'Đã gửi yêu cầu',
  reviewing: 'Đang xem xét',
  quote_sent: 'Đã báo giá',
  deposit_paid: 'Đã đặt cọc',
  ordered: 'Đã đặt hàng',
  arrived: 'Đã về kho',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const PAYMENT_METHOD = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  MOMO: 'momo',
  VNPAY: 'vnpay',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
};

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'createdAt:asc', label: 'Cũ nhất' },
  { value: 'price:asc', label: 'Giá thấp đến cao' },
  { value: 'price:desc', label: 'Giá cao đến thấp' },
  { value: 'name:asc', label: 'Tên A-Z' },
  { value: 'name:desc', label: 'Tên Z-A' },
  { value: 'rating:desc', label: 'Đánh giá cao nhất' },
] as const;

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
