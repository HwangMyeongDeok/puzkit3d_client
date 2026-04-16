'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetCustomerOrderByIdQuery,
  useCompleteOrderMutation,
  useCancelOrderMutation,
} from '@/lib/api/endpoints/orderApi';
import { useDeliveryTracking } from '@/lib/hooks/useDeliveryTracking';
import { useGetTicketByOrderIdQuery } from '@/lib/api/endpoints/supportTicketApi';
import {
  useGetPaymentByOrderIdQuery,
  useGetPaymentTransactionsQuery,
  useCreateTransactionMutation,
} from '@/lib/api/endpoints/paymentApi';

import { toast } from 'sonner';
import { Loader2, ArrowLeft, CreditCard, Clock, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Utils & Shared Components
import { getEffectiveOrderStatus } from '@/lib/utils/getEffectiveOrderStatus';
import { handleErrorToast } from '@/lib/utils/error-handler';
import { InstockOrderStatus } from '@/types/api/order.api.types';
import type { DeliveryTracking } from '@/types/api/delivery.api.types';

// Page Components
import OrderProductsList from '@/components/orderDetail/OrderProductsList';
import ReportIssueDialog from '@/components/ticket/Reportissuedialog';
import OrderHeaderCard from '@/components/orderDetail/OrderHeaderCard';
import OrderActionDialogs from '@/components/orderDetail/OrderActionDialogs';
import OrderPaymentSummary from '@/components/orderDetail/OrderPaymentSummary';
import OrderTransactionHistory from '@/components/orderDetail/OrderTransactionHistory';
import Image from 'next/image';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  // --- States ---
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [payFlowOpen, setPayFlowOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'VNPAY' | 'MOMO'>('VNPAY');

  // --- API Queries (RTK Query) ---
  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useGetCustomerOrderByIdQuery(orderId!, { refetchOnMountOrArgChange: true, skip: !orderId });

  const { data: paymentData } = useGetPaymentByOrderIdQuery(orderId!, { skip: !orderId });
  const paymentId = paymentData?.paymentId;

  const { data: transactionResponse } = useGetPaymentTransactionsQuery(paymentId ?? '', {
    skip: !paymentId,
  });

  const transactions = useMemo(() => {
    return transactionResponse?.transactions || [];
  }, [transactionResponse?.transactions]);

  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();
  const [createTransaction, { isLoading: isCreatingTxn }] = useCreateTransactionMutation();

  const { data: deliveryData } = useDeliveryTracking({
    orderId: orderId!,
    orderStatus: order?.status,
    enabled: !!order?.id,
  });

  const { data: ticketData } = useGetTicketByOrderIdQuery(orderId!, { skip: !orderId });

  // --- Logic Xử lý Giao dịch (Sử dụng useMemo để đảm bảo tính toán chính xác & hiệu năng) ---
  const validTransactions = useMemo(() => {
    const now = new Date().getTime();
    return transactions.filter((txn) => {
      const status = txn.status?.toUpperCase();
      const isPending = status === 'PENDING' || status === 'WAITING';
      const isNotExpired = new Date(txn.expiredAt).getTime() > now;
      return isPending && isNotExpired && txn.paymentUrl;
    });
  }, [transactions]);

  // --- Logic Variables ---
  const originalTrackingData =
    deliveryData?.data?.filter((t: DeliveryTracking) => t.type === 'Original') || [];
  const effectiveStatus = getEffectiveOrderStatus(order?.status, originalTrackingData);

  const isCOD = order?.paymentMethod === 'COD';
  const isCoin = order?.paymentMethod === 'COIN';
  const isOnline = !isCOD && !isCoin;

  const isDelivered = effectiveStatus === 'Delivered';
  const isCancelled = effectiveStatus === 'Cancelled';
  const isExpired = effectiveStatus === 'Expired';
  const isPendingPayment = order?.status === 'Pending';

  const canReport = !!order?.orderDetails?.length && isDelivered && !ticketData;
  const canPay = isOnline && isPendingPayment && !isExpired && !isCancelled;
  const canCancel =
    (isCOD && order?.status === 'Waiting') ||
    (isCoin && (order?.status === 'Waiting' || order?.status === 'Paid')) ||
    (isOnline && (order?.status === 'Pending' || order?.status === 'Paid'));

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    return date
      .toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
      .replace(',', ' -'); // Kết quả: 10:31 - 15/04
  };
  // --- Handlers ---
  const handlePayClick = () => setPayFlowOpen(true);

  const handleCreateNewTransaction = async () => {
    if (!paymentId) return;
    try {
      const paymentUrl = await createTransaction({
        paymentId,
        provider: selectedProvider,
      }).unwrap();

      if (paymentUrl) {
        window.open(paymentUrl, '_self');
      }
    } catch (error) {
      handleErrorToast(error, 'Failed to create new transaction');
    }
  };

  const handleConfirmComplete = async () => {
    try {
      await completeOrder(order!.id).unwrap();
      setConfirmCompleteOpen(false);
      toast.success('Order successfully confirmed!');
    } catch (error) {
      handleErrorToast(error, 'Confirmation failed');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(order!.id).unwrap();
      setConfirmCancelOpen(false);
      toast.success('Order Cancelled!');
    } catch (error) {
      handleErrorToast(error, 'Failed to cancel order');
    }
  };

  if (isOrderLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand h-10 w-10 animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading order details...</p>
      </div>
    );
  }

  if (isOrderError || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="h-10 w-10 rounded-full p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Order Details</h1>
      </div>

      <div className="flex flex-col gap-5">
        <OrderHeaderCard
          order={order}
          effectiveStatus={effectiveStatus}
          isCOD={isCOD}
          isCancelled={isCancelled}
          isExpired={isExpired}
          canCancel={canCancel}
          canReport={canReport}
          canPay={canPay}
          isDelivered={isDelivered}
          isCanceling={isCanceling}
          isCompleting={isCompleting}
          ticketData={ticketData}
          onCancelClick={() => setConfirmCancelOpen(true)}
          onCompleteClick={() => setConfirmCompleteOpen(true)}
          onReportClick={() => setReportDialogOpen(true)}
          onPayClick={handlePayClick}
        />

        <OrderProductsList order={order} />

        <div className="flex flex-col gap-5">
          <OrderPaymentSummary
            order={order}
            payment={paymentData}
            transactions={transactions}
            effectiveStatus={effectiveStatus as InstockOrderStatus}
          />
          <OrderTransactionHistory transactions={transactions} />
        </div>
      </div>

      {/* --- Smart Payment Dialog --- */}
      <Dialog open={payFlowOpen} onOpenChange={setPayFlowOpen}>
        <DialogContent className="overflow-hidden border-none p-0 shadow-2xl sm:max-w-[480px]">
          <DialogHeader className="from-brand/10 bg-gradient-to-b to-transparent px-6 pt-8 pb-4">
            <div className="bg-brand/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <CreditCard className="text-brand h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
              {validTransactions.length > 0 ? 'Secure Payment' : 'Choose Method'}
            </DialogTitle>
            <DialogDescription className="mt-2 px-4 text-center text-slate-500">
              {validTransactions.length > 0
                ? 'You have an active payment session. Please complete it to proceed.'
                : 'Please select your preferred payment provider to generate a secure link.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-4">
            {/* LOGIC MỚI: Nếu có transaction thì CHỈ hiện transaction. Nếu KHÔNG có thì CHỈ hiện Chọn phương thức */}
            {validTransactions.length > 0 ? (
              /* 1. HIỂN THỊ CÁC TRANSACTION CÒN HẠN */
              <div className="space-y-3">
                <p className="ml-1 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                  Active Sessions
                </p>
                <div className="grid gap-3">
                  {validTransactions.map((txn) => (
                    <button
                      key={txn.id}
                      onClick={() => window.open(txn.paymentUrl!, '_self')}
                      className="group border-brand/50 bg-brand/5 hover:border-brand relative flex w-full items-center justify-between rounded-xl border p-4 transition-all hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="flex w-full items-start gap-4">
                        {/* Icon Provider */}
                        <div
                          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${txn.provider === 'MOMO' ? 'bg-white text-pink-600 shadow-sm' : 'bg-white text-blue-600 shadow-sm'}`}
                        >
                          <Wallet className="h-5 w-5" />
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-800">
                              {txn.provider || 'Payment Link'}
                            </p>
                            <p className="text-brand text-sm font-bold">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(txn.amount)}
                            </p>
                          </div>

                          <div className="mt-1 flex flex-col gap-1">
                            <div className="text-[11px] font-medium text-slate-500">
                              Ref: <span className="font-mono text-slate-700">{txn.txnRef}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                              <Clock className="h-3 w-3 text-amber-500" />
                              Expires: {formatExpiry(txn.expiredAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Icon */}
                      <div className="bg-brand hover:bg-brand/90 ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-colors">
                        <ArrowLeft
                          className="h-4 w-4 rotate-135"
                          style={{ transform: 'rotate(135deg)' }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* 2. CHỌN PROVIDER ĐỂ TẠO MỚI (Chỉ hiện khi mảng validTransactions rỗng) */
              <div className="space-y-3">
                <p className="ml-1 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                  Select Payment Method
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* VNPAY Button */}
                  <button
                    onClick={() => setSelectedProvider('VNPAY')}
                    className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 ${
                      selectedProvider === 'VNPAY'
                        ? 'scale-[1.02] border-[#005BAA] bg-[#005BAA]/[0.03] shadow-md ring-1 ring-[#005BAA]'
                        : 'border-slate-200 bg-white hover:border-[#005BAA]/40 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                  >
                    {/* Active Indicator */}
                    {selectedProvider === 'VNPAY' && (
                      <div className="animate-in zoom-in absolute top-3 right-3 duration-200">
                        <CheckCircle2
                          className="h-5 w-5 text-[#005BAA]"
                          fill="currentColor"
                          stroke="white"
                        />
                      </div>
                    )}

                    {/* Logo Container */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-105">
                      <Image
                        src="/logo/Logo-VNPAY-QR.webp"
                        alt="VNPAY"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>

                    <span
                      className={`text-sm font-bold transition-colors ${selectedProvider === 'VNPAY' ? 'text-[#005BAA]' : 'text-slate-600 group-hover:text-slate-900'}`}
                    >
                      VNPAY
                    </span>
                  </button>

                  {/* MOMO Button */}
                  <button
                    onClick={() => setSelectedProvider('MOMO')}
                    className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-300 ${
                      selectedProvider === 'MOMO'
                        ? 'scale-[1.02] border-[#A50064] bg-[#A50064]/[0.03] shadow-md ring-1 ring-[#A50064]'
                        : 'border-slate-200 bg-white hover:border-[#A50064]/40 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                  >
                    {/* Active Indicator */}
                    {selectedProvider === 'MOMO' && (
                      <div className="animate-in zoom-in absolute top-3 right-3 duration-200">
                        <CheckCircle2
                          className="h-5 w-5 text-[#A50064]"
                          fill="currentColor"
                          stroke="white"
                        />
                      </div>
                    )}

                    {/* Logo Container */}
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-105">
                      <Image
                        src="/logo/Logo-MoMo-Square.webp"
                        alt="MoMo"
                        width={44}
                        height={44}
                        className="object-contain"
                      />
                    </div>

                    <span
                      className={`text-sm font-bold transition-colors ${selectedProvider === 'MOMO' ? 'text-[#A50064]' : 'text-slate-600 group-hover:text-slate-900'}`}
                    >
                      Ví MoMo
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="mt-2 border-t bg-slate-50 px-6 py-4">
            <Button
              variant="ghost"
              className="font-bold text-slate-500"
              onClick={() => setPayFlowOpen(false)}
            >
              {validTransactions.length > 0 ? 'Close' : 'Maybe Later'}
            </Button>

            {/* CHỈ hiện nút TẠO MỚI khi KHÔNG CÓ transaction nào active */}
            {validTransactions.length === 0 && (
              <Button
                onClick={handleCreateNewTransaction}
                disabled={isCreatingTxn}
                className="bg-brand shadow-brand/20 px-8 font-bold text-white shadow-lg transition-all hover:translate-y-[-1px] hover:shadow-xl"
              >
                {isCreatingTxn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  `Pay with ${selectedProvider}`
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Action Dialogs (Confirm Cancel/Complete) --- */}
      <OrderActionDialogs
        order={order}
        isCOD={isCOD}
        isCompleting={isCompleting}
        isCanceling={isCanceling}
        confirmCompleteOpen={confirmCompleteOpen}
        setConfirmCompleteOpen={setConfirmCompleteOpen}
        confirmCancelOpen={confirmCancelOpen}
        setConfirmCancelOpen={setConfirmCancelOpen}
        handleConfirmComplete={handleConfirmComplete}
        handleCancelOrder={handleCancelOrder}
      />

      {canReport && (
        <ReportIssueDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          orderId={order.id}
          orderDetails={order.orderDetails!}
        />
      )}
    </div>
  );
}
