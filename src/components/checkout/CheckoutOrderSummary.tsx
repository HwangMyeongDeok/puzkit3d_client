'use client';
import React from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Lock, ShoppingBag, Coins, Plus, Minus, Receipt } from 'lucide-react';
import type { CartItemDto } from '@/types/api/cart.api.types';

interface CheckoutOrderSummaryProps {
  selectedItems: CartItemDto[];
  subtotal: number;
  shippingFee: number;
  total: number;
  isSubmitting: boolean;
  isShippingFeeLoading: boolean;
  isButtonDisabled: boolean;
  availableCoin: number;
  usedCoinInput: number;
  setUsedCoinInput: (val: number) => void;
  isUsingMaxCoin: boolean;
  setIsUsingMaxCoin: (val: boolean) => void;
}

export default function CheckoutOrderSummary({
  selectedItems,
  subtotal,
  shippingFee,
  total,
  isSubmitting,
  isShippingFeeLoading,
  isButtonDisabled,
  availableCoin,
  usedCoinInput,
  setUsedCoinInput,
  isUsingMaxCoin,
  setIsUsingMaxCoin,
}: CheckoutOrderSummaryProps) {
  const COIN_STEP = 100;
  const maxPossible = Math.min(availableCoin, subtotal + shippingFee);

  const handleToggleMax = (checked: boolean) => {
    setIsUsingMaxCoin(checked);
    if (checked) {
      const roundedMax = Math.floor(maxPossible / COIN_STEP) * COIN_STEP;
      setUsedCoinInput(roundedMax);
    } else {
      setUsedCoinInput(0);
    }
  };

  // 👉 XỬ LÝ FORMAT SỐ KHI NHẬP VÀO INPUT
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ lấy các ký tự là số (Loại bỏ dấu phẩy/chấm do user nhập)
    const rawValue = e.target.value.replace(/\D/g, '');
    let val = parseInt(rawValue, 10) || 0;

    if (val < 0) val = 0;
    if (val > maxPossible) val = maxPossible;
    setUsedCoinInput(val);
  };

  const handleBlur = () => {
    const rounded = Math.floor(usedCoinInput / COIN_STEP) * COIN_STEP;
    setUsedCoinInput(rounded);
  };

  // Giá trị hiển thị trong Input (Thêm dấu phân cách hàng nghìn)
  const displayInputValue = usedCoinInput === 0 ? '' : usedCoinInput.toLocaleString('en-US');

  return (
    <div className="border-border bg-card sticky top-20 overflow-hidden rounded-xl border shadow-sm">
      {/* --- HEADER --- */}
      <div className="border-border border-b bg-slate-50 p-5">
        <h2 className="text-card-foreground flex items-center gap-2 text-lg font-bold">
          <ShoppingBag className="text-brand h-5 w-5" />
          Order Summary{' '}
          <span className="text-muted-foreground text-sm font-normal">
            ({selectedItems.length} items)
          </span>
        </h2>
      </div>

      <div className="p-5">
        {/* --- PRODUCT LIST --- */}
        <div className="scrollbar-thin flex max-h-[280px] flex-col gap-4 overflow-y-auto pr-2">
          {selectedItems.map((item) => (
            <div key={item.itemId} className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
                <Image
                  src={item.thumbnailUrl || '/images/placeholder.webp'}
                  alt={item.name || 'Product'}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-800">{item.name}</h3>
                {item.variantName && (
                  <p className="text-muted-foreground text-[11px] italic">
                    Variant: {item.variantName}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Qty: {item.quantity}</span>
                  <span className="text-sm font-bold text-slate-700">
                    {formatPrice(item.unitPrice || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* --- SMART PUZCOIN SECTION --- */}
        {availableCoin >= COIN_STEP && (
          <div className="mb-6 space-y-4 rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2 shadow-inner">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amber-900">Pay with PuzCoin</span>
                  <span className="text-xs font-medium text-amber-700/80">
                    Balance: {formatPrice(availableCoin)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-white/50 px-2 py-1">
                <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                  Max
                </span>
                <Switch
                  checked={isUsingMaxCoin}
                  onCheckedChange={handleToggleMax}
                  className="data-[state=checked]:bg-amber-600"
                />
              </div>
            </div>

            {!isUsingMaxCoin && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-2 duration-300">
                <div className="relative">
                  <Input
                    type="text" // Đổi thành text để có thể render dấu phẩy
                    value={displayInputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter coin amount..."
                    className="border-amber-200 bg-white pr-12 font-medium shadow-sm focus-visible:ring-amber-500"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-amber-500">
                    VND
                  </span>
                </div>
                <p className="px-1 text-[11px] leading-relaxed text-amber-600/80 italic">
                  * Limit: {formatPrice(maxPossible)}. Automatically rounded to multiples of{' '}
                  {COIN_STEP} VND.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- RECEIPT CALCULATION DETAILS --- */}
        <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
          <h3 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-bold text-slate-800">
            <Receipt className="h-4 w-4 text-slate-500" /> Payment Details
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">Shipping Fee</span>
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                {isShippingFeeLoading ? (
                  <Loader2 className="text-brand h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-3 w-3 text-slate-400" /> {formatPrice(shippingFee)}
                  </>
                )}
              </span>
            </div>

            {usedCoinInput > 0 && (
              <div className="-mx-2 flex items-center justify-between rounded-md bg-emerald-50 p-2 font-bold text-emerald-600">
                <span className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4" /> Coin Applied
                </span>
                <span className="flex items-center gap-1">
                  <Minus className="h-3 w-3" /> {formatPrice(usedCoinInput)}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-slate-200" />

          {/* GRAND TOTAL */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-base font-black text-slate-800">Total</span>
              <span className="text-muted-foreground text-[10px] italic">VAT Included</span>
            </div>
            <span className="text-brand text-2xl font-black tracking-tight drop-shadow-sm">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* --- SUBMIT BUTTON --- */}
        <Button
          type="submit"
          disabled={isButtonDisabled}
          className="bg-brand hover:bg-brand/90 mt-6 w-full py-6 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Lock className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? 'Processing Order...' : 'Confirm and Place Order'}
        </Button>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          By clicking, you agree to our{' '}
          <span className="hover:text-brand cursor-pointer underline">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
