'use client';
import React from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Lock, ShoppingBag, Coins } from 'lucide-react';
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
  // Đã sửa lại step thành 100
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0;
    if (val < 0) val = 0;
    if (val > maxPossible) val = maxPossible;
    setUsedCoinInput(val);
  };

  const handleBlur = () => {
    const rounded = Math.floor(usedCoinInput / COIN_STEP) * COIN_STEP;
    setUsedCoinInput(rounded);
  };

  return (
    <div className="border-border bg-card sticky top-20 rounded-xl border p-6 shadow-sm">
      <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
        <ShoppingBag className="text-brand h-5 w-5" />
        Order Summary ({selectedItems.length} items)
      </h2>

      {/* --- PRODUCT LIST --- */}
      <div className="scrollbar-thin flex max-h-72 flex-col gap-4 overflow-y-auto pr-2">
        {selectedItems.map((item) => (
          <div key={item.itemId} className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-slate-50">
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
                <span className="text-sm font-semibold text-slate-700">
                  {formatPrice(item.unitPrice || 0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-5" />

      {/* --- SMART PUZCOIN SECTION --- */}
      {availableCoin >= COIN_STEP && (
        <div className="mb-5 space-y-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-200 p-1.5 shadow-sm">
                <Coins className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-amber-900">PuzCoin Wallet</span>
                <span className="text-[10px] font-medium text-amber-700/80">
                  Available: {formatPrice(availableCoin)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="animate-in fade-in slide-in-from-top-1 space-y-2 duration-200">
              <div className="relative">
                <Input
                  type="number"
                  value={usedCoinInput === 0 ? '' : usedCoinInput}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter coin amount..."
                  className="border-amber-200 bg-white pr-10 focus-visible:ring-amber-500"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-amber-400">
                  VND
                </span>
              </div>
              <p className="px-1 text-[10px] leading-relaxed text-amber-600/70 italic">
                * Max usable is {formatPrice(maxPossible)}. Automatically rounded to multiples of{' '}
                {COIN_STEP} VND.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- CALCULATION DETAILS --- */}
      <div className="flex flex-col gap-3 text-sm">
        <div className="text-muted-foreground flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-slate-700">{formatPrice(subtotal)}</span>
        </div>

        <div className="text-muted-foreground flex items-center justify-between">
          <span>Shipping Fee</span>
          <span className="font-medium text-slate-700">
            {isShippingFeeLoading ? (
              <Loader2 className="text-brand h-3 w-3 animate-spin" />
            ) : (
              `+ ${formatPrice(shippingFee)}`
            )}
          </span>
        </div>

        {usedCoinInput > 0 && (
          <div className="flex items-center justify-between font-bold text-emerald-600">
            <span className="flex items-center gap-1">
              <Coins className="h-3 w-3" /> Coin Applied
            </span>
            <span>- {formatPrice(usedCoinInput)}</span>
          </div>
        )}
      </div>

      <Separator className="my-5" />

      {/* --- GRAND TOTAL --- */}
      <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <span className="text-base font-bold text-slate-700">Grand Total</span>
        <div className="flex flex-col items-end">
          <span className="text-brand text-2xl font-black tracking-tight">
            {formatPrice(total)}
          </span>
          <span className="text-muted-foreground text-[10px] italic">VAT Included</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isButtonDisabled}
        className="bg-brand hover:bg-brand/90 mt-6 w-full py-7 text-base font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Lock className="mr-2 h-4 w-4" />
        )}
        {isSubmitting ? 'Processing Order...' : 'Confirm and Place Order'}
      </Button>

      <p className="text-muted-foreground mt-4 text-center text-[10px]">
        By clicking, you agree to our Terms of Service
      </p>
    </div>
  );
}
