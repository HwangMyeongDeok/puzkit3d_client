'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Puzzle, Timer, ShoppingCart, Loader2 } from 'lucide-react';
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
      <div className="absolute top-3 left-3 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-800 uppercase shadow-sm backdrop-blur-md">
        {product.difficultLevel}
      </div>

      <Link href={productUrl} className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
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
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-tight font-semibold text-slate-800 transition-colors group-hover:text-[#e51636]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-3 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1">
            <Puzzle className="h-3.5 w-3.5 text-slate-400" />
            <span>{product.totalPieceCount} pcs</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1">
            <Timer className="h-3.5 w-3.5 text-slate-400" />
            <span>{product.estimatedBuildTime} min</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase">From</span>

            {isFetchingData ? (
              <div className="h-6 w-24 animate-pulse rounded bg-slate-200"></div>
            ) : (
              <span className="text-lg font-bold tracking-tight text-[#e51636]">
                {formattedPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isAdding || isFetchingData}
            className="group/btn flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#e51636] hover:shadow-lg hover:shadow-[#e51636]/30 disabled:pointer-events-none disabled:opacity-50"
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
