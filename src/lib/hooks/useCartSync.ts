// lib/hooks/useCartSync.ts
'use client';

import { useRef, useCallback, useEffect } from 'react';
import {
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  cartApi,
} from '../api/endpoints/cartApi';
import { handleErrorToast } from '@/lib/utils/error-handler';
import { toast } from 'sonner';
import { useAppDispatch } from '@/stores/hooks';
import type { CartDto } from '@/types/api/cart.api.types'; // <-- Import type Cart vào đây

export function useCartSync() {
  const dispatch = useAppDispatch();
  const [updateItemMutate] = useUpdateCartItemMutation();
  const [removeItemMutate] = useRemoveCartItemMutation();

  // Dùng Record cho chuẩn TS thay vì {[key: string]: type}
  const pendingQuantities = useRef<Record<string, number>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleRemove = useCallback(
    async (itemId: string): Promise<void> => {
      // Khai báo return type
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }
      delete pendingQuantities.current[itemId];

      try {
        await removeItemMutate(itemId).unwrap();
        toast.success('Item removed from cart');
      } catch (error: unknown) {
        // Đổi thành unknown
        handleErrorToast(error, 'Failed to remove item');
      }
    },
    [removeItemMutate]
  );

  const handleUpdateQuantity = useCallback(
    (itemId: string, newQuantity: number): void => {
      // Khai báo return type
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }

      const safeQuantity = newQuantity < 1 ? 1 : newQuantity;
      pendingQuantities.current[itemId] = safeQuantity;

      // Ép kiểu (draft: Cart) để TS gợi ý code (IntelliSense) chuẩn 100%
      dispatch(
        cartApi.util.updateQueryData('getCart', undefined, (draft: CartDto) => {
          if (draft?.items) {
            const item = draft.items.find((i) => i.itemId === itemId);
            if (item) {
              const qtyDiff = safeQuantity - item.quantity;
              draft.totalItem += qtyDiff;
              item.quantity = safeQuantity;
              item.totalPrice = item.unitPrice * safeQuantity;
            }
          }
        })
      );

      debounceTimers.current[itemId] = setTimeout(async () => {
        try {
          const finalQty = pendingQuantities.current[itemId];
          if (finalQty > 0) {
            await updateItemMutate({ itemId, quantity: finalQty }).unwrap();
          }
          delete pendingQuantities.current[itemId];
        } catch (error: unknown) {
          // Đổi thành unknown
          handleErrorToast(error, 'Failed to update quantity!');
        }
      }, 300);
    },
    [updateItemMutate, dispatch]
  );

  const handleIncrement = useCallback(
    (itemId: string, currentQuantity: number): void => {
      const baseQty = pendingQuantities.current[itemId] ?? currentQuantity;
      handleUpdateQuantity(itemId, baseQty + 1);
    },
    [handleUpdateQuantity]
  );

  const handleDecrement = useCallback(
    (itemId: string, currentQuantity: number): void => {
      const baseQty = pendingQuantities.current[itemId] ?? currentQuantity;
      if (baseQty > 1) {
        handleUpdateQuantity(itemId, baseQty - 1);
      }
    },
    [handleUpdateQuantity]
  );

  return { handleIncrement, handleDecrement, handleRemove, handleUpdateQuantity };
}
