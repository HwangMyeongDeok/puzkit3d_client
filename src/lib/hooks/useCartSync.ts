'use client';

import { useRef } from 'react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/stores';
import { selectIsAuthenticated } from '@/stores/slices/authSlice';
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  addToCart,
  rollbackQuantity,
  syncItemToServer,
  addToCartServer,
  removeFromCartServer,
} from '@/stores/slices/cartSlice';

import type { AddToCartPayload, RemoveCartItemPayload } from '@/types';

const DEBOUNCE_DELAY = 500;

export function useCartSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const snapshotRef = useRef<Map<string, number>>(new Map());

  const getKey = (itemId: string, sku: string | null) => (sku ? `${itemId}::${sku}` : itemId);

  const scheduleSyncToServer = (itemId: string, quantity: number, sku: string | null) => {
    if (!isAuthenticated) return;

    const key = getKey(itemId, sku);
    const existing = timersRef.current.get(key);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      timersRef.current.delete(key);
      try {
        await dispatch(syncItemToServer({ itemId, quantity, sku })).unwrap();
        snapshotRef.current.delete(key);
      } catch {
        const prevQty = snapshotRef.current.get(key);
        if (prevQty !== undefined) {
          dispatch(rollbackQuantity({ itemId, sku, previousQuantity: prevQty }));
          snapshotRef.current.delete(key);
        }
        toast.error('Không thể cập nhật giỏ hàng. Vui lòng thử lại.');
      }
    }, DEBOUNCE_DELAY);

    timersRef.current.set(key, timer);
  };

  const captureSnapshot = (itemId: string, currentQty: number, sku: string | null) => {
    const key = getKey(itemId, sku);
    if (!snapshotRef.current.has(key)) {
      snapshotRef.current.set(key, currentQty);
    }
  };

  const handleIncrement = (itemId: string, currentQty: number, sku: string | null) => {
    captureSnapshot(itemId, currentQty, sku);
    dispatch(incrementQuantity({ itemId, sku }));
    scheduleSyncToServer(itemId, currentQty + 1, sku);
  };

  const handleDecrement = (itemId: string, currentQty: number, sku: string | null) => {
    captureSnapshot(itemId, currentQty, sku);
    dispatch(decrementQuantity({ itemId, sku }));
    const newQty = currentQty - 1;
    scheduleSyncToServer(itemId, newQty, sku);
  };

  const handleRemove = async (itemId: string, sku: string | null) => {
    dispatch(removeFromCart({ itemId, sku }));
    if (isAuthenticated) {
      try {
        await dispatch(removeFromCartServer({ itemId, sku })).unwrap();
      } catch {
        toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  const handleAddToCart = async (payload: AddToCartPayload) => {
    dispatch(addToCart(payload));
    if (isAuthenticated) {
      try {
        await dispatch(addToCartServer(payload)).unwrap();
      } catch {
        toast.error('Không thể thêm sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  return {
    handleIncrement,
    handleDecrement,
    handleRemove,
    handleAddToCart,
    isAuthenticated,
  };
}
