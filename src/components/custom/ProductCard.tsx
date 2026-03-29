'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Puzzle, Timer, ShoppingCart, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductDto } from '@/types';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/stores/hooks';
import { selectIsAuthenticated } from '@/stores/slices/authSlice';
import { useAddToCartMutation } from '@/lib/api/endpoints/cartApi';

import { useGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';
import { useGetProductVariantsQuery } from '@/lib/api/endpoints/productApi';
import { handleErrorToast } from '@/lib/utils/error-handler';
import { skipToken } from '@reduxjs/toolkit/query';

type ProductCardProps = {
  product: ProductDto;
};

const getDifficultyStyles = (level: string) => {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel.includes('basic') || normalizedLevel.includes('easy')) {
    return 'border-emerald-200 bg-emerald-100 text-emerald-700';
  }
  if (normalizedLevel.includes('intermediate') || normalizedLevel.includes('medium')) {
    return 'border-amber-200 bg-amber-100 text-amber-700';
  }
  if (normalizedLevel.includes('advanced') || normalizedLevel.includes('hard')) {
    return 'border-rose-200 bg-rose-100 text-rose-700';
  }
  return 'border-slate-200 bg-slate-100 text-slate-700';
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [addToCartMutate, { isLoading: isAdding }] = useAddToCartMutation();

  // Fetch product variants
  const { data: variantsData, isLoading: isVariantsLoading } = useGetProductVariantsQuery(
    product.id,
    { refetchOnMountOrArgChange: true }
  );
  const defaultVariant = variantsData?.variants?.[0];

  // Fetch price based on first variant
  const { data: priceData, isLoading: isPriceLoading } = useGetPriceDetailByVariantIdQuery(
    defaultVariant?.id ?? skipToken,
    { refetchOnMountOrArgChange: true }
  );

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to add products to cart!');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!defaultVariant || !priceData) {
      toast.info('Product is not ready or requires configuration!');
      router.push(ROUTES.PRODUCT_DETAIL(product.slug));
      return;
    }

    try {
      const priceDetailId = priceData.id.replace(/"/g, '').trim();

      const payload = {
        itemId: defaultVariant.id,
        inStockProductPriceDetailId: priceDetailId,
        quantity: 1,
      };

      await addToCartMutate(payload).unwrap();
      toast.success('Added to cart!');
    } catch (error: any) {
      handleErrorToast(error);
      if (error.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  };

  const productUrl = ROUTES.PRODUCT_DETAIL(product.slug);

  const formattedPrice = priceData?.unitPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(
        priceData.unitPrice
      )
    : 'Updating...';

  const isFetchingData = isVariantsLoading || isPriceLoading;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div
        className={`absolute top-3 left-3 z-10 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md transition-colors ${getDifficultyStyles(product.difficultLevel)}`}
      >
        {product.difficultLevel}
      </div>

      <Link href={productUrl} className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <span className="text-sm font-medium text-slate-400">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={productUrl}>
          <h3 className="line-clamp-2 min-h-10 text-base leading-tight font-bold text-slate-800 transition-colors group-hover:text-[#e51636]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex text-amber-400">
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-amber-400/30 text-amber-400/30" />
          </div>
          <span className="text-xs font-semibold text-slate-700">4.8</span>
          <span className="text-xs text-slate-400">(120 reviews)</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-100 px-2.5 py-1 transition-colors group-hover:bg-slate-200/50">
            <Puzzle className="h-3.5 w-3.5 text-slate-500" />
            <span>{product.totalPieceCount} Pcs</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-100 px-2.5 py-1 transition-colors group-hover:bg-slate-200/50">
            <Timer className="h-3.5 w-3.5 text-slate-500" />
            <span>{product.estimatedBuildTime} Min</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="mb-0.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Price
            </span>

            {isFetchingData ? (
              <div className="h-6 w-24 animate-pulse rounded bg-slate-200"></div>
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#e51636]">
                  {formattedPrice}
                </span>
                {priceData?.unitPrice && (
                  <span className="mb-0.5 text-xs font-medium text-slate-400 line-through decoration-slate-300">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(
                      priceData.unitPrice * 1.2
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isAdding || isFetchingData}
            className="group/btn flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e51636] hover:shadow-lg hover:shadow-[#e51636]/30 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            title="Add to cart"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 transition-transform group-active/btn:scale-90" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
