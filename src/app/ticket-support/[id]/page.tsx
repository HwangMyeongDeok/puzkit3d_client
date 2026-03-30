'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  FileWarning,
  Image as ImageIcon,
  PackageSearch,
  AlertCircle,
  Loader2,
  Hash,
  Truck,
  Check,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Hooks & Types
import {
  useGetTicketByIdQuery,
  useGetTicketDeliveryTrackingQuery,
  type TicketType,
} from '@/lib/api/endpoints/supportTicketApi';
import { useGetCustomerOrderByIdQuery } from '@/lib/api/endpoints/orderApi';

// Components
import TicketStepper from '@/components/ticket/TicketStepper';
import ProductItemCard from '@/components/ticket/ProductItemCard';
import EvidenceGallery from '@/components/ticket/EvidenceGallery';

const TICKET_TYPE_CONFIG: Record<TicketType, { label: string; className: string }> = {
  ReplacePart: {
    label: 'Replace Part',
    className:
      'bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  },
  Exchange: {
    label: 'Exchange',
    className:
      'bg-violet-50/50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
  },
  Return: {
    label: 'Return',
    className:
      'bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
};

// 👉 Cấu hình các bước giao hàng
const DELIVERY_STEPS = [
  'Pending',
  'Processing',
  'Handed Over',
  'Delivering',
  'Delivered',
  'Completed',
];

const getDeliveryStepIndex = (status: string | undefined | null) => {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes('completed')) return 5;
  if (s.includes('delivered')) return 4;
  if (s.includes('delivering')) return 3;
  if (s.includes('handed')) return 2;
  if (s.includes('processing')) return 1;
  return 0; // Default Pending
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = params.id;

  // 1. Fetch Ticket Data
  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
  } = useGetTicketByIdQuery(ticketId!, {
    skip: !ticketId,
  });

  // 2. Fetch Order Data
  const { data: orderData, isLoading: isFetchingOrder } = useGetCustomerOrderByIdQuery(
    ticket?.orderId ?? '',
    { skip: !ticket?.orderId }
  );

  // 3. Fetch Delivery Tracking cho Ticket
  const { data: deliveryTracking, isLoading: isDeliveryLoading } =
    useGetTicketDeliveryTrackingQuery(ticketId!, { skip: !ticketId });

  /* ---- Loading / Error states ---- */
  if (isTicketLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="text-brand h-10 w-10 animate-spin" />
        <p className="text-muted-foreground">Loading ticket details...</p>
      </div>
    );
  }

  if (isTicketError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="mb-2 h-16 w-16 text-rose-500" />
        <h2 className="text-xl font-bold">Ticket Not Found</h2>
        <p className="text-muted-foreground">
          The support ticket does not exist or you do not have permission to view it.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  /* ---- Ticket Status Logic ---- */
  const typeConfig = TICKET_TYPE_CONFIG[ticket.type];
  const ticketSteps = [
    'Submitted',
    'Processing',
    ticket.status === 'Rejected' ? 'Rejected' : 'Resolved',
  ];
  const activeStep = ticket.status === 'Open' ? 0 : ticket.status === 'Processing' ? 1 : 2;
  const isRejected = ticket.status === 'Rejected';

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
          <h1 className="text-2xl font-bold md:text-3xl">Ticket Details</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ========== CỘT TRÁI ========== */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* 1. Status Header Card */}
            <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                    Ticket Code
                  </p>
                  <p className="text-foreground mt-1 flex items-center gap-1.5 text-2xl font-bold uppercase">
                    <Hash className="text-muted-foreground h-5 w-5" />
                    {ticket.code}
                  </p>
                  {ticket.createdAt && (
                    <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', {
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
                    Ticket Type
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-lg border px-3 py-1 text-xs font-bold tracking-wider uppercase',
                      typeConfig.className
                    )}
                  >
                    {typeConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Stepper của Ticket */}
              <div className="border-border mt-2 border-t pt-6">
                <TicketStepper
                  steps={ticketSteps}
                  activeStep={activeStep}
                  isRejected={isRejected}
                />
              </div>
            </div>

            {/* 👉 2. MỚI: Delivery Tracking Stepper */}
            {(isDeliveryLoading || deliveryTracking) && (
              <div className="bg-card border-border flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                    <Truck className="h-4 w-4" /> Delivery Tracking
                  </h2>
                  {deliveryTracking?.deliveryOrderCode && (
                    <div className="bg-muted text-foreground flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium">
                      Tracking Code:{' '}
                      <span className="font-bold">{deliveryTracking.deliveryOrderCode}</span>
                    </div>
                  )}
                </div>

                {isDeliveryLoading ? (
                  <div className="text-muted-foreground flex items-center justify-center gap-2 py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">Loading delivery status...</span>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto py-4">
                    <div className="relative w-full min-w-[500px]">
                      {/* Đường line xám chìm ở dưới */}
                      <div className="bg-muted absolute top-4 right-[5%] left-[5%] h-1 -translate-y-1/2 rounded-full"></div>

                      {/* Đường line chạy tiến độ */}
                      <div
                        className="absolute top-4 left-[5%] h-1 -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-500 ease-in-out"
                        style={{
                          width: `${(getDeliveryStepIndex(deliveryTracking!.status) / (DELIVERY_STEPS.length - 1)) * 90}%`,
                        }}
                      ></div>

                      <div className="relative z-10 flex items-start justify-between">
                        {DELIVERY_STEPS.map((step, index) => {
                          const currentIndex = getDeliveryStepIndex(deliveryTracking!.status);
                          const isCompleted = index <= currentIndex;
                          const isActive = index === currentIndex;

                          return (
                            <div key={step} className="flex w-[16%] flex-col items-center gap-3">
                              <div
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300',
                                  isCompleted
                                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                                    : 'bg-background border-muted text-muted-foreground',
                                  isActive && 'ring-4 ring-emerald-500/20'
                                )}
                              >
                                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                              </div>
                              <span
                                className={cn(
                                  'text-center text-xs leading-tight font-semibold',
                                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                )}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Reason Info */}
            <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                <FileWarning className="h-4 w-4" /> Customer Reason
              </h2>
              <div className="bg-muted/40 text-foreground rounded-xl border-l-4 border-slate-400 p-4 text-base leading-relaxed dark:border-slate-600">
                {ticket.reason}
              </div>
            </div>

            {/* 4. Affected Items */}
            <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                <PackageSearch className="h-4 w-4" /> Affected Items ({ticket.details.length})
              </h2>
              <div className="flex flex-col gap-3">
                {ticket.details.map((detail) => {
                  const matchedItem = orderData?.orderDetails?.find(
                    (item) => item.id === detail.orderDetailId
                  );
                  return (
                    <ProductItemCard
                      key={detail.id}
                      detail={detail}
                      orderDetail={matchedItem}
                      isLoading={isFetchingOrder}
                    />
                  );
                })}
              </div>
            </div>

            {/* 5. Evidence (Nếu có) */}
            {ticket.proof && (
              <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
                <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                  <ImageIcon className="h-4 w-4" /> Attached Evidence
                </h2>
                <div className="border-border overflow-hidden rounded-xl border">
                  <EvidenceGallery proof={ticket.proof} />
                </div>
              </div>
            )}
          </div>

          {/* ========== CỘT PHẢI ========== */}
          <div className="flex flex-col gap-6">
            {/* Meta Info Sidebar */}
            <div className="bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm">
              <div className="bg-muted/40 border-border border-b p-4">
                <h3 className="text-foreground font-semibold">Ticket Information</h3>
              </div>

              <div className="space-y-4 p-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Last Updated</p>
                  <p className="flex items-center gap-2 font-medium">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    {new Date(ticket.updatedAt).toLocaleString('en-US')}
                  </p>
                </div>

                <div className="border-border mt-4 border-t pt-4">
                  <p className="text-muted-foreground mb-2">Associated Order</p>
                  {ticket.orderCode && (
                    <p className="mb-3 text-base font-semibold">#{ticket.orderCode}</p>
                  )}
                  <Button variant="outline" className="w-full gap-2 text-sm" asChild>
                    <Link href={ROUTES.ORDER_DETAIL(ticket.orderId)}>
                      View Order <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
