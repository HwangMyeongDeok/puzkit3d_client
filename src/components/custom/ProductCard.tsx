'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Puzzle, ShoppingCart, Loader2, BarChart3, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductDto } from '@/types/api/product.api.types';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/stores/hooks';
import { selectIsAuthenticated } from '@/stores/slices/authSlice';

// API Hooks
import { useAddToCartMutation } from '@/lib/api/endpoints/cartApi';
import { useGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';
import { useGetProductVariantsQuery } from '@/lib/api/endpoints/productApi';
import { useGetTopicsQuery } from '@/lib/api/endpoints/metaData';

import { handleErrorToast } from '@/lib/utils/error-handler';
import { skipToken } from '@reduxjs/toolkit/query';

type ProductCardProps = {
  product: ProductDto;
};

const getDifficultyStyles = (level: string) => {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel.includes('basic')) {
    return 'text-green-600';
  }
  if (normalizedLevel.includes('intermediate')) {
    return 'text-amber-600';
  }
  if (normalizedLevel.includes('advanced')) {
    return 'text-red-600';
  }
  return 'text-slate-600';
};

function formatBuildTime(value?: number) {
  if (!value) return 'N/A';
  if (value < 60) return `${value} min`;

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [addToCartMutate, { isLoading: isAdding }] = useAddToCartMutation();

  // 1. Fetch Topics
  const { data: topicsData } = useGetTopicsQuery({ pageNumber: 1, pageSize: 100, ascending: true });
  const topicName = topicsData?.items?.find((t: any) => t.id === product.topicId)?.name || 'N/A';

  // 2. Fetch Variant & Price Array
  const { data: variantsData, isLoading: isVariantsLoading } = useGetProductVariantsQuery(
    product.id,
    { refetchOnMountOrArgChange: true }
  );
  const defaultVariant = variantsData?.variants?.[0];

  // API trả về Array mảng giá
  const { data: priceArray, isLoading: isPriceLoading } = useGetPriceDetailByVariantIdQuery(
    defaultVariant?.id ?? skipToken,
    { refetchOnMountOrArgChange: true }
  );

  const isFetchingData = isVariantsLoading || isPriceLoading;

  // XỬ LÝ LOGIC GIÁ (Array)
  const prices = Array.isArray(priceArray) ? priceArray : [];
  const standardPriceObj = prices.find((p: any) => p.priceName === 'Standard');
  const salePriceObj = prices.find((p: any) => p.priceName !== 'Standard');

  // Ưu tiên hiển thị và thêm vào giỏ hàng cái giá Sale (nếu có)
  const activePriceObj = salePriceObj || standardPriceObj;
  const isSale = !!salePriceObj && !!standardPriceObj;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formattedActivePrice = activePriceObj?.unitPrice
    ? formatCurrency(activePriceObj.unitPrice)
    : 'Updating...';
  const formattedStandardPrice = standardPriceObj?.unitPrice
    ? formatCurrency(standardPriceObj.unitPrice)
    : '';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to add products to cart!');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!defaultVariant || !activePriceObj) {
      toast.info('Product is not ready or requires configuration!');
      router.push(ROUTES.PRODUCT_DETAIL(product.slug));
      return;
    }

    try {
      const priceDetailId = activePriceObj.id.replace(/"/g, '').trim();

      await addToCartMutate({
        itemId: defaultVariant.id,
        inStockProductPriceDetailId: priceDetailId,
        quantity: 1,
      }).unwrap();

      toast.success('Added to cart!');
    } catch (error: any) {
      handleErrorToast(error);
      if (error.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  };

  const productUrl = ROUTES.PRODUCT_DETAIL(product.slug);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      <div
        className={`absolute top-3 left-3 z-10 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md transition-colors ${getDifficultyStyles(product.difficultLevel || '')}`}
      >
        {product.difficultLevel || 'Instock'}
      </div>

      <Link href={productUrl} className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <span className="text-sm font-medium text-slate-400">No image</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={productUrl}>
          <h3 className="line-clamp-2 min-h-10 text-base leading-tight font-bold text-slate-800 transition-colors group-hover:text-[#e51636]">
            {product.name}
          </h3>
        </Link>

        {/* CỤM BADGE MỚI (Pcs, Time, Topic) TRÊN 1 HÀNG */}
        <div className="mt-4 flex w-full flex-nowrap items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
            <Puzzle className="h-3 w-3" />
            {product.totalPieceCount ?? '—'}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
            <Clock3 className="h-3 w-3" />
            {formatBuildTime(product.estimatedBuildTime)}
          </span>

          <span className="inline-flex min-w-0 shrink items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
            <BarChart3 className="h-3 w-3 shrink-0" />
            <span className="truncate">{topicName}</span>
          </span>
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
                  {formattedActivePrice}
                </span>

                {isSale && (
                  <span className="mb-0.5 text-xs font-medium text-slate-400 line-through decoration-slate-300">
                    {formattedStandardPrice}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isAdding || isFetchingData}
            className="group/btn flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-950 hover:shadow-lg hover:shadow-blue-950/30 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
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
