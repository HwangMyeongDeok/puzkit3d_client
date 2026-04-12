'use client';

import { useState, useEffect } from 'react';
import {
  Banknote,
  Receipt,
  CreditCard,
  Coins,
  Truck,
  CheckCircle2,
  Clock,
  Minus,
  Plus,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import type {
  GetCustomerOrderByIdResponseDto,
  InstockOrderStatus,
} from '@/types/api/order.api.types';
import type { GetPaymentByOrderIdResponse, TransactionDto } from '@/types/api/payment.api.types';

interface OrderPaymentSummaryProps {
  order: GetCustomerOrderByIdResponseDto;
  payment?: GetPaymentByOrderIdResponse;
  transactions?: TransactionDto[];
  effectiveStatus: InstockOrderStatus;
}

// ⏱️ COMPONENT NHỎ: Đồng hồ đếm ngược
function PaymentCountdown({ expiredAt }: { expiredAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiration = new Date(expiredAt).getTime();
      const distance = expiration - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('Expired');
        setIsExpired(true);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt]);

  if (isExpired) {
    return <span className="mt-1 text-xs font-bold text-red-500">Payment Expired</span>;
  }

  return (
    <span className="mt-1 text-[11px] font-medium text-amber-600/80">
      Pay before: <span className="font-bold tabular-nums">{timeLeft}</span>
    </span>
  );
}

export default function OrderPaymentSummary({
  order,
  payment,
  transactions,
  effectiveStatus,
}: OrderPaymentSummaryProps) {
  const isCOD = order.paymentMethod === 'COD';
  const usedCoin = order.usedCoinAmount ?? 0;
  const hasCoinDiscount = usedCoin > 0;

  const latestTransaction = transactions?.[0];

  const originalTotal = (order.subTotalAmount ?? 0) + (order.shippingFee ?? 0);
  const amountToPay = order.grandTotalAmount ?? 0;

  return (
    <div className="bg-card border-border flex flex-col gap-6 overflow-hidden rounded-xl border p-6 shadow-sm">
      {/* HEADER */}
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
        <Receipt className="text-brand h-5 w-5" />
        Payment Summary
      </h3>

      {/* 1. STATUS & METHOD BLOCK */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
            {isCOD ? <Truck className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
            Payment Method
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-bold tracking-wider text-slate-700 uppercase shadow-sm">
            {order.paymentMethod || 'COD'}
          </span>
        </div>

        <Separator className="bg-slate-200" />

        <div className="flex items-start justify-between">
          <span className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Banknote className="h-4 w-4" />
            Payment Status
          </span>

          <div className="flex flex-col items-end text-right">
            {order.isPaid ? (
              <>
                <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Paid Successfully
                </span>
                {latestTransaction && (
                  <div className="mt-1.5 flex flex-col items-end">
                    <span className="text-[11px] font-medium text-slate-500">
                      via{' '}
                      <span className="font-bold text-slate-700">{latestTransaction.provider}</span>
                    </span>
                    <span className="mt-0.5 font-mono text-[10px] text-slate-400 uppercase">
                      TXN: {latestTransaction.transactionNo || latestTransaction.txnRef || 'N/A'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {effectiveStatus === 'Pending' && (
                  <>
                    <span className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
                      <Clock className="h-4 w-4 animate-pulse" />
                      {effectiveStatus}
                    </span>
                    {!isCOD && payment?.expiredAt && (
                      <PaymentCountdown expiredAt={payment.expiredAt} />
                    )}
                  </>
                )}

                {effectiveStatus === 'Expired' && (
                  <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                    <Minus className="h-4 w-4" /> {effectiveStatus}
                  </span>
                )}

                {(effectiveStatus === 'Cancelled' || effectiveStatus === 'Rejected') && (
                  <span className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
                    <Minus className="h-4 w-4" /> {effectiveStatus}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. THE MATH */}
      <div className="flex flex-col gap-3.5 px-1 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium text-slate-800">
            {formatPrice(order.subTotalAmount ?? 0)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping Fee</span>
          <span className="flex items-center gap-1 font-medium text-slate-800">
            <Plus className="h-3 w-3 text-slate-400" /> {formatPrice(order.shippingFee ?? 0)}
          </span>
        </div>

        <Separator className="my-1 border-dashed border-slate-200 bg-transparent" />

        <div className="flex items-center justify-between font-semibold text-slate-800">
          <span>Total Order Value</span>
          <span>{formatPrice(originalTotal)}</span>
        </div>

        {hasCoinDiscount && (
          <div className="-mx-2 mt-1 flex items-center justify-between rounded-lg border border-emerald-100/50 bg-emerald-50/70 p-3 font-bold text-emerald-600">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4" /> PuzCoin Applied
              </span>
              <span className="ml-6 text-[11px] font-medium text-emerald-600/70">
                Used {usedCoin.toLocaleString('en-US')} coins
              </span>
            </div>
            <span className="flex items-center gap-1 text-base">
              <Minus className="h-4 w-4" /> {formatPrice(usedCoin)}
            </span>
          </div>
        )}
      </div>

      <Separator className="border-dashed border-slate-200 bg-transparent" />

      {/* 3. FINAL AMOUNT TO PAY */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-800">
              {order.isPaid ? 'Total Paid' : 'Amount to Pay'}
            </span>
            <span className="text-muted-foreground text-[11px] italic">
              Via {order.paymentMethod || 'COD'}
            </span>
          </div>
          <span className="text-brand text-2xl font-black tracking-tight drop-shadow-sm">
            {formatPrice(amountToPay)}
          </span>
        </div>

        <div className="bg-brand/5 border-brand/20 rounded-lg border p-3">
          <p className="text-brand/80 text-center text-xs leading-relaxed font-medium">
            {order.isPaid
              ? `Thank you! You have successfully paid ${formatPrice(amountToPay)}.`
              : `Please prepare ${formatPrice(amountToPay)} ${isCOD ? 'in cash ' : ''}to complete your order.`}
          </p>
        </div>
      </div>
    </div>
  );
}
