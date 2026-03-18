import type { BaseEntity } from './common.types';

// ============ SHARED ============

export type PaymentMethod = 'COD' | 'ONLINE';

export interface CustomerAddress {
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
}

// ============ INSTOCK ORDER ============

export type InstockOrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Processing'
  | 'Waiting'
  | 'Shipping'
  | 'Delivered'
  | 'Cancelled'
  | 'Completed'
  | 'Returned'
  | 'HandedOverToDelivery'
  | 'Rejected'; // DB uses integer status codes

export interface InstockOrder extends BaseEntity {
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: CustomerAddress;
  subTotalAmount: number;
  shippingFee: number;
  usedCoinAmountAsMoney: number;
  grandTotalAmount: number;
  status: InstockOrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  paidAt: string | null;
}

export interface InstockOrderDetail {
  id: string;
  instockOrderId: string;
  instockProductVariantId: string;
  sku: string;
  productName: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  instockProductPriceDetailId: string;
  priceName: string;
  totalAmount: number;
}

// ============ PARTNER ORDER ============

export interface PartnerProductRequest extends BaseEntity {
  code: string;
  customerId: string;
  partnerId: string;
  desiredDeliveryDate: string;
  totalRequestedQuantity: number;
  note: string | null;
  status: number;
}

export interface PartnerProductRequestItem {
  id: string;
  partnerProductRequestId: string;
  partnerProductId: string;
  referenceUnitPrice: number;
  quantity: number;
  referenceTotalAmount: number;
}

export interface PartnerProductQuotation extends BaseEntity {
  code: string;
  partnerProductRequestId: string;
  version: number;
  subTotalAmount: number;
  shippingFee: number;
  importTaxAmount: number;
  grandTotalAmount: number;
  expectedDeliveryDate: string;
  note: string | null;
  status: number;
}

export interface PartnerProductOrder extends BaseEntity {
  code: string;
  partnerProductQuotationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: CustomerAddress;
  subTotalAmount: number;
  shippingFee: number;
  importTaxAmount: number;
  usedCoinAmountAsMoney: number;
  grandTotalAmount: number;
  status: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  paidAt: string | null;
}

export interface PartnerProductOrderDetail {
  id: string;
  partnerProductOrderId: string;
  partnerProductId: string;
  partnerProductSku: string;
  partnerProductName: string | null;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

// ============ CHECKOUT FORM (FE-only) ============

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  address: string;
  paymentMethod: PaymentMethod;
  note?: string;
}
