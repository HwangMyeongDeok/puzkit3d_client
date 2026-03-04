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

  const getKey = (productId: string, variant?: string) =>
    variant ? `${productId}::${variant}` : productId;

  const scheduleSyncToServer = (productId: string, quantity: number, variant?: string) => {
    if (!isAuthenticated) return;

    const key = getKey(productId, variant);
    const existing = timersRef.current.get(key);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      timersRef.current.delete(key);
      try {
        await dispatch(syncItemToServer({ productId, quantity, variant })).unwrap();
        snapshotRef.current.delete(key);
      } catch {
        const prevQty = snapshotRef.current.get(key);
        if (prevQty !== undefined) {
          dispatch(rollbackQuantity({ productId, variant, previousQuantity: prevQty }));
          snapshotRef.current.delete(key);
        }
        toast.error('Không thể cập nhật giỏ hàng. Vui lòng thử lại.');
      }
    }, DEBOUNCE_DELAY);

    timersRef.current.set(key, timer);
  };

  const captureSnapshot = (productId: string, currentQty: number, variant?: string) => {
    const key = getKey(productId, variant);
    if (!snapshotRef.current.has(key)) {
      snapshotRef.current.set(key, currentQty);
    }
  };

  const handleIncrement = (productId: string, currentQty: number, variant?: string) => {
    captureSnapshot(productId, currentQty, variant);
    dispatch(incrementQuantity({ productId, variant }));
    scheduleSyncToServer(productId, currentQty + 1, variant);
  };

  const handleDecrement = (productId: string, currentQty: number, variant?: string) => {
    captureSnapshot(productId, currentQty, variant);
    dispatch(decrementQuantity({ productId, variant }));
    const newQty = currentQty - 1;
    scheduleSyncToServer(productId, newQty, variant);
  };

  const handleRemove = async (productId: string, variant?: string) => {
    dispatch(removeFromCart({ productId, variant }));
    if (isAuthenticated) {
      try {
        await dispatch(removeFromCartServer({ productId, variant })).unwrap();
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
