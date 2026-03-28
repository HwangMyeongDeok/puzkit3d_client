'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetCustomerOrderByIdQuery,
  useCompleteOrderMutation,
  useCancelOrderMutation,
} from '@/lib/api/endpoints/orderApi';
import { useDeliveryTracking } from '@/lib/hooks/useDeliveryTracking';
import type { DeliveryTracking } from '@/types/api/delivery.api.types';
import { ORDER_STATUS_MAP } from '@/constants';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  XCircle,
  PackageSearch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Components đã tách
import OrderBadge from '@/components/order/OrderBadge';
import OrderStepper from '@/components/custom/OrderStepper';
import ReportIssueDialog from '@/components/ticket/Reportissuedialog';
import OrderCustomerInfo from '@/components/orderDetail/OrderCustomerInfo';
import OrderPaymentSummary from '@/components/orderDetail/OrderPaymentSummary';
import OrderProductsList from '@/components/orderDetail/OrderProductsList';
import { InstockOrderStatus } from '@/types/api/order.api.types';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

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

  const originalDetails = deliveryData
    ? {
        ...deliveryData,
        data: deliveryData.data.filter(
          (tracking: DeliveryTracking) => tracking.type === 'Original'
        ),
      }
    : undefined;

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
    (order.status === 'HandedOverToDelivery' || order.status === 'Delivering') &&
    originalDetails?.data &&
    originalDetails.data.length > 0
  ) {
    const latestTracking = originalDetails.data[0];
    const trackingStatusLower = latestTracking.status?.toLowerCase() || '';

    if (trackingStatusLower.includes('delivered')) {
      effectiveStatus = 'Delivered';
    } else if (trackingStatusLower.includes('delivering')) {
      effectiveStatus = 'Delivering';
    }
  }

  /* ---- Stepper Logic ---- */
  const isCOD = order.paymentMethod === 'COD';
  const isCancelled = effectiveStatus === 'Cancelled';

  // 1. Mảng Default chuẩn
  const defaultSteps = isCOD
    ? [
        ORDER_STATUS_MAP['Waiting']?.label || 'Waiting', // 👉 Đổi Pending thành Waiting cho COD
        ORDER_STATUS_MAP['Processing'].label,
        ORDER_STATUS_MAP['HandedOverToDelivery'].label,
        ORDER_STATUS_MAP['Delivering'].label,
        ORDER_STATUS_MAP['Delivered'].label,
        ORDER_STATUS_MAP['Completed'].label,
      ]
    : [
        ORDER_STATUS_MAP['Pending'].label, // Online vẫn giữ Pending -> Paid
        ORDER_STATUS_MAP['Paid'].label,
        ORDER_STATUS_MAP['Processing'].label,
        ORDER_STATUS_MAP['HandedOverToDelivery'].label,
        ORDER_STATUS_MAP['Delivering'].label,
        ORDER_STATUS_MAP['Delivered'].label,
        ORDER_STATUS_MAP['Completed'].label,
      ];

  // 2. Clone mảng
  const stepperSteps = [...defaultSteps];

  // 3. Nếu Hủy -> Chèn vào mảng
  if (isCancelled) {
    const insertIndex = isCOD ? 1 : 2;
    stepperSteps.splice(insertIndex, 0, ORDER_STATUS_MAP['Cancelled']?.label || 'Cancelled');
  }

  const statusInfo = effectiveStatus
    ? ORDER_STATUS_MAP[effectiveStatus as InstockOrderStatus]
    : undefined;

  const activeStep = statusInfo ? Math.max(0, stepperSteps.indexOf(statusInfo.label)) : 0;

  /* ---- Visibility logic ---- */
  const isDelivered = effectiveStatus === 'Delivered';
  const canReport = !!order.orderDetails?.length && isDelivered;

  // 👉 CHỈ CHO PHÉP HỦY KHI CHƯA TỚI BƯỚC PROCESSING
  const canCancel =
    (!isCOD && order.status === 'Paid') || // Online: Đã thanh toán, chưa tới Processing
    (isCOD && order.status === 'Waiting'); // COD: Thay vì Pending, giờ là Waiting

  /* ---- Handlers ---- */
  const handleConfirmComplete = async () => {
    try {
      await completeOrder(order.id).unwrap();
      setConfirmCompleteOpen(false);
      toast.success('Order successfully confirmed!', {
        description: 'Thank you for your purchase. The order has been completed.',
      });
    } catch {
      toast.error('Confirmation failed', {
        description: 'An error occurred. Please try again.',
      });
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(order.id).unwrap();
      setConfirmCancelOpen(false);
      toast.success('Order Cancelled!', {
        description: isCOD
          ? 'Your order has been cancelled successfully.'
          : 'Your order has been cancelled and 100% PuzCoin has been refunded to your wallet.',
      });
    } catch (error: any) {
      toast.error('Failed to cancel order', {
        description: error?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        {/* Header Navigation */}
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
          {/* ========== CỘT TRÁI ========== */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* 1. Status Header Card */}
            <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Order Code
                  </p>
                  <p className="text-foreground mt-1 text-2xl font-bold uppercase">
                    #{order.code || order.id.split('-')[0]}
                  </p>
                  {order.createdAt && (
                    <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end md:text-right">
                  <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Status
                  </p>
                  <OrderBadge status={effectiveStatus} />
                </div>
              </div>

              {activeStep >= 0 && (
                <div className="border-border mt-2 border-t pt-6">
                  <OrderStepper
                    steps={stepperSteps}
                    activeStep={activeStep}
                    isPaid={order.isPaid ?? false}
                    isCancelled={isCancelled}
                  />
                </div>
              )}
            </div>

            {/* 2.A BANNER HỦY ĐƠN (Chia UI linh hoạt cho COD & Online) */}
            {canCancel && (
              <div className="flex flex-col justify-between gap-5 rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-6 shadow-sm transition-all sm:flex-row sm:items-center">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="shrink-0 rounded-full bg-amber-100 p-3">
                    {isCOD ? (
                      <PackageSearch className="h-6 w-6 text-amber-600" />
                    ) : (
                      <Wallet className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg leading-tight font-bold text-amber-900">
                      {isCOD ? 'Order Received' : 'Payment Received'}
                    </h4>
                    <p className="mt-1 max-w-sm text-sm text-amber-800/80">
                      {isCOD
                        ? 'Your order is waiting. You can still cancel this order before we start processing it.'
                        : 'We are preparing your order. You can still cancel this order now and get a 100% refund in PuzCoin.'}
                    </p>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
                  <Button
                    variant="destructive"
                    className="w-full bg-red-600 shadow-md transition-transform hover:-translate-y-0.5 hover:bg-red-700 sm:w-auto"
                    onClick={() => setConfirmCancelOpen(true)}
                    disabled={isCanceling}
                  >
                    {isCanceling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {isCOD ? 'Cancel Order' : 'Cancel & Refund'}
                  </Button>
                </div>
              </div>
            )}

            {/* 2.B BANNER XÁC NHẬN NHẬN HÀNG */}
            {isDelivered && (
              <div className="flex flex-col justify-between gap-5 rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-teal-50 p-6 shadow-sm transition-all sm:flex-row sm:items-center">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="shrink-0 rounded-full bg-emerald-100 p-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg leading-tight font-bold text-emerald-800">
                      Package Delivered!
                    </h4>
                    <p className="mt-1 max-w-sm text-sm text-emerald-700/80">
                      Please inspect your items. If everything looks good, please confirm receipt to
                      complete this order.
                    </p>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                  {canReport && (
                    <Button
                      variant="outline"
                      className="w-full border-orange-200 bg-white text-orange-600 shadow-sm hover:border-orange-300 hover:bg-orange-50 sm:w-auto"
                      onClick={() => setReportDialogOpen(true)}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                    </Button>
                  )}
                  <Button
                    className="w-full bg-emerald-600 text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-emerald-700 sm:w-auto"
                    onClick={() => setConfirmCompleteOpen(true)}
                    disabled={isCompleting}
                  >
                    {isCompleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Confirm Received
                  </Button>
                </div>
              </div>
            )}

            {/* 3. Delivery Tracking Info */}
            {['HandedOverToDelivery', 'Delivering', 'Delivered'].includes(effectiveStatus || '') &&
              originalDetails?.data &&
              originalDetails.data.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                  <p className="mb-4 flex items-center gap-2 text-base font-bold text-blue-900">
                    <span className="text-xl">📦</span> Live Delivery Tracking
                  </p>
                  <div className="flex flex-col gap-4">
                    {originalDetails.data
                      .slice(0, 3)
                      .map((tracking: DeliveryTracking, index: number) => (
                        <div
                          key={tracking.id}
                          className="flex items-start gap-3 text-sm text-blue-900"
                        >
                          <div className="mt-1 flex flex-col items-center">
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-blue-600 ring-4 ring-blue-600/20' : 'bg-blue-300'}`}
                            />
                            {index !== Math.min(originalDetails.data.length, 3) - 1 && (
                              <div className="mt-1 h-full min-h-8 w-0.5 bg-blue-200" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <p
                              className={`font-semibold ${index === 0 ? 'text-blue-800' : 'text-blue-700/70'}`}
                            >
                              {tracking.status}{' '}
                              {tracking.deliveryOrderCode && ` (${tracking.deliveryOrderCode})`}
                            </p>
                            {tracking.note && (
                              <p className="mt-1 text-xs text-blue-700/80">{tracking.note}</p>
                            )}
                            {tracking.createdAt && (
                              <p className="mt-1 text-xs font-medium text-blue-600/60">
                                {new Date(tracking.createdAt).toLocaleString('en-US')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* 4. Products List */}
            <OrderProductsList order={order} />
          </div>

          {/* ========== CỘT PHẢI ========== */}
          <div className="flex flex-col gap-6">
            <OrderCustomerInfo order={order} />
            <OrderPaymentSummary order={order} />
          </div>
        </div>
      </div>

      {/* ================= DIALOGS ================= */}

      {/* Dialog: Confirm Complete */}
      <AlertDialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Confirm Received
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-base leading-relaxed">
              Are you sure you have received all items in good condition?
              <br />
              <br />
              <span className="font-semibold text-slate-700">Note:</span> After confirmation, you
              will not be able to request a return, exchange, or report missing items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={isCompleting} className="hover:bg-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              disabled={isCompleting}
              className="bg-emerald-600 shadow-md hover:bg-emerald-700 focus:ring-emerald-600"
            >
              {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, I Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Confirm Cancel */}
      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <AlertTriangle className="h-6 w-6" /> Cancel Order?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-base leading-relaxed text-slate-600">
              Are you sure you want to cancel order{' '}
              <strong>#{order?.code || order?.id?.split('-')[0]}</strong>?
              <br />
              <br />
              {!isCOD ? (
                <>
                  Since you have already paid, <strong>100% of the amount</strong> will be
                  immediately refunded to your wallet as <strong>PuzCoins</strong>. You can use
                  these coins for future purchases.
                </>
              ) : (
                <>
                  This action cannot be undone. You will need to place a new order if you change
                  your mind later.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={isCanceling} className="hover:bg-slate-100">
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelOrder();
              }}
              disabled={isCanceling}
              className="bg-red-600 text-white shadow-md hover:bg-red-700 focus:ring-red-600"
            >
              {isCanceling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isCOD ? 'Yes, Cancel Order' : 'Yes, Cancel & Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Report Issue */}
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
