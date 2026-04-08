'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Ticket,
  Truck,
  ChevronDown,
  ChevronUp,
  Copy,
  Package,
  CalendarClock,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import OrderBadge from '@/components/orderDetail/OrderBadge';
import OrderStepper from '@/components/orderDetail/OrderStepper';
import { ORDER_STATUS_MAP } from '@/constants';
import { InstockOrderStatus } from '@/types/api/order.api.types';
import type { DeliveryTracking } from '@/types/api/delivery.api.types';

export default function OrderHeaderCard({
  order,
  effectiveStatus,
  isCOD,
  isCancelled,
  isReturned,
  canCancel,
  canReport,
  isDelivered,
  isCanceling,
  isCompleting,
  ticketData,
  trackingData,
  onCancelClick,
  onCompleteClick,
  onReportClick,
}: any) {
  const [showFullTracking, setShowFullTracking] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const defaultSteps = isCOD
    ? [
        ORDER_STATUS_MAP['Waiting']?.label,
        ORDER_STATUS_MAP['Processing'].label,
        ORDER_STATUS_MAP['HandedOverToDelivery'].label,
        ORDER_STATUS_MAP['Delivering'].label,
        ORDER_STATUS_MAP['Delivered'].label,
        ORDER_STATUS_MAP['Completed'].label,
      ]
    : [
        ORDER_STATUS_MAP['Pending'].label,
        ORDER_STATUS_MAP['Paid'].label,
        ORDER_STATUS_MAP['Processing'].label,
        ORDER_STATUS_MAP['HandedOverToDelivery'].label,
        ORDER_STATUS_MAP['Delivering'].label,
        ORDER_STATUS_MAP['Delivered'].label,
        ORDER_STATUS_MAP['Completed'].label,
      ];

  const stepperSteps = [...defaultSteps];
  if (isCancelled) {
    const insertIndex = isCOD ? 1 : 2;
    stepperSteps.splice(insertIndex, 0, ORDER_STATUS_MAP['Cancelled']?.label || 'Cancelled');
  }
  const returnedLabel = ORDER_STATUS_MAP['Returned']?.label || 'Returned';
  if (isReturned) {
    const deliveringLabel = ORDER_STATUS_MAP['Delivering']?.label;
    const deliveringIndex = stepperSteps.indexOf(deliveringLabel);
    if (deliveringIndex !== -1) {
      stepperSteps.splice(deliveringIndex + 1, 0, returnedLabel);
    }
  }

  const statusInfo = effectiveStatus
    ? ORDER_STATUS_MAP[effectiveStatus as InstockOrderStatus] || { label: effectiveStatus }
    : undefined;

  const activeStep = (() => {
    if (isReturned) {
      const idx = stepperSteps.indexOf(returnedLabel);
      return idx !== -1 ? idx : 0;
    }
    const statusInfo = effectiveStatus
      ? ORDER_STATUS_MAP[effectiveStatus as InstockOrderStatus] || { label: effectiveStatus }
      : undefined;
    if (!statusInfo) return 0;
    return Math.max(0, stepperSteps.indexOf(statusInfo.label));
  })();

  // 👉 ĐÃ FIX: Cho phép hiển thị ở trạng thái Completed và Returned
  const showTracking =
    ['HandedOverToDelivery', 'Delivering', 'Delivered', 'Completed'].includes(
      effectiveStatus || ''
    ) && trackingData?.length > 0;

  const isTicketResolved = ticketData?.status === 'Resolved';
  const hasActiveComplaint = ticketData && !isTicketResolved;

  // 👉 Lấy data tracking mới nhất của lần giao đầu
  const latestTracking = trackingData?.[0] as DeliveryTracking | undefined;
  // 👉 Hàm Copy Mã vận đơn
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied');
  };

  return (
    <div className="bg-card border-border flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
      {/* KHỐI 1: THÔNG TIN CƠ BẢN VÀ ACTIONS GÓC PHẢI */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Cột trái: Mã đơn & Ngày */}
        <div>
          <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Order Code
          </p>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-foreground text-2xl font-bold uppercase">
              #{order.code || order.id.split('-')[0]}
            </p>
            <OrderBadge status={effectiveStatus} />
          </div>
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

        {/* Cột phải: Control Center (Các nút hành động) */}
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {/* Nút Cancel */}
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onCancelClick}
                disabled={isCanceling}
              >
                {isCanceling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                {isCOD ? 'Cancel Order' : 'Cancel & Refund'}
              </Button>
            )}

            {/* Nút View Ticket */}
            {ticketData && (
              <Link
                href={`/profile/ticket-support/${ticketData.id}`}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold shadow-sm transition-colors ${
                  isTicketResolved
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                }`}
              >
                <Ticket className="h-4 w-4" />
                {isTicketResolved ? 'View Resolution' : 'View Active Ticket'}
              </Link>
            )}

            {/* Cụm nút nhận hàng / Report */}
            {isDelivered && (
              <>
                {canReport && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    onClick={onReportClick}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                  </Button>
                )}

                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={onCompleteClick}
                  disabled={isCompleting || hasActiveComplaint}
                >
                  {isCompleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Confirm Received
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KHỐI 2: STEPPER */}
      {activeStep >= 0 && (
        <div className="border-border border-t pt-6">
          <OrderStepper
            steps={stepperSteps}
            activeStep={activeStep}
            isPaid={order.isPaid ?? false}
            isCancelled={isCancelled}
            isReturned={isReturned}
          />
        </div>
      )}

      {/* KHỐI 3: COMPACT TRACKING GẤP GỌN */}
      {showTracking && latestTracking && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          {/* HEADER CỦA TRACKING CARD */}
          <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              {/* Mã vận đơn (deliveryOrderCode) */}
              {latestTracking.deliveryOrderCode && (
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  <Package className="h-4 w-4 text-slate-500" />
                  <span className="text-xs text-slate-500">Waybill:</span>
                  <span className="font-mono text-sm font-bold text-slate-800">
                    {latestTracking.deliveryOrderCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-6 w-6 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleCopyCode(latestTracking.deliveryOrderCode)}
                    title="Copy Waybill Code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Ngày giao dự kiến (expectedDeliveryDate) */}
              {latestTracking.expectedDeliveryDate && effectiveStatus === 'Delivering' && (
                <div className="flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                  <CalendarClock className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">
                    Expected:{' '}
                    {new Date(latestTracking.expectedDeliveryDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* TOGGLE MỞ RỘNG CHI TIẾT */}
          <div
            className="flex cursor-pointer items-center justify-between pt-4 transition-opacity hover:opacity-80"
            onClick={() => setShowFullTracking(!showFullTracking)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Latest Update</p>
                <p className="text-sm font-medium text-blue-600">{latestTracking.status}</p>
              </div>
            </div>
            {showFullTracking ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>

          {/* CHI TIẾT LỊCH SỬ TRACKING */}
          {showFullTracking && (
            <div className="mt-4 flex flex-col gap-5 border-t border-slate-200 pt-5">
              {trackingData.slice(0, 5).map((tracking: DeliveryTracking, index: number) => (
                <div key={tracking.id} className="relative flex items-start gap-4 text-sm">
                  {/* Timeline Line */}
                  {index !== Math.min(trackingData.length, 5) - 1 && (
                    <div className="absolute top-6 bottom-[-20px] left-2.5 w-0.5 bg-slate-200" />
                  )}

                  {/* Timeline Dot */}
                  <div className="relative z-10 mt-1 flex flex-col items-center">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${index === 0 ? 'bg-blue-100 ring-2 ring-blue-600/20' : 'bg-slate-100'}`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Timeline Content */}
                  <div className="flex-1 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                    <p
                      className={`font-semibold ${index === 0 ? 'text-slate-800' : 'text-slate-600'}`}
                    >
                      {tracking.status}
                    </p>

                    {tracking.createdAt && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(tracking.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}

                    {/* Hiển thị Note của Shipper */}
                    {tracking.note && (
                      <div className="mt-2 border-l-2 border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-600 italic">
                        "{tracking.note}"
                      </div>
                    )}

                    {/* Hiển thị Ảnh giao hàng (handOverImageUrl) */}
                    {tracking.handOverImageUrl && (
                      <div className="mt-3">
                        <p className="mb-1 text-[11px] font-medium text-slate-500">
                          Proof of Delivery:
                        </p>
                        <div
                          className="relative h-20 w-20 cursor-zoom-in overflow-hidden rounded-md border border-slate-200 shadow-sm"
                          onClick={() => setZoomedImage(tracking.handOverImageUrl)}
                        >
                          <Image
                            src={tracking.handOverImageUrl}
                            alt="Delivery Proof"
                            fill
                            className="object-cover transition-transform hover:scale-110"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Phóng to Ảnh Giao Hàng */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-black">
            <Image src={zoomedImage} alt="Zoomed Delivery Proof" fill className="object-contain" />
            <Button
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/80"
              size="icon"
              onClick={() => setZoomedImage(null)}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
