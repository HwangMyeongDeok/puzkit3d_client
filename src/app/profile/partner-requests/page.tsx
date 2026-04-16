'use client';

import { useEffect, useMemo, useRef, useState, type WheelEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Loader2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Box,
  Store,
  Funnel,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { formatPrice } from '@/lib/utils';
import {
  useGetMyPartnerProductRequestsQuery,
  useGetPartnerProductRequestDetailQuery,
} from '@/lib/api/endpoints/partnerProductRequestApi';
import { useGetPartnerProductsQuery } from '@/lib/api/endpoints/partnerProductApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import { getPartnerRequestStatusMeta } from '@/lib/utils/partnerRequestStatus';

type FilterKey =
  | 'all'
  | 'pending'
  | 'cancelled'
  | 'approved'
  | 'quoted'
  | 'accepted'
  | 'rejected';

type RequestPreviewProduct = {
  id: string;
  productName: string;
  thumbnailUrl?: string;
  unitPrice: number;
  quantity: number;
};

const FILTERS: Array<{
  key: FilterKey;
  label: string;
  status?: number;
}> = [
  { key: 'all', label: 'All Requests' },
  { key: 'pending', label: 'Pending', status: 0 },
  { key: 'cancelled', label: 'Cancelled by Staff', status: 1 },
  { key: 'approved', label: 'Approved', status: 2 },
  { key: 'quoted', label: 'Quoted', status: 4 },
  { key: 'accepted', label: 'Accepted', status: 5 },
  { key: 'rejected', label: 'Rejected by Customer', status: 6 },
];

const DEFAULT_PARTNER_MEDIA_BASE_URL =
  'https://puzkit3d-media-s3-bucket.s3.ap-southeast-1.amazonaws.com';

const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_PARTNER_MEDIA_BASE_URL
).replace(/\/$/, '');

const INITIAL_FETCH_PAGE_SIZE = 20;

function formatDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date);
}

function resolvePartnerImageUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${MEDIA_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

function getRequestTotalAmount(details?: Array<any>) {
  if (!details?.length) return 0;

  return details.reduce((sum, item) => {
    const unitPrice = item.referencePrice ?? item.unitPrice ?? item.price ?? 0;
    const quantity = item.quantity ?? item.qty ?? 0;
    const lineTotal = item.referenceTotalAmount ?? item.totalAmount ?? unitPrice * quantity;
    return sum + lineTotal;
  }, 0);
}

function RequestPreviewItem({
  productName,
  thumbnailUrl,
  unitPrice,
  quantity,
}: {
  productName: string;
  thumbnailUrl?: string;
  unitPrice: number;
  quantity: number;
}) {
  return (
    <div className="bg-muted/30 border-border/50 hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-2 transition-colors">
      <div className="bg-card relative h-14 w-14 shrink-0 overflow-hidden rounded-md border shadow-sm">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={productName}
            fill
            sizes="56px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-semibold" title={productName}>
          {productName}
        </p>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-muted-foreground truncate text-xs">
            {formatPrice(unitPrice)} / item
          </p>
          <span className="bg-background rounded-full border px-2 py-0.5 text-xs font-bold shadow-sm">
            x{quantity}
          </span>
        </div>
      </div>
    </div>
  );
}

function PartnerRequestCard({
  request,
  productMap,
  partnerMap,
}: {
  request: any;
  productMap: Map<string, any>;
  partnerMap: Map<string, any>;
}) {
  const { data: requestDetail, isFetching } = useGetPartnerProductRequestDetailQuery(request.id, {
    skip: !request?.id,
    refetchOnMountOrArgChange: true,
  });

  const resolved = requestDetail ?? request;
  const requestStatus = getPartnerRequestStatusMeta(resolved.status ?? request.status);

  const partnerId = resolved.partnerId ?? request.partnerId;
  const partnerName = partnerMap.get(partnerId)?.name || request.partnerName || 'Partner';

  const details =
    resolved.details ??
    resolved.requestDetails ??
    resolved.items ??
    resolved.partnerProductRequestDetails ??
    [];

  const requestProducts: RequestPreviewProduct[] = useMemo(() => {
    return details.map((detail: any, index: number) => {
      const productId =
        detail?.partnerProductId ?? detail?.productId ?? detail?.itemId ?? detail?.id;

      const product = productId ? productMap.get(productId) : undefined;

      const rawThumbnail =
        product?.thumbnailUrl ??
        detail?.thumbnailUrl ??
        detail?.imageUrl ??
        request?.thumbnailUrl ??
        request?.previewAssets?.[0] ??
        '';

      const unitPrice =
        detail?.referencePrice ??
        detail?.unitPrice ??
        detail?.price ??
        request?.referencePrice ??
        request?.unitPrice ??
        0;

      const quantity = detail?.quantity ?? detail?.qty ?? request?.quantity ?? 0;

      return {
        id: detail?.id ?? productId ?? `${request.id}-${index}`,
        productName:
          product?.name ??
          detail?.productName ??
          detail?.partnerProductName ??
          request?.name ??
          request?.productName ??
          'Product',
        thumbnailUrl: resolvePartnerImageUrl(rawThumbnail),
        unitPrice,
        quantity,
      };
    });
  }, [details, productMap, request]);

  const previewProducts: RequestPreviewProduct[] = requestProducts.slice(0, 3);

  const totalAmount =
    resolved.totalAmount ??
    resolved.referenceTotalAmount ??
    resolved.subTotalAmount ??
    resolved.grandTotalAmount ??
    request.totalAmount ??
    request.referenceTotalAmount ??
    getRequestTotalAmount(details);

  const requestTitle =
    typeof request.code === 'string' && request.code.startsWith('PPR')
      ? `Request #${request.code}`
      : `Request #${request.code ?? '--'}`;

  return (
    <div className="bg-card border-border hover:border-brand/30 flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-start">
        <div className="flex items-start gap-3">
          <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Box className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-lg leading-none font-bold">{requestTitle}</h3>

            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(resolved.createdAt ?? request.createdAt)}
              </span>

              <span className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                <Store className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">{partnerName}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide shadow-sm ${requestStatus.className}`}
          >
            {requestStatus.label}
          </span>
        </div>
      </div>

      <div className="py-2">
        {isFetching && requestProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">Loading request products...</p>
        ) : requestProducts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previewProducts.map((item: RequestPreviewProduct) => (
              <RequestPreviewItem
                key={item.id}
                productName={item.productName}
                thumbnailUrl={item.thumbnailUrl}
                unitPrice={item.unitPrice}
                quantity={item.quantity}
              />
            ))}

            {requestProducts.length > 3 && (
              <div className="border-border text-muted-foreground bg-muted/10 flex h-full min-h-16 items-center justify-center rounded-lg border border-dashed text-xs font-medium">
                +{requestProducts.length - 3} other products
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">No preview images.</p>
        )}
      </div>

      <div className="border-border flex flex-col justify-between gap-4 border-t pt-4 md:flex-row md:items-center">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Total Amount
          </span>
          <span className="text-brand text-xl font-bold">{formatPrice(totalAmount)}</span>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          <Link
            href={`/profile/partner-requests/${request.id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-semibold shadow-sm transition-colors md:w-auto"
          >
            <Eye className="h-4 w-4" /> View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PartnerRequestsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const pageSize = 5;

  const filterScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetMyPartnerProductRequestsQuery({
    ascending: false,
    pageNumber: 1,
    pageSize: INITIAL_FETCH_PAGE_SIZE,
  });

  const { data: partnerProductsResponse } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 50,
    ascending: true,
  });

  const { data: partnerResponse } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 50,
    ascending: true,
  });

  const productMap = useMemo(() => {
    return new Map((partnerProductsResponse?.items ?? []).map((item) => [item.id, item]));
  }, [partnerProductsResponse?.items]);

  const partnerMap = useMemo(() => {
    return new Map((partnerResponse?.items ?? []).map((item) => [item.id, item]));
  }, [partnerResponse?.items]);

  const allItems = useMemo(() => data?.items ?? [], [data?.items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return allItems;

    const selectedFilter = FILTERS.find((item) => item.key === activeFilter);
    if (selectedFilter?.status === undefined) return allItems;

    return allItems.filter((item: any) => item.status === selectedFilter.status);
  }, [allItems, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, pageNumber, pageSize]);

  const showRequestError = isError && !isLoading && allItems.length === 0;

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(1);
    }
  }, [pageNumber, totalPages]);

  function handleFilterChange(filterKey: FilterKey) {
    setActiveFilter(filterKey);
    setPageNumber(1);
  }

  function handleFilterWheel(e: WheelEvent<HTMLDivElement>) {
    const container = filterScrollRef.current;
    if (!container) return;

    const hasHorizontalOverflow = container.scrollWidth > container.clientWidth;
    if (!hasHorizontalOverflow) return;

    e.preventDefault();
    container.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
  }

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    const container = filterScrollRef.current;
    if (!container) return;

    isDraggingRef.current = true;
    dragStartXRef.current = e.pageX - container.offsetLeft;
    startScrollLeftRef.current = container.scrollLeft;
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const container = filterScrollRef.current;
    if (!container || !isDraggingRef.current) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = x - dragStartXRef.current;
    container.scrollLeft = startScrollLeftRef.current - walk;
  }

  function stopDragging() {
    isDraggingRef.current = false;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">My Request History</h1>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-600">Partner Product Requests</p>

        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-2 text-slate-600">
            <Funnel className="h-4 w-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <div
            ref={filterScrollRef}
            onWheel={handleFilterWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            onDragStart={(e) => e.preventDefault()}
            className="scrollbar-hide cursor-grab overflow-x-auto overflow-y-hidden active:cursor-grabbing"
          >
            <div className="flex min-w-max items-center gap-3 pr-2 select-none">
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => handleFilterChange(filter.key)}
                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="text-brand h-8 w-8 animate-spin" />
        </div>
      ) : showRequestError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="font-medium text-red-600">
            An error occurred while loading your request history.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center shadow-sm">
          <Receipt className="text-muted-foreground/30 mb-5 h-20 w-20" />
          <h2 className="mb-2 text-xl font-bold text-slate-700">
            {activeFilter !== 'all' ? 'No requests found for this status' : 'No requests yet'}
          </h2>
          <p className="text-muted-foreground">
            {activeFilter !== 'all'
              ? 'Try selecting "All Requests" to see your full request history.'
              : 'Your partner product requests will appear here after you submit them.'}
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-5">
          {isFetching && !isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-[1px]">
              <Loader2 className="text-brand h-8 w-8 animate-spin" />
            </div>
          ) : null}

          {paginatedItems.map((request: any) => (
            <PartnerRequestCard
              key={request.id}
              request={request}
              productMap={productMap}
              partnerMap={partnerMap}
            />
          ))}

          {filteredItems.length > pageSize ? (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                disabled={pageNumber <= 1 || isFetching}
                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <span className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                Page {pageNumber} / {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={pageNumber >= totalPages || isFetching}
                onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                className="gap-2 rounded-lg"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}