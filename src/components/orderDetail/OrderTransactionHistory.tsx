'use client';

import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  ReceiptText,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper format giống cái Dialog ở trên
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date
    .toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
    .replace(',', ' -');
};

export default function OrderTransactionHistory({ transactions }: { transactions: any[] }) {
  if (!transactions || transactions.length === 0) return null;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <ReceiptText className="text-brand h-5 w-5" />
          <h3 className="text-foreground text-lg font-bold">Payment History</h3>
        </div>
        <span className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">
          {transactions.length} Attempts
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sortedTransactions.map((txn) => {
          const currentStatus = txn.status?.toUpperCase() || 'UNKNOWN';
          const now = new Date().getTime();
          const expiryTime = new Date(txn.expiredAt).getTime();
          const isExpired = expiryTime < now;

          const isPending = currentStatus === 'PENDING' || currentStatus === 'WAITING';
          const isSuccess = ['PAID', 'SUCCESS', 'COMPLETED'].includes(currentStatus);
          const canResume = isPending && !isExpired && !!txn.paymentUrl;

          return (
            <div
              key={txn.id}
              className={`group relative flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center ${
                canResume
                  ? 'border-brand/20 bg-brand/[0.02] hover:bg-brand/[0.04]'
                  : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-1 items-center gap-4">
                {/* Icon trạng thái */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isSuccess
                      ? 'bg-emerald-100 text-emerald-600'
                      : canResume
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : canResume ? (
                    <Clock className="animate-pulse-slow h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">
                      {txn.provider || 'Payment Gateway'}
                    </p>
                    <span className="text-brand text-xs font-black">
                      {txn.amount.toLocaleString()}đ
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" /> {formatTime(txn.createdAt)}
                    </span>
                    {txn.txnRef && (
                      <span className="rounded bg-slate-200/50 px-1.5 font-mono text-[10px]">
                        ID: {txn.txnRef}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:border-none sm:pt-0">
                <div className="flex flex-col sm:items-end">
                  {isSuccess ? (
                    <span className="text-xs font-bold tracking-tight text-emerald-600 uppercase">
                      Success
                    </span>
                  ) : canResume ? (
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] font-bold text-amber-600 uppercase">
                        Awaiting Payment
                      </span>
                      <span className="text-[9px] font-medium text-amber-500/80">
                        Expires: {formatTime(txn.expiredAt)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {isExpired && isPending ? 'Expired' : txn.status || 'Failed'}
                    </span>
                  )}
                </div>

                {canResume && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="border-brand/20 text-brand hover:bg-brand ml-4 h-8 gap-1.5 rounded-lg border bg-white text-[11px] font-bold hover:text-white"
                    onClick={() => window.open(txn.paymentUrl!, '_self')}
                  >
                    Resume <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
