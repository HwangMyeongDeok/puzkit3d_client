'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Calendar, Eye } from 'lucide-react';

import { formatPrice } from '@/lib/utils';
import {
  type PartnerProductRequestListItem,
  useGetPartnerProductRequestDetailQuery,
} from '@/lib/api/endpoints/partnerProductRequestApi';
import { useGetPartnerProductsQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import {
  getPartnerRequestStatusMeta,
} from '@/lib/utils/partnerRequestStatus';
import { useGetPartnerQuotationByRequestIdQuery } from '@/lib/api/endpoints/partnerProductQuotationApi';

type Props = {
  request: PartnerProductRequestListItem;
  onChanged?: () => void;
};

function formatDate(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function PartnerRequestHistoryCard({ request }: Props) {
  const requestStatus = getPartnerRequestStatusMeta(request.status);

  const { data: requestDetail } = useGetPartnerProductRequestDetailQuery(request.id);

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

  const requestStatusNumber = Number(request.status ?? 0) || 0;

const { data: quotation } = useGetPartnerQuotationByRequestIdQuery(request.id, {
  skip: requestStatusNumber < 4,
});

  const productMap = useMemo(() => {
    return new Map((productResponse?.items ?? []).map((item) => [item.id, item]));
  }, [productResponse?.items]);

  const partnerMap = useMemo(() => {
    return new Map((partnerResponse?.items ?? []).map((item) => [item.id, item]));
  }, [partnerResponse?.items]);

  const requestItems = requestDetail?.details ?? [];
  const firstItem = requestItems[0];
  const firstProduct = firstItem ? productMap.get(firstItem.partnerProductId) : undefined;

  const totalQuantity = useMemo(() => {
    if (requestItems.length > 0) {
      return requestItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    }
    return request.totalRequestedQuantity ?? 0;
  }, [requestItems, request.totalRequestedQuantity]);

  const referenceTotalAmount = useMemo(() => {
    if (requestItems.length > 0) {
      return requestItems.reduce((sum, item) => {
        const lineTotal = item.referenceTotalAmount ?? (item.referencePrice ?? 0) * (item.quantity ?? 0);
        return sum + lineTotal;
      }, 0);
    }
    return 0;
  }, [requestItems]);

  const displayTotalAmount = quotation?.grandTotalAmount ?? referenceTotalAmount;
  const displayPartnerName = partnerMap.get(request.partnerId)?.name || request.partnerId;
  const displayUnitPrice = firstItem?.referencePrice ?? 0;
  const displayQuantity = firstItem?.quantity ?? request.totalRequestedQuantity ?? 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Box className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                {request.code}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(request.createdAt)}
                </span>
                <span>{displayPartnerName}</span>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${requestStatus.className}`}
          >
            {requestStatus.label}
          </span>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 md:min-w-[360px]">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {firstProduct?.thumbnailUrl ? (
                  <Image
                    src={firstProduct.thumbnailUrl}
                    alt={firstProduct.name}
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
                <p className="truncate text-lg font-bold text-slate-900">
                  {firstProduct?.name || 'Requested product'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {formatPrice(displayUnitPrice)}{' '}
                  <span className="mx-1 text-slate-400">×</span>
                  {displayQuantity}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Total Amount
                </p>
                <p className="mt-1 text-3xl font-extrabold text-[#003f88]">
                  {formatPrice(displayTotalAmount)}
                </p>
              </div>

              <Link
                href={`/profile/partner-requests/${request.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
