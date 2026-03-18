'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useUpdateCartItemMutation, useRemoveCartItemMutation } from '../api/endpoints/cartApi';
import { toast } from 'sonner';

export function useCartSync() {
  const [updateItemMutate] = useUpdateCartItemMutation();
  const [removeItemMutate] = useRemoveCartItemMutation();

  // Lưu trữ số lượng "đang chờ" để tránh việc cộng dồn sai khi user click quá nhanh
  const pendingQuantities = useRef<{ [key: string]: number }>({});
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    return () => {
      // Cleanup timers khi component bị unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  // 1. ĐƯA handleRemove LÊN TRÊN CÙNG ĐỂ CÁC HÀM KHÁC GỌI ĐƯỢC NÓ
  const handleRemove = useCallback(
    async (itemId: string) => {
      // Xóa các trạng thái chờ của item này khi xóa khỏi giỏ
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }
      delete pendingQuantities.current[itemId];

      try {
        await removeItemMutate(itemId).unwrap();
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      } catch (error) {
        toast.error('Lỗi khi xóa sản phẩm');
      }
    },
    [removeItemMutate]
  );

  // 2. TỚI handleUpdateQuantity
  const handleUpdateQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      // 1. Clear timer cũ của chính item đó
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }

      // 2. Cập nhật số lượng mới nhất vào bản ghi tạm
      pendingQuantities.current[itemId] = newQuantity;

      // Nếu số lượng <= 0 thì gọi xóa luôn (Giờ thì handleRemove đã tồn tại)
      if (newQuantity <= 0) {
        handleRemove(itemId);
        return;
      }

      // 3. Debounce gọi API
      debounceTimers.current[itemId] = setTimeout(async () => {
        try {
          // Lấy con số cuối cùng sau khi user ngừng spam
          const finalQty = pendingQuantities.current[itemId];

          // Kiểm tra lại lần nữa lỡ user đổi ý
          if (finalQty > 0) {
            await updateItemMutate({ itemId, quantity: finalQty }).unwrap();
          }

          // Xóa khỏi pending sau khi thành công
          delete pendingQuantities.current[itemId];
        } catch (error) {
          toast.error('Không thể cập nhật số lượng, vui lòng thử lại');
        }
      }, 400);
    },
    [updateItemMutate, handleRemove] // Update deps
  );

  // 3. CÁC HÀM TĂNG / GIẢM
  const handleIncrement = useCallback(
    (itemId: string, currentQuantity: number) => {
      // Nếu đang có một số lượng chờ xử lý (do ấn nhanh), lấy số đó cộng tiếp
      const baseQty = pendingQuantities.current[itemId] ?? currentQuantity;
      handleUpdateQuantity(itemId, baseQty + 1);
    },
    [handleUpdateQuantity]
  );

  const handleDecrement = useCallback(
    (itemId: string, currentQuantity: number) => {
      const baseQty = pendingQuantities.current[itemId] ?? currentQuantity;
      if (baseQty > 1) {
        handleUpdateQuantity(itemId, baseQty - 1);
      } else {
        handleRemove(itemId);
      }
    },
    [handleUpdateQuantity, handleRemove] // Update deps
  );

  return { handleIncrement, handleDecrement, handleRemove, handleUpdateQuantity };
}
