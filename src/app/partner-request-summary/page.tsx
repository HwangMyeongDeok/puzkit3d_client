'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Lock,
  Store,
  Info,
  ReceiptText,
} from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/constants';
import { formatPrice } from '@/lib/utils';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import { useCreatePartnerProductRequestMutation } from '@/lib/api/endpoints/partnerProductRequestApi';
import { useGetPartnerCartQuery, type PartnerCartItem } from '@/lib/api/endpoints/partnerCartApi';

const STORAGE_KEY = 'partner_request_selected_ids';
const DEFAULT_PARTNER_MEDIA_BASE_URL =
  'https://puzkit3d-media-s3-bucket.s3.ap-southeast-1.amazonaws.com';

const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || DEFAULT_PARTNER_MEDIA_BASE_URL
).replace(/\/$/, '');

function isNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: number | string }).status === 404
  );
}

function resolvePartnerImageUrl(url?: string | null) {
  if (!url) return `${DEFAULT_PARTNER_MEDIA_BASE_URL}/partner-products/default.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${MEDIA_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

function getPartnerUnitPrice(item: PartnerCartItem) {
  if (item.unitPrice != null) return item.unitPrice;
  return item.productDetails.referencePrice ?? 0;
}

function getPartnerLineTotal(item: PartnerCartItem) {
  if (item.totalPrice != null) return item.totalPrice;
  return getPartnerUnitPrice(item) * (item.quantity ?? 1);
}

function getMockDesiredDeliveryDate(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function ReferencePriceNotice() {
  return (
    <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Info className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black tracking-tight text-amber-900">
            Reference price only
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Prices shown on this page are estimated reference prices only. Final pricing may
            change after quotation, shipping fee, and import fee.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PartnerRequestSummaryPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const {
    data: partnerCartDto,
    isLoading: isPartnerCartLoading,
    error: partnerCartError,
  } = useGetPartnerCartQuery();

  const { data: partnerResponse } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const [createPartnerProductRequest, { isLoading: isSubmitting }] =
    useCreatePartnerProductRequestMutation();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setSelectedIds([]);
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSelectedIds(parsed.filter((x) => typeof x === 'string'));
      } else {
        setSelectedIds([]);
      }
    } catch {
      setSelectedIds([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  const partnerItems: PartnerCartItem[] = isNotFoundError(partnerCartError)
    ? []
    : (partnerCartDto?.items ?? []);

  const partnerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const partner of partnerResponse?.items ?? []) {
      map.set(partner.id, partner.name);
    }
    return map;
  }, [partnerResponse?.items]);

  const partnerSlugById = useMemo(() => {
    const map = new Map<string, string>();
    for (const partner of partnerResponse?.items ?? []) {
      map.set(partner.id, partner.slug);
    }
    return map;
  }, [partnerResponse?.items]);

  const selectedItems = useMemo(() => {
    if (selectedIds.length === 0) return [];
    const idSet = new Set(selectedIds);
    return partnerItems.filter((item) => idSet.has(item.itemId));
  }, [partnerItems, selectedIds]);

  const groupedItems = useMemo(() => {
    const map = new Map<
      string,
      { partnerId: string; partnerName: string; items: PartnerCartItem[] }
    >();

    for (const item of selectedItems) {
      const partnerId = item.productDetails.partnerId;
      const partnerName = partnerNameById.get(partnerId) || 'Partner';

      if (!map.has(partnerId)) {
        map.set(partnerId, { partnerId, partnerName, items: [] });
      }

      map.get(partnerId)!.items.push(item);
    }

    return Array.from(map.values());
  }, [selectedItems, partnerNameById]);

  const totalAmount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + getPartnerLineTotal(item), 0),
    [selectedItems]
  );

  const totalQuantity = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    [selectedItems]
  );

  const partnerRequestCount = groupedItems.length;

  useEffect(() => {
    if (!hydrated || isPartnerCartLoading) return;

    if (selectedIds.length === 0 || selectedItems.length === 0) {
      toast.warning('No partner products selected.');
      router.replace(`${ROUTES.CART}?tab=partner`);
    }
  }, [hydrated, isPartnerCartLoading, selectedIds.length, selectedItems.length, router]);

  async function handleConfirmRequest() {
    if (groupedItems.length === 0) return;

    const successPartners: string[] = [];
    const failedPartners: string[] = [];

    for (const group of groupedItems) {
      try {
        await createPartnerProductRequest({
          partnerId: group.partnerId,
          desiredDeliveryDate: getMockDesiredDeliveryDate(7),
          items: group.items.map((item) => ({
            partnerProductId: item.productDetails.productId || item.itemId,
            quantity: item.quantity ?? 1,
          })),
        }).unwrap();

        successPartners.push(group.partnerName);
      } catch {
        failedPartners.push(group.partnerName);
      }
    }

    if (successPartners.length > 0 && failedPartners.length === 0) {
      sessionStorage.removeItem(STORAGE_KEY);
      toast.success('Request created successfully');
      router.push(ROUTES.CHECKOUT_SUCCESS_QUOTE);
      return;
    }

    if (successPartners.length > 0 && failedPartners.length > 0) {
      toast.warning(
        `Created ${successPartners.length} request(s), but failed for: ${failedPartners.join(', ')}`
      );
      return;
    }

    toast.error(`Failed to create request for: ${failedPartners.join(', ')}`);
  }

  if (!hydrated || isPartnerCartLoading) {
    return (
      <div className="container-custom flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-slate-900" />
        <p className="text-slate-500">Loading request summary...</p>
      </div>
    );
  }

  return (
    <div className="container-custom min-h-screen bg-slate-50/60 py-8 lg:py-12">
      <Link
        href={`${ROUTES.CART}?tab=partner`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <div className="mb-6">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
          Your Request
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          Review your selected partner products before sending the request.
        </p>
      </div>

      <ReferencePriceNotice />

      <div className="mt-6 flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          {groupedItems.map((group) => {
            const partnerTotal = group.items.reduce(
              (sum, item) => sum + getPartnerLineTotal(item),
              0
            );

            return (
              <div
                key={group.partnerId}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Store className="h-5 w-5 text-slate-700" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Partner
                    </p>
                    <h2 className="truncate text-lg font-black tracking-tight text-slate-900">
                      {group.partnerName}
                    </h2>
                  </div>

                  <div className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    {group.items.length} item{group.items.length > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 px-6">
                  {group.items.map((item) => {
                    const partnerSlug = partnerSlugById.get(item.productDetails.partnerId);
                    const href =
                      partnerSlug && item.productDetails.slug
                        ? ROUTES.PARTNER_PRODUCT_DETAIL(partnerSlug, item.productDetails.slug)
                        : ROUTES.BRANDS;

                    return (
                      <div
                        key={item.itemId}
                        className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <Image
                              src={resolvePartnerImageUrl(item.productDetails.thumbnailUrl)}
                              alt={item.productDetails.productName}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <Link href={href} className="group block">
                              <h3 className="truncate text-base font-black tracking-tight text-slate-900 transition group-hover:text-slate-700">
                                {item.productDetails.productName}
                              </h3>
                            </Link>

                            <div className="mt-2">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Reference price
                              </p>
                              <p className="text-sm font-semibold text-slate-600">
                                {formatPrice(getPartnerUnitPrice(item))}
                                <span className="ml-1 text-slate-400">/ item</span>
                              </p>
                            </div>

                            <p className="mt-2 text-sm font-medium text-slate-500">
                              Quantity:{' '}
                              <span className="font-bold text-slate-700">
                                {item.quantity ?? 1}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Sub total
                          </p>
                          <p className="mt-1 text-xl font-black tracking-tight text-[#0b4a8b]">
                            {formatPrice(getPartnerLineTotal(item))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 px-6 py-5">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Total Amount
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-tight text-[#0b4a8b]">
                        {formatPrice(partnerTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b bg-slate-50/80 border-slate-100 px-6 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                    <ReceiptText className="h-4 w-4 text-slate-700" />
                  </div>

                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Request Total
                  </h2>
                </div>

                <div className="shrink-0 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-700 shadow-sm">
                  {partnerRequestCount} request{partnerRequestCount > 1 ? 's' : ''}
                </div>
              </div>

              <p className="mt-1 mb-0.1 text-center text-[12px] text-slate-400">
                Each request can only contain products from one partner.
              </p>

            </div>

            <div className="px-6 py-4">
              <div className="mb-5 mt-0.1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                    Total Quantity
                  </span>
                  <span className="text-3xl font-black text-slate-900">{totalQuantity}</span>
                </div>
              </div>

              <div className="space-y-5">
                {groupedItems.map((group, groupIndex) => {
                  const groupTotal = group.items.reduce(
                    (sum, item) => sum + getPartnerLineTotal(item),
                    0
                  );

                  const groupQuantity = group.items.reduce(
                    (sum, item) => sum + (item.quantity ?? 1),
                    0
                  );

                  return (
                    <div key={group.partnerId}>
                      {groupIndex > 0 ? <div className="mb-5 h-px bg-slate-200" /> : null}

                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Request {groupIndex + 1}
                          </p>
                          <p className="truncate text-base font-black text-slate-900">
                            {group.partnerName}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                          {group.items.length} item{group.items.length > 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {group.items.map((item) => (
                          <div
                            key={item.itemId}
                            className="flex items-start justify-between gap-4 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-700">
                                {item.productDetails.productName}

                              </p>
                              <p className="truncate font-semibold text-slate-700">
                                × {item.quantity ?? 1}

                              </p>

                            </div>

                            <p className="shrink-0 font-bold text-slate-900">
                              {formatPrice(getPartnerLineTotal(item))}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-600">
                            Request {groupIndex + 1} total ({groupQuantity} item
                            {groupQuantity > 1 ? 's' : ''})
                          </span>
                          <span className="text-lg font-black text-[#0b4a8b]">
                            {formatPrice(groupTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5">
                {/* <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold text-slate-900">Grand Total</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Final price may change after quotation.
                    </p>
                  </div>

                  <p className="text-4xl font-black tracking-tight text-[#0b4a8b]">
                    {formatPrice(totalAmount)}
                  </p>
                </div> */}
                <p className="mt-4 text-center text-[11px] text-slate-400">
                  Final review before confirming your request.
                </p>
                <button
                  type="button"
                  onClick={handleConfirmRequest}
                  disabled={isSubmitting || groupedItems.length === 0}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b4a8b] px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#0a427b] active:scale-[0.99] disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Confirm {partnerRequestCount > 1 ? `${partnerRequestCount} Requests` : 'Request'}
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] text-slate-400">
                  By clicking, you agree to our{' '}
                  <span className="cursor-pointer underline underline-offset-2">
                    Terms of Service
                  </span>
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}