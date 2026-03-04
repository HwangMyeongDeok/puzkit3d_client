export type CartItemType = 'instock' | 'partner';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  maxQuantity?: number;
  itemType: CartItemType;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  syncStatus: 'idle' | 'syncing' | 'error';
}

export interface AddToCartPayload {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  maxQuantity?: number;
  itemType: CartItemType;
}

export interface UpdateCartItemPayload {
  productId: string;
  variant?: string;
  quantity: number;
}

export interface RemoveCartItemPayload {
  productId: string;
  variant?: string;
}
