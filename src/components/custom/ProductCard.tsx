'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Puzzle, Timer, ShoppingCart, Loader2, Layers, Wrench, Zap } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductDto } from '@/types/api/product.api.types';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/stores/hooks';
import { selectIsAuthenticated } from '@/stores/slices/authSlice';

// API Hooks
import { useAddToCartMutation } from '@/lib/api/endpoints/cartApi';
import { useGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';
import { useGetProductVariantsQuery } from '@/lib/api/endpoints/productApi';
import { useGetCapabilitiesQuery } from '@/lib/api/endpoints/metaData';
import { useGetMaterialsQuery } from '@/lib/api/endpoints/metaData';
import { useGetAssemblyMethodsQuery } from '@/lib/api/endpoints/metaData';

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

  // 1. Fetch Danh Mục
  const { data: capsData } = useGetCapabilitiesQuery({ pageNumber: 1, pageSize: 100 });
  const { data: materialsData } = useGetMaterialsQuery({ pageNumber: 1, pageSize: 100 });
  const { data: assemblyData } = useGetAssemblyMethodsQuery({ pageNumber: 1, pageSize: 100 });

  const materialName =
    materialsData?.items?.find((m) => m.id === product.materialId)?.name || '...';
  const assemblyName =
    assemblyData?.items?.find((a) => a.id === product.assemblyMethodId)?.name || '...';
  const capabilityNames = product.capabilityIds
    ?.map((id) => capsData?.items?.find((c) => c.id === id)?.name)
    .filter(Boolean);

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
  const isSale = !!salePriceObj && !!standardPriceObj; // Chỉ show gạch ngang nếu có đủ cả 2

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
      // Lấy ID của cái giá đang được áp dụng (Sale hoặc Standard)
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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

        {/* THÔNG TIN VẬT LIỆU, CÁCH LẮP... */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-600">
          <div
            className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5"
            title="Material"
          >
            <Layers className="h-3 w-3 text-slate-400" />
            <span className="max-w-[80px] truncate">{materialName}</span>
          </div>
          <div
            className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5"
            title="Assembly Method"
          >
            <Wrench className="h-3 w-3 text-slate-400" />
            <span className="max-w-[80px] truncate">{assemblyName}</span>
          </div>

          {capabilityNames && capabilityNames.length > 0 && (
            <div
              className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5"
              title="Capabilities"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="max-w-[80px] truncate">{capabilityNames[0]}</span>
              {capabilityNames.length > 1 && (
                <span className="text-[9px] font-bold text-slate-400">
                  +{capabilityNames.length - 1}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 px-2.5 py-1">
            <Puzzle className="h-3.5 w-3.5 text-slate-500" />
            <span>{product.totalPieceCount} Pcs</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 px-2.5 py-1">
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
                {/* Giá Đang Bán (Sale hoặc Standard) */}
                <span className="text-lg font-extrabold tracking-tight text-[#e51636]">
                  {formattedActivePrice}
                </span>

                {/* Nếu đang Sale thì gạch ngang giá Standard */}
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
