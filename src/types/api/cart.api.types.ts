// --- 1. RAW TYPE (Dữ liệu gốc từ API trả về) ---
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
  partnerId: string | null; // MỚI: Bổ sung từ API
  referencePrice: number | null; // MỚI: Bổ sung từ API
}

export interface RawCartItemDto {
  id: string;
  itemId: string; // ID của Variant
  unitPrice: number;
  inStockProductPriceDetailId: string;
  quantity: number;
  totalPrice: number;
  productDetails: RawProductDetailsDto;
  isVariantActive: boolean; // MỚI: Bổ sung từ API
  isValidPrice: boolean;
  newUnitPrice: number | null;
  newPriceDetailId: string | null;
  newPriceName: string | null;
  isValidInventory: boolean; // MỚI: Bổ sung từ API
  availableInventory: number | null; // MỚI: Bổ sung từ API (có thể null nếu là vô hạn hoặc không quản lý)
}

export interface RawCartDto {
  id: string;
  userId: string;
  cartType: string;
  totalItem: number;
  items: RawCartItemDto[];
}

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

  // Logic check Giá
  isValidPrice: boolean;
  newUnitPrice?: number | null;
  newPriceDetailId?: string | null;
  newPriceName?: string | null;

  // Logic check Kho & Trạng thái (MỚI BỔ SUNG CHO UI)
  isVariantActive: boolean;
  isValidInventory: boolean;
  availableInventory: number; // Để kiểu number để dễ so sánh > < (Khi map từ API sang, nếu null thì gán mặc định bằng 0 hoặc 9999 tùy ông)
}

export interface CartDto {
  id: string;
  totalItem: number;
  items: CartItemDto[];
}

// --- 3. REQUEST PAYLOADS ---
export interface AddItemToInStockCartRequest {
  itemId: string;
  quantity: number;
  inStockProductPriceDetailId: string;
}
