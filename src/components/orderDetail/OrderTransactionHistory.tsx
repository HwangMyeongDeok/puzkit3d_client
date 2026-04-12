'use client';

import { ExternalLink, CheckCircle2, XCircle, Clock, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TransactionDto } from '@/types/api/payment.api.types';

interface OrderTransactionHistoryProps {
  transactions?: TransactionDto[] | null;
}

export default function OrderTransactionHistory({ transactions }: OrderTransactionHistoryProps) {
  if (!transactions || transactions.length === 0) return null;

  // Sắp xếp transaction mới nhất lên đầu (dựa vào createdAt)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
      <div className="border-border flex items-center gap-2 border-b pb-4">
        <ReceiptText className="text-brand h-5 w-5" />
        <h3 className="text-foreground text-lg font-bold">Payment History</h3>
      </div>

      <div className="flex flex-col gap-3">
        {sortedTransactions.map((txn) => {
          // Xử lý status an toàn, đưa về chữ hoa để dễ check
          const currentStatus = txn.status?.toUpperCase() || 'UNKNOWN';

          // Kiểm tra xem giao dịch còn hạn không
          const isExpired = new Date(txn.expiredAt).getTime() < new Date().getTime();
          const isPending = currentStatus === 'PENDING' || currentStatus === 'WAITING';
          const isSuccess =
            currentStatus === 'PAID' ||
            currentStatus === 'SUCCESS' ||
            currentStatus === 'COMPLETED';

          // Chỉ cho phép thanh toán tiếp nếu đang Pending, chưa hết hạn và có link
          const canResume = isPending && !isExpired && !!txn.paymentUrl;

          return (
            <div
              key={txn.id}
              className={`flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center ${
                canResume ? 'border-brand/30 bg-brand/5' : 'border-muted bg-muted/20'
              }`}
            >
              <div className="flex flex-col gap-1">
                <p className="text-foreground font-semibold">
                  {txn.provider || 'Payment Gateway'} -{' '}
                  <span className="text-brand">{txn.amount.toLocaleString()} VND</span>
                </p>

                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span>{new Date(txn.createdAt).toLocaleString('en-GB')}</span>

                  {txn.txnRef && <span className="font-mono opacity-70">Ref: {txn.txnRef}</span>}

                  {/* Status Badge */}
                  {isSuccess ? (
                    <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                    </span>
                  ) : canResume ? (
                    <span className="flex items-center gap-1 font-medium text-orange-600 dark:text-orange-500">
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-500">
                      <XCircle className="h-3.5 w-3.5" />
                      {isExpired && isPending ? 'Expired' : txn.status || 'Failed'}
                    </span>
                  )}
                </div>
              </div>

              {/* Nút Tiếp tục thanh toán */}
              {canResume && (
                <Button
                  size="sm"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => window.open(txn.paymentUrl!, '_self')}
                >
                  Pay Now <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
