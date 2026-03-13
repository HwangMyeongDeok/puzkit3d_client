export type CartType = 'INSTOCK' | 'PARTNER';

export interface CartItem {
  id: string;
  cartId: string;
  itemId: string;
  unitPrice: number | null;
  instockProductPriceDetailId: string | null;
  quantity: number;
  cartType: CartType;

  // Denormalized display fields (from product replicas)
  productName: string;
  thumbnailUrl: string;
  sku: string | null;
  variantColor: string | null;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  syncStatus: 'idle' | 'syncing' | 'error';
}

export interface AddToCartPayload {
  itemId: string;
  unitPrice: number | null;
  instockProductPriceDetailId: string | null;
  quantity: number;
  cartType: CartType;
  productName: string;
  thumbnailUrl: string;
  sku: string | null;
  variantColor: string | null;
}

export interface UpdateCartItemPayload {
  itemId: string;
  sku: string | null;
  quantity: number;
}

export interface RemoveCartItemPayload {
  itemId: string;
  sku: string | null;
}
