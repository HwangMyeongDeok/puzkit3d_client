'use client';

import { useState, useMemo } from 'react';
import { Loader2, CreditCard, Plus, Clock, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import {
  useGetPaymentByOrderIdQuery,
  useGetPaymentTransactionsQuery,
  useCreateTransactionMutation,
} from '@/lib/api/endpoints/paymentApi';
import { handleErrorToast } from '@/lib/utils/error-handler';

interface SmartPaymentDialogProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

export function SmartPaymentDialog({ orderId, open, onClose }: SmartPaymentDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<'VNPAY' | 'MOMO'>('VNPAY');

  // 1. Fetch thông tin Payment từ OrderId
  const { data: paymentData, isLoading: isPaymentLoading } = useGetPaymentByOrderIdQuery(orderId!, {
    skip: !orderId || !open,
  });

  // 2. Fetch danh sách Transactions từ PaymentId
  const { data: transactionResponse, isLoading: isTxnLoading } = useGetPaymentTransactionsQuery(
    paymentData?.paymentId ?? '',
    {
      skip: !paymentData?.paymentId || !open,
    }
  );

  const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation();

  const transactions = transactionResponse?.transactions || [];

  // 3. Logic lọc transaction còn hạn
  const validTransactions = useMemo(() => {
    const transactions = transactionResponse?.transactions || [];
    const now = new Date().getTime();

    return transactions.filter((txn) => {
      const status = txn.status?.toUpperCase();
      const isPending = status === 'PENDING' || status === 'WAITING';
      const isNotExpired = new Date(txn.expiredAt).getTime() > now;
      return isPending && isNotExpired && txn.paymentUrl;
    });
  }, [transactionResponse?.transactions]);

  const handleCreate = async () => {
    if (!paymentData?.paymentId) return;
    try {
      const paymentUrl = await createTransaction({
        paymentId: paymentData.paymentId,
        provider: selectedProvider,
      }).unwrap();
      if (paymentUrl) window.open(paymentUrl, '_self');
    } catch (error) {
      handleErrorToast(error, 'Failed to create payment');
    }
  };

  const formatExpiry = (dateStr: string) => {
    return new Date(dateStr)
      .toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
      .replace(',', ' -');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-[480px]">
        {isPaymentLoading || isTxnLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="text-brand h-10 w-10 animate-spin" />
            <p className="text-muted-foreground text-sm font-medium">Checking payment status...</p>
          </div>
        ) : (
          <>
            <DialogHeader className="from-brand/10 bg-gradient-to-b to-transparent px-6 pt-8 pb-4">
              <div className="bg-brand/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <CreditCard className="text-brand h-6 w-6" />
              </div>
              <DialogTitle className="text-center text-2xl font-bold">Secure Payment</DialogTitle>
              <DialogDescription className="mt-2 text-center">
                {validTransactions.length > 0
                  ? 'Continue with an active session or create a new one.'
                  : 'Select a provider to start your payment.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-6 py-4">
              {validTransactions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Active Sessions
                  </p>
                  {validTransactions.map((txn) => (
                    <button
                      key={txn.id}
                      onClick={() => window.open(txn.paymentUrl!, '_self')}
                      className="hover:border-brand hover:bg-brand/[0.02] group flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet
                          className={`h-5 w-5 ${txn.provider === 'MOMO' ? 'text-pink-500' : 'text-blue-500'}`}
                        />
                        <div className="text-left">
                          <p className="text-sm font-bold">{txn.provider || 'Gateway'}</p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3" /> Exp: {formatExpiry(txn.expiredAt)}
                          </p>
                        </div>
                      </div>
                      <Plus className="group-hover:text-brand h-4 w-4 rotate-45 text-slate-300" />
                    </button>
                  ))}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-2 text-slate-400">Or New Method</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className={`flex h-14 flex-col gap-1 rounded-2xl border-2 ${selectedProvider === 'VNPAY' ? 'border-brand bg-brand/5' : ''}`}
                  onClick={() => setSelectedProvider('VNPAY')}
                >
                  <span className="font-bold">VNPAY</span>
                </Button>
                <Button
                  variant="outline"
                  className={`flex h-14 flex-col gap-1 rounded-2xl border-2 ${selectedProvider === 'MOMO' ? 'border-pink-500 bg-pink-50' : ''}`}
                  onClick={() => setSelectedProvider('MOMO')}
                >
                  <span className="font-bold">MOMO</span>
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-2 border-t bg-slate-50 px-6 py-4">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating} className="bg-brand px-8">
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Pay with {selectedProvider}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
