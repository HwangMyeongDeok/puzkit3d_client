import type { BaseEntity } from './common.types';
import type { CartItem } from './cart.types';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ShippingAddress {
  id?: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  isDefault?: boolean;
}

export interface OrderItem extends CartItem {
  subtotal: number;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingFee: number;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  note?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export type ImportRequestStatus =
  | 'submitted'
  | 'reviewing'
  | 'quote_sent'
  | 'deposit_paid'
  | 'ordered'
  | 'arrived'
  | 'delivered'
  | 'cancelled';

export interface ImportRequest extends BaseEntity {
  brand: string;
  productLink?: string;
  productCode?: string;
  quantity: number;
  notes?: string;
  status: ImportRequestStatus;
  quotedPrice?: number;
  serviceFee?: number;
  shippingFee?: number;
  depositAmount?: number;
  estimatedArrival?: string;
}
