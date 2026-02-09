/**
 * Application enums and constant values
 */

// Material types
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

// Difficulty levels
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

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  packed: 'Đang đóng gói',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

// Import request status
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

// Payment methods
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

// Sort options
export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'createdAt:asc', label: 'Cũ nhất' },
  { value: 'price:asc', label: 'Giá thấp đến cao' },
  { value: 'price:desc', label: 'Giá cao đến thấp' },
  { value: 'name:asc', label: 'Tên A-Z' },
  { value: 'name:desc', label: 'Tên Z-A' },
  { value: 'rating:desc', label: 'Đánh giá cao nhất' },
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
