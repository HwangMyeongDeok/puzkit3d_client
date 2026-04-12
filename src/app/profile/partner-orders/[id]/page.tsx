'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Check,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PaymentActionDialog from '@/components/checkout/PaymentActionDialog';

import {
  useGetPartnerOrderByIdQuery,
  useUpdatePartnerOrderStatusMutation,
} from '@/lib/api/endpoints/partnerOrderApi';
import { useGetPartnerQuotationByIdQuery } from '@/lib/api/endpoints/partnerProductQuotationApi';
import { useGetDeliveryTrackingQuery } from '@/lib/api/endpoints/deliveryApi';
import { useGetPartnerProductsQuery } from '@/lib/api/endpoints/partnerProductApi';
import { getOriginalOrLatestTrackings, getPartnerDisplayStatus } from '@/lib/utils/order-status';
import { formatPrice } from '@/lib/utils';

const DEFAULT_PARTNER_MEDIA_BASE_URL =
  'https://puzkit3d-media-s3-bucket.s3.ap-southeast-1.amazonaws.com';

const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_PARTNER_MEDIA_BASE_URL
).replace(/\/$/, '');

function resolvePartnerImageUrl(url?: string | null) {
  if (!url) return `${DEFAULT_PARTNER_MEDIA_BASE_URL}/partner-products/default.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${MEDIA_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

function formatDisplayDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getStatusBadgeClass(status?: string | null) {
  switch ((status || '').toLowerCase()) {
    case 'paid':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'pending':
    case 'waiting':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'processing':
    case 'ordered from partner':
    case 'received at warehouse':
    case 'handed over':
    case 'delivering':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    case 'delivered':
    case 'completed':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'cancelled':
    case 'returned':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700';
  }
}

const PARTNER_ORDER_STEPS = [
  { index: 1, label: 'Pending' },
  { index: 2, label: 'Paid' },
  { index: 3, label: 'Ordered\nFrom\nPartner' },
  { index: 4, label: 'Received\nAt\nWarehouse' },
  { index: 5, label: 'Processing' },
  { index: 6, label: 'Handed\nOver' },
  { index: 7, label: 'Delivering' },
  { index: 8, label: 'Delivered' },
] as const;

function getActivePartnerStep(status?: string | null) {
  switch ((status || '').toLowerCase()) {
    case 'pending':
    case 'waiting':
      return 1;
    case 'paid':
      return 2;
    case 'ordered from partner':
      return 3;
    case 'received at warehouse':
      return 4;
    case 'processing':
      return 5;
    case 'handed over':
      return 6;
    case 'delivering':
      return 7;
    case 'delivered':
    case 'completed':
      return 8;
    default:
      return 1;
  }
}

function PartnerOrderStepper({ status }: { status?: string | null }) {
  const activeStep = getActivePartnerStep(status);

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[980px] items-start">
        {PARTNER_ORDER_STEPS.map((step, index) => {
          const isDone = step.index < activeStep;
          const isCurrent = step.index === activeStep;

          return (
            <div key={step.index} className="flex flex-1 items-start">
              <div className="flex min-w-[120px] flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
                    isDone || isCurrent
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-500'
                  }`}
                >
                  {isDone || isCurrent ? <Check className="h-4 w-4" /> : step.index}
                </div>

                <div className="mt-2 min-h-[44px] whitespace-pre-line text-center text-xs font-medium leading-4 text-slate-600">
                  {step.label}
                </div>
              </div>

              {index < PARTNER_ORDER_STEPS.length - 1 ? (
                <div
                  className={`mx-3 mt-5 h-[2px] flex-1 ${
                    step.index < activeStep ? 'bg-green-600' : 'bg-slate-200'
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PartnerOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useGetPartnerOrderByIdQuery(orderId, {
    skip: !orderId,
    refetchOnMountOrArgChange: true,
  });

  const quotationId = order?.partnerProductQuotationId || '';

  const { data: quotation } = useGetPartnerQuotationByIdQuery(quotationId, {
    skip: !quotationId,
  });

  const { data: productsResponse } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const [updatePartnerOrderStatus, { isLoading: isConfirming }] =
    useUpdatePartnerOrderStatusMutation();

  const { data: deliveryResponse } = useGetDeliveryTrackingQuery(
    {
      orderId,
      pageNumber: 1,
      pageSize: 20,
    },
    {
      skip: !orderId || !order?.id,
    }
  );

  const trackingData = useMemo(
    () => getOriginalOrLatestTrackings(deliveryResponse?.data ?? []),
    [deliveryResponse]
  );

  const effectiveStatus = useMemo(
    () => getPartnerDisplayStatus(order?.status, trackingData) || order?.status,
    [order?.status, trackingData]
  );

  const isDelivered = (effectiveStatus || '').toLowerCase() === 'delivered';

  const canPayNow =
    !!order &&
    !order.isPaid &&
    order.paymentMethod === 'Online' &&
    !['Cancelled', 'Returned', 'Completed'].includes(order.status);

  const productMap = useMemo(() => {
    return new Map((productsResponse?.items ?? []).map((item) => [item.id, item]));
  }, [productsResponse?.items]);

  const quotationDetails = quotation?.details ?? [];

  const orderedProducts = quotationDetails.map((item: any) => {
    const product = productMap.get(item.partnerProductId);

    return {
      id: item.id,
      productName: product?.name || item.partnerProductId,
      thumbnailUrl: resolvePartnerImageUrl(product?.thumbnailUrl),
      unitPrice: item.unitPrice ?? 0,
      quantity: item.quantity ?? 0,
      totalAmount: item.totalAmount ?? (item.unitPrice ?? 0) * (item.quantity ?? 0),
    };
  });

  const shippingFeeOverseas = quotation?.shippingFee ?? 0;
  const importTaxAmount = quotation?.importTaxAmount ?? 0;
  const localShippingFee = order?.shippingFee ?? 0;
  const orderSubtotal = order?.subTotalAmount ?? quotation?.subTotalAmount ?? 0;
  const orderGrandTotal = order?.grandTotalAmount ?? 0;

  const fullAddress = [
    order?.detailAddress,
    order?.customerWardName,
    order?.customerDistrictName,
    order?.customerProvinceName,
  ]
    .filter(Boolean)
    .join(', ');

  const handleConfirmComplete = async () => {
    if (!order?.id) return;

    try {
      await updatePartnerOrderStatus({
        orderId: order.id,
        newStatus: 'Completed',
      }).unwrap();

      toast.success('Order successfully confirmed!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Confirmation failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand h-10 w-10 animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="hover:bg-muted shrink-0 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Order Details</h1>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-card border-border flex flex-col gap-6 rounded-xl border p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                  Order Code
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <p className="text-foreground text-2xl font-bold uppercase">
                    #{order.code || order.id?.split('-')[0]}
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusBadgeClass(
                      effectiveStatus
                    )}`}
                  >
                    {effectiveStatus}
                  </span>
                </div>

                {order.createdAt && (
                  <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDisplayDate(order.createdAt)}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start gap-2 md:items-end">
                <div className="flex flex-wrap items-center gap-2">
                  {canPayNow && (
                    <Button
                      size="sm"
                      className="bg-brand text-brand-foreground hover:bg-brand/90"
                      onClick={() => setPaymentDialogOpen(true)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                  )}

                  {isDelivered && order.status !== 'Completed' && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={handleConfirmComplete}
                      disabled={isConfirming}
                    >
                      {isConfirming ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Confirm Received
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-border border-t pt-6">
              <PartnerOrderStepper status={effectiveStatus} />
            </div>
          </div>

          <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <User className="text-brand h-5 w-5" />
              Shipping Information
            </h3>

            <div className="bg-muted/30 border-border/50 flex flex-col gap-3 rounded-lg border p-4 text-sm">
              <div className="flex items-center gap-3">
                <User className="text-muted-foreground h-4 w-4 shrink-0" />
                <p className="font-semibold">{order.customerName || '--'}</p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                <p className="text-muted-foreground">{order.customerPhone || '--'}</p>
              </div>

              {order.customerEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                  <p className="text-muted-foreground truncate">{order.customerEmail}</p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
                <MapPin className="text-brand h-4 w-4" />
                Delivery Address
              </h3>
              <p className="text-muted-foreground bg-muted/30 border-border/50 rounded-lg border p-4 text-sm leading-relaxed">
                {fullAddress || '--'}
              </p>
            </div>
          </div>

          <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Package className="text-brand h-5 w-5" />
              Ordered Products ({orderedProducts.length})
            </h3>

            {orderedProducts.length > 0 ? (
              <div className="flex flex-col">
                {orderedProducts.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <Separator className="my-5" />}
                    <div className="flex items-start gap-4">
                      <div className="bg-muted block h-16 w-16 shrink-0 overflow-hidden rounded-md border shadow-sm sm:h-24 sm:w-24">
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-foreground text-base leading-tight font-semibold">
                            {item.productName}
                          </p>

                          <p className="text-muted-foreground text-sm">Partner product</p>

                          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                            <span>{formatPrice(item.unitPrice ?? 0)}</span>
                            <span>✕</span>
                            <span className="text-foreground font-semibold">{item.quantity}</span>
                          </div>
                        </div>

                        <span className="text-brand text-lg font-bold whitespace-nowrap">
                          {formatPrice(item.totalAmount ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/20 rounded-lg border border-dashed py-8 text-center">
                <Package className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground text-sm italic">No product data.</p>
              </div>
            )}
          </div>

          <div className="bg-card border-border flex flex-col gap-6 overflow-hidden rounded-xl border p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <Receipt className="text-brand h-5 w-5" />
              Payment Summary
            </h3>

            <div className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </span>
                <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-bold tracking-wider text-slate-700 uppercase shadow-sm">
                  {order.paymentMethod || 'Online'}
                </span>
              </div>

              <Separator className="bg-slate-200" />

              <div className="flex items-start justify-between">
                <span className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Banknote className="h-4 w-4" />
                  Payment Status
                </span>

                <div className="flex flex-col items-end text-right">
                  {order.isPaid ? (
                    <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Paid Successfully
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
                      <Clock className="h-4 w-4 animate-pulse" /> Pending Payment
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 px-1 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800">{formatPrice(orderSubtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping Fee Overseas</span>
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <Plus className="h-3 w-3 text-slate-400" /> {formatPrice(shippingFeeOverseas)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <Plus className="h-3 w-3 text-slate-400" /> {formatPrice(localShippingFee)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Import Tax</span>
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <Plus className="h-3 w-3 text-slate-400" /> {formatPrice(importTaxAmount)}
                </span>
              </div>
            </div>

            <Separator className="border-dashed border-slate-200 bg-transparent" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-800">
                    {order.isPaid ? 'Total Paid' : 'Amount to Pay'}
                  </span>
                  <span className="text-muted-foreground text-[11px] italic">
                    Via {order.paymentMethod || 'Online'}
                  </span>
                </div>

                <span className="text-brand text-2xl font-black tracking-tight drop-shadow-sm">
                  {formatPrice(orderGrandTotal)}
                </span>
              </div>

              <div className="bg-brand/5 border-brand/20 rounded-lg border p-3">
                <p className="text-brand/80 text-center text-xs leading-relaxed font-medium">
                  {order.isPaid
                    ? `Thank you! You have successfully paid ${formatPrice(orderGrandTotal)}.`
                    : `Please prepare ${formatPrice(orderGrandTotal)} to complete your order.`}
                </p>
              </div>
            </div>
          </div>

          {trackingData.length > 0 ? (
            <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
              <div className="border-border flex items-center gap-2 border-b pb-4">
                <Truck className="text-brand h-5 w-5" />
                <h3 className="text-foreground text-lg font-bold">Delivery Tracking</h3>
              </div>

              <div className="flex flex-col gap-3">
                {trackingData.map((tracking: any) => (
                  <div
                    key={tracking.id}
                    className="border-muted bg-muted/20 flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-foreground font-semibold">{tracking.status}</p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                        <span>{formatDisplayDate(tracking.createdAt || tracking.updatedAt)}</span>
                      </div>
                      {tracking.note ? (
                        <p className="text-muted-foreground text-sm">{tracking.note}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <PaymentActionDialog
        open={paymentDialogOpen}
        orderId={order.id}
        onClose={() => setPaymentDialogOpen(false)}
        redirectRoute="/profile/orders?tab=partner"
        orderType="partner"
      />
    </>
  );
}