'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/stores';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
import { ROUTES } from '@/constants';
import { setSelectedItems } from '@/stores/slices/checkoutSlice';
import type { CartItemDto } from '@/types/api/cart.api.types';

import CartLoading from '@/components/cart/CartLoading';
import CartEmpty from '@/components/cart/CartEmpty';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummaryBar from '@/components/cart/CartSummaryBar';

type CheckoutMode = 'instock' | 'partner' | 'mixed' | 'none';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);

  const {
    data: cartDto,
    isLoading,
    isFetching,
  } = useGetCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
  });

  const allItems: CartItemDto[] = cartDto?.items || [];

  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  useEffect(() => {
    router.prefetch(ROUTES.CHECKOUT);
  }, [router]);

  // Phân loại item (Hiện tại ông mới code cho instock, tui giữ nguyên cấu trúc này)
  const instockItems: CartItemDto[] = [];
  const partnerItems: CartItemDto[] = [];

  let selectedTotal: number = 0;
  let checkedInstockCount: number = 0;
  // Sửa const thành let vì biến này phải thay đổi giá trị
  const checkedPartnerCount: number = 0;

  allItems.forEach((item) => {
    instockItems.push(item);
    if (item.itemId && checkedIds.has(item.itemId)) {
      checkedInstockCount++;
      const itemTotal: number = item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1);
      selectedTotal += itemTotal;
    }
  });

  const hasMixedSelection: boolean = checkedInstockCount > 0 && checkedPartnerCount > 0;

  const checkoutMode: CheckoutMode = hasMixedSelection
    ? 'mixed'
    : checkedInstockCount > 0
      ? 'instock'
      : checkedPartnerCount > 0
        ? 'partner'
        : 'none';

  const selectedCount: number = checkedInstockCount + checkedPartnerCount;

  // 🚨 LỖI CŨ Ở ĐÂY: Hàm set state bị sai logic update Set
  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSectionAll = (items: CartItemDto[], checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      items.forEach((item) => {
        if (item.itemId) {
          if (checked) next.add(item.itemId);
          else next.delete(item.itemId);
        }
      });
      return next;
    });
  };

  const isSectionAllChecked = (items: CartItemDto[]): boolean =>
    items.length > 0 && items.every((item) => item.itemId && checkedIds.has(item.itemId));

  const isSectionPartialChecked = (items: CartItemDto[]): boolean =>
    items.some((item) => item.itemId && checkedIds.has(item.itemId)) && !isSectionAllChecked(items);

  const handleCheckout = () => {
    setIsNavigating(true);
    // Lưu ý: Nếu sau này mở rộng partner, cần check checkoutMode ở đây để gửi đúng data
    dispatch(setSelectedItems({ ids: Array.from(checkedIds), mode: 'instock' }));
    router.push(ROUTES.CHECKOUT);
  };

  const isPageLoading: boolean = isAuthLoading || isLoading || (isFetching && !cartDto);

  if (isPageLoading) return <CartLoading />;
  if (allItems.length === 0) return <CartEmpty />;

  return (
    <div className="container-custom pt-8 pb-28 lg:pt-12 lg:pb-12">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-3xl font-bold md:text-4xl">Shopping Cart</h1>
        {isFetching && <Loader2 className="text-brand h-5 w-5 animate-spin" />}
      </div>

      <div className="flex flex-col gap-8">
        {instockItems.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSectionAllChecked(instockItems)}
                ref={(el) => {
                  if (el) el.indeterminate = isSectionPartialChecked(instockItems);
                }}
                onChange={(e) => toggleSectionAll(instockItems, e.target.checked)}
                className="border-border accent-brand text-brand h-4 w-4 rounded"
              />
              <div className="flex items-center gap-2">
                <Package className="text-success h-5 w-5" />
                <h2 className="text-card-foreground text-lg font-bold">
                  Products
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({instockItems.length} items)
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {instockItems.map((item) => {
                return (
                  <CartItemRow
                    key={item.itemId}
                    item={item}
                    isChecked={checkedIds.has(item.itemId)}
                    onToggle={() => toggleItem(item.itemId)} // Đã sửa hàm này
                    onIncrement={() => handleIncrement(item.itemId, item.quantity)}
                    onDecrement={() => handleDecrement(item.itemId, item.quantity)}
                    onRemove={() => handleRemove(item.itemId)}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      <CartSummaryBar
        selectedCount={selectedCount}
        selectedTotal={selectedTotal}
        checkoutMode={checkoutMode}
        isNavigating={isNavigating}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
