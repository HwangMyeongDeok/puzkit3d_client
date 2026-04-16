export type PartnerOrderStatus =
  | 'Pending'
  | 'Paid'
  | 'WatingForReorder'
  | 'OrderedFromPartner'
  | 'ReceivedAtWarehouse'
  | 'CheckingFailed'
  | 'Processing'
  | 'HandedOverToDelivery'
  | 'Completed'
  | 'Expired'
  | 'CancelledByCustomer'
  | 'CancelledByStaff'
  | 'Returned';

export type PartnerOrderDisplayStatus = PartnerOrderStatus | 'Delivering' | 'Delivered';

export type PartnerOrderPaymentMethod = 'Online' | 'Coin' | 'COD';

export interface CreatePartnerOrderItemDto {
  partnerProductId: string;
  quantity: number;
  price: number;
}

export interface CreatePartnerOrderRequestDto {
  quotationId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerProvinceName: string;
  customerDistrictName: string;
  customerWardName: string;
  detailAddress: string;
  userCoinAmount: number;
  shippingFee: number;
  paymentMethod: PartnerOrderPaymentMethod;
  items: CreatePartnerOrderItemDto[];
}

export interface PartnerOrderListItemDto {
  id: string;
  partnerProductQuotationId: string;
  code: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  subTotalAmount: number;
  shippingFee: number;
  importTaxAmount: number;
  grandTotalAmount: number;
  status: PartnerOrderStatus | string;
  paymentMethod: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerOrderDetailDto extends PartnerOrderListItemDto {
  customerProvinceName?: string;
  customerDistrictName?: string;
  customerWardName?: string;
  detailAddress?: string;
  paidAt?: string | null;
}

export interface PartnerOrdersPagedResult {
  items: PartnerOrderListItemDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
