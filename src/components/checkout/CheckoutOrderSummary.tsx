import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Lock, ShoppingBag } from 'lucide-react';

// Import type đàng hoàng từ file của ông
import type { CartItemDto } from '@/types/api/cart.api.types';

interface CheckoutOrderSummaryProps {
  selectedItems: CartItemDto[]; // <-- Đã đổi từ any[] sang CartItemDto[]
  subtotal: number;
  shippingFee: number;
  total: number;
  isSubmitting: boolean;
  isShippingFeeLoading: boolean;
  isButtonDisabled: boolean;
}

export default function CheckoutOrderSummary({
  selectedItems,
  subtotal,
  shippingFee,
  total,
  isSubmitting,
  isShippingFeeLoading,
  isButtonDisabled,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="border-border bg-card sticky top-20 rounded-xl border p-6 shadow-sm">
      <h2 className="text-card-foreground mb-5 flex items-center gap-2 text-lg font-bold">
        <ShoppingBag className="text-brand h-5 w-5" />
        Order Summary ({selectedItems.length} items)
      </h2>

      {/* Danh sách sản phẩm chi tiết */}
      <div className="scrollbar-thin flex max-h-80 flex-col gap-4 overflow-y-auto pr-2">
        {selectedItems.map((item: CartItemDto) => (
          <div key={item.itemId} className="flex gap-3">
            <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={item?.thumbnailUrl || ''}
                alt={item?.name || 'Product Image'}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <p className="text-card-foreground truncate text-sm font-semibold" title={item?.name}>
                {item?.name}
              </p>

              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">
                  {formatPrice(item.unitPrice ?? 0)} <span className="text-xs">x</span>{' '}
                  {item.quantity}
                </span>
                <span className="text-card-foreground text-sm font-bold">
                  {formatPrice((item.unitPrice ?? 0) * (item.quantity ?? 1))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-5" />

      {/* Bảng tính tiền chi tiết */}
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal (Provisional)</span>
          <span className="text-card-foreground font-semibold">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping Fee</span>
          <span className="text-card-foreground flex items-center font-semibold">
            {isShippingFeeLoading ? (
              <Loader2 className="text-brand h-4 w-4 animate-spin" />
            ) : shippingFee === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `+ ${formatPrice(shippingFee)}`
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount / Coins</span>
          <span className="font-semibold text-green-600">- {formatPrice(0)}</span>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="bg-secondary/30 flex items-center justify-between rounded-lg border p-4">
        <div>
          <span className="text-card-foreground block text-base font-bold">Grand Total</span>
          <span className="text-muted-foreground text-[10px]">(VAT included if applicable)</span>
        </div>
        <span className="text-brand text-2xl font-extrabold">{formatPrice(total)}</span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isButtonDisabled}
        className="mt-6 w-full gap-2 rounded-xl py-6 text-base font-bold shadow-lg transition-all hover:scale-[1.02]"
      >
        <Lock className="h-4 w-4" />
        {isSubmitting ? 'Processing...' : 'Place Order Securely'}
      </Button>

      <p className="text-muted-foreground mt-4 text-center text-[11px] leading-relaxed">
        By placing an order, you agree to PuzKit3D's <br /> Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
