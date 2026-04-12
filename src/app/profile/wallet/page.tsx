'use client';

import {
  useGetWalletQuery,
  useGetWalletTransactionsQuery, // IMPORT HOOK MỚI
} from '@/lib/api/endpoints/walletApi';
import { useGetCustomerOrderByIdQuery } from '@/lib/api/endpoints/orderApi';
import type { WalletTransactionDto } from '@/types/api/wallet.api.types';
import {
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Clock,
  RefreshCcw,
  ShoppingBag,
  Loader2,
  Sparkles,
  CreditCard,
  Truck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import OrderBadge from '@/components/orderDetail/OrderBadge';
import { useGetWalletConfigQuery } from '@/lib/api/endpoints/configApi';

// ----------------------------------------------------------------------
// COMPONENT CON: Hiển thị từng dòng giao dịch và fetch data Order
// ----------------------------------------------------------------------
function TransactionItem({ transaction }: { transaction: WalletTransactionDto }) {
  // 1. Gọi API lấy thông tin Order (Chỉ gọi khi giao dịch này có orderId)
  const { data: order, isLoading: isOrderLoading } = useGetCustomerOrderByIdQuery(
    transaction.orderId!,
    { skip: !transaction.orderId }
  );

  // Format số tiền
  const formatCoin = (amount: number) => new Intl.NumberFormat('en-US').format(amount);

  // 2. Map UI theo Type
  let ui = {
    icon: <ArrowUpRight className="h-5 w-5" />,
    color: 'bg-slate-100 text-slate-600',
    sign: '',
    amountColor: 'text-slate-800',
    title: transaction.type,
  };

  if (transaction.type === 'Reward') {
    ui = {
      icon: <Coins className="h-5 w-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      sign: '+',
      amountColor: 'text-emerald-600',
      title: 'Reward from Order',
    };
  } else if (transaction.type === 'Refund') {
    ui = {
      icon: <RefreshCcw className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
      sign: '+',
      amountColor: 'text-blue-600',
      title: 'Refund for Cancelled Order',
    };
  } else if (transaction.type === 'Spend') {
    ui = {
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'bg-slate-100 text-slate-600',
      sign: '-',
      amountColor: 'text-slate-800',
      title: 'Spent on Order',
    };
  }

  return (
    <div className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
      <div className="flex items-start gap-4">
        {/* Icon Trạng Thái */}
        <div
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ui.color}`}
        >
          {ui.icon}
        </div>

        {/* Thông tin Giao dịch & Order */}
        <div className="flex flex-col gap-1">
          <p className="font-medium text-slate-800">{ui.title}</p>

          {/* Nếu có orderId thì hiển thị Order Code & Status */}
          {transaction.orderId && (
            <div className="flex items-center gap-2">
              {isOrderLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <>
                  <span className="text-sm font-semibold text-blue-600 uppercase underline-offset-2 group-hover:underline">
                    #{order?.code || transaction.orderId.split('-')[0]}
                  </span>
                  {/* Hiển thị Status Badge mượt mà */}
                  {order?.status && (
                    <div className="origin-left scale-90">
                      <OrderBadge status={order.status} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <p className="text-sm text-slate-500">
            {new Date(transaction.createdAt).toLocaleString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Số tiền (+/-) */}
      <div className={`shrink-0 text-right text-lg font-bold ${ui.amountColor}`}>
        {ui.sign} {formatCoin(transaction.amount)}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT CHÍNH: Trang quản lý Ví
// ----------------------------------------------------------------------
export default function MyWalletPage() {
  const { data: wallet, isLoading: isLoadingWallet } = useGetWalletQuery();

  // GỌI API LẤY CONFIG CASHBACK
  const { data: walletConfig, isLoading: isLoadingConfig } = useGetWalletConfigQuery();

  const { data: transactions, isLoading: isLoadingHistory } = useGetWalletTransactionsQuery(
    wallet?.id ?? '',
    { skip: !wallet?.id }
  );

  const formatCoin = (amount: number) => new Intl.NumberFormat('en-US').format(amount);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-6">
        {' '}
        {/* Đổi gap-8 thành gap-6 để UI gắn kết hơn */}
        {/* ================= PHẦN 1: BANNER SỐ DƯ ================= */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-400 via-orange-500 to-orange-600 p-8 text-white shadow-lg">
          <div className="absolute -top-10 -right-10 opacity-20">
            <Coins className="h-48 w-48" />
          </div>

          <div className="relative z-10 flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-lg font-medium text-orange-50">
              <Wallet className="h-5 w-5" />
              My PuzCoin Balance
            </h2>

            {isLoadingWallet ? (
              <Skeleton className="mt-2 h-14 w-48 rounded-lg bg-white/20" />
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight">
                  {formatCoin(wallet?.balance || 0)}
                </span>
                <span className="text-xl font-medium text-orange-100 uppercase">Coin</span>
              </div>
            )}
            <p className="mt-1 text-sm text-orange-100">
              Use PuzCoins to get discounts on your next orders.
            </p>

            {/* PHẦN GIẢI THÍCH CASHBACK NẰM TRONG BANNER CAM */}
            <div className="mt-4 border-t border-orange-300/30 pt-4">
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-100" />
                <span className="text-sm font-semibold text-orange-50">
                  Earn Cashback on Completed Orders:
                </span>
              </div>

              {isLoadingConfig ? (
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-32 rounded-full bg-white/20" />
                  <Skeleton className="h-8 w-32 rounded-full bg-white/20" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/25">
                    <CreditCard className="h-4 w-4" />
                    Online Payment:{' '}
                    <span className="font-bold">
                      {walletConfig?.onlineOrderCompletedRewardPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/25">
                    <Truck className="h-4 w-4" />
                    Cash on Delivery:{' '}
                    <span className="font-bold">
                      {walletConfig?.codOrderCompletedRewardPercentage}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ================= PHẦN 2: LỊCH SỬ GIAO DỊCH ================= */}
        <Card className="border-border shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Clock className="h-5 w-5 text-slate-500" />
              Transaction History
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoadingHistory || isLoadingWallet ? (
              <div className="flex flex-col divide-y">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="flex max-h-[600px] flex-col divide-y divide-slate-100 overflow-y-auto">
                {/* Render từng Item qua Component Con */}
                {transactions
                  .slice()
                  .reverse()
                  .map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                  <Coins className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No transactions yet</h3>
                <p className="mt-1 text-slate-500">
                  When you earn or spend PuzCoins, they will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
