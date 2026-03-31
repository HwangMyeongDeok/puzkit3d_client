'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/stores';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { useGetCartQuery, useUpdateCartItemMutation } from '@/lib/api/endpoints/cartApi';
import { ROUTES } from '@/constants';
import { formatPrice } from '@/lib/utils';
import { setSelectedItems } from '@/stores/slices/checkoutSlice';
import type { CartItemDto } from '@/types/api/cart.api.types';

import { Button } from '@/components/ui/button';
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

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();

  const allItems: CartItemDto[] = cartDto?.items || [];

  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  useEffect(() => {
    router.prefetch(ROUTES.CHECKOUT);
  }, [router]);

  const instockItems: CartItemDto[] = [];
  const partnerItems: CartItemDto[] = [];

  let selectedTotal: number = 0;
  let checkedInstockCount: number = 0;
  const checkedPartnerCount: number = 0;

  allItems.forEach((item) => {
    instockItems.push(item);
    // Chỉ tính tiền và đếm số lượng được chọn nếu sản phẩm còn hàng
    if (item.itemId && checkedIds.has(item.itemId) && item.availableInventory > 0) {
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

  // Sửa lại hàm toggle: Không cho phép chọn sản phẩm hết hàng
  const toggleItem = (id: string, isOutOfStock: boolean) => {
    if (isOutOfStock) return; // Nếu hết hàng thì bỏ qua
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

  // Sửa lại hàm toggle toàn bộ: Chỉ chọn những sản phẩm CÒN HÀNG
  const toggleSectionAll = (items: CartItemDto[], checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      items.forEach((item) => {
        if (item.itemId && item.availableInventory > 0) {
          if (checked) next.add(item.itemId);
          else next.delete(item.itemId);
        }
      });
      return next;
    });
  };

  const isSectionAllChecked = (items: CartItemDto[]): boolean => {
    const validItems = items.filter((item) => item.availableInventory > 0);
    return (
      validItems.length > 0 &&
      validItems.every((item) => item.itemId && checkedIds.has(item.itemId))
    );
  };

  const isSectionPartialChecked = (items: CartItemDto[]): boolean => {
    const validItems = items.filter((item) => item.availableInventory > 0);
    return (
      validItems.some((item) => item.itemId && checkedIds.has(item.itemId)) &&
      !isSectionAllChecked(items)
    );
  };

  const handleUpdatePrice = async (itemId: string, quantity: number, newPriceDetailId: string) => {
    try {
      await updateCartItem({
        itemId,
        quantity,
        inStockProductPriceDetailId: newPriceDetailId,
      }).unwrap();
      toast.success('Cart updated with the new price!');
    } catch (error) {
      toast.error('Failed to update price. Please try again.');
    }
  };

  // Hàm xử lý hạ số lượng xuống mức tối đa kho có thể đáp ứng
  const handleUpdateToMaxInventory = async (itemId: string, maxInventory: number) => {
    try {
      await updateCartItem({
        itemId,
        quantity: maxInventory,
      }).unwrap();
      toast.success(`Quantity updated to maximum available (${maxInventory})`);
    } catch (error) {
      toast.error('Failed to update quantity.');
    }
  };

  const handleCheckout = () => {
    // 1. Kiểm tra sản phẩm bị sai giá
    const hasInvalidPriceInSelection = allItems.some(
      (item) => checkedIds.has(item.itemId) && item.isValidPrice === false
    );
    if (hasInvalidPriceInSelection) {
      toast.error('Please update the changed prices of selected items before proceeding.');
      return;
    }

    // 2. Kiểm tra sản phẩm vượt quá số lượng kho
    const hasOverStockInSelection = allItems.some(
      (item) =>
        checkedIds.has(item.itemId) &&
        item.availableInventory > 0 &&
        item.quantity > item.availableInventory
    );
    if (hasOverStockInSelection) {
      toast.error('Some selected items exceed available inventory. Please update quantities.');
      return;
    }

    setIsNavigating(true);
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
                className="border-border accent-brand text-brand h-4 w-4 cursor-pointer rounded"
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
                const isOutOfStock = item.availableInventory === 0;
                const isOverStock =
                  item.availableInventory > 0 && item.quantity > item.availableInventory;

                return (
                  <div
                    key={item.itemId}
                    className={`flex flex-col gap-2 rounded-lg p-2 transition-colors ${
                      isOutOfStock ? 'bg-secondary/40 opacity-60 grayscale-[40%]' : ''
                    }`}
                  >
                    {/* Hàng sản phẩm */}
                    <CartItemRow
                      item={item}
                      isChecked={checkedIds.has(item.itemId) && !isOutOfStock}
                      onToggle={() => toggleItem(item.itemId, isOutOfStock)}
                      onIncrement={() =>
                        !isOutOfStock && handleIncrement(item.itemId, item.quantity)
                      }
                      onDecrement={() =>
                        !isOutOfStock && handleDecrement(item.itemId, item.quantity)
                      }
                      onRemove={() => handleRemove(item.itemId)}
                    />

                    {/* CASE 1: THÔNG BÁO VƯỢT QUÁ SỐ LƯỢNG TỒN KHO */}
                    {isOverStock && (
                      <div className="flex flex-col justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                          <p className="text-xs leading-relaxed text-blue-800">
                            <span className="font-bold text-blue-900">Limited Stock!</span> Only{' '}
                            <span className="font-bold">{item.availableInventory}</span> items
                            available. Please update your cart quantity to proceed.
                          </p>
                        </div>

                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() =>
                            handleUpdateToMaxInventory(item.itemId, item.availableInventory)
                          }
                          className="h-8 w-full shrink-0 bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 sm:w-auto"
                        >
                          {isUpdating ? 'Updating...' : `Update to ${item.availableInventory}`}
                        </Button>
                      </div>
                    )}

                    {/* CASE 2: THÔNG BÁO HẾT HÀNG HOÀN TOÀN */}
                    {isOutOfStock && (
                      <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3">
                        <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                        <p className="text-destructive-foreground text-xs leading-relaxed font-medium">
                          This product is currently out of stock. Please remove it from your cart to
                          proceed with checkout.
                        </p>
                      </div>
                    )}

                    {/* CASE 3: CẢNH BÁO THAY ĐỔI GIÁ (vẫn giữ nguyên từ bước trước) */}
                    {!isOutOfStock &&
                      item.isValidPrice === false &&
                      item.newPriceDetailId &&
                      item.newUnitPrice && (
                        <div className="flex flex-col justify-between gap-3 rounded-lg border border-amber-200 bg-amber-100/60 p-3 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <p className="text-xs leading-relaxed text-amber-800">
                              <span className="font-bold text-amber-900">Price changed!</span> The
                              price for this item has changed to{' '}
                              <span className="font-bold">{formatPrice(item.newUnitPrice)}</span>{' '}
                              {item.newPriceName && `(${item.newPriceName})`}. Update to proceed.
                            </p>
                          </div>

                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={() =>
                              handleUpdatePrice(item.itemId, item.quantity, item.newPriceDetailId!)
                            }
                            className="h-8 w-full shrink-0 bg-amber-500 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600 sm:w-auto"
                          >
                            {isUpdating ? 'Updating...' : 'Update Price'}
                          </Button>
                        </div>
                      )}
                  </div>
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
