// src/types/api/order.api.types.ts

export interface OrderProductDetailsDto {
  productId?: string;
  code?: string;
  name?: string;
  description?: string;
  difficultLevel?: string;
  estimatedBuildTime?: number;
  totalPieceCount?: number;
  thumbnailUrl?: string;
  previewAsset?: string;
  isActive?: boolean;
}

export interface OrderVariantDetailsDto {
  color?: string;
  assembledLengthMm?: number;
  assembledWidthMm?: number;
  assembledHeightMm?: number;
  isActive?: boolean;
}

export interface OrderDetailDto {
  id: string;
  variantId?: string;
  sku?: string;
  productName?: string;
  variantName?: string;
  unitPrice?: number;
  quantity: number;
  totalAmount?: number;
  priceName?: string;
  thumbnailUrl?: string;
  productDetails?: OrderProductDetailsDto;
  variantDetails?: OrderVariantDetailsDto;
}

export interface CreateInstockOrderRequestDto {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerProvinceName: string;
  customerDistrictName: string;
  customerWardName: string;
  customerDetailAddress: string;
  cartItems: {
    itemId: string;
    priceDetailId: string;
    quantity: number;
  }[];
  shippingFee: number;
  usedCoinAmount: number;
  grandTotalAmount: number;
  paymentMethod: string;
}

export interface GetCustomerOrderByIdResponseDto {
  id: string;
  code?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerProvinceCode?: string;
  customerProvinceName?: string;
  customerDistrictCode?: string;
  customerDistrictName?: string;
  customerWardCode?: string;
  customerWardName?: string;
  subTotalAmount?: number;
  shippingFee?: number;
  usedCoinAmount?: number;
  usedCoinAmountAsMoney?: number;
  grandTotalAmount?: number;
  status?: number;
  paymentMethod?: string;
  isPaid?: boolean;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  orderDetails?: OrderDetailDto[];
}

export interface OrderPreviewDto {
  productName?: string;
  variantName?: string;
  quantity?: number;
  unitPrice?: number;
  thumbnailUrl?: string;
}

export interface GetCustomerOrderResponseDto {
  id: string;
  code?: string;
  grandTotalAmount?: number;
  totalQuantity?: number;
  status?: number;
  paymentMethod?: string;
  isPaid?: boolean;
  paidAt?: string;
  createdAt?: string;
  orderDetailsPreview?: OrderPreviewDto[];
}

export interface GetCustomerOrdersResponseDtoPagedResult {
  items: GetCustomerOrderResponseDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
