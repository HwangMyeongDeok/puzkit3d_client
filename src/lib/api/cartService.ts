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
      (item) => item.itemId === guestItem.itemId && item.sku === guestItem.sku
    );

    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      merged.push({ ...guestItem });
    }
  }

  serverCart = merged;
  return { success: true, data: [...serverCart] };
}

export async function addItemToServer(item: CartItem): Promise<CartApiResponse> {
  await delay(300);

  const existing = serverCart.find((i) => i.itemId === item.itemId && i.sku === item.sku);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    serverCart.push({ ...item });
  }

  return { success: true, data: [...serverCart] };
}

export async function updateItemQty(
  itemId: string,
  quantity: number,
  sku: string | null
): Promise<CartApiResponse> {
  await delay(300);

  const item = serverCart.find((i) => i.itemId === itemId && i.sku === sku);

  if (!item) {
    return { success: false, data: [...serverCart], error: 'Item not found' };
  }

  if (quantity <= 0) {
    serverCart = serverCart.filter((i) => !(i.itemId === itemId && i.sku === sku));
  } else {
    item.quantity = quantity;
  }

  return { success: true, data: [...serverCart] };
}

export async function removeItemFromServer(
  itemId: string,
  sku: string | null
): Promise<CartApiResponse> {
  await delay(300);
  serverCart = serverCart.filter((i) => !(i.itemId === itemId && i.sku === sku));
  return { success: true, data: [...serverCart] };
}

export async function clearServerCart(): Promise<CartApiResponse> {
  await delay(300);
  serverCart = [];
  return { success: true, data: [] };
}

export function _resetServerCart(): void {
  serverCart = [];
}
