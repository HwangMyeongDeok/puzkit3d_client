'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetCustomerOrderByIdQuery,
  useCompleteOrderMutation,
  useCancelOrderMutation,
} from '@/lib/api/endpoints/orderApi';
import { useDeliveryTracking } from '@/lib/hooks/useDeliveryTracking';
import { useGetTicketByOrderIdQuery } from '@/lib/api/endpoints/supportTicketApi';
import type { DeliveryTracking } from '@/types/api/delivery.api.types';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Components
import OrderCustomerInfo from '@/components/orderDetail/OrderCustomerInfo';
import OrderPaymentSummary from '@/components/orderDetail/OrderPaymentSummary';
import OrderProductsList from '@/components/orderDetail/OrderProductsList';
import ReportIssueDialog from '@/components/orderDetail/Reportissuedialog';
import OrderHeaderCard from '@/components/orderDetail/OrderHeaderCard';
import OrderActionDialogs from '@/components/orderDetail/OrderActionDialogs';
import OrderTransactionHistory from '@/components/orderDetail/OrderTransactionHistory';
import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';

import {
  useGetPaymentByOrderIdQuery,
  useGetPaymentTransactionsQuery,
} from '@/lib/api/endpoints/paymentApi';
import { getEffectiveOrderStatus } from '@/lib/utils/getEffectiveOrderStatus';
import { InstockOrderStatus } from '@/types/api/order.api.types';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // --- API Queries ---
  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useGetCustomerOrderByIdQuery(orderId!, {
    refetchOnMountOrArgChange: true,
    skip: !orderId,
  });

  const { data: paymentData } = useGetPaymentByOrderIdQuery(orderId!, { skip: !orderId });
  const paymentId = paymentData?.paymentId;
  const { data: transactionResponse } = useGetPaymentTransactionsQuery(paymentId!, {
    skip: !paymentId,
  });
  const transactions = transactionResponse?.transactions || [];

  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();

  const { data: deliveryData } = useDeliveryTracking({
    orderId: orderId!,
    orderStatus: order?.status,
    enabled: !!order?.id,
  });

  const { data: ticketData } = useGetTicketByOrderIdQuery(orderId!, { skip: !orderId });

  // --- Loading / Error States ---
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

  // --- Logic Variables ---
  const originalTrackingData =
    deliveryData?.data?.filter((t: DeliveryTracking) => t.type === 'Original') || [];
  const effectiveStatus = getEffectiveOrderStatus(order.status, originalTrackingData);

  const isCOD = order.paymentMethod === 'COD';
  const isCoin = order.paymentMethod === 'COIN';
  const isOnline = !isCOD && !isCoin;

  const isDelivered = effectiveStatus === 'Delivered';
  const isCancelled = effectiveStatus === 'Cancelled';
  const isReturned = effectiveStatus === 'Returned';
  const isExpired = effectiveStatus === 'Expired';
  const isPendingPayment = order.status === 'Pending';

  const canReport = !!order.orderDetails?.length && isDelivered && !ticketData;
  const canPay = isOnline && isPendingPayment && !isExpired && !isCancelled;
  const canCancel =
    (isCOD && order.status === 'Waiting') ||
    (isCoin && (order.status === 'Waiting' || order.status === 'Paid')) ||
    (isOnline && (order.status === 'Pending' || order.status === 'Paid'));

  // --- Smart Payment Handler ---
  const handlePayClick = () => {
    // Tìm xem có giao dịch nào đang pending và còn hạn không
    const validPendingTxn = transactions.find((txn) => {
      const isPending =
        txn.status?.toUpperCase() === 'PENDING' || txn.status?.toUpperCase() === 'WAITING';
      const isExpired = new Date(txn.expiredAt).getTime() < new Date().getTime();
      return isPending && !isExpired && txn.paymentUrl;
    });

    if (validPendingTxn) {
      // Nếu có, đẩy thẳng sang link thanh toán cũ
      window.open(validPendingTxn.paymentUrl!, '_self');
    } else {
      // Nếu không, mở popup tạo giao dịch mới
      setIsPaymentDialogOpen(true);
    }
  };

  // --- Handlers ---
  const handleConfirmComplete = async () => {
    try {
      await completeOrder(order.id).unwrap();
      setConfirmCompleteOpen(false);
      toast.success('Order successfully confirmed!');
    } catch {
      toast.error('Confirmation failed');
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(order.id).unwrap();
      setConfirmCancelOpen(false);
      toast.success('Order Cancelled!');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="hover:bg-muted shrink-0 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Order Details</h1>
      </div>

      <div className="flex flex-col gap-5">
        {/* 1. Header Card (Status, Tracking, Actions) */}
        <OrderHeaderCard
          order={order}
          effectiveStatus={effectiveStatus}
          isCOD={isCOD}
          isCancelled={isCancelled}
          isReturned={isReturned}
          isExpired={isExpired}
          canCancel={canCancel}
          canReport={canReport}
          canPay={canPay}
          isDelivered={isDelivered}
          isCanceling={isCanceling}
          isCompleting={isCompleting}
          ticketData={ticketData}
          trackingData={originalTrackingData}
          onCancelClick={() => setConfirmCancelOpen(true)}
          onCompleteClick={() => setConfirmCompleteOpen(true)}
          onReportClick={() => setReportDialogOpen(true)}
          onPayClick={handlePayClick} // <-- Truyền hàm Smart Payment vào đây
        />

        {/* 2. Customer Info */}
        <OrderCustomerInfo order={order} />

        {/* 3. Products */}
        <OrderProductsList order={order} />

        {/* 4. Payment & Transactions Group */}
        <div className="flex flex-col gap-5">
          <OrderPaymentSummary
            order={order}
            payment={paymentData}
            transactions={transactions}
            effectiveStatus={effectiveStatus as InstockOrderStatus}
          />
          {/* Component này tự ẩn nếu mảng rỗng, nên đặt sát Summary là chuẩn */}
          <OrderTransactionHistory transactions={transactions} />
        </div>
      </div>

      {/* --- Modals --- */}
      <PaymentActionDialog
        open={isPaymentDialogOpen}
        orderId={order.id}
        onClose={() => setIsPaymentDialogOpen(false)}
        mode="history"
      />

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
