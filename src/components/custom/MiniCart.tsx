'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

import { formatPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/stores';
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  selectCartItems,
  selectCartTotalPrice,
  selectCartTotalQuantity,
  selectInstockItems,
  selectPartnerItems,
} from '@/stores/slices/cartSlice';
import { ROUTES } from '@/constants';

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
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectCartTotalPrice);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const instockCount = useAppSelector(selectInstockItems).length;
  const partnerCount = useAppSelector(selectPartnerItems).length;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="border-border border-b px-5 py-4">
          <SheetTitle className="text-base font-bold">Giỏ hàng ({totalQuantity})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="text-muted-foreground/30 mb-3 h-12 w-12" />
              <p className="text-foreground mb-1 text-sm font-semibold">Giỏ hàng trống</p>
              <p className="text-muted-foreground text-xs">Hãy thêm sản phẩm yêu thích vào giỏ.</p>
              <SheetClose asChild>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="bg-primary text-primary-foreground mt-4 rounded-lg px-5 py-2 text-xs font-semibold"
                >
                  Khám phá sản phẩm
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="border-border bg-card flex gap-3 rounded-lg border p-3"
                >
                  <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <p className="text-card-foreground line-clamp-1 text-xs font-semibold">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-accent text-xs font-bold">{formatPrice(item.price)}</p>
                      {item.itemType === 'partner' && (
                        <span className="bg-warning/15 text-warning rounded px-1.5 py-0.5 text-[9px] font-bold">
                          Đối tác
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="border-border flex items-center rounded border">
                        <button
                          onClick={() =>
                            dispatch(
                              decrementQuantity({
                                productId: item.productId,
                                variant: item.variant,
                              })
                            )
                          }
                          className="text-foreground/50 hover:bg-secondary flex h-6 w-6 cursor-pointer items-center justify-center transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="border-border flex h-6 w-7 items-center justify-center border-x text-[11px] font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              incrementQuantity({
                                productId: item.productId,
                                variant: item.variant,
                              })
                            )
                          }
                          className="text-foreground/50 hover:bg-secondary flex h-6 w-6 cursor-pointer items-center justify-center transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          dispatch(
                            removeFromCart({
                              productId: item.productId,
                              variant: item.variant,
                            })
                          )
                        }
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded p-1 transition-colors"
                        aria-label="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="border-border border-t px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm font-semibold">Tạm tính</span>
                {(instockCount > 0 || partnerCount > 0) && (
                  <span className="text-muted-foreground text-[10px]">
                    {instockCount > 0 && `${instockCount} có sẵn`}
                    {instockCount > 0 && partnerCount > 0 && ' · '}
                    {partnerCount > 0 && `${partnerCount} đặt trước`}
                  </span>
                )}
              </div>
              <span className="text-accent text-lg font-extrabold">{formatPrice(totalPrice)}</span>
            </div>

            <Separator className="my-1" />

            <div className="flex flex-col gap-2">
              <SheetClose asChild>
                <Link href={ROUTES.CART}>
                  <Button className="w-full gap-2 rounded-xl py-5 text-sm font-bold shadow-lg">
                    Xem giỏ hàng & thanh toán
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href={ROUTES.PRODUCTS}>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl py-5 text-sm font-semibold"
                  >
                    Tiếp tục mua sắm
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
