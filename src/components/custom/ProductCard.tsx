'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';

import type { MockProduct } from '@/lib/mockData';
import { formatPrice, formatNumber } from '@/lib/utils';
import { useAppDispatch } from '@/stores';
import { addToCart } from '@/stores/slices/cartSlice';
import { ROUTES } from '@/constants';

type ProductCardProps = {
  product: MockProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();

  const hasDiscount = product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;

    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
        maxQuantity: 10,
      })
    );
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.slug)} className="group block">
      <div className="card-hover border-border bg-card overflow-hidden rounded-xl border">
        <div className="bg-muted relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {hasDiscount && (
            <span className="bg-accent text-accent-foreground absolute top-2 left-2 rounded-md px-2 py-0.5 text-xs font-bold">
              -{discountPercent}%
            </span>
          )}

          {!product.inStock && (
            <div className="bg-background/60 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-muted text-muted-foreground rounded-full px-4 py-1.5 text-sm font-bold">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3">
          <span className="text-brand text-[11px] font-semibold tracking-wider uppercase">
            {product.brand}
          </span>

          <h3 className="text-card-foreground line-clamp-2 min-h-[2.5rem] text-sm leading-tight font-semibold">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-accent text-base font-bold">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Star className="fill-warning text-warning h-3 w-3" />
              <span>{product.rating}</span>
            </div>
            <span>Đã bán {formatNumber(product.soldCount)}</span>
          </div>

          <button
            className="bg-primary text-primary-foreground mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
          </button>
        </div>
      </div>
    </Link>
  );
}
