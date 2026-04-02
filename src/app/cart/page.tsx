'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Package,
  BriefcaseBusiness,
  ShoppingBag,
  CreditCard,
  FileText,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/stores';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { useGetCartQuery, useUpdateCartItemMutation } from '@/lib/api/endpoints/cartApi';
import {
  useGetPartnerCartQuery,
  useRemoveItemFromPartnerCartMutation,
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

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);

  const {
    data: cartDto,
    isLoading: isInstockLoading,
    isFetching: isInstockFetching,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
  });

  const {
    data: partnerCartDto,
    isLoading: isPartnerLoading,
    isFetching: isPartnerFetching,
    error: partnerCartError,
    refetch: refetchPartnerCart,
  } = useGetPartnerCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
  });

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();

  const [removePartnerItem, { isLoading: isRemovingPartnerItem }] =
    useRemoveItemFromPartnerCartMutation();

  const instockItems: CartItemDto[] = cartDto?.items ?? [];
  const partnerItems: PartnerCartItem[] = isNotFoundError(partnerCartError)
    ? []
    : (partnerCartDto?.items ?? []);

  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();

  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  useEffect(() => {
    router.prefetch(ROUTES.CHECKOUT);
  }, [router]);

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

  const selectedPartnerIds = useMemo(
    () =>
      partnerItems
        .filter((item) => checkedKeys.has(partnerKey(item.itemId)))
        .map((item) => item.itemId),
    [partnerItems, checkedKeys]
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

  const selectedCheckoutTotal = selectedInstockTotal;
  const selectedPartnerEstimate = selectedPartnerTotal;
  const selectedCount = selectedInstockIds.length + selectedPartnerIds.length;

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

  const handleUpdatePrice = async (itemId: string, quantity: number, newPriceDetailId: string) => {
    try {
      await updateCartItem({
        itemId,
        quantity,
        inStockProductPriceDetailId: newPriceDetailId,
      }).unwrap();

      toast.success('Cart updated with the new price!');
      await refetchCart();
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to update quantity.');
    }
  };

  const handleCheckoutInstock = () => {
    if (selectedInstockIds.length === 0) return;

    setIsNavigating(true);
    dispatch(setSelectedItems({ ids: selectedInstockIds, mode: 'instock' }));
    router.push(ROUTES.CHECKOUT);
  };

  const handleRequestQuote = () => {
    if (selectedPartnerIds.length === 0) return;
    toast.info('Request Quote API chưa có, hiện tại mới dừng ở bước review cart.');
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
    } catch (error) {
      console.error('Remove partner product failed:', error);
      toast.error('Failed to remove partner product');
    }
  }

  if (isPageLoading) return <CartLoading />;
  if (!hasAnyItem) return <CartEmpty />;

  return (
    <div className="container-custom pt-8 pb-28 lg:pt-12 lg:pb-12">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-3xl font-bold md:text-4xl">Shopping Cart</h1>
        {(isInstockFetching || isPartnerFetching) && (
          <Loader2 className="text-brand h-5 w-5 animate-spin" />
        )}
      </div>

      <div className="flex flex-col gap-8">
        {instockItems.length > 0 && (
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
                  Products
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
                    className={`flex flex-col gap-2 rounded-lg p-2 transition-colors ${
                      isOutOfStock ? 'bg-secondary/40 opacity-60 grayscale-[40%]' : ''
                    }`}
                  >
                    <CartItemRow
                      item={item}
                      isChecked={isSelectable && checkedKeys.has(instockKey(item.itemId))}
                      onToggle={() => {
                        if (!isSelectable) return;
                        toggleChecked(instockKey(item.itemId));
                      }}
                      onIncrement={() =>
                        !isOutOfStock && handleIncrement(item.itemId, item.quantity)
                      }
                      onDecrement={() =>
                        !isOutOfStock && handleDecrement(item.itemId, item.quantity)
                      }
                      onRemove={() => handleRemove(item.itemId)}
                    />

                    {isOverStock && (
                      <div className="flex flex-col justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                          <p className="text-xs leading-relaxed text-blue-800">
                            <span className="font-bold text-blue-900">Limited Stock!</span> Only{' '}
                            <span className="font-bold">{item.availableInventory}</span> items
                            available. Please update your cart quantity to proceed.
                          </p>
                        </div>

                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() =>
                            handleUpdateToMaxInventory(item.itemId, item.availableInventory)
                          }
                          className="h-8 w-full shrink-0 bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 sm:w-auto"
                        >
                          {isUpdating ? 'Updating...' : `Update to ${item.availableInventory}`}
                        </Button>
                      </div>
                    )}

                    {isOutOfStock && (
                      <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3">
                        <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                        <p className="text-destructive-foreground text-xs leading-relaxed font-medium">
                          This product is currently out of stock. Please remove it from your cart to
                          proceed with checkout.
                        </p>
                      </div>
                    )}

                    {!isOutOfStock && isPriceChanged && (
                      <div className="flex flex-col justify-between gap-3 rounded-lg border border-amber-200 bg-amber-100/60 p-3 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <p className="text-xs leading-relaxed text-amber-800">
                            <span className="font-bold text-amber-900">Price changed!</span> The
                            price for this item has changed to{' '}
                            <span className="font-bold">{formatPrice(item.newUnitPrice!)}</span>{' '}
                            {item.newPriceName && `(${item.newPriceName})`}. Update to proceed.
                          </p>
                        </div>

                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() =>
                            handleUpdatePrice(item.itemId, item.quantity, item.newPriceDetailId!)
                          }
                          className="h-8 w-full shrink-0 bg-amber-500 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600 sm:w-auto"
                        >
                          {isUpdating ? 'Updating...' : 'Update Price'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {partnerItems.length > 0 && (
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

            <div className="flex flex-col gap-3">
              {partnerItems.map((item) => (
                <div
                  key={`partner-${item.id}`}
                  className="border-border bg-card flex gap-4 rounded-2xl border p-4 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={checkedKeys.has(partnerKey(item.itemId))}
                    onChange={() => toggleChecked(partnerKey(item.itemId))}
                    className="border-border accent-brand text-brand mt-2 h-4 w-4 rounded"
                  />

                  <div className="bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={resolvePartnerImageUrl(item.productDetails.thumbnailUrl)}
                      alt={item.productDetails.productName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-base font-semibold">{item.productDetails.productName}</p>

                        <p className="text-muted-foreground text-sm">
                          {item.productDetails.variantName || 'Partner product'}
                        </p>

                        {item.productDetails.slug ? (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Slug: {item.productDetails.slug}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Quote-based
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemovePartner(item.itemId)}
                          disabled={isRemovingPartnerItem}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Remove partner item"
                        >
                          {isRemovingPartnerItem ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Estimated price</p>
                        <p className="text-lg font-bold text-slate-900">
                          {formatPrice(getPartnerUnitPrice(item))}
                        </p>
                      </div>

                      <div className="text-sm text-slate-600">Quantity: {item.quantity}</div>

                      <div className="text-right">
                        <p className="text-sm text-slate-500">Estimated total</p>
                        <p className="text-lg font-extrabold text-slate-900">
                          {formatPrice(getPartnerLineTotal(item))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="sticky bottom-4 z-10 mt-8 rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">{selectedCount} items selected</p>
            <p className="text-3xl font-extrabold text-rose-600">
              {formatPrice(selectedCheckoutTotal)}
            </p>

            {selectedPartnerIds.length > 0 && (
              <p className="mt-1 text-sm font-semibold text-amber-700">
                Partner estimate (not included in subtotal): {formatPrice(selectedPartnerEstimate)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {selectedInstockIds.length > 0 && (
              <button
                type="button"
                onClick={handleCheckoutInstock}
                disabled={isNavigating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                {isNavigating ? 'Redirecting...' : 'Checkout In-stock Products'}
              </button>
            )}

            {selectedPartnerIds.length > 0 && (
              <button
                type="button"
                onClick={handleRequestQuote}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                Request Quote for Partner Products
              </button>
            )}

            {selectedCount === 0 && (
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

        {(selectedInstockIds.length > 0 || selectedPartnerIds.length > 0) && (
          <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
            <div>In-stock selected: {selectedInstockIds.length}</div>
            <div>Partner selected: {selectedPartnerIds.length}</div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          Continue shopping
        </Link>

        <Link
          href="/brands"
          className="inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          Browse partner products
        </Link>
      </div>
    </div>
  );
}
