'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  PackageSearch,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Hooks & APIS
import {
  useGetTicketByIdQuery,
  useGetTicketDeliveryTrackingQuery,
  useUpdateTicketStatusMutation,
} from '@/lib/api/endpoints/supportTicketApi';
import { useGetCustomerOrderByIdQuery } from '@/lib/api/endpoints/orderApi';

// Nhúng các component đã tách
import TicketDetailSkeleton from '@/components/ticketSupportDetail/TicketDetailSkeleton';
import TicketStatusCard from '@/components/ticketSupportDetail/TicketStatusCard';
import DeliveryTrackingCard from '@/components/ticketSupportDetail/DeliveryTrackingCard';
import TicketSidebarInfo from '@/components/ticketSupportDetail/TicketSidebarInfo';
import AttachedEvidence from '@/components/ticketSupportDetail/AttachedEvidence';
import ProductItemCard from '@/components/ticket/ProductItemCard';

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = params.id;

  // Query Hooks
  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
  } = useGetTicketByIdQuery(ticketId!, { skip: !ticketId });
  const { data: orderData, isLoading: isFetchingOrder } = useGetCustomerOrderByIdQuery(
    ticket?.orderId ?? '',
    { skip: !ticket?.orderId }
  );
  const { data: deliveryTracking, isLoading: isDeliveryLoading } =
    useGetTicketDeliveryTrackingQuery(ticketId!, { skip: !ticketId });

  // Mutation Hook
  const [updateTicketStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();

  const handleResolveTicket = async () => {
    if (!ticketId) return;
    try {
      await updateTicketStatus({ id: ticketId, status: 'Resolved' }).unwrap();
      toast.success('Ticket has been successfully resolved!');
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      toast.error('Failed to resolve ticket. Please try again later.');
    }
  };

  if (isTicketLoading) return <TicketDetailSkeleton />;

  if (isTicketError || !ticket) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="rounded-full bg-rose-50 p-4 dark:bg-rose-500/10">
          <AlertCircle className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold">Ticket Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The support ticket does not exist, was deleted, or you do not have permission to view it.
        </p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4 rounded-full px-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Điều kiện hiển thị CTA
  const isDelivered = deliveryTracking?.status?.toLowerCase().includes('delivered');
  const canResolve = isDelivered && ticket.status !== 'Resolved';

  return (
    <div className="container-custom min-h-screen py-8 lg:py-12">
      <div className="flex flex-col gap-8">
        {/* ========== Header Navigation ========== */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="icon"
            className="bg-background hover:bg-muted shrink-0 rounded-full shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ticket Details</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Ticket ID:{' '}
              <span className="text-foreground font-mono uppercase">{ticketId?.slice(0, 8)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* ========== CỘT TRÁI (2/3) ========== */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* VỊ TRÍ MỚI: CTA RESOLVE TICKET - Đổi sang tone xanh lá báo hiệu "Thành công / Hoàn tất" */}
            {canResolve && (
              <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center justify-between gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:flex-row dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-50">
                      Action Required: Resolve Ticket
                    </h3>
                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300/80">
                      Your package has been delivered. If everything looks good, please confirm to
                      close this ticket.
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full shrink-0 rounded-xl bg-emerald-600 font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg sm:w-auto"
                  onClick={handleResolveTicket}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    'Mark as Resolved'
                  )}
                </Button>
              </div>
            )}

            {/* NHÓM TIẾN TRÌNH: Gom Status và Tracking lại gần nhau để user hiểu chúng liên quan với nhau */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Activity className="text-primary h-5 w-5" />
                <h2 className="text-lg font-bold tracking-tight">Progress Tracking</h2>
              </div>

              <div className="flex flex-col gap-4">
                <TicketStatusCard ticket={ticket} />

                {/* Phân tách nhẹ nhàng nếu có dữ liệu Tracking */}
                {deliveryTracking && (
                  <DeliveryTrackingCard
                    deliveryTracking={deliveryTracking}
                    isLoading={isDeliveryLoading}
                  />
                )}
              </div>
            </div>

            {/* Affected Items */}
            <div className="bg-card border-border flex flex-col gap-5 rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
                  <PackageSearch className="text-primary h-5 w-5" />
                  Affected Items
                </h2>
                <span className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                  {ticket.details.length}
                </span>
              </div>

              <div className="flex flex-col gap-4 pt-2">
                {ticket.details.map((detail: any) => {
                  const matchedItem = orderData?.orderDetails?.find(
                    (item: any) => item.id === detail.orderDetailId
                  );
                  return (
                    <ProductItemCard
                      key={detail.id}
                      detail={detail}
                      orderDetail={matchedItem}
                      ticketType={ticket.type}
                      isLoading={isFetchingOrder}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========== CỘT PHẢI (1/3) ========== */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1">
            <TicketSidebarInfo ticket={ticket} />
          </div>
        </div>
      </div>
    </div>
  );
}
