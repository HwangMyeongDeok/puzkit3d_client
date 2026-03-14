// src/types/api/cart.api.types.ts

export interface ProductDetailsDto {
  name: string | null;
  sku: string | null;
  color: string | null;
  assembledLengthMm: number | null;
  assembledWidthMm: number | null;
  assembledHeightMm: number | null;
  thumbnailUrl: string | null;
  isActive: boolean;
}

export interface CartItemDto {
  id: string; // Đây là ID của bản ghi trong CartItem table
  itemId: string; // Thường là ProductID hoặc ID định danh item
  unitPrice: number | null;
  inStockProductPriceDetailId: string | null;
  quantity: number;
  totalPrice: number | null;
  productDetails: ProductDetailsDto; // Thông tin chi tiết sản phẩm nằm ở đây
}

export interface CartDto {
  id: string;
  userId: string;
  cartType: string | null; // INSTOCK_CART hoặc PARTNER_CART
  totalItem: number;
  items: CartItemDto[] | null;
}

export interface AddItemToInStockCartRequest {
  itemId: string;
  inStockProductPriceDetailId?: string | null;
  quantity: number;
}
