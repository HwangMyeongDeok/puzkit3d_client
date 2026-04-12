'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Package2,
  BriefcaseBusiness,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn, formatPrice } from '@/lib/utils';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { useGetCartQuery, useUpdateCartItemMutation } from '@/lib/api/endpoints/cartApi';
import {
  useGetPartnerCartQuery,
  useRemoveItemFromPartnerCartMutation,
  type PartnerCartItem,
} from '@/lib/api/endpoints/partnerCartApi';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/stores/hooks';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MiniCartProps {
  children: React.ReactNode;
}

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
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${MEDIA_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

function getPartnerUnitPrice(item: PartnerCartItem) {
  if (item.unitPrice != null) return item.unitPrice;
  return item.productDetails.referencePrice ?? 0;
}

function getPartnerEstimate(item: PartnerCartItem) {
  return getPartnerUnitPrice(item) * item.quantity;
}

export default function MiniCart({ children }: MiniCartProps) {
  const [open, setOpen] = useState(false);
  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();
  const { isAuthenticated, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);

  const cartQuery = useGetCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
  });

  const partnerCartQuery = useGetPartnerCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
  });

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();

  const [removePartnerItem, { isLoading: isRemovingPartnerItem }] =
    useRemoveItemFromPartnerCartMutation();

  useEffect(() => {
    const handler = () => {
      setOpen(true);

      if (isAuthenticated) {
        void cartQuery.refetch();
        void partnerCartQuery.refetch();
      }
    };

    window.addEventListener('open-mini-cart', handler);
    return () => window.removeEventListener('open-mini-cart', handler);
  }, [cartQuery, partnerCartQuery, isAuthenticated]);

  const instockItems = cartQuery.data?.items ?? [];
  const partnerItems: PartnerCartItem[] = isNotFoundError(partnerCartQuery.error)
    ? []
    : (partnerCartQuery.data?.items ?? []);

  const instockSubtotal = instockItems.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  const partnerEstimate = partnerItems.reduce((sum, item) => sum + getPartnerEstimate(item), 0);

  const totalQuantity =
    (cartQuery.data?.totalItem ?? instockItems.length) +
    (partnerCartQuery.data?.totalItem ?? partnerItems.length);

  const isMiniCartLoading =
    isAuthLoading ||
    (isAuthenticated &&
      ((cartQuery.isLoading && !cartQuery.data && !cartQuery.error) ||
        (partnerCartQuery.isLoading &&
          !partnerCartQuery.data &&
          !isNotFoundError(partnerCartQuery.error))));

  const isEmpty = instockItems.length === 0 && partnerItems.length === 0;

  async function handleRemovePartner(itemId: string) {
    try {
      await removePartnerItem(itemId).unwrap();
      await partnerCartQuery.refetch();
      toast.success('Removed partner product from cart');
    } catch (error) {
      console.error('Remove partner product failed:', error);
      toast.error('Failed to remove partner product');
    }
  }

  const handleUpdatePrice = async (itemId: string, quantity: number, newPriceDetailId: string) => {
    try {
      await updateCartItem({
        itemId,
        quantity,
        inStockProductPriceDetailId: newPriceDetailId,
      }).unwrap();
      toast.success('Cart updated with the new price!');
      await cartQuery.refetch();
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
      await cartQuery.refetch();
    } catch (error) {
      toast.error('Failed to update quantity.');
    }
  };

  const hasInvalidInstockItem = instockItems.some(
    (item) =>
      !item.isValidPrice || item.availableInventory === 0 || item.quantity > item.availableInventory
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-lg">
        <SheetHeader className="border-border border-b px-5 py-4">
          <SheetTitle className="text-base font-bold">Cart ({totalQuantity})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {isMiniCartLoading ? (
            <div className="text-muted-foreground animate-pulse py-10 text-center text-xs">
              Syncing your cart...
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="text-muted-foreground/30 mb-3 h-12 w-12" />
              <p className="text-foreground mb-1 text-sm font-semibold">Your cart is empty</p>
              <p className="text-muted-foreground text-xs">
                Add your favorite products to the cart.
              </p>

              <div className="mt-4 flex gap-2">
                <SheetClose asChild>
                  <Link
                    href="/shop"
                    className="bg-primary text-primary-foreground rounded-lg px-5 py-2 text-xs font-semibold hover:opacity-90"
                  >
                    Explore Products
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href="/brands"
                    className="rounded-lg border px-5 py-2 text-xs font-semibold hover:bg-slate-50"
                  >
                    Partner Products
                  </Link>
                </SheetClose>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {instockItems.length > 0 && (
                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-bold">
                      In-stock Products
                      <span className="text-muted-foreground ml-2 font-normal">
                        ({cartQuery.data?.totalItem ?? instockItems.length})
                      </span>
                    </p>
                  </div>

                  {instockItems.map((item) => {
                    const variantDisplay = item.variantName || item.color || 'Default';

                    const isOutOfStock = item.availableInventory === 0;
                    const isOverStock =
                      item.availableInventory > 0 && item.quantity > item.availableInventory;
                    const isPriceChanged =
                      item.isValidPrice === false && item.newPriceDetailId && item.newUnitPrice;

                    return (
                      <div
                        key={`instock-${item.itemId}`}
                        className={`border-border bg-card flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:shadow-sm ${
                          isOutOfStock
                            ? 'bg-secondary/40 opacity-60 grayscale-[40%]'
                            : item.isValidPrice === false
                              ? 'border-amber-300 bg-amber-50/30'
                              : ''
                        }`}
                      >
                        <div className="flex gap-4">
                          <SheetClose asChild>
                            <Link
                              href={`/shop/${item.slug}`}
                              className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-md transition-opacity hover:opacity-80"
                            >
                              <Image
                                src={item.thumbnailUrl}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </Link>
                          </SheetClose>

                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <SheetClose asChild>
                                <Link href={`/shop/${item.slug}`}>
                                  <p className="text-card-foreground hover:text-primary line-clamp-2 cursor-pointer text-sm font-semibold transition-colors">
                                    {item.name}
                                  </p>
                                </Link>
                              </SheetClose>

                              <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[11px]">
                                {variantDisplay}
                              </p>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <p
                                className={`text-xs font-bold ${
                                  item.isValidPrice === false
                                    ? 'text-muted-foreground line-through'
                                    : 'text-primary'
                                }`}
                              >
                                {formatPrice(item.unitPrice)}
                              </p>

                              <div className="flex items-center gap-3">
                                <div className="border-border bg-background flex items-center rounded border">
                                  <button
                                    onClick={() => handleDecrement(item.itemId, item.quantity)}
                                    disabled={item.quantity <= 1 || isUpdating || isOutOfStock}
                                    className="text-foreground/50 hover:bg-secondary flex h-6 w-6 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>

                                  <span className="border-border flex h-6 w-7 items-center justify-center border-x text-[11px] font-bold">
                                    {item.quantity}
                                  </span>

                                  <button
                                    onClick={() => handleIncrement(item.itemId, item.quantity)}
                                    disabled={isUpdating || isOutOfStock}
                                    className="text-foreground/50 hover:bg-secondary flex h-6 w-6 items-center justify-center transition-colors disabled:opacity-40"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemove(item.itemId)}
                                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 transition-colors"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {isOverStock && (
                          <div className="mt-1 flex flex-col gap-2 rounded-md border border-blue-200 bg-blue-50 p-2.5">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                              <p className="text-[11px] leading-relaxed text-blue-800">
                                <span className="font-bold text-blue-900">Limited Stock!</span>
                                <br />
                                Only <span className="font-bold">
                                  {item.availableInventory}
                                </span>{' '}
                                items available.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateToMaxInventory(item.itemId, item.availableInventory)
                              }
                              className="h-7 w-full bg-blue-600 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-blue-700"
                            >
                              {isUpdating ? 'Updating...' : `Update to ${item.availableInventory}`}
                            </Button>
                          </div>
                        )}

                        {isOutOfStock && (
                          <div className="bg-destructive/10 border-destructive/20 mt-1 flex items-center gap-2 rounded-md border p-2.5">
                            <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                            <p className="text-destructive-foreground text-[11px] leading-relaxed font-medium">
                              Out of stock. Please remove it from your cart.
                            </p>
                          </div>
                        )}

                        {!isOutOfStock && isPriceChanged && (
                          <div className="mt-1 flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-100/50 p-2.5">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              <p className="text-[11px] leading-relaxed text-amber-800">
                                <span className="font-bold text-amber-900">Price changed!</span>
                                <br />
                                Update to{' '}
                                <span className="font-bold">
                                  {formatPrice(item.newUnitPrice!)}
                                </span>{' '}
                                {item.newPriceName && `(${item.newPriceName})`} to proceed.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdatePrice(
                                  item.itemId,
                                  item.quantity,
                                  item.newPriceDetailId!
                                )
                              }
                              className="h-7 w-full bg-amber-500 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-amber-600"
                            >
                              {isUpdating ? 'Updating...' : 'Update Price'}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}

              {partnerItems.length > 0 && (
                <section className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-bold">
                      Partner Products
                      <span className="text-muted-foreground ml-2 font-normal">
                        ({partnerCartQuery.data?.totalItem ?? partnerItems.length})
                      </span>
                    </p>
                  </div>

                  {partnerItems.map((item) => {
                    const imageUrl = resolvePartnerImageUrl(item.productDetails.thumbnailUrl);

                    return (
                      <div
                        key={`partner-${item.id}`}
                        className="border-border bg-card flex gap-4 rounded-lg border p-3"
                      >
                        <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.productDetails.productName}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <p className="text-card-foreground line-clamp-2 text-sm font-semibold">
                              {item.productDetails.productName}
                            </p>

                            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[11px]">
                              {item.productDetails.variantName || 'Partner product'}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-primary text-xs font-bold">
                                {formatPrice(getPartnerUnitPrice(item))}
                              </p>
                              <p className="text-muted-foreground mt-1 text-[11px]">
                                Qty: {item.quantity}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'rounded-full px-2.5 py-1 text-[10px] font-semibold',
                                  'bg-amber-100 text-amber-700'
                                )}
                              >
                                Quote-based
                              </span>

                              <button
                                onClick={() => handleRemovePartner(item.itemId)}
                                disabled={isRemovingPartnerItem}
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Remove partner item"
                              >
                                {isRemovingPartnerItem ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}
            </div>
          )}
        </div>

        {!isEmpty && (
          <SheetFooter className="border-border flex flex-col gap-3 border-t px-5 py-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-muted-foreground text-sm font-semibold">Subtotal</span>
              <span className="text-accent text-lg font-extrabold">
                {formatPrice(instockSubtotal)}
              </span>
            </div>

            {partnerItems.length > 0 && (
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-medium text-amber-700">Partner estimate</span>
                <span className="text-sm font-bold text-amber-700">
                  {formatPrice(partnerEstimate)}
                </span>
              </div>
            )}

            <Separator className="my-1" />

            <div className="flex w-full flex-col gap-2">
              <SheetClose asChild>
                <Link href={ROUTES.CART} className="w-full">
                  <Button className="w-full gap-2 rounded-xl py-5 text-sm font-bold shadow-lg">
                    View Cart
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href={ROUTES.SHOP}>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl py-5 text-sm font-semibold"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
