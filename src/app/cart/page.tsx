'use client';

import { useState } from 'react';
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
import {
  selectInstockItems,
  selectPartnerItems,
  selectCartSyncStatus,
} from '@/stores/slices/cartSlice';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { ROUTES } from '@/constants';
import OrderStepper from '@/components/custom/OrderStepper';
import { setSelectedItems } from '@/stores/slices/checkoutSlice';

import type { CartItem } from '@/types';

const PARTNER_STEPS = ['Gửi yêu cầu', 'Staff báo giá', 'Thanh toán cọc', 'Giao hàng'];

function CartItemRow({
  item,
  isChecked,
  onToggle,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  isChecked: boolean;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
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
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="text-card-foreground line-clamp-1 text-sm font-semibold">{item.name}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {item.itemType === 'partner' ? 'Giá dự kiến: ' : ''}
            {formatPrice(item.price)} / sản phẩm
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
              {item.quantity}
            </span>
            <button
              onClick={onIncrement}
              className="text-foreground/60 hover:bg-secondary flex h-8 w-8 cursor-pointer items-center justify-center transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-accent text-sm font-bold">
            {formatPrice(item.price * item.quantity)}
          </span>

          <button
            onClick={onRemove}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-2 transition-colors"
            aria-label="Xóa sản phẩm"
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
  const instockItems = useAppSelector(selectInstockItems);
  const partnerItems = useAppSelector(selectPartnerItems);
  const syncStatus = useAppSelector(selectCartSyncStatus);
  const allItems = [...instockItems, ...partnerItems];
  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSectionAll = (items: CartItem[], checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      items.forEach((item) => {
        if (checked) next.add(item.productId);
        else next.delete(item.productId);
      });
      return next;
    });
  };

  const isSectionAllChecked = (items: CartItem[]) =>
    items.length > 0 && items.every((item) => checkedIds.has(item.productId));

  const isSectionPartialChecked = (items: CartItem[]) =>
    items.some((item) => checkedIds.has(item.productId)) && !isSectionAllChecked(items);

  const checkedInstockCount = instockItems.filter((i) => checkedIds.has(i.productId)).length;
  const checkedPartnerCount = partnerItems.filter((i) => checkedIds.has(i.productId)).length;

  const hasMixedSelection = checkedInstockCount > 0 && checkedPartnerCount > 0;

  const selectedTotal = allItems
    .filter((item) => checkedIds.has(item.productId))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const selectedCount = checkedInstockCount + checkedPartnerCount;

  const checkoutMode: 'instock' | 'partner' | 'mixed' | 'none' = hasMixedSelection
    ? 'mixed'
    : checkedInstockCount > 0
      ? 'instock'
      : checkedPartnerCount > 0
        ? 'partner'
        : 'none';

  if (allItems.length === 0) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link
          href={ROUTES.PRODUCTS}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Tiếp tục mua sắm
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom pt-8 pb-28 lg:pt-12 lg:pb-12">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-3xl font-bold md:text-4xl">Giỏ hàng</h1>
        {syncStatus === 'syncing' && <Loader2 className="text-brand h-5 w-5 animate-spin" />}
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
                  Hàng có sẵn
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({instockItems.length} sản phẩm)
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {instockItems.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  isChecked={checkedIds.has(item.productId)}
                  onToggle={() => toggleItem(item.productId)}
                  onIncrement={() => handleIncrement(item.productId, item.quantity, item.variant)}
                  onDecrement={() => handleDecrement(item.productId, item.quantity, item.variant)}
                  onRemove={() => handleRemove(item.productId, item.variant)}
                />
              ))}
            </div>
          </section>
        )}

        {partnerItems.length > 0 && (
          <section>
            <div className="border-warning/20 bg-warning/5 mb-3 overflow-x-auto rounded-xl border px-4 py-3">
              <OrderStepper steps={PARTNER_STEPS} activeStep={0} />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSectionAllChecked(partnerItems)}
                ref={(el) => {
                  if (el) el.indeterminate = isSectionPartialChecked(partnerItems);
                }}
                onChange={(e) => toggleSectionAll(partnerItems, e.target.checked)}
                className="border-border accent-warning text-warning h-4 w-4 rounded"
              />
              <div className="flex items-center gap-2">
                <FileText className="text-warning h-5 w-5" />
                <h2 className="text-card-foreground text-lg font-bold">
                  Hàng đặt trước
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({partnerItems.length} sản phẩm)
                  </span>
                </h2>
              </div>
              <div className="group relative ml-auto">
                <Info className="text-muted-foreground h-4 w-4 cursor-help" />
                <div className="border-border bg-popover text-popover-foreground pointer-events-none absolute right-0 bottom-full z-10 mb-2 w-64 rounded-lg border p-3 text-xs opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  Giá cuối cùng sẽ được Staff xác nhận dựa trên tỷ giá và phí vận chuyển thực tế
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {partnerItems.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  isChecked={checkedIds.has(item.productId)}
                  onToggle={() => toggleItem(item.productId)}
                  onIncrement={() => handleIncrement(item.productId, item.quantity, item.variant)}
                  onDecrement={() => handleDecrement(item.productId, item.quantity, item.variant)}
                  onRemove={() => handleRemove(item.productId, item.variant)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {hasMixedSelection && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mt-6 flex items-center gap-3 rounded-xl border px-5 py-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="font-medium">Vui lòng thanh toán tách biệt hàng có sẵn và hàng đặt trước</p>
        </div>
      )}

      <div className="border-border bg-card/95 lg:bg-card fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 shadow-2xl backdrop-blur-sm lg:static lg:mt-8 lg:rounded-xl lg:border lg:px-6 lg:py-5 lg:shadow-none">
        <div className="container-custom flex items-center justify-between gap-4 lg:px-0">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Đã chọn {selectedCount} sản phẩm</span>
            <span className="text-accent text-xl font-extrabold">{formatPrice(selectedTotal)}</span>
          </div>

          {checkoutMode === 'instock' && (
            <button
              onClick={() => {
                dispatch(setSelectedItems({ ids: Array.from(checkedIds), mode: 'instock' }));
                router.push(ROUTES.CHECKOUT);
              }}
              className="bg-accent text-accent-foreground flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Thanh toán
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {checkoutMode === 'partner' && (
            <button
              onClick={() => {
                dispatch(setSelectedItems({ ids: Array.from(checkedIds), mode: 'partner' }));
                router.push(ROUTES.CHECKOUT);
              }}
              className="bg-warning text-warning-foreground flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <FileText className="h-4 w-4" />
              Gửi yêu cầu báo giá
            </button>
          )}

          {checkoutMode === 'mixed' && (
            <button
              disabled
              className="bg-muted text-muted-foreground flex cursor-not-allowed items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
            >
              Thanh toán
            </button>
          )}

          {checkoutMode === 'none' && (
            <button
              disabled
              className="bg-muted text-muted-foreground flex cursor-not-allowed items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
            >
              Chọn sản phẩm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
