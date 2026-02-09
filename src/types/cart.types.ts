export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  maxQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

export interface AddToCartPayload {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  maxQuantity?: number;
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
