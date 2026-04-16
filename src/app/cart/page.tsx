'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  Package,
  ShoppingBag,
  CreditCard,
  FileText,
  Trash2,
  AlertCircle,
  BriefcaseBusiness,
  Minus,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/stores';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { useGetCartQuery, useUpdateCartItemMutation } from '@/lib/api/endpoints/cartApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import {
  useGetPartnerCartQuery,
  useRemoveItemFromPartnerCartMutation,
  useUpdatePartnerCartItemMutation,
  type PartnerCartItem,
} from '@/lib/api/endpoints/partnerCartApi';
import { ROUTES } from '@/constants';
import { formatPrice } from '@/lib/utils';
import { setSelectedItems } from '@/stores/slices/checkoutSlice';
import type { CartItemDto } from '@/types/api/cart.api.types';

import { Button } from '@/components/ui/button';
import CartLoading from '@/components/cart/CartLoading';
import CartEmpty from '@/components/cart/CartEmpty';
import CartItemRow from '@/components/cart/CartItemRow';

const PARTNER_REQUEST_STORAGE_KEY = 'partner_request_selected_ids';
const PARTNER_REQUEST_QUANTITY_STORAGE_KEY = 'partner_request_selected_quantities';
const PARTNER_REQUEST_SUMMARY_ROUTE = '/partner-request-summary';
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
  if (!url) {
    return `${DEFAULT_PARTNER_MEDIA_BASE_URL}/partner-products/default.png`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${MEDIA_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

function getPartnerUnitPrice(item: PartnerCartItem) {
  if (item.unitPrice != null) return item.unitPrice;
  return item.productDetails.referencePrice ?? 0;
}

function getPartnerLineTotal(item: PartnerCartItem) {
  if (item.totalPrice != null) return item.totalPrice;
  return getPartnerUnitPrice(item) * item.quantity;
}

function instockKey(itemId: string) {
  return `instock:${itemId}`;
}

function partnerKey(itemId: string) {
  return `partner:${itemId}`;
}

function getPartnerSelectionAliases(item: PartnerCartItem) {
  const productDetails = item.productDetails as PartnerCartItem['productDetails'] & {
    productId?: string;
    id?: string;
  };

  return Array.from(
    new Set(
      [item.itemId, productDetails.productId, productDetails.id].filter(
        (value): value is string => Boolean(value && String(value).trim())
      )
    )
  );
}

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowVariantId = searchParams.get('buyNowVariant');
  const { isAuthenticated, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const requestedTab = searchParams.get('tab');

  const [activeCartTab, setActiveCartTab] = useState<'instock' | 'partner'>(
    requestedTab === 'partner' ? 'partner' : 'instock'
  );
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    data: cartDto,
    isLoading: isInstockLoading,
    isFetching: isInstockFetching,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: partnerCartDto,
    isLoading: isPartnerLoading,
    isFetching: isPartnerFetching,
    error: partnerCartError,
    refetch: refetchPartnerCart,
  } = useGetPartnerCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  const { data: partnerResponse } = useGetPartnersQuery(
    {
      pageNumber: 1,
      pageSize: 100,
      ascending: true,
    },
    {
      skip: isAuthLoading || !isAuthenticated,
    }
  );

  const [updateCartItem, { isLoading: isUpdatingInstock }] = useUpdateCartItemMutation();
  const [updatePartnerCartItem, { isLoading: isUpdatingPartner }] =
    useUpdatePartnerCartItemMutation();
  const [removePartnerItem, { isLoading: isRemovingPartnerItem }] =
    useRemoveItemFromPartnerCartMutation();

  const instockItems: CartItemDto[] = cartDto?.items ?? [];
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

  const groupedPartnerItems = useMemo(() => {
    const map = new Map<
      string,
      {
        partnerId: string;
        partnerName: string;
        partnerSlug: string;
        items: PartnerCartItem[];
      }
    >();

    for (const item of partnerItems) {
      const partnerId = item.productDetails.partnerId;
      const partnerName = partnerNameById.get(partnerId) || 'Partner';
      const partnerSlug = partnerSlugById.get(partnerId) || '';

      if (!map.has(partnerId)) {
        map.set(partnerId, {
          partnerId,
          partnerName,
          partnerSlug,
          items: [],
        });
      }

      map.get(partnerId)!.items.push(item);
    }

    return Array.from(map.values());
  }, [partnerItems, partnerNameById, partnerSlugById]);

  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (requestedTab === 'partner') {
      setActiveCartTab('partner');
    } else if (requestedTab === 'instock') {
      setActiveCartTab('instock');
    }
  }, [requestedTab]);

  useEffect(() => {
    if (buyNowVariantId && instockItems.length > 0) {
      const targetItem = instockItems.find((item) => item.itemId === buyNowVariantId);

      if (targetItem) {
        setCheckedKeys((prev) => {
          const next = new Set(prev);
          next.add(instockKey(targetItem.itemId));
          return next;
        });

        router.replace(ROUTES.CART, { scroll: false });
      }
    }
  }, [buyNowVariantId, instockItems, router]);

  useEffect(() => {
    router.prefetch(ROUTES.CHECKOUT);
    router.prefetch(PARTNER_REQUEST_SUMMARY_ROUTE);
  }, [router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const refreshAll = () => {
      refetchCart();
      refetchPartnerCart();
    };

    refreshAll();

    const handleFocus = () => refreshAll();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAuthLoading, isAuthenticated, refetchCart, refetchPartnerCart]);

  const isPageLoading =
    isAuthLoading ||
    (isInstockLoading && !cartDto) ||
    (isPartnerLoading && !partnerCartDto && !isNotFoundError(partnerCartError));

  const hasAnyItem = instockItems.length > 0 || partnerItems.length > 0;

  const selectedInstockIds = useMemo(
    () =>
      instockItems
        .filter(
          (item) =>
            checkedKeys.has(instockKey(item.itemId)) &&
            item.availableInventory > 0 &&
            item.isValidPrice !== false &&
            item.quantity <= item.availableInventory
        )
        .map((item) => item.itemId),
    [instockItems, checkedKeys]
  );

  const selectedPartnerItems = useMemo(
    () => partnerItems.filter((item) => checkedKeys.has(partnerKey(item.itemId))),
    [partnerItems, checkedKeys]
  );

  const selectedPartnerIds = useMemo(
    () => selectedPartnerItems.map((item) => item.itemId),
    [selectedPartnerItems]
  );

  const selectedInstockTotal = useMemo(
    () =>
      instockItems.reduce((sum, item) => {
        if (!checkedKeys.has(instockKey(item.itemId))) return sum;
        if (
          item.availableInventory === 0 ||
          item.isValidPrice === false ||
          item.quantity > item.availableInventory
        ) {
          return sum;
        }

        return sum + (item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1));
      }, 0),
    [instockItems, checkedKeys]
  );

  const selectedPartnerTotal = useMemo(
    () =>
      partnerItems.reduce((sum, item) => {
        if (!checkedKeys.has(partnerKey(item.itemId))) return sum;
        return sum + getPartnerLineTotal(item);
      }, 0),
    [partnerItems, checkedKeys]
  );

  const isInstockTab = activeCartTab === 'instock';

  const activeSelectedCount = isInstockTab
    ? selectedInstockIds.length
    : selectedPartnerIds.length;

  const activeSelectedTotal = isInstockTab
    ? selectedInstockTotal
    : selectedPartnerTotal;

  const activeItemCount = isInstockTab ? instockItems.length : partnerItems.length;

  const selectableInstockItems = instockItems.filter(
    (item) =>
      item.availableInventory > 0 &&
      item.isValidPrice !== false &&
      item.quantity <= item.availableInventory
  );

  const isInstockAllChecked =
    selectableInstockItems.length > 0 &&
    selectableInstockItems.every((item) => checkedKeys.has(instockKey(item.itemId)));

  const isInstockPartialChecked =
    selectableInstockItems.some((item) => checkedKeys.has(instockKey(item.itemId))) &&
    !isInstockAllChecked;

  const isPartnerAllChecked =
    partnerItems.length > 0 &&
    partnerItems.every((item) => checkedKeys.has(partnerKey(item.itemId)));

  const isPartnerPartialChecked =
    partnerItems.some((item) => checkedKeys.has(partnerKey(item.itemId))) && !isPartnerAllChecked;

  const toggleChecked = (key: string) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleInstockSectionAll = (checked: boolean) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);

      instockItems.forEach((item) => {
        const key = instockKey(item.itemId);
        const selectable =
          item.availableInventory > 0 &&
          item.isValidPrice !== false &&
          item.quantity <= item.availableInventory;

        if (!selectable) {
          next.delete(key);
          return;
        }

        if (checked) next.add(key);
        else next.delete(key);
      });

      return next;
    });
  };

  const togglePartnerSectionAll = (checked: boolean) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);

      partnerItems.forEach((item) => {
        const key = partnerKey(item.itemId);
        if (checked) next.add(key);
        else next.delete(key);
      });

      return next;
    });
  };

  const handlePartnerGroupToggle = (items: PartnerCartItem[], checked: boolean) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);

      items.forEach((item) => {
        const key = partnerKey(item.itemId);
        if (checked) next.add(key);
        else next.delete(key);
      });

      return next;
    });
  };

  const handleUpdatePrice = async (itemId: string, quantity: number, newPriceDetailId: string) => {
    try {
      await updateCartItem({
        itemId,
        quantity,
        inStockProductPriceDetailId: newPriceDetailId,
      }).unwrap();

      toast.success('Cart updated with the new price');
      await refetchCart();
    } catch {
      toast.error('Failed to update price. Please try again.');
    }
  };

  const handleUpdateToMaxInventory = async (itemId: string, maxInventory: number) => {
    try {
      await updateCartItem({
        itemId,
        quantity: maxInventory,
      }).unwrap();

      toast.success(`Quantity updated to maximum available (${maxInventory})`);
      await refetchCart();
    } catch {
      toast.error('Failed to update quantity.');
    }
  };

  const handlePartnerQuantityChange = async (item: PartnerCartItem, nextQuantity: number) => {
    if (nextQuantity < 1) return;

    try {
      await updatePartnerCartItem({
        itemId: item.itemId,
        quantity: nextQuantity,
      }).unwrap();

      await refetchPartnerCart();
    } catch {
      toast.error('Failed to update partner cart quantity');
    }
  };

  const handlePartnerDecrement = async (item: PartnerCartItem) => {
    if (item.quantity <= 1) {
      const confirmed = window.confirm('Do you want to remove this product from cart?');
      if (!confirmed) return;

      await handleRemovePartner(item.itemId);
      return;
    }

    await handlePartnerQuantityChange(item, item.quantity - 1);
  };
  const handleChangeCartTab = (tab: 'instock' | 'partner') => {
    setActiveCartTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);

    router.replace(`${ROUTES.CART}?${params.toString()}`, { scroll: false });
  };
  const handleCheckoutInstock = () => {
    if (selectedInstockIds.length === 0) return;

    setIsNavigating(true);
    dispatch(setSelectedItems({ ids: selectedInstockIds, mode: 'instock' }));
    router.push(ROUTES.CHECKOUT);
  };

  const handleGoToPartnerRequestSummary = async () => {
    if (selectedPartnerItems.length === 0) return;

    const nextIds: string[] = [];
    const nextQuantities: Record<string, number> = {};

    for (const item of selectedPartnerItems) {
      const aliases = getPartnerSelectionAliases(item);

      for (const alias of aliases) {
        nextIds.push(alias);
        nextQuantities[alias] = item.quantity;
      }
    }

    try {
      sessionStorage.setItem(PARTNER_REQUEST_STORAGE_KEY, JSON.stringify(Array.from(new Set(nextIds))));
      sessionStorage.setItem(PARTNER_REQUEST_QUANTITY_STORAGE_KEY, JSON.stringify(nextQuantities));
      sessionStorage.setItem('partner_cart_last_updated_at', String(Date.now()));
    } catch { }

    await refetchPartnerCart();
    router.push(PARTNER_REQUEST_SUMMARY_ROUTE);
  };

  async function handleRemovePartner(itemId: string) {
    try {
      await removePartnerItem(itemId).unwrap();

      setCheckedKeys((prev) => {
        const next = new Set(prev);
        next.delete(partnerKey(itemId));
        return next;
      });

      await refetchPartnerCart();
      toast.success('Removed partner product from cart');
    } catch {
      toast.error('Failed to remove partner product');
    }
  }

  function getPartnerProductHref(item: PartnerCartItem) {
    const partnerSlug = partnerSlugById.get(item.productDetails.partnerId);
    const productSlug = item.productDetails.slug;

    if (!partnerSlug || !productSlug) return ROUTES.BRANDS;

    return ROUTES.PARTNER_PRODUCT_DETAIL(partnerSlug, productSlug);
  }

  if (isPageLoading) return <CartLoading />;
  if (!hasAnyItem) return <CartEmpty />;

  return (
    <div className="container-custom pt-8 pb-28 lg:pt-12 lg:pb-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold md:text-4xl">Shopping Cart</h1>
          {(isInstockFetching || isPartnerFetching) && (
            <Loader2 className="text-brand h-5 w-5 animate-spin" />
          )}
        </div>

        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => handleChangeCartTab('instock')}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeCartTab === 'instock'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            Instock Product ({instockItems.length})
          </button>

          <button
            type="button"
            onClick={() => handleChangeCartTab('partner')}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${activeCartTab === 'partner'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-50'
              }`}
          >
            Partner Product ({partnerItems.length})
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {isInstockTab ? (
          instockItems.length > 0 ? (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isInstockAllChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = isInstockPartialChecked;
                  }}
                  onChange={(e) => toggleInstockSectionAll(e.target.checked)}
                  className="border-border accent-brand text-brand h-4 w-4 rounded"
                />

                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-card-foreground text-lg font-bold">
                    In-stock Products
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                      ({instockItems.length} items)
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {instockItems.map((item) => {
                  const isOutOfStock = item.availableInventory === 0;
                  const isOverStock =
                    item.availableInventory > 0 && item.quantity > item.availableInventory;

                  const isPriceChanged =
                    item.isValidPrice === false && item.newPriceDetailId && item.newUnitPrice;

                  const isSelectable = !isOutOfStock && !isOverStock && item.isValidPrice !== false;

                  return (
                    <div
                      key={`instock-${item.itemId}`}
                      className={`flex flex-col gap-2 rounded-lg p-2 transition-colors ${isOutOfStock ? 'bg-secondary/40 opacity-60 grayscale-[40%]' : ''
                        }`}
                    >
                      <CartItemRow
                        item={item}
                        isChecked={isSelectable && checkedKeys.has(instockKey(item.itemId))}
                        onToggle={() => {
                          if (!isSelectable) return;
                          toggleChecked(instockKey(item.itemId));
                        }}
                        onIncrement={() => !isOutOfStock && handleIncrement(item.itemId, item.quantity)}
                        onDecrement={() => !isOutOfStock && handleDecrement(item.itemId, item.quantity)}
                        onRemove={() => handleRemove(item.itemId)}
                      />

                      {isOverStock && (
                        <div className="flex flex-col justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                            <p className="text-xs leading-relaxed text-blue-800">
                              <span className="font-bold text-blue-900">Limited Stock.</span> Only{' '}
                              <span className="font-bold">{item.availableInventory}</span> items available.
                            </p>
                          </div>

                          <Button
                            size="sm"
                            disabled={isUpdatingInstock}
                            onClick={() => handleUpdateToMaxInventory(item.itemId, item.availableInventory)}
                            className="h-8 w-full shrink-0 bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 sm:w-auto"
                          >
                            {isUpdatingInstock ? 'Updating...' : `Update to ${item.availableInventory}`}
                          </Button>
                        </div>
                      )}

                      {isOutOfStock && (
                        <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3">
                          <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                          <p className="text-destructive-foreground text-xs leading-relaxed font-medium">
                            This product is currently out of stock.
                          </p>
                        </div>
                      )}

                      {!isOutOfStock && isPriceChanged && (
                        <div className="flex flex-col justify-between gap-3 rounded-lg border border-amber-200 bg-amber-100/60 p-3 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <p className="text-xs leading-relaxed text-amber-800">
                              <span className="font-bold text-amber-900">Price changed.</span> New price:{' '}
                              <span className="font-bold">{formatPrice(item.newUnitPrice!)}</span>{' '}
                              {item.newPriceName && `(${item.newPriceName})`}.
                            </p>
                          </div>

                          <Button
                            size="sm"
                            disabled={isUpdatingInstock}
                            onClick={() => handleUpdatePrice(item.itemId, item.quantity, item.newPriceDetailId!)}
                            className="h-8 w-full shrink-0 bg-amber-500 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600 sm:w-auto"
                          >
                            {isUpdatingInstock ? 'Updating...' : 'Update Price'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">No in-stock products</h3>
              <p className="mt-2 text-sm text-slate-500">
                You do not have any in-stock products in your cart.
              </p>
            </div>
          )
        ) : partnerItems.length > 0 ? (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPartnerAllChecked}
                ref={(el) => {
                  if (el) el.indeterminate = isPartnerPartialChecked;
                }}
                onChange={(e) => togglePartnerSectionAll(e.target.checked)}
                className="border-border accent-brand text-brand h-4 w-4 rounded"
              />

              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-amber-600" />
                <h2 className="text-card-foreground text-lg font-bold">
                  Partner Products
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({partnerItems.length} items)
                  </span>
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              {groupedPartnerItems.map((group) => {
                const groupAllChecked =
                  group.items.length > 0 &&
                  group.items.every((item) => checkedKeys.has(partnerKey(item.itemId)));

                const groupPartialChecked =
                  group.items.some((item) => checkedKeys.has(partnerKey(item.itemId))) &&
                  !groupAllChecked;

                return (
                  <div key={group.partnerId} className="rounded-3xl border bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b px-5 py-4">
                      <input
                        type="checkbox"
                        checked={groupAllChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = groupPartialChecked;
                        }}
                        onChange={(e) => handlePartnerGroupToggle(group.items, e.target.checked)}
                        className="border-border accent-brand text-brand h-4 w-4 rounded"
                      />

                      {group.partnerSlug ? (
                        <Link
                          href={ROUTES.PARTNER_BRAND_DETAIL(group.partnerSlug)}
                          className="text-lg font-bold text-slate-900 hover:text-slate-700"
                        >
                          {group.partnerName}
                        </Link>
                      ) : (
                        <h3 className="text-lg font-bold text-slate-900">{group.partnerName}</h3>
                      )}
                    </div>

                    <div className="space-y-3 p-4">
                      {group.items.map((item) => (
                        <div
                          key={`partner-${item.itemId}`}
                          className="flex flex-col gap-2 rounded-lg p-2 transition-colors"
                        >
                          <div
                            className={`border-border bg-card flex flex-col gap-4 rounded-xl border p-4 transition-all hover:shadow-md sm:flex-row ${checkedKeys.has(partnerKey(item.itemId))
                                ? 'ring-primary/20 bg-primary/5 ring-1'
                                : ''
                              }`}
                          >
                            <div className="flex items-center gap-4 sm:items-start">
                              <div className="flex shrink-0 items-center justify-center pt-0 sm:pt-1">
                                <input
                                  type="checkbox"
                                  checked={checkedKeys.has(partnerKey(item.itemId))}
                                  onChange={() => toggleChecked(partnerKey(item.itemId))}
                                  className="border-border text-primary accent-primary h-5 w-5 cursor-pointer rounded transition-all focus:ring-0"
                                  aria-label={`Select ${item.productDetails.productName}`}
                                />
                              </div>

                              <Link
                                href={getPartnerProductHref(item)}
                                className="border-border bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition-opacity hover:opacity-80 sm:h-24 sm:w-24"
                              >
                                <Image
                                  src={resolvePartnerImageUrl(item.productDetails.thumbnailUrl)}
                                  alt={item.productDetails.productName}
                                  fill
                                  sizes="(max-width: 640px) 80px, 96px"
                                  className="object-cover"
                                />
                              </Link>
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col">
                                  <Link href={getPartnerProductHref(item)}>
                                    <h4 className="text-card-foreground hover:text-primary line-clamp-2 cursor-pointer text-sm font-semibold transition-colors sm:text-base">
                                      {item.productDetails.productName}
                                    </h4>
                                  </Link>

                                  <p className="text-muted-foreground mt-2 hidden text-sm font-medium sm:block">
                                    {formatPrice(getPartnerUnitPrice(item))}{' '}
                                    <span className="text-xs opacity-60">/ item</span>
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemovePartner(item.itemId)}
                                  disabled={isRemovingPartnerItem}
                                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-md p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                  aria-label="Remove partner item"
                                >
                                  {isRemovingPartnerItem ? (
                                    <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                  )}
                                </button>
                              </div>

                              <div className="mt-4 flex items-center justify-between sm:mt-auto">
                                <div className="border-border bg-background flex h-9 items-center overflow-hidden rounded-md border shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => handlePartnerDecrement(item)}
                                    disabled={isUpdatingPartner}
                                    className="text-foreground/70 hover:bg-muted flex h-full w-9 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>

                                  <span className="border-border flex h-full w-12 items-center justify-center border-x text-sm font-bold">
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handlePartnerQuantityChange(item, item.quantity + 1)}
                                    disabled={isUpdatingPartner}
                                    className="text-foreground/70 hover:bg-muted flex h-full w-9 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <div className="flex flex-col items-end">
                                  <span className="text-primary text-base font-bold sm:text-lg">
                                    {formatPrice(getPartnerLineTotal(item))}
                                  </span>
                                  <span className="text-muted-foreground text-[10px] sm:hidden">
                                    {formatPrice(getPartnerUnitPrice(item))} / item
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">No partner products</h3>
            <p className="mt-2 text-sm text-slate-500">
              You do not have any partner products in your cart.
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-4 z-10 mt-8 rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {activeSelectedCount} selected / {activeItemCount} item{activeItemCount !== 1 ? 's' : ''}
            </p>
            <p className="text-3xl font-extrabold text-rose-600">
              {formatPrice(activeSelectedTotal)}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isInstockTab ? (
              activeSelectedCount > 0 ? (
                <button
                  type="button"
                  onClick={handleCheckoutInstock}
                  disabled={isNavigating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CreditCard className="h-4 w-4" />
                  {isNavigating ? 'Redirecting...' : 'Checkout In-stock'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Select products
                </button>
              )
            ) : activeSelectedCount > 0 ? (
              <button
                type="button"
                onClick={handleGoToPartnerRequestSummary}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                Request Summary
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500"
              >
                <ShoppingBag className="h-4 w-4" />
                Select products
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
