import { Banknote } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OrderPaymentSummaryProps {
  paymentMethod?: string;
  isPaid?: boolean;
  subTotalAmount?: number;
  shippingFee?: number;
  usedCoinAmountAsMoney?: number;
  grandTotalAmount?: number;
}

export function OrderPaymentSummary({
  paymentMethod,
  isPaid,
  subTotalAmount,
  shippingFee,
  usedCoinAmountAsMoney,
  grandTotalAmount,
}: OrderPaymentSummaryProps) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-md">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Banknote className="h-5 w-5 text-blue-600" />
          Payment Details
        </h3>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Payment Method:</span>
            <span className="rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 uppercase">
              {paymentMethod || 'COD'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Status:</span>
            {isPaid ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-600" /> Paid
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-orange-600">
                <div className="h-2 w-2 rounded-full bg-orange-600" /> Pending
              </span>
            )}
          </div>
        </div>

        <Separator className="border-slate-100" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Subtotal:</span>
            <span className="text-sm font-medium text-slate-900">
              ₫{subTotalAmount?.toLocaleString('en-US') || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Shipping Fee:</span>
            <span className="text-sm font-medium text-slate-900">
              ₫{shippingFee?.toLocaleString('en-US') || 0}
            </span>
          </div>
          {(usedCoinAmountAsMoney ?? 0) > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-sm">Discount (Coins):</span>
              <span className="font-medium">
                -₫{(usedCoinAmountAsMoney ?? 0).toLocaleString('en-US')}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 rounded-lg border border-blue-200 bg-linear-to-r from-blue-50 to-blue-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600 uppercase">Total</span>
            <span className="text-3xl font-bold text-blue-600">
              ₫{grandTotalAmount ? grandTotalAmount.toLocaleString('en-US') : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
