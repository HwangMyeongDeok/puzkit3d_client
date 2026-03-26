// // src/types/api/cart.api.types.ts

// export interface ProductDetailsDto {
//   name: string | null;
//   sku: string | null;
//   color: string | null;
//   assembledLengthMm: number | null;
//   assembledWidthMm: number | null;
//   assembledHeightMm: number | null;
//   thumbnailUrl: string | null;
//   isActive: boolean;
// }

// export interface CartItemDto {
//   id: string; // Đây là ID của bản ghi trong CartItem table
//   itemId: string; // Thường là ProductID hoặc ID định danh item
//   unitPrice: number | null;
//   inStockProductPriceDetailId: string | null;
//   quantity: number;
//   totalPrice: number | null;
//   productDetails: ProductDetailsDto; // Thông tin chi tiết sản phẩm nằm ở đây
// }

// export interface CartDto {
//   id: string;
//   userId: string;
//   cartType: string | null; // INSTOCK_CART hoặc PARTNER_CART
//   totalItem: number;
//   items: CartItemDto[] | null;
// }

// export interface AddItemToInStockCartRequest {
//   itemId: string;
//   inStockProductPriceDetailId?: string | null;
//   quantity: number;
// }

// --- 1. TYPE DÀNH CHO DỮ LIỆU THÔ TỪ BACKEND ---
// --- 1. TYPE CỦA DATA TỪ BACKEND TRẢ VỀ (RAW) ---
export interface RawProductDetailsDto {
  productId: string;
  productName: string;
  slug: string;
  variantName: string;
  sku: string;
  color: string;
  assembledLengthMm: number;
  assembledWidthMm: number;
  assembledHeightMm: number;
  thumbnailUrl: string;
  isActive: boolean;
}

export interface RawCartItemDto {
  id: string;
  itemId: string; // ID của Variant
  unitPrice: number;
  inStockProductPriceDetailId: string;
  quantity: number;
  totalPrice: number;
  productDetails: RawProductDetailsDto;
}

export interface RawCartDto {
  id: string;
  userId: string;
  cartType: string;
  totalItem: number;
  items: RawCartItemDto[];
}

// --- 2. TYPE ĐÃ LÀM PHẲNG CHO GIAO DIỆN (UI) ---
export interface CartItemDto {
  id: string;
  itemId: string;
  productId: string;
  priceDetailId: string;
  name: string;
  variantName: string;
  slug: string;
  sku: string;
  color: string;
  thumbnailUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CartDto {
  id: string;
  totalItem: number;
  items: CartItemDto[];
}

export interface AddItemToInStockCartRequest {
  itemId: string;
  quantity: number;
}
