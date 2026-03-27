import { Banknote } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import type { GetCustomerOrderByIdResponseDto } from '@/types/api/order.api.types';

export default function OrderPaymentSummary({ order }: { order: GetCustomerOrderByIdResponseDto }) {
  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <Banknote className="text-brand h-5 w-5" />
        Payment Details
      </h3>

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Method:</span>
          <span className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-1 text-xs font-medium tracking-wider uppercase">
            {order.paymentMethod || 'COD'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status:</span>
          {order.isPaid ? (
            <span className="text-success flex items-center gap-1.5 font-medium">
              <div className="bg-success h-2 w-2 rounded-full" /> Paid
            </span>
          ) : (
            <span className="text-warning flex items-center gap-1.5 font-medium">
              <div className="bg-warning h-2 w-2 rounded-full" /> Pending Payment
            </span>
          )}
        </div>
      </div>

      <Separator className="border-dashed" />

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">{formatPrice(order.subTotalAmount ?? 0)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping Fee:</span>
          <span className="font-medium">{formatPrice(order.shippingFee ?? 0)}</span>
        </div>
        {(order.usedCoinAmountAsMoney ?? 0) > 0 && (
          <div className="text-success flex items-center justify-between">
            <span>Coin Discount:</span>
            <span className="font-medium">- {formatPrice(order.usedCoinAmountAsMoney ?? 0)}</span>
          </div>
        )}
      </div>

      <div className="bg-brand/5 border-brand/20 mt-2 rounded-lg border p-4">
        <div className="flex items-center justify-between font-bold">
          <span className="text-brand text-sm tracking-wider uppercase">Total</span>
          <span className="text-brand text-2xl">{formatPrice(order.grandTotalAmount ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
