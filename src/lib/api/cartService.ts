import type { CartItem } from '@/types';

let serverCart: CartItem[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CartApiResponse {
  success: boolean;
  data: CartItem[];
  error?: string;
}

export async function fetchCart(): Promise<CartApiResponse> {
  await delay(300);
  return { success: true, data: [...serverCart] };
}

export async function syncGuestCart(guestItems: CartItem[]): Promise<CartApiResponse> {
  await delay(300);

  const merged = [...serverCart];

  for (const guestItem of guestItems) {
    const existing = merged.find(
      (item) => item.productId === guestItem.productId && item.variant === guestItem.variant
    );

    if (existing) {
      const sumQty = existing.quantity + guestItem.quantity;
      existing.quantity = existing.maxQuantity ? Math.min(sumQty, existing.maxQuantity) : sumQty;
    } else {
      merged.push({ ...guestItem });
    }
  }

  serverCart = merged;
  return { success: true, data: [...serverCart] };
}

export async function addItemToServer(item: CartItem): Promise<CartApiResponse> {
  await delay(300);

  const existing = serverCart.find(
    (i) => i.productId === item.productId && i.variant === item.variant
  );

  if (existing) {
    const newQty = existing.quantity + item.quantity;
    existing.quantity = existing.maxQuantity ? Math.min(newQty, existing.maxQuantity) : newQty;
  } else {
    serverCart.push({ ...item });
  }

  return { success: true, data: [...serverCart] };
}

export async function updateItemQty(
  productId: string,
  quantity: number,
  variant?: string
): Promise<CartApiResponse> {
  await delay(300);

  const item = serverCart.find((i) => i.productId === productId && i.variant === variant);

  if (!item) {
    return { success: false, data: [...serverCart], error: 'Item not found' };
  }

  if (quantity <= 0) {
    serverCart = serverCart.filter((i) => !(i.productId === productId && i.variant === variant));
  } else {
    item.quantity = item.maxQuantity ? Math.min(quantity, item.maxQuantity) : quantity;
  }

  return { success: true, data: [...serverCart] };
}

export async function removeItemFromServer(
  productId: string,
  variant?: string
): Promise<CartApiResponse> {
  await delay(300);
  serverCart = serverCart.filter((i) => !(i.productId === productId && i.variant === variant));
  return { success: true, data: [...serverCart] };
}

export async function clearServerCart(): Promise<CartApiResponse> {
  await delay(300);
  serverCart = [];
  return { success: true, data: [] };
}

export function _resetServerCart() {
  serverCart = [];
}
