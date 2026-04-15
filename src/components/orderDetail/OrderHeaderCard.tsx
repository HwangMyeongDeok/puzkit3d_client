'use client';

import Link from 'next/link';
import {
  Calendar,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Ticket,
  CreditCard,
  User, // Đã thêm
  Phone, // Đã thêm
  Mail, // Đã thêm
  MapPin, // Đã thêm
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderBadge from '@/components/orderDetail/OrderBadge';
import OrderStepper from '@/components/orderDetail/OrderStepper';
import { ORDER_STATUS_MAP } from '@/constants';
import { GetCustomerOrderResponseDto, InstockOrderStatus } from '@/types/api/order.api.types';
import { SupportTicketDto } from '@/lib/api/endpoints/supportTicketApi';

interface OrderHeaderCardProps {
  order: GetCustomerOrderResponseDto;
  effectiveStatus?: string;
  isCOD?: boolean;
  isCancelled?: boolean;
  isReturned?: boolean;
  canCancel?: boolean;
  canReport?: boolean;
  isExpired?: boolean;
  canPay?: boolean;
  isDelivered?: boolean;
  isCanceling?: boolean;
  isCompleting?: boolean;
  ticketData?: SupportTicketDto;
  onCancelClick?: () => void;
  onCompleteClick?: () => void;
  onReportClick?: () => void;
  onPayClick?: () => void;
}

export default function OrderHeaderCard({
  order,
  effectiveStatus,
  isCOD,
  isCancelled,
  isReturned,
  isExpired,
  canCancel,
  canReport,
  canPay,
  isDelivered,
  isCanceling,
  isCompleting,
  ticketData,
  onCancelClick,
  onCompleteClick,
  onReportClick,
  onPayClick,
}: OrderHeaderCardProps) {
  // 1. Dẹp chữ Expired ở cuối đi, chỉ lấy mảng gốc bình thường
  const defaultSteps = isCOD
    ? [
        ORDER_STATUS_MAP['Waiting']?.label || 'Waiting',
        ORDER_STATUS_MAP['Processing']?.label || 'Processing',
        ORDER_STATUS_MAP['HandedOverToDelivery']?.label || 'Handed Over',
        ORDER_STATUS_MAP['Delivering']?.label || 'Delivering',
        ORDER_STATUS_MAP['Delivered']?.label || 'Delivered',
        ORDER_STATUS_MAP['Completed']?.label || 'Completed',
      ]
    : [
        ORDER_STATUS_MAP['Pending']?.label || 'Pending',
        ORDER_STATUS_MAP['Paid']?.label || 'Paid',
        ORDER_STATUS_MAP['Processing']?.label || 'Processing',
        ORDER_STATUS_MAP['HandedOverToDelivery']?.label || 'Handed Over',
        ORDER_STATUS_MAP['Delivering']?.label || 'Delivering',
        ORDER_STATUS_MAP['Delivered']?.label || 'Delivered',
        ORDER_STATUS_MAP['Completed']?.label || 'Completed',
      ];

  const stepperSteps = [...defaultSteps];

  // 2. Logic chèn Expired, Cancelled, Returned
  const expiredLabel = ORDER_STATUS_MAP['Expired']?.label || 'Expired';
  const cancelledLabel = ORDER_STATUS_MAP['Cancelled']?.label || 'Cancelled';
  const returnedLabel = ORDER_STATUS_MAP['Returned']?.label || 'Returned';

  if (isExpired) {
    stepperSteps.splice(1, 0, expiredLabel);
  } else if (isCancelled) {
    const insertIndex = isCOD ? 1 : 2;
    stepperSteps.splice(insertIndex, 0, cancelledLabel);
  }

  if (isReturned) {
    const deliveringLabel = ORDER_STATUS_MAP['Delivering']?.label || 'Delivering';
    const deliveringIndex = stepperSteps.indexOf(deliveringLabel);
    if (deliveringIndex !== -1) {
      stepperSteps.splice(deliveringIndex + 1, 0, returnedLabel);
    }
  }

  // 3. Cho activeStep dừng lại đúng chỗ khi có biến
  const activeStep = (() => {
    if (isExpired) return stepperSteps.indexOf(expiredLabel);
    if (isCancelled) return stepperSteps.indexOf(cancelledLabel);
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

  const isTicketResolved = ticketData?.status === 'Resolved';
  const hasActiveComplaint = ticketData && !isTicketResolved;

  return (
    <div className="bg-card border-border flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
      {/* KHỐI 1: THÔNG TIN CƠ BẢN VÀ ACTIONS */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Cột trái */}
        <div>
          <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Order Code
          </p>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-foreground text-2xl font-bold uppercase">
              #{order?.code || order?.id?.split('-')[0]}
            </p>
            <OrderBadge status={effectiveStatus as InstockOrderStatus} />
          </div>
          {order?.createdAt && (
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

        {/* Cột phải: Actions */}
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {canPay && (
              <Button
                size="sm"
                className="bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={onPayClick}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </Button>
            )}
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

            {ticketData && (
              <Link
                href={`/profile/ticket-support/${ticketData.id}`}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold shadow-sm transition-colors ${
                  isTicketResolved
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <Ticket className="h-4 w-4" />
                {isTicketResolved ? 'View Resolution' : 'View Active Ticket'}
              </Link>
            )}

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

      {/* KHỐI 1.5: THÔNG TIN GIAO HÀNG */}
      <div className="bg-muted/20 border-border/50 grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
        {/* Cột 1: Thông tin người nhận */}
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <User className="text-brand h-4 w-4" />
            Shipping Information
          </h3>
          <p className="text-sm font-medium text-slate-700">
            {order.customerName} - {order.customerPhone}{' '}
            {order.customerEmail ? `- ${order.customerEmail}` : ''}
          </p>
        </div>

        {/* Cột 2: Địa chỉ giao hàng */}
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="text-brand h-4 w-4" />
            Delivery Address
          </h3>
          <p className="text-sm text-slate-600">
            {order.customerWardName}, {order.customerDistrictName}, {order.customerProvinceName}
          </p>
        </div>
      </div>

      {/* KHỐI 2: STEPPER */}
      {activeStep >= 0 && (
        <div className="border-border border-t pt-6">
          <OrderStepper
            steps={stepperSteps}
            activeStep={activeStep}
            isPaid={order?.isPaid ?? false}
            isCancelled={isCancelled}
            isReturned={isReturned}
            isExpired={isExpired}
          />
        </div>
      )}

      {/* KHỐI 3: TRACKING BỊ LOẠI BỎ THEO YÊU CẦU */}
    </div>
  );
}
