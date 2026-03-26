'use client';

import { Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface CartSummaryBarProps {
  selectedCount: number;
  selectedTotal: number;
  checkoutMode: 'instock' | 'partner' | 'mixed' | 'none';
  isNavigating: boolean;
  onCheckout: () => void;
}

export default function CartSummaryBar({
  selectedCount,
  selectedTotal,
  checkoutMode,
  isNavigating,
  onCheckout,
}: CartSummaryBarProps) {
  // Cho phép thanh toán nếu giỏ hàng thuần 1 loại (instock hoặc partner)
  const canCheckout = checkoutMode === 'instock' || checkoutMode === 'partner';

  return (
    <div className="border-border bg-card/95 lg:bg-card fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 shadow-2xl backdrop-blur-sm lg:static lg:mt-8 lg:rounded-xl lg:border lg:px-6 lg:py-5 lg:shadow-none">
      <div className="container-custom flex items-center justify-between gap-4 lg:px-0">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">{selectedCount} items selected</span>
          <span className="text-accent text-xl font-extrabold">{formatPrice(selectedTotal)}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 1. Trạng thái HỢP LỆ ('instock' hoặc 'partner') */}
          {canCheckout && (
            <button
              disabled={isNavigating}
              onClick={onCheckout}
              className="bg-accent text-accent-foreground flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isNavigating ? (
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

          {/* 2. Trạng thái LỖI ('mixed' - Chọn lẫn lộn 2 loại không thể thanh toán chung) */}
          {checkoutMode === 'mixed' && (
            <button
              disabled
              className="bg-destructive/10 text-destructive flex cursor-not-allowed items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold opacity-80"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Cannot mix items</span>
              <span className="sm:hidden">Invalid</span>
            </button>
          )}

          {/* 3. Trạng thái RỖNG ('none' - Chưa tick chọn sản phẩm nào) */}
          {checkoutMode === 'none' && (
            <button
              disabled
              className="bg-muted text-muted-foreground flex cursor-not-allowed items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
            >
              Select products
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
