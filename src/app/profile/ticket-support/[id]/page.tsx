'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  PackageSearch,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  Ticket,
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

// Components
import TicketDetailSkeleton from '@/components/ticketSupportDetail/TicketDetailSkeleton';
import TicketStatusCard from '@/components/ticketSupportDetail/TicketStatusCard';
import DeliveryTrackingCard from '@/components/ticketSupportDetail/DeliveryTrackingCard';
import TicketSidebarInfo from '@/components/ticketSupportDetail/TicketSidebarInfo';
import ProductItemCard from '@/components/ticket/ProductItemCard';

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = params.id;

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
      <div className="border-border bg-card flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
        <div className="rounded-full bg-rose-50 p-4 dark:bg-rose-500/10">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Ticket Not Found</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            This support ticket does not exist, was deleted, or you don't have permission to view
            it.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline" className="mt-2 rounded-full px-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const isDelivered = deliveryTracking?.status?.toLowerCase().includes('delivered');
  const canResolve = isDelivered && ticket.status !== 'Resolved';

  return (
    <div className="flex w-full flex-col gap-6">
      {/* ========== Header Section ========== */}
      <div className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground -ml-2 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Ticket className="text-primary h-5 w-5" />
              <h1 className="text-xl font-bold md:text-2xl">Ticket Details</h1>
            </div>
          </div>
          <p className="text-muted-foreground pl-10 text-sm">
            Reference ID:{' '}
            <span className="text-foreground font-mono font-medium">{ticketId?.slice(0, 8)}</span>
          </p>
        </div>
      </div>

      {/* ========== Main Content Layout ========== */}
      {/* Dùng flex-col-reverse để trên Mobile/Tablet: Cột chính nằm trên, Info nằm dưới. 
          Chỉ lên màn hình xl (rất rộng) mới chia làm 2 cột */}
      <div className="flex flex-col-reverse items-start gap-6 xl:flex-row">
        {/* === CỘT TRÁI (Nội dung chính) === */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
          {/* Action Banner */}
          {canResolve && (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3 sm:items-center">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-50">
                    Package Delivered
                  </h3>
                  <p className="text-xs text-emerald-700 md:text-sm dark:text-emerald-300/80">
                    If everything looks good, please resolve this ticket to close the request.
                  </p>
                </div>
              </div>
              <Button
                className="w-full shrink-0 bg-emerald-600 font-semibold text-white hover:bg-emerald-700 sm:w-auto"
                onClick={handleResolveTicket}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resolving
                  </>
                ) : (
                  'Mark as Resolved'
                )}
              </Button>
            </div>
          )}

          {/* Progress Tracking */}
          <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm">
            <div className="border-border bg-muted/20 border-b px-5 py-3.5">
              <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
                <Activity className="text-primary h-4 w-4" />
                Progress Tracking
              </h2>
            </div>

            <div className="flex flex-col gap-6 p-5">
              <TicketStatusCard ticket={ticket} />

              {deliveryTracking && (
                <>
                  <div className="bg-border/50 my-1 h-px w-full" />
                  <DeliveryTrackingCard
                    deliveryTracking={deliveryTracking}
                    isLoading={isDeliveryLoading}
                  />
                </>
              )}
            </div>
          </div>

          {/* Affected Items */}
          <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm">
            <div className="border-border bg-muted/20 flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
                <PackageSearch className="text-primary h-4 w-4" />
                Affected Items
              </h2>
              <span className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                {ticket.details.length}
              </span>
            </div>

            <div className="flex flex-col gap-4 p-5">
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

        {/* === CỘT PHẢI (Thông tin Ticket) === */}
        <div className="flex w-full shrink-0 flex-col gap-6 xl:sticky xl:top-24 xl:w-80">
          <TicketSidebarInfo ticket={ticket} />
        </div>
      </div>
    </div>
  );
}
