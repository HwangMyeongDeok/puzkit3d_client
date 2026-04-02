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

import OrderCustomerInfo from '@/components/orderDetail/OrderCustomerInfo';
import OrderPaymentSummary from '@/components/orderDetail/OrderPaymentSummary';
import OrderProductsList from '@/components/orderDetail/OrderProductsList';
import ReportIssueDialog from '@/components/orderDetail/Reportissuedialog';
import OrderHeaderCard from '@/components/orderDetail/OrderHeaderCard';
import OrderActionDialogs from '@/components/orderDetail/OrderActionDialogs';
import {
  useGetPaymentByOrderIdQuery,
  useGetPaymentTransactionsQuery,
} from '@/lib/api/endpoints/paymentApi';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useGetCustomerOrderByIdQuery(orderId!, {
    refetchOnMountOrArgChange: true,
    skip: !orderId,
  });

  const { data: paymentData } = useGetPaymentByOrderIdQuery(orderId!, {
    skip: !orderId,
  });

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

  const { data: ticketData } = useGetTicketByOrderIdQuery(orderId!, {
    skip: !orderId,
  });

  const originalTrackingData =
    deliveryData?.data?.filter((tracking: DeliveryTracking) => tracking.type === 'Original') || [];

  if (isOrderLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand h-10 w-10 animate-spin" />
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (isOrderError || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  let effectiveStatus = order.status;
  if (
    order.status &&
    ['HandedOverToDelivery', 'Delivering'].includes(order.status as string) &&
    originalTrackingData.length > 0
  ) {
    const trackingStatusLower = originalTrackingData[0].status?.toLowerCase() || '';
    if (trackingStatusLower.includes('return')) effectiveStatus = 'Returned';
    else if (trackingStatusLower.includes('delivered')) effectiveStatus = 'Delivered';
    else if (trackingStatusLower.includes('delivering')) effectiveStatus = 'Delivering';
  }

  const isCOD = order.paymentMethod === 'COD';
  const isDelivered = effectiveStatus === 'Delivered';
  const isCancelled = effectiveStatus === 'Cancelled';
  const isReturned = effectiveStatus === 'Returned';

  const canReport = !!order.orderDetails?.length && isDelivered && !ticketData;
  const canCancel = (!isCOD && order.status === 'Paid') || (isCOD && order.status === 'Waiting');

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
    } catch (error: any) {
      toast.error('Failed to cancel order');
    }
  };

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <OrderHeaderCard
              order={order}
              effectiveStatus={effectiveStatus}
              isCOD={isCOD}
              isCancelled={isCancelled}
              isReturned={isReturned}
              canCancel={canCancel}
              canReport={canReport}
              isDelivered={isDelivered}
              isCanceling={isCanceling}
              isCompleting={isCompleting}
              ticketData={ticketData}
              trackingData={originalTrackingData}
              onCancelClick={() => setConfirmCancelOpen(true)}
              onCompleteClick={() => setConfirmCompleteOpen(true)}
              onReportClick={() => setReportDialogOpen(true)}
            />

            <OrderProductsList order={order} />
          </div>

          <div className="flex flex-col gap-6">
            <OrderCustomerInfo order={order} />
            <OrderPaymentSummary order={order} payment={paymentData} transactions={transactions} />
          </div>
        </div>
      </div>

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
