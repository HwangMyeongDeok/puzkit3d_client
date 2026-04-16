'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  PackageSearch,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  Camera,
  UploadCloud,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Info,
  User,
  MessageSquareQuote,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Hooks & APIS
import {
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
} from '@/lib/api/endpoints/supportTicketApi';
import { useGetCustomerOrderByIdQuery } from '@/lib/api/endpoints/orderApi';
import { useGetPresignedUrlMutation } from '@/lib/api/endpoints/uploadApi';
import { useUpdateDeliveryHandoverMutation } from '@/lib/api/endpoints/deliveryApi';
import { useGetDeliveryTrackingQuery } from '@/lib/api/endpoints/deliveryApi';

// Components
import TicketDetailSkeleton from '@/components/ticketSupportDetail/TicketDetailSkeleton';
import TicketStatusCard from '@/components/ticketSupportDetail/TicketStatusCard';
import DeliveryTrackingCard from '@/components/ticketSupportDetail/DeliveryTrackingCard';
import ProductItemCard from '@/components/ticket/ProductItemCard';
import { handleErrorToast } from '@/lib/utils/error-handler';

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = params.id;

  // --- API Queries ---
  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
  } = useGetTicketByIdQuery(ticketId!, { skip: !ticketId });
  const { data: orderData, isLoading: isFetchingOrder } = useGetCustomerOrderByIdQuery(
    ticket?.orderId ?? '',
    { skip: !ticket?.orderId }
  );

  const { data: deliveryRes, isLoading: isDeliveryLoading } = useGetDeliveryTrackingQuery(
    { orderId: ticket?.orderId ?? '', pageNumber: 1, pageSize: 100 },
    { skip: !ticket?.orderId }
  );

  // --- Mutations ---
  const [updateTicketStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();
  const [updateHandover, { isLoading: isUpdatingHandover }] = useUpdateDeliveryHandoverMutation();

  // --- States Upload ---
  const [handoverFile, setHandoverFile] = useState<File | null>(null);
  const [handoverPreview, setHandoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Extraction Logic ---
  const allOrderTrackings = deliveryRes?.data || [];
  const supportTrackings = allOrderTrackings.filter((d: any) => d.supportTicketId === ticketId);

  const returnDelivery = supportTrackings.find((d: any) => d.type === 'Return');
  const resendDelivery = supportTrackings.find(
    (d: any) => d.type === 'Resend' || d.type === 'ReplaceDrive'
  );

  const isReturnReadyToPick = returnDelivery?.status === 'ReadyToPick';
  const needsCustomerHandover = isReturnReadyToPick && !returnDelivery?.handOverImageUrl;

  const isResendDelivered = resendDelivery?.status?.toLowerCase().includes('delivered');
  const canResolve = isResendDelivered && ticket?.status !== 'Resolved';

  // --- Handlers ---
  const handleResolveTicket = async () => {
    if (!ticketId) return;
    try {
      await updateTicketStatus({ id: ticketId, status: 'Resolved' }).unwrap();
      toast.success('Support request has been successfully resolved!');
    } catch (error) {
      handleErrorToast(error, 'Failed to resolve ticket.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only images are allowed for handover proof.');
      return;
    }
    setHandoverFile(file);
    setHandoverPreview(URL.createObjectURL(file));
  };

  const clearHandoverFile = () => {
    if (handoverPreview) URL.revokeObjectURL(handoverPreview);
    setHandoverFile(null);
    setHandoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitHandover = async () => {
    if (!handoverFile || !returnDelivery?.id) return;
    try {
      setIsUploading(true);
      const { presignedUrl, path } = await getPresignedUrl({
        contentType: handoverFile.type,
        folder: 'delivery-handovers',
        path: `delivery-handovers/${returnDelivery.id}/${Date.now()}_${handoverFile.name}`,
        fileName: handoverFile.name,
      }).unwrap();

      await fetch(presignedUrl, {
        method: 'PUT',
        body: handoverFile,
        headers: { 'Content-Type': handoverFile.type },
      });

      await updateHandover({ trackingId: returnDelivery.id, handOverImageUrl: path }).unwrap();

      toast.success('Handover confirmed successfully!');
      clearHandoverFile();
    } catch (error) {
      handleErrorToast(error, 'Failed to upload proof.');
    } finally {
      setIsUploading(false);
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
          <h2 className="text-xl font-bold">Request Not Found</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            This support request does not exist, or you don't have permission to view it.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline" className="mt-2 rounded-full px-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      {/* ========== HEADER ========== */}
      <div className="border-border mb-6 flex flex-col gap-2 border-b">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground -ml-2 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Badge
            variant="secondary"
            className="text-muted-foreground bg-muted/50 hover:bg-muted/50 rounded-full font-mono text-xs font-semibold"
          >
            {ticket.code || ticketId?.slice(0, 8)}
          </Badge>
        </div>
        <h1 className="text-foreground mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          Support Request Details
        </h1>
      </div>

      {/* ========== 🌟 TOP CONTEXT BAR (Thay thế Sidebar cũ) 🌟 ========== */}
      <div className="border-border bg-card grid grid-cols-1 gap-4 rounded-xl border p-5 shadow-sm md:grid-cols-3">
        {/* Cột 1: Thông tin liên hệ */}
        <div className="flex items-start gap-3">
          <div className="bg-muted/50 text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              Contact Info
            </p>
            <p className="text-foreground truncate text-sm font-semibold">
              {orderData?.customerName || 'N/A'}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {orderData?.customerPhone || 'No phone number'}
            </p>
          </div>
        </div>

        {/* Cột 2: Lý do Ticket */}
        <div className="border-border flex items-start gap-3 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <MessageSquareQuote className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              Reason: {ticket.type}
            </p>
            <p className="text-foreground line-clamp-2 text-xs" title={ticket.reason}>
              "{ticket.reason}"
            </p>
          </div>
        </div>

        {/* Cột 3: Trạng thái chung */}
        <div className="border-border flex items-start gap-3 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <div className="bg-muted/50 text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              Current Status
            </p>
            <div>
              <Badge variant="outline" className="bg-muted/30">
                {ticket.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT (SINGLE COLUMN) ========== */}
      <div className="flex w-full flex-col gap-8">
        {/* URGENT ACTION BANNERS */}
        <div className="flex flex-col gap-4">
          {canResolve && (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/50 p-4 shadow-sm sm:flex-row sm:items-center sm:p-5 dark:border-emerald-900/30 dark:from-emerald-950/30 dark:to-emerald-950/10">
              <div className="flex items-start gap-3 sm:items-center">
                <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/50">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-emerald-900 uppercase dark:text-emerald-50">
                    Replacement Delivered
                  </h3>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300/80">
                    Your replacement package has arrived. Please confirm to close this request.
                  </p>
                </div>
              </div>
              <Button
                className="h-10 shrink-0 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 sm:w-auto"
                onClick={handleResolveTicket}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resolving
                  </>
                ) : (
                  'Confirm & Resolve'
                )}
              </Button>
            </div>
          )}

          {needsCustomerHandover && (
            <div className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50 p-4 shadow-sm sm:p-5 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-amber-950/10">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/40 dark:text-amber-500">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-amber-900 uppercase dark:text-amber-100">
                    Action Required: Upload Handover Proof
                  </h3>
                  <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-400/80">
                    The shipper is arriving to pick up your return. Please upload a photo as proof
                    of handover.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 pt-2 sm:ml-12 sm:flex-row">
                {!handoverPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-300 bg-white/50 transition-colors hover:bg-amber-50 sm:w-56 dark:border-amber-700/50 dark:bg-black/20 dark:hover:bg-amber-900/20"
                  >
                    <UploadCloud className="h-6 w-6 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-500">
                      Click to upload photo
                    </span>
                  </div>
                ) : (
                  <div className="border-border relative inline-block rounded-lg border bg-white p-1 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={handoverPreview}
                      alt="Preview"
                      className="h-24 w-auto rounded-md object-cover"
                    />
                    <button
                      onClick={clearHandoverFile}
                      className="absolute -top-2 -right-2 rounded-full bg-white text-rose-500 shadow-md hover:text-rose-600"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />

                {handoverFile && (
                  <Button
                    className="h-10 w-full bg-amber-600 font-semibold text-white shadow-sm hover:bg-amber-700 sm:w-auto"
                    onClick={handleSubmitHandover}
                    disabled={isUploading || isUpdatingHandover}
                  >
                    {isUploading || isUpdatingHandover ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                      </>
                    ) : (
                      'Submit Photo'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RESOLUTION TIMELINE */}
        <div className="mt-2 flex flex-col gap-5">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
            <Activity className="text-primary h-5 w-5" />
            Resolution Timeline
          </h2>

          <div className="relative flex flex-col gap-5">
            {/* OVERVIEW: Ticket Status (Viền Xám/Slate) */}
            <div className="border-border bg-card overflow-hidden rounded-xl border border-l-[5px] border-l-slate-400 shadow-sm transition-all hover:shadow-md dark:border-l-slate-600">
              <div className="p-5 sm:p-6">
                <div className="border-border/50 mb-4 flex items-center justify-between border-b pb-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <Ticket className="h-3 w-3" /> OVERVIEW
                    </span>
                    Request Lifecycle
                  </h3>
                </div>
                <TicketStatusCard ticket={ticket} />
              </div>
            </div>

            {/* SHIPMENT 1: Return Shipment (Viền Cam) */}
            {(ticket.type === 'Exchange' || returnDelivery) && (
              <div className="border-border bg-card overflow-hidden rounded-xl border border-l-[5px] border-l-amber-500 shadow-sm transition-all hover:shadow-md dark:border-l-amber-600">
                <div className="p-5 sm:p-6">
                  <div className="border-border/50 mb-4 flex items-center justify-between border-b pb-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-amber-600 uppercase dark:text-amber-500">
                      <span className="flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                        SHIPMENT 1
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0" /> Return Shipment
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-amber-50 text-[10px] font-bold tracking-wider text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                    >
                      YOU → WAREHOUSE
                    </Badge>
                  </div>

                  {returnDelivery ? (
                    <DeliveryTrackingCard
                      deliveryTracking={returnDelivery}
                      isLoading={isDeliveryLoading}
                    />
                  ) : (
                    <div className="bg-muted/20 border-border/50 flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 text-center">
                      <Info className="h-5 w-5 text-amber-500 opacity-50" />
                      <p className="text-muted-foreground text-sm">
                        Waiting for staff to approve and generate return shipping label.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SHIPMENT 2: Replacement Shipment (Viền Xanh) */}
            {(ticket.type === 'Exchange' || ticket.type === 'ReplaceDrive' || resendDelivery) && (
              <div className="border-border bg-card overflow-hidden rounded-xl border border-l-[5px] border-l-indigo-500 shadow-sm transition-all hover:shadow-md dark:border-l-indigo-600">
                <div className="p-5 sm:p-6">
                  <div className="border-border/50 mb-4 flex items-center justify-between border-b pb-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                      <span className="flex items-center gap-1.5 rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                        SHIPMENT 2
                      </span>
                      <ArrowDownLeft className="h-4 w-4 shrink-0" /> Replacement Shipment
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-indigo-50 text-[10px] font-bold tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                    >
                      WAREHOUSE → YOU
                    </Badge>
                  </div>

                  {resendDelivery ? (
                    <DeliveryTrackingCard
                      deliveryTracking={resendDelivery}
                      isLoading={isDeliveryLoading}
                    />
                  ) : (
                    <div className="bg-muted/20 border-border/50 flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 text-center">
                      <Clock className="h-5 w-5 text-indigo-500 opacity-50" />
                      <p className="text-muted-foreground text-sm">
                        {ticket.type === 'Exchange'
                          ? 'Will ship once return is received and inspected.'
                          : 'Preparing your replacement.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AFFECTED ITEMS */}
        <div className="border-border bg-card mt-2 flex flex-col overflow-hidden rounded-xl border shadow-sm">
          <div className="border-border bg-muted/20 flex items-center justify-between gap-3 border-b px-5 py-4">
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
              <PackageSearch className="text-primary h-4 w-4" /> Affected Items
            </h2>
            <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
              {ticket.details.length}
            </span>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6">
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
    </div>
  );
}
