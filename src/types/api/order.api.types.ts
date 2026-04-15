export type PaymentMethod = 'COD' | 'Online' | 'COIN';

export type InstockOrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Processing'
  | 'Waiting'
  | 'Delivering'
  | 'Delivered'
  | 'Cancelled'
  | 'Completed'
  | 'Returned'
  | 'HandedOverToDelivery'
  | 'Rejected'
  | 'Expired';

// ==========================================
// 2. DTOs - CHI TIẾT SẢN PHẨM TRONG ĐƠN
// ==========================================
export interface OrderProductDetailsDto {
  productId?: string;
  code?: string;
  name?: string;
  slug?: string; // Bổ sung slug theo JSON
  description?: string;
  difficultLevel?: string;
  estimatedBuildTime?: number;
  totalPieceCount?: number;
  thumbnailUrl?: string;
  previewAsset?: string[]; // 👉 ĐÃ SỬA: Đổi thành mảng chuỗi (array of strings)
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

// ==========================================
// 3. DTOs - REQUEST / RESPONSE API CHÍNH
// ==========================================
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
  paymentMethod: PaymentMethod;
}

export interface GetCustomerOrderByIdResponseDto {
  id: string;
  code?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerProvinceName?: string;
  customerDistrictName?: string;
  customerWardName?: string;
  detailAddress?: string; // 👉 ĐÃ THÊM: Theo đúng key trong JSON
  subTotalAmount?: number;
  shippingFee?: number;
  usedCoinAmount?: number; // 👉 GIỮ LẠI CÁI NÀY, BỎ CÁI AsMoney ĐI
  grandTotalAmount?: number;
  status?: InstockOrderStatus;
  paymentMethod?: PaymentMethod;
  isPaid?: boolean;
  paidAt?: string | null; // Cập nhật cho phép null
  createdAt?: string;
  updatedAt?: string;
  orderDetails?: OrderDetailDto[];
}

// ==========================================
// 4. DTOs - LỊCH SỬ ĐƠN HÀNG & PHÂN TRANG
// ==========================================
export interface OrderPreviewDto {
  productId?: string;
  slug?: string;
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
  status?: InstockOrderStatus;
  paymentMethod?: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerProvinceName?: string;
  customerDistrictName?: string;
  customerWardName?: string;
  detailAddress?: string;
  isPaid?: boolean;
  paidAt?: string | null;
  createdAt?: string;
  orderDetailsPreview?: OrderPreviewDto[];
}

export interface GetCustomerOrdersResponseDtoPagedResult {
  items: GetCustomerOrderResponseDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
