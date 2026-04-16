'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Package,
  Mail,
  Phone,
  House,
  User,
  FileText,
  ReceiptText,
  ClipboardList,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useGetProfileQuery } from '@/lib/api/endpoints/authApi';
import { useGetPartnerProductRequestDetailQuery } from '@/lib/api/endpoints/partnerProductRequestApi';
import { useGetPartnerProductsQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import {
  PARTNER_QUOTATION_STATUS,
  getPartnerQuotationStatusMeta,
  getPartnerRequestStatusMeta,
} from '@/lib/utils/partnerRequestStatus';
import {
  useGetPartnerQuotationByRequestIdQuery,
  useUpdatePartnerQuotationStatusMutation,
} from '@/lib/api/endpoints/partnerProductQuotationApi';
import { useGetMyPartnerOrdersQuery } from '@/lib/api/endpoints/partnerOrderApi';
import ConfirmQuotationRejectModal from '@/components/custom/ConfirmQuotationRejectModal';
import { formatPrice } from '@/lib/utils';

const DEFAULT_PARTNER_MEDIA_BASE_URL =
  'https://puzkit3d-media-s3-bucket.s3.ap-southeast-1.amazonaws.com';

const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_PARTNER_MEDIA_BASE_URL
).replace(/\/$/, '');

const REQUEST_STATUS = {
  Pending: 0,
  CancelledByStaff: 1,
  Approved: 2,
  Quoted: 4,
  Accepted: 5,
  RejectedByCustomer: 6,
  CancelledByCustomer: 7,
} as const;

function resolvePartnerImageUrl(url?: string | null) {
  if (!url) return `${DEFAULT_PARTNER_MEDIA_BASE_URL}/partner-products/default.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${MEDIA_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

function normalizeRequestStatus(value: string | number | undefined | null): number {
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return REQUEST_STATUS.Pending;
}

function getCustomerName(
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null,
) {
  const fullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ').trim();
  return fullName || customer?.email?.split('@')[0] || 'Customer';
}

type TimelineNode = {
  key: number;
  label: string;
  danger?: boolean;
};

function formatDateTime(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function buildRequestTimeline(status: number): TimelineNode[] {
  if (status === REQUEST_STATUS.CancelledByStaff) {
    return [
      { key: REQUEST_STATUS.Pending, label: 'Pending' },
      { key: REQUEST_STATUS.CancelledByStaff, label: 'Cancelled by Staff', danger: true },
    ];
  }

  if (status === REQUEST_STATUS.RejectedByCustomer) {
    return [
      { key: REQUEST_STATUS.Pending, label: 'Pending' },
      { key: REQUEST_STATUS.Approved, label: 'Approved' },
      { key: REQUEST_STATUS.Quoted, label: 'Quoted' },
      { key: REQUEST_STATUS.Accepted, label: 'Accepted' },
      { key: REQUEST_STATUS.RejectedByCustomer, label: 'Rejected by Customer', danger: true },
    ];
  }

  if (status === REQUEST_STATUS.CancelledByCustomer) {
    return [
      { key: REQUEST_STATUS.Pending, label: 'Pending' },
      { key: REQUEST_STATUS.Approved, label: 'Approved' },
      { key: REQUEST_STATUS.Quoted, label: 'Quoted' },
      { key: REQUEST_STATUS.Accepted, label: 'Accepted' },
      { key: REQUEST_STATUS.CancelledByCustomer, label: 'Cancelled by Customer', danger: true },
    ];
  }

  return [
    { key: REQUEST_STATUS.Pending, label: 'Pending' },
    { key: REQUEST_STATUS.Approved, label: 'Approved' },
    { key: REQUEST_STATUS.Quoted, label: 'Quoted' },
    { key: REQUEST_STATUS.Accepted, label: 'Accepted' },
  ];
}

function getReachedPath(status: number): number[] {
  switch (status) {
    case REQUEST_STATUS.Pending:
      return [REQUEST_STATUS.Pending];
    case REQUEST_STATUS.Approved:
      return [REQUEST_STATUS.Pending, REQUEST_STATUS.Approved];
    case REQUEST_STATUS.Quoted:
      return [REQUEST_STATUS.Pending, REQUEST_STATUS.Approved, REQUEST_STATUS.Quoted];
    case REQUEST_STATUS.Accepted:
      return [
        REQUEST_STATUS.Pending,
        REQUEST_STATUS.Approved,
        REQUEST_STATUS.Quoted,
        REQUEST_STATUS.Accepted,
      ];
    case REQUEST_STATUS.CancelledByStaff:
      return [REQUEST_STATUS.Pending, REQUEST_STATUS.CancelledByStaff];
    case REQUEST_STATUS.RejectedByCustomer:
      return [
        REQUEST_STATUS.Pending,
        REQUEST_STATUS.Approved,
        REQUEST_STATUS.Quoted,
        REQUEST_STATUS.RejectedByCustomer,
      ];
    case REQUEST_STATUS.CancelledByCustomer:
      return [
        REQUEST_STATUS.Pending,
        REQUEST_STATUS.Approved,
        REQUEST_STATUS.Quoted,
        REQUEST_STATUS.Accepted,
        REQUEST_STATUS.CancelledByCustomer,
      ];
    default:
      return [REQUEST_STATUS.Pending];
  }
}

function getNodeState(nodeKey: number, status: number) {
  const reached = getReachedPath(status);

  if (status === REQUEST_STATUS.RejectedByCustomer && nodeKey === REQUEST_STATUS.Accepted) {
    return 'upcoming';
  }

  if (status === REQUEST_STATUS.CancelledByStaff && nodeKey === REQUEST_STATUS.CancelledByStaff) {
    return 'current-danger';
  }

  if (
    status === REQUEST_STATUS.RejectedByCustomer &&
    nodeKey === REQUEST_STATUS.RejectedByCustomer
  ) {
    return 'current-danger';
  }

  if (
    status === REQUEST_STATUS.CancelledByCustomer &&
    nodeKey === REQUEST_STATUS.CancelledByCustomer
  ) {
    return 'current-danger';
  }

  const lastReached = reached[reached.length - 1];

  if (nodeKey === lastReached) return 'current-success';
  if (reached.includes(nodeKey)) return 'done';
  return 'upcoming';
}

function isSegmentActive(leftKey: number, rightKey: number, status: number) {
  const reached = getReachedPath(status);
  const leftIndex = reached.indexOf(leftKey);
  const rightIndex = reached.indexOf(rightKey);
  return leftIndex !== -1 && rightIndex !== -1 && rightIndex === leftIndex + 1;
}

function getQuotedUnitPrice(detail: any, fallbackQuantity = 0) {
  if (!detail) return null;

  const directPrice =
    detail.unitPrice ??
    detail.quotedUnitPrice ??
    detail.finalUnitPrice ??
    detail.price ??
    detail.partnerProductPrice ??
    null;

  if (directPrice != null) return Number(directPrice);

  const quantity = detail.quantity ?? detail.qty ?? fallbackQuantity ?? 0;
  const totalAmount =
    detail.totalAmount ??
    detail.grandTotalAmount ??
    detail.subTotalAmount ??
    detail.referenceTotalAmount ??
    null;

  if (totalAmount != null && quantity > 0) {
    return Number(totalAmount) / Number(quantity);
  }

  return null;
}

function RequestProgress({ status }: { status: number }) {
  const nodes = buildRequestTimeline(status);

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[720px] items-center">
        {nodes.map((node, index) => {
          const state = getNodeState(node.key, status);
          const nextNode = nodes[index + 1];

          const circleClass =
            state === 'done' || state === 'current-success'
              ? 'border-green-600 bg-green-600 text-white'
              : state === 'current-danger'
                ? 'border-red-500 bg-red-500 text-white'
                : 'border-slate-200 bg-slate-100 text-slate-500';

          const labelClass =
            state === 'done' || state === 'current-success'
              ? 'text-green-700'
              : state === 'current-danger'
                ? 'text-red-600'
                : 'text-slate-500';

          const connectorClass =
            nextNode && isSegmentActive(node.key, nextNode.key, status)
              ? 'bg-green-600'
              : 'bg-slate-200';

          return (
            <div key={node.key} className="flex flex-1 items-center">
              <div className="flex min-w-[110px] flex-col items-center text-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${circleClass}`}
                >
                  {state === 'done' || state === 'current-success' ? (
                    <Check className="h-4 w-4" />
                  ) : state === 'current-danger' ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <span className={`mt-2 text-xs font-medium ${labelClass}`}>{node.label}</span>
              </div>

              {index < nodes.length - 1 ? (
                <div className={`mx-3 h-[2px] flex-1 ${connectorClass}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PartnerRequestDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const requestId = params.id;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const { data: profile } = useGetProfileQuery();

  const {
    data: requestDetail,
    isLoading: isRequestLoading,
    isError: isRequestError,
  } = useGetPartnerProductRequestDetailQuery(requestId, {
    skip: !requestId,
    refetchOnMountOrArgChange: true,
  });

  const { data: productResponse } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const { data: partnerResponse } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const {
    data: quotation,
    isFetching: isFetchingQuotation,
    refetch: refetchQuotation,
  } = useGetPartnerQuotationByRequestIdQuery(requestId, {
    skip: !requestId,
  });

  const { data: myPartnerOrders } = useGetMyPartnerOrdersQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const [updateQuotationStatus, { isLoading: isUpdatingQuotationStatus }] =
    useUpdatePartnerQuotationStatusMutation();

  const productMap = useMemo(() => {
    return new Map((productResponse?.items ?? []).map((item) => [item.id, item]));
  }, [productResponse?.items]);

  const partnerMap = useMemo(() => {
    return new Map((partnerResponse?.items ?? []).map((item) => [item.id, item]));
  }, [partnerResponse?.items]);

  const quotationDetailMap = useMemo(() => {
    return new Map((quotation?.details ?? []).map((item: any) => [item.partnerProductId, item]));
  }, [quotation?.details]);

  if (isRequestLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand h-10 w-10 animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Loading request details...
        </p>
      </div>
    );
  }

  if (isRequestError || !requestDetail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Request Not Found</h2>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const requestItems = requestDetail.details ?? [];
  const partnerName =
    partnerMap.get(requestDetail.partnerId)?.name || 'Partner';

  const requestStatusValue = normalizeRequestStatus(requestDetail.status);
  const requestStatus = getPartnerRequestStatusMeta(requestStatusValue);
  const quotationStatus = getPartnerQuotationStatusMeta(quotation?.status);

  const matchedPartnerOrder = myPartnerOrders?.items?.find(
    (order) => order.partnerProductQuotationId === quotation?.id,
  );

  const shippingFeeOverseas = quotation?.shippingFee ?? 0;
  const localShippingFee = matchedPartnerOrder?.shippingFee ?? 0;
  const quotationDisplayTotal =
    matchedPartnerOrder?.grandTotalAmount ?? quotation?.grandTotalAmount ?? 0;

  const canRespondToQuotation =
    !!quotation &&
    quotation.status === PARTNER_QUOTATION_STATUS.QUOTED &&
    !matchedPartnerOrder;

  const canContinueCheckout =
    !!quotation &&
    quotation.status === PARTNER_QUOTATION_STATUS.ACCEPTED &&
    !matchedPartnerOrder;

  const shouldShowQuotationBadge = !!quotation && quotationStatus.label !== requestStatus.label;

  const requestProducts = requestItems.map((item) => {
    const product = productMap.get(item.partnerProductId);
    const referenceUnitPrice = item.referencePrice ?? 0;
    const quantity = item.quantity ?? 0;
    const referenceTotalAmount = item.referenceTotalAmount ?? referenceUnitPrice * quantity;

    const quoteDetail = quotationDetailMap.get(item.partnerProductId);
    const quotedUnitPrice = getQuotedUnitPrice(quoteDetail, quantity);

    const hasQuotedPriceChange =
      quotedUnitPrice != null &&
      Math.round(Number(quotedUnitPrice)) !== Math.round(Number(referenceUnitPrice));

    const quotedTotalAmount =
      quoteDetail?.totalAmount ??
      (quotedUnitPrice != null ? Number(quotedUnitPrice) * quantity : referenceTotalAmount);

    return {
      id: item.id,
      productName: product?.name || item.partnerProductId,
      thumbnailUrl: resolvePartnerImageUrl(product?.thumbnailUrl || ''),
      referenceUnitPrice,
      referenceTotalAmount,
      quotedUnitPrice,
      hasQuotedPriceChange,
      quantity,
      totalAmount: quotation ? quotedTotalAmount : referenceTotalAmount,
    };
  });

  const reviewTotal = requestProducts.reduce((sum, item) => sum + item.referenceTotalAmount, 0);
  const quotedTotal = quotation?.subTotalAmount ?? reviewTotal;
  const totalRequestedQuantity = requestProducts.reduce((sum, item) => sum + item.quantity, 0);

  const hasQuotedTotalChange =
    !!quotation && Math.round(Number(quotedTotal)) !== Math.round(Number(reviewTotal));

  const customerName = getCustomerName(profile);
  const customerPhone = profile?.phoneNumber || '--';
  const customerEmail = profile?.email || '--';

  async function handleConfirmRequest() {
    if (!quotation?.id) return;

    try {
      await updateQuotationStatus({
        id: quotation.id,
        newStatus: PARTNER_QUOTATION_STATUS.ACCEPTED,
      }).unwrap();

      toast.success('Request confirmed successfully');
      await refetchQuotation();
      router.push(`/partner-checkout/${requestId}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to confirm request');
    }
  }

  async function handleRejectQuotation(note: string) {
    if (!quotation?.id) return;

    try {
      await updateQuotationStatus({
        id: quotation.id,
        newStatus: PARTNER_QUOTATION_STATUS.REJECTED_BY_CUSTOMER,
        note: note.trim() || undefined,
      }).unwrap();

      toast.success('Request rejected successfully');
      setRejectModalOpen(false);
      await refetchQuotation();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject request');
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/profile/partner-requests')}
            variant="ghost"
            size="icon"
            className="hover:bg-muted shrink-0 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Request Details</h1>
        </div>

        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 px-7 py-7">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <div className="min-w-0">
                  <p className="text-sm font-medium uppercase tracking-[0.1em] text-slate-500">
                    Request Code
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">#{requestDetail.code}</h2>

                    <span
                      className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${requestStatus.className}`}
                    >
                      {requestStatus.label}
                    </span>

                    {shouldShowQuotationBadge ? (
                      <span
                        className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${quotationStatus.className}`}
                      >
                        {quotationStatus.label}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-start md:justify-end">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(requestDetail.createdAt)}
                  </span>
                </div>
              </div>

              <div className="relative mt-5 h-px">
                <div className="absolute left-[-28px] right-[-28px] top-0 border-t border-slate-200" />
              </div>

              <div className="pt-4">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <House className="h-4 w-4 text-slate-500" />
                    <span>{partnerName}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
                    <p className="inline-flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{customerName}</span>
                    </p>

                    <p className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{customerPhone}</span>
                    </p>

                    <p className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{customerEmail}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-7 py-6">
              <RequestProgress status={requestStatusValue} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-7 py-5">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Package className="h-5 w-5 text-slate-700" />
                Request Products ({requestProducts.length})
              </h3>
            </div>

            <div className="px-7 py-6">
              <div className="space-y-5">
                {requestProducts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-slate-900">
                          {item.productName}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-base">
                          {item.hasQuotedPriceChange ? (
                            <>
                              <span className="font-medium text-slate-400 line-through">
                                {formatPrice(item.referenceUnitPrice)} /item
                              </span>
                              <span className="font-bold text-[#0b4a8b]">
                                {formatPrice(item.quotedUnitPrice ?? 0)} /item
                              </span>
                            </>
                          ) : (
                            <span className="font-medium text-slate-700">
                              {formatPrice(item.referenceUnitPrice)} /item
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Quantity:{' '}
                          <span className="font-semibold text-slate-700">{item.quantity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-extrabold text-[#003f88]">
                        {formatPrice(item.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!quotation ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-7 py-5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <ClipboardList className="h-5 w-5 text-slate-700" />
                  Request Summary
                </h3>
              </div>

              <div className="px-7 py-6">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        Partner Name
                      </span>
                      <span className="font-semibold text-slate-900">{partnerName}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                      <span>Customer Name</span>
                      <span className="font-semibold text-slate-900">{customerName}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                      <span>Phone</span>
                      <span className="font-semibold text-slate-900">{customerPhone}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                      <span>Email</span>
                      <span className="font-semibold text-slate-900">{customerEmail}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                      <span>Request Status</span>
                      <span className="font-semibold text-slate-900">{requestStatus.label}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                      <span>Total Quantity</span>
                      <span className="font-semibold text-slate-900">{totalRequestedQuantity}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 font-semibold text-base text-slate-700">
                      <span>Review Total</span>
                      <span className="font-semibold text-slate-900">
                        {formatPrice(reviewTotal)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xl font-bold text-slate-900">Total Amount</span>
                        <span className="text-xl font-bold text-slate-900">
                          {formatPrice(reviewTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {requestDetail.note ? (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                    <p className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                      <FileText className="h-4 w-4 text-slate-500" />
                      Request Note
                    </p>
                    <p className="text-sm leading-7 text-slate-600">{requestDetail.note}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {quotation ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-7 py-5">
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <ReceiptText className="h-5 w-5 text-slate-700" />
                  Quotation Summary
                </h3>
              </div>

              <div className="px-7 py-6">
                {isFetchingQuotation ? (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading quotation...
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                          <span>Quotation Code</span>
                          <span className="font-semibold text-slate-900">{quotation.code}</span>
                        </div>

                        {/* <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                          <span>Quotation Status</span>
                          <span className="font-semibold text-slate-900">
                            {quotationStatus.label}
                          </span>
                        </div> */}

                        <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                          <span>Review Total</span>
                          <span
                            className={
                              hasQuotedTotalChange
                                ? 'font-semibold text-slate-400 line-through'
                                : 'font-semibold text-slate-900'
                            }
                          >
                            {formatPrice(reviewTotal)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                          <span>Quoted Total</span>
                          <span className="text-lg font-bold text-[#0b4a8b]">
                            {formatPrice(quotedTotal)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                          <span>Shipping Fee Overseas</span>
                          <span className="font-semibold text-slate-900">
                            + {formatPrice(shippingFeeOverseas)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                          <span>shipping Domestic Fee</span>
                          <span className="font-semibold text-slate-900">
                            + {formatPrice(localShippingFee)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-base text-slate-700">
                          <span>Import Tax</span>
                          <span className="font-semibold text-slate-900">
                            + {formatPrice(quotation.importTaxAmount ?? 0)}
                          </span>
                        </div>

                        <div className="border-t border-slate-200 pt-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <span className="text-xl font-bold text-slate-900">Total Amount</span>
                              {/* {hasQuotedTotalChange ? (
                                <p className="mt-1 text-sm text-slate-400 line-through">
                                  {formatPrice(reviewTotal)}
                                </p>
                              ) : null} */}
                            </div>

                            <div className="text-right">
                              <span className="text-2xl font-extrabold text-[#0b4a8b]">
                                {formatPrice(quotationDisplayTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                      {canContinueCheckout ? (
                        <Button
                          onClick={() => router.push(`/partner-checkout/${requestId}`)}
                          className="rounded-xl bg-slate-900 hover:bg-slate-800"
                        >
                          Continue Checkout
                        </Button>
                      ) : null}

                      {matchedPartnerOrder ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(`/profile/partner-orders/${matchedPartnerOrder.id}`)
                          }
                          className="rounded-xl"
                        >
                          View Order
                        </Button>
                      ) : null}

                      {canRespondToQuotation ? (
                        <>
                          <Button
                            onClick={handleConfirmRequest}
                            disabled={isUpdatingQuotationStatus}
                            className="rounded-xl bg-slate-900 hover:bg-slate-800"
                          >
                            Confirm
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setRejectModalOpen(true)}
                            disabled={isUpdatingQuotationStatus}
                            className="rounded-xl"
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmQuotationRejectModal
        open={rejectModalOpen}
        loading={isUpdatingQuotationStatus}
        title="Reject quotation"
        description="Please tell us why you want to reject this quotation."
        confirmText="Reject"
        noteLabel="Reason"
        notePlaceholder="Enter your reason"
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={handleRejectQuotation}
      />
    </>
  );
}