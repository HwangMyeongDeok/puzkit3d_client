'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, PackageSearch, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertCircle className="mb-2 h-16 w-16 text-rose-500 opacity-80" />
        <h2 className="text-2xl font-bold">Ticket Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The support ticket does not exist, was deleted, or you do not have permission to view it.
        </p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Điều kiện hiển thị CTA
  const isDelivered = deliveryTracking?.status?.toLowerCase().includes('delivered');
  const canResolve = isDelivered && ticket.status !== 'Resolved';

  return (
    <div className="container-custom py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ticket Details</h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* ========== CỘT TRÁI (2/3) ========== */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* VỊ TRÍ MỚI: CTA RESOLVE TICKET - Đặt ngay đầu cột trái */}
            {canResolve && (
              <div className="bg-primary/10 border-primary/20 animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center justify-between gap-4 rounded-xl border p-5 shadow-sm transition-all sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground shrink-0 rounded-full p-2.5">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-lg font-bold">
                      Action Required: Resolve Ticket
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      Your package has been delivered. If everything looks good, please confirm to
                      close this ticket.
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full shrink-0 font-bold shadow-md transition-all hover:shadow-lg sm:w-auto"
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

            <TicketStatusCard ticket={ticket} />

            <DeliveryTrackingCard
              deliveryTracking={deliveryTracking}
              isLoading={isDeliveryLoading}
            />

            {/* Affected Items */}
            <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                <PackageSearch className="h-4 w-4" /> Affected Items ({ticket.details.length})
              </h2>
              <div className="flex flex-col gap-3">
                {ticket.details.map((detail: any) => {
                  const matchedItem = orderData?.orderDetails?.find(
                    (item: any) => item.id === detail.orderDetailId
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
          </div>

          {/* ========== CỘT PHẢI (1/3) ========== */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1">
            <TicketSidebarInfo ticket={ticket} />
            <AttachedEvidence proof={ticket.proof} />
          </div>
        </div>
      </div>
    </div>
  );
}
