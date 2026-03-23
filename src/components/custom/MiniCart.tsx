'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

import { formatPrice } from '@/lib/utils';
import { useCartSync } from '@/lib/hooks/useCartSync';
import { useGetCartQuery } from '@/lib/api/endpoints/cartApi';
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

export default function MiniCart({ children }: MiniCartProps) {
  const { handleIncrement, handleDecrement, handleRemove } = useCartSync();

  const { isAuthenticated, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);

  const { data: cartDto } = useGetCartQuery(undefined, {
    skip: isAuthLoading || !isAuthenticated,
  });

  const cartItems = cartDto?.items || [];

  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 0);
  });

  const totalQuantity = cartDto?.totalItem ?? 0;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="border-border border-b px-5 py-4">
          <SheetTitle className="text-base font-bold">Cart ({totalQuantity})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {isAuthLoading ? (
            <div className="text-muted-foreground animate-pulse py-10 text-center text-xs">
              Syncing your cart...
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="text-muted-foreground/30 mb-3 h-12 w-12" />
              <p className="text-foreground mb-1 text-sm font-semibold">Your cart is empty</p>
              <p className="text-muted-foreground text-xs">
                Add your favorite products to the cart.
              </p>
              <SheetClose asChild>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="bg-primary text-primary-foreground mt-4 rounded-lg px-5 py-2 text-xs font-semibold"
                >
                  Explore Products
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cartItems.map((item) => {
                const displayPrice = item.unitPrice ?? 0;
                const productName = item.productDetails?.name || 'Unknown product';
                const thumbnailUrl = item.productDetails?.thumbnailUrl || '/placeholder-image.png';
                const variantColor = item.productDetails?.color || '';

                return (
                  <div
                    key={item.id || item.itemId}
                    className="border-border bg-card flex gap-3 rounded-lg border p-3"
                  >
                    <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={thumbnailUrl}
                        alt={productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <p className="text-card-foreground line-clamp-1 text-xs font-semibold">
                        {productName}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-accent text-xs font-bold">{formatPrice(displayPrice)}</p>
                        {variantColor && (
                          <span className="text-muted-foreground text-[9px]">· {variantColor}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="border-border flex items-center rounded border">
                          <button
                            onClick={() =>
                              handleDecrement(item.itemId as string, item.quantity as number)
                            }
                            className="text-foreground/50 hover:bg-secondary flex h-6 w-6 items-center justify-center transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="border-border flex h-6 w-7 items-center justify-center border-x text-[11px] font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleIncrement(item.itemId as string, item.quantity as number)
                            }
                            className="text-foreground/50 hover:bg-secondary flex h-6 w-6 items-center justify-center transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.itemId as string)}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="border-border flex flex-col gap-3 border-t px-5 py-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-muted-foreground text-sm font-semibold">Subtotal</span>
              <span className="text-accent text-lg font-extrabold">{formatPrice(totalPrice)}</span>
            </div>

            <Separator className="my-1" />

            <div className="flex w-full flex-col gap-2">
              <SheetClose asChild>
                <Link href={ROUTES.CART}>
                  <Button className="w-full gap-2 rounded-xl py-5 text-sm font-bold shadow-lg">
                    View Cart & Checkout
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href={ROUTES.PRODUCTS}>
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
