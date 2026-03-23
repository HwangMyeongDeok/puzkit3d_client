'use client';

import { useState, useMemo, useEffect } from 'react'; // Bổ sung useEffect
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Info,
  AlertTriangle,
  Package,
  FileText,
  Loader2,
} from 'lucide-react';

import { formatPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/stores';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
import { ROUTES } from '@/constants';
import { setSelectedItems } from '@/stores/slices/checkoutSlice';

import type { CartItemDto } from '@/types/api/cart.api.types';

const PARTNER_STEPS = ['Submit Request', 'Staff Quote', 'Deposit Payment', 'Delivery'];

function CartItemRow({
  item,
  isChecked,
  onToggle,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItemDto;
  isChecked: boolean;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const isPartner = false;
  const displayPrice = item.unitPrice ?? 0;
  const quantity = item.quantity ?? 1;

  const productName = item.productDetails?.name || 'Unknown product';
  const thumbnailUrl = item.productDetails?.thumbnailUrl || '/placeholder-image.png';
  const variantColor = item.productDetails?.color || '';

  return (
    <div className="border-border bg-card flex gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          className="border-border accent-brand text-brand h-4 w-4 rounded"
        />
      </div>

      <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
        <Image src={thumbnailUrl} alt={productName} fill sizes="80px" className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="text-card-foreground line-clamp-1 text-sm font-semibold">{productName}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {isPartner ? 'Reference Price: ' : ''}
            {formatPrice(displayPrice)} / item
            {variantColor && <span className="ml-2">· {variantColor}</span>}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="border-border flex items-center rounded-lg border">
            <button
              onClick={onDecrement}
              className="text-foreground/60 hover:bg-secondary flex h-8 w-8 cursor-pointer items-center justify-center transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="border-border flex h-8 w-10 items-center justify-center border-x text-xs font-bold">
              {quantity}
            </span>
            <button
              onClick={onIncrement}
              className="text-foreground/60 hover:bg-secondary flex h-8 w-8 cursor-pointer items-center justify-center transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-accent text-sm font-bold">
            {formatPrice(item.totalPrice ?? displayPrice * quantity)}
          </span>

          <button
            onClick={onRemove}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-2 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const allItems = cartDto?.items || [];

  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // 1. STATE MỚI: Quản lý hiệu ứng loading lúc bấm nút Thanh toán
  const [isNavigating, setIsNavigating] = useState(false);

  // 2. EFFECT MỚI: Ép Next.js prefetch (tải ngầm) trang Checkout ngay khi vào Giỏ hàng
  useEffect(() => {
    router.prefetch(ROUTES.CHECKOUT);
  }, [router]);

  const instockItems: CartItemDto[] = [];
  const partnerItems: CartItemDto[] = [];
  let selectedTotal = 0;
  let checkedInstockCount = 0;
  const checkedPartnerCount = 0;

  allItems.forEach((item) => {
    instockItems.push(item);
    if (item.itemId && checkedIds.has(item.itemId)) {
      checkedInstockCount++;
      selectedTotal += item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1);
    }
  });

  const hasMixedSelection = checkedInstockCount > 0 && checkedPartnerCount > 0;
  const checkoutMode: 'instock' | 'partner' | 'mixed' | 'none' = hasMixedSelection
    ? 'mixed'
    : checkedInstockCount > 0
      ? 'instock'
      : checkedPartnerCount > 0
        ? 'partner'
        : 'none';

  const selectedCount = checkedInstockCount + checkedPartnerCount;

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  const isSectionAllChecked = (items: CartItemDto[]) =>
    items.length > 0 && items.every((item) => item.itemId && checkedIds.has(item.itemId));

  const isSectionPartialChecked = (items: CartItemDto[]) =>
    items.some((item) => item.itemId && checkedIds.has(item.itemId)) && !isSectionAllChecked(items);

  const isPageLoading = isAuthLoading || isLoading || (isFetching && !cartDto);

  if (isPageLoading) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 className="text-brand mb-4 h-10 w-10 animate-spin" />
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">You don't have any products in your cart yet.</p>
        <Link
          href={ROUTES.PRODUCTS}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

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
              {instockItems.map((item) => (
                <CartItemRow
                  key={item.id || item.itemId}
                  item={item}
                  isChecked={item.itemId ? checkedIds.has(item.itemId) : false}
                  onToggle={() => item.itemId && toggleItem(item.itemId)}
                  onIncrement={() =>
                    handleIncrement(item.itemId as string, item.quantity as number)
                  }
                  onDecrement={() =>
                    handleDecrement(item.itemId as string, item.quantity as number)
                  }
                  onRemove={() => handleRemove(item.itemId as string)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="border-border bg-card/95 lg:bg-card fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 shadow-2xl backdrop-blur-sm lg:static lg:mt-8 lg:rounded-xl lg:border lg:px-6 lg:py-5 lg:shadow-none">
        <div className="container-custom flex items-center justify-between gap-4 lg:px-0">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">{selectedCount} items selected</span>
            <span className="text-accent text-xl font-extrabold">{formatPrice(selectedTotal)}</span>
          </div>

          {checkoutMode === 'instock' && (
            <button
              disabled={isNavigating} // 3. VÔ HIỆU HÓA nút khi đang chuyển trang
              onClick={() => {
                setIsNavigating(true); // 4. BẬT loading state
                dispatch(setSelectedItems({ ids: Array.from(checkedIds), mode: 'instock' }));
                router.push(ROUTES.CHECKOUT);
              }}
              className="bg-accent text-accent-foreground flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isNavigating ? ( // 5. ĐỔI UI sang trạng thái chờ
                <>
                  Processing...
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {checkoutMode === 'none' && (
            <button
              disabled
              className="bg-muted text-muted-foreground flex cursor-not-allowed items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
            >
              Select product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
