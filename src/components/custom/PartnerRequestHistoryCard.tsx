'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, FileText, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';

import { formatPrice } from '@/lib/utils';
import {
  type PartnerProductRequestListItem,
  useGetPartnerProductRequestDetailQuery,
} from '@/lib/api/endpoints/partnerProductRequestApi';
import { useGetPartnerProductByIdQuery } from '@/lib/api/endpoints/partnerProductApi';
import {
  PARTNER_QUOTATION_STATUS,
  getPartnerQuotationStatusMeta,
  getPartnerRequestStatusMeta,
} from '@/lib/utils/partnerRequestStatus';
import {
  useGetPartnerQuotationByRequestIdQuery,
  useUpdatePartnerQuotationStatusMutation,
} from '@/lib/api/endpoints/partnerProductQuotationApi';
import ConfirmQuotationRejectModal from '@/components/custom/ConfirmQuotationRejectModal';

type Props = {
  request: PartnerProductRequestListItem;
  onChanged?: () => void;
};

function formatDate(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function PartnerRequestHistoryCard({ request, onChanged }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const {
    data: requestDetail,
    isFetching: isFetchingRequestDetail,
    error: requestDetailError,
  } = useGetPartnerProductRequestDetailQuery(request.id);

  const firstDetail = requestDetail?.details?.[0];
  const partnerProductId = firstDetail?.partnerProductId;

  const {
    data: product,
    isFetching: isFetchingProduct,
    error: productError,
  } = useGetPartnerProductByIdQuery(partnerProductId ?? '', {
    skip: !partnerProductId,
  });

  const {
    data: quotation,
    isFetching: isFetchingQuotation,
    error: quotationError,
    refetch: refetchQuotation,
  } = useGetPartnerQuotationByRequestIdQuery(request.id, {
    skip: !expanded,
  });

  const [updateQuotationStatus, { isLoading: isUpdatingQuotationStatus }] =
    useUpdatePartnerQuotationStatusMutation();

  const requestStatus = getPartnerRequestStatusMeta(request.status);
  const quotationStatus = getPartnerQuotationStatusMeta(quotation?.status);

  const quotationErrorStatus = (quotationError as { status?: number } | undefined)?.status;
  const requestDetailErrorStatus = (requestDetailError as { status?: number } | undefined)?.status;
  const productErrorStatus = (productError as { status?: number } | undefined)?.status;

  const hasQuotation = !!quotation;
  const quotationNotCreatedYet = quotationErrorStatus === 404;

  const canRespondToQuotation = quotation && quotation.status === PARTNER_QUOTATION_STATUS.QUOTED;

  const productName = useMemo(() => {
    if (product?.name?.trim()) return product.name;
    if (isFetchingRequestDetail || isFetchingProduct) return 'Loading product...';
    return 'Unnamed product';
  }, [product?.name, isFetchingRequestDetail, isFetchingProduct]);

  const productDescription = useMemo(() => {
    return product?.description?.trim() || 'No description available.';
  }, [product?.description]);

  const productImage =
    product?.thumbnailUrl || product?.previewImages?.[0] || product?.previewAssets?.[0] || null;

  const requestQuantity = firstDetail?.quantity ?? request.totalRequestedQuantity ?? '--';

  async function handleAcceptQuotation() {
    if (!quotation?.id) return;

    try {
      await updateQuotationStatus({
        id: quotation.id,
        newStatus: PARTNER_QUOTATION_STATUS.ACCEPTED,
      }).unwrap();

      toast.success('Quotation accepted successfully');
      await refetchQuotation();
      onChanged?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to accept quotation');
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

      toast.success('Quotation rejected successfully');
      setRejectModalOpen(false);
      await refetchQuotation();
      onChanged?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject quotation');
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-slate-900">{productName}</h3>
                <p className="text-sm text-slate-500">
                  Request code: <span className="font-semibold text-slate-700">{request.code}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <p>
                Sent date:{' '}
                <span className="font-medium text-slate-800">{formatDate(request.createdAt)}</span>
              </p>
              <p>
                Quantity: <span className="font-medium text-slate-800">{requestQuantity}</span>
              </p>
            </div>

            {requestDetailErrorStatus && requestDetailErrorStatus !== 404 ? (
              <p className="mt-2 text-sm text-red-600">Failed to load request detail.</p>
            ) : null}

            {productErrorStatus && productErrorStatus !== 404 ? (
              <p className="mt-2 text-sm text-red-600">Failed to load product information.</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${requestStatus.className}`}
            >
              {requestStatus.label}
            </span>

            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label={expanded ? 'Collapse request' : 'Expand request'}
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="space-y-5 border-t border-slate-200 bg-slate-50 px-5 py-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Customer Request</h4>
                  <p className="text-sm text-slate-500">Information that you submitted</p>
                </div>
              </div>

              {isFetchingRequestDetail || (partnerProductId && isFetchingProduct) ? (
                <div className="space-y-3">
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              ) : requestDetail?.details?.length ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border bg-white sm:h-28 sm:w-28">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h5 className="truncate text-lg font-bold text-slate-900">
                            {productName}
                          </h5>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                            {productDescription}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${requestStatus.className}`}
                        >
                          {requestStatus.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Request code
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{request.code}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Sent date
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Quantity
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{requestQuantity}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Note
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {requestDetail.note?.trim() || 'No note from customer.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No request item detail found.
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <ReceiptText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Manager Quotation</h4>
                  <p className="text-sm text-slate-500">Quotation returned from manager</p>
                </div>
              </div>

              {isFetchingQuotation ? (
                <div className="space-y-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              ) : hasQuotation ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Quotation code
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{quotation.code}</p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${quotationStatus.className}`}
                    >
                      {quotationStatus.label}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Product amount
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {formatPrice(quotation.subTotalAmount ?? 0)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Shipping fee
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {formatPrice(quotation.shippingFee ?? 0)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        Import tax
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {formatPrice(quotation.importTaxAmount ?? 0)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-900 p-4 text-white">
                      <p className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
                        Grand total
                      </p>
                      <p className="mt-2 text-lg font-extrabold">
                        {formatPrice(quotation.grandTotalAmount ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Manager note
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {quotation.note?.trim() || 'No note from manager.'}
                    </p>
                  </div>

                  {canRespondToQuotation ? (
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setRejectModalOpen(true)}
                        disabled={isUpdatingQuotationStatus}
                        className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Reject quotation
                      </button>

                      <button
                        type="button"
                        onClick={handleAcceptQuotation}
                        disabled={isUpdatingQuotationStatus}
                        className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {isUpdatingQuotationStatus ? 'Processing...' : 'Accept quotation'}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : quotationNotCreatedYet ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  Manager has not sent a quotation for this request yet.
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-5 text-sm text-red-600">
                  Failed to load quotation information.
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <ConfirmQuotationRejectModal
        open={rejectModalOpen}
        loading={isUpdatingQuotationStatus}
        title="Reject quotation"
        description="Please tell us why you want to reject this quotation."
        confirmText="Reject quotation"
        noteLabel="Reason for rejection"
        notePlaceholder="Enter your reason"
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={handleRejectQuotation}
      />
    </>
  );
}
