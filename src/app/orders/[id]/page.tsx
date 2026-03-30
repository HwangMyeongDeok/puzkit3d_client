'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link'; // 👉 Thêm import Link
import {
  useGetCustomerOrderByIdQuery,
  useCompleteOrderMutation,
  useCancelOrderMutation,
} from '@/lib/api/endpoints/orderApi';
import { useDeliveryTracking } from '@/lib/hooks/useDeliveryTracking';
import { useGetTicketByOrderIdQuery } from '@/lib/api/endpoints/supportTicketApi';
import type { DeliveryTracking } from '@/types/api/delivery.api.types';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Ticket } from 'lucide-react'; // 👉 Thêm icon Ticket
import { Button } from '@/components/ui/button';

// Các Component đã tách trước đó
import OrderCustomerInfo from '@/components/orderDetail/OrderCustomerInfo';
import OrderPaymentSummary from '@/components/orderDetail/OrderPaymentSummary';
import OrderProductsList from '@/components/orderDetail/OrderProductsList';
import ReportIssueDialog from '@/components/orderDetail/Reportissuedialog';

// Các Component VỪA MỚI TÁCH
import OrderHeaderCard from '@/components/orderDetail/OrderHeaderCard';
import OrderActionBanners from '@/components/orderDetail/OrderActionBanners';
import OrderDeliveryTracking from '@/components/orderDetail/OrderDeliveryTracking';
import OrderActionDialogs from '@/components/orderDetail/OrderActionDialogs';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  // Dialog States
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // 1. Fetch Order Data
  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useGetCustomerOrderByIdQuery(orderId!, {
    refetchOnMountOrArgChange: true,
    skip: !orderId,
  });

  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();

  // 2. Fetch Delivery Tracking Data
  const { data: deliveryData } = useDeliveryTracking({
    orderId: orderId!,
    orderStatus: order?.status,
    enabled: !!order?.id,
    pollInterval: 5000,
  });

  // 3. Fetch Ticket Data để check Complaint
  const { data: ticketData, isLoading: isTicketLoading } = useGetTicketByOrderIdQuery(orderId!, {
    skip: !orderId, // Chỉ fetch khi có orderId
  });

  const originalTrackingData =
    deliveryData?.data?.filter((tracking: DeliveryTracking) => tracking.type === 'Original') || [];

  /* ---- Loading / Error states ---- */
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
        <p className="text-muted-foreground">
          The order does not exist or you do not have permission to view it.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  /* ---- Status Override Logic ---- */
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

  /* ---- Visibility & Flags logic ---- */
  const isCOD = order.paymentMethod === 'COD';
  const isDelivered = effectiveStatus === 'Delivered';
  const isCancelled = effectiveStatus === 'Cancelled';
  const isReturned = effectiveStatus === 'Returned';

  // CHECK COMPLAINT LOGIC: Có data ticket VÀ status chưa Resolved
  const hasActiveComplaint = !!ticketData && ticketData.status !== 'Resolved';

  // Cập nhật lại canReport dùng hasActiveComplaint
  const canReport = !!order.orderDetails?.length && isDelivered && !hasActiveComplaint;

  const canCancel = (!isCOD && order.status === 'Paid') || (isCOD && order.status === 'Waiting');

  /* ---- Handlers ---- */
  const handleConfirmComplete = async () => {
    try {
      await completeOrder(order.id).unwrap();
      setConfirmCompleteOpen(false);
      toast.success('Order successfully confirmed!', {
        description: 'Thank you for your purchase.',
      });
    } catch {
      toast.error('Confirmation failed', { description: 'An error occurred. Please try again.' });
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(order.id).unwrap();
      setConfirmCancelOpen(false);
      toast.success('Order Cancelled!', {
        description: isCOD
          ? 'Your order has been cancelled successfully.'
          : 'Your order has been cancelled and refunded.',
      });
    } catch (error: any) {
      toast.error('Failed to cancel order', {
        description: error?.data?.message || 'Something went wrong.',
      });
    }
  };

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        {/* 👉 Header Navigation - Đã chỉnh sửa để chứa nút View Ticket */}
        <div className="flex items-center justify-between gap-4">
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

          {/* 👉 NÚT BAY SANG TICKET */}
          {ticketData && (
            <Link
              href={`/ticket-support/${ticketData.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">View Ticket</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* CỘT TRÁI */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <OrderHeaderCard
              order={order}
              effectiveStatus={effectiveStatus}
              isCOD={isCOD}
              isCancelled={isCancelled}
              isReturned={isReturned}
            />

            <OrderActionBanners
              canCancel={canCancel}
              canReport={canReport}
              isDelivered={isDelivered}
              isCOD={isCOD}
              isCanceling={isCanceling}
              isCompleting={isCompleting}
              hasComplaint={hasActiveComplaint}
              onCancelClick={() => setConfirmCancelOpen(true)}
              onCompleteClick={() => setConfirmCompleteOpen(true)}
              onReportClick={() => setReportDialogOpen(true)}
            />

            <OrderDeliveryTracking
              effectiveStatus={effectiveStatus}
              trackingData={originalTrackingData}
            />

            <OrderProductsList order={order} />
          </div>

          {/* CỘT PHẢI */}
          <div className="flex flex-col gap-6">
            <OrderCustomerInfo order={order} />
            <OrderPaymentSummary order={order} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
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
