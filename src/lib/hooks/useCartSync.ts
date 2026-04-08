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
import type { CartDto } from '@/types/api/cart.api.types';

export function useCartSync() {
  const dispatch = useAppDispatch();
  const [updateItemMutate] = useUpdateCartItemMutation();
  const [removeItemMutate] = useRemoveCartItemMutation();

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
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }
      delete pendingQuantities.current[itemId];

      try {
        await removeItemMutate(itemId).unwrap();
        toast.success('Item removed from cart');
      } catch (error: unknown) {
        handleErrorToast(error, 'Failed to remove item');
      }
    },
    [removeItemMutate]
  );

  const handleUpdateQuantity = useCallback(
    (itemId: string, newQuantity: number): void => {
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }

      const safeQuantity = newQuantity < 1 ? 1 : newQuantity;
      pendingQuantities.current[itemId] = safeQuantity;

      // Optimistic update
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
          handleErrorToast(error, 'Failed to update quantity!');
          delete pendingQuantities.current[itemId];

          // ÉP RESET UI VỀ CHUẨN DATABASE
          dispatch(
            cartApi.endpoints.getCart.initiate(undefined, {
              subscribe: false,
              forceRefetch: true,
            })
          );
        }
      }, 300);
    },
    [dispatch, updateItemMutate] // <--- Nãy bác thiếu nguyên cụm đóng ngoặc này
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
