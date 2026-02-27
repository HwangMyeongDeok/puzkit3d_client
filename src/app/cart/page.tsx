'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

import { formatPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/stores';
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  selectCartItems,
  selectCartTotalPrice,
} from '@/stores/slices/cartSlice';
import { ROUTES } from '@/constants';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectCartTotalPrice);

  const shipping = totalPrice > 2_000_000 ? 0 : 30_000;
  const total = totalPrice + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link
          href={ROUTES.PRODUCTS}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Tiếp tục mua sắm
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 lg:py-12">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">Giỏ hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="border-border bg-card flex gap-4 rounded-xl border p-4 transition-shadow hover:shadow-md"
            >
              <div className="bg-muted h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="text-card-foreground line-clamp-1 text-sm font-semibold">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatPrice(item.price)} / sản phẩm
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="border-border flex items-center rounded-lg border">
                    <button
                      onClick={() =>
                        dispatch(
                          decrementQuantity({
                            productId: item.productId,
                            variant: item.variant,
                          })
                        )
                      }
                      className="text-foreground/60 hover:bg-secondary flex h-8 w-8 cursor-pointer items-center justify-center transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="border-border flex h-8 w-10 items-center justify-center border-x text-xs font-bold">
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
                      className="text-foreground/60 hover:bg-secondary flex h-8 w-8 cursor-pointer items-center justify-center transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-accent text-sm font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          productId: item.productId,
                          variant: item.variant,
                        })
                      )
                    }
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg p-2 transition-colors"
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border-border bg-card sticky top-20 rounded-xl border p-6">
            <h2 className="text-card-foreground mb-5 text-lg font-bold">Tóm tắt đơn hàng</h2>

            <div className="border-border flex flex-col gap-3 border-b pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="text-card-foreground font-semibold">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="text-card-foreground font-semibold">
                  {shipping === 0 ? (
                    <span className="text-success">Miễn phí</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-muted-foreground text-xs">
                  Miễn phí vận chuyển cho đơn hàng trên {formatPrice(2_000_000)}
                </p>
              )}
            </div>

            <div className="flex justify-between pt-5">
              <span className="text-card-foreground text-base font-bold">Tổng cộng</span>
              <span className="text-accent text-xl font-extrabold">{formatPrice(total)}</span>
            </div>

            <Link
              href={ROUTES.CHECKOUT}
              className="bg-accent text-accent-foreground mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Tiến hành thanh toán
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={ROUTES.PRODUCTS}
              className="text-brand hover:text-brand-accent mt-3 block text-center text-xs font-semibold transition-colors"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
