'use client';

import { Hash, Truck, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TicketStepper, { StepItem } from '@/components/ticket/TicketStepper';
import type { TicketType } from '@/lib/api/endpoints/supportTicketApi';

// 👉 Import Hook API của bạn (Nhớ điều chỉnh đường dẫn nếu cần)
import {
  useGetDeliveryTrackingQuery,
  useGetWaybillNumberQuery,
} from '@/lib/api/endpoints/deliveryApi';
import { Button } from '../ui/button';

const TICKET_TYPE_CONFIG: Record<TicketType, { label: string; className: string }> = {
  ReplaceDrive: {
    label: 'Replace Drive',
    className:
      'bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400',
  },
  Exchange: {
    label: 'Exchange',
    className:
      'bg-violet-50/50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400',
  },
  Return: {
    label: 'Return',
    className:
      'bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400',
  },
};

// Component nhỏ hiển thị Waybill
function WaybillDisplay({ deliveryId, label }: { deliveryId: string; label: string }) {
  const { data: waybillUrl, isLoading } = useGetWaybillNumberQuery(deliveryId);

  if (isLoading) return <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />;
  if (!waybillUrl) return <span className="text-muted-foreground text-xs italic">Updating...</span>;

  return (
    <Button
      variant="link"
      className="h-auto p-0 font-mono text-xs font-bold text-blue-600 hover:text-blue-800"
      onClick={() => window.open(waybillUrl, '_blank')}
    >
      View {label} Waybill <ExternalLink className="ml-1 h-3 w-3" />
    </Button>
  );
}

export default function TicketStatusCard({ ticket }: { ticket: any }) {
  const typeConfig = TICKET_TYPE_CONFIG[ticket.type as TicketType] || {
    label: ticket.type,
    className: 'bg-gray-100 text-gray-700',
  };

  // Fetch tất cả deliveries liên quan đến order này
  const { data: deliveryRes } = useGetDeliveryTrackingQuery(
    { orderId: ticket.orderId },
    { skip: !ticket.orderId }
  );

  // Lọc ra các delivery thuộc về Support Ticket này
  const ticketDeliveries =
    deliveryRes?.data?.filter((d: any) => d.supportTicketId === ticket.id) || [];

  const returnDelivery = ticketDeliveries.find((d: any) => d.type === 'Return');
  const resendDelivery = ticketDeliveries.find((d: any) => d.type === 'Resend');

  // Logic Xây dựng Stepper động
  const buildSteps = (): StepItem[] => {
    const isRejected = ticket.status === 'Rejected';
    const isResolved = ticket.status === 'Resolved';

    // Bước 1 & 2: Mặc định luôn có
    const steps: StepItem[] = [
      { label: 'Submitted', isCompleted: true, isActive: false },
      {
        label: 'Processing',
        isCompleted: ticket.status !== 'Open',
        isActive: ticket.status === 'Processing' && !returnDelivery && !resendDelivery,
      },
    ];

    if (isRejected) {
      steps.push({ label: 'Rejected', isCompleted: false, isActive: true, isRejected: true });
      return steps;
    }

    // Bước 3: Return (Dành cho Return và Exchange)
    if (ticket.type === 'Return' || ticket.type === 'Exchange') {
      const isReturnDelivered = returnDelivery?.status?.toLowerCase().includes('delivered');
      steps.push({
        label: 'Returning Item',
        isCompleted: !!isReturnDelivered,
        isActive: !!returnDelivery && !isReturnDelivered && !isResolved,
      });
    }

    // Bước 4: Resend (Dành cho ReplaceDrive và Exchange)
    if (ticket.type === 'ReplaceDrive' || ticket.type === 'Exchange') {
      const isResendDelivered = resendDelivery?.status?.toLowerCase().includes('delivered');
      steps.push({
        label: 'Sending New Item',
        isCompleted: !!isResendDelivered,
        isActive: !!resendDelivery && !isResendDelivered && !isResolved,
      });
    }

    // Bước Cuối: Resolved
    steps.push({
      label: 'Resolved',
      isCompleted: isResolved,
      isActive: isResolved,
    });

    return steps;
  };

  const currentSteps = buildSteps();

  return (
    <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Ticket Code
          </p>
          <p className="text-foreground mt-1 flex items-center gap-1.5 text-2xl font-bold uppercase">
            <Hash className="text-muted-foreground h-5 w-5" />
            {ticket.code}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge
            variant="outline"
            className={cn(
              'px-3 py-1.5 text-xs font-bold uppercase shadow-sm',
              typeConfig.className
            )}
          >
            {typeConfig.label}
          </Badge>
          <Badge
            variant={
              ticket.status === 'Rejected'
                ? 'destructive'
                : ticket.status === 'Resolved'
                  ? 'default'
                  : 'secondary'
            }
            className={
              ticket.status === 'Resolved'
                ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                : 'shadow-sm'
            }
          >
            {ticket.status}
          </Badge>
        </div>
      </div>

      {/* TRACKING INFO (Chỉ hiện khi có Delivery) */}
      {(returnDelivery || resendDelivery) && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/20">
          <h4 className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
            <Truck className="h-3.5 w-3.5" /> Delivery Status
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {returnDelivery && (
              <div className="flex flex-col gap-1.5 rounded-md border bg-white p-3 shadow-sm dark:bg-slate-950">
                <span className="w-max rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
                  Return Package
                </span>
                <p className="mt-1 text-sm font-semibold">{returnDelivery.status}</p>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <WaybillDisplay deliveryId={returnDelivery.id} label="Return" />
                </div>
              </div>
            )}

            {resendDelivery && (
              <div className="flex flex-col gap-1.5 rounded-md border bg-white p-3 shadow-sm dark:bg-slate-950">
                <span className="w-max rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 uppercase">
                  Replacement Package
                </span>
                <p className="mt-1 text-sm font-semibold">{resendDelivery.status}</p>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <WaybillDisplay deliveryId={resendDelivery.id} label="Resend" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEPPER */}
      <div className="border-border mt-2 border-t pt-6">
        <TicketStepper steps={currentSteps} />
      </div>
    </div>
  );
}
