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

// Sếp nhớ import đúng đường dẫn 2 hook này từ Redux của sếp nhé
import { useGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';
import { useGetProductVariantsQuery } from '@/lib/api/endpoints/productApi';
import { handleApiError } from '@/lib/utils/error-handle';
import { skipToken } from '@reduxjs/toolkit/query';

type ProductCardProps = {
  product: ProductDto;
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [addToCartMutate, { isLoading: isAdding }] = useAddToCartMutation();

  // 1. GỌI API LẤY VARIANTS CỦA SẢN PHẨM NÀY
  const { data: variantsData, isLoading: isVariantsLoading } = useGetProductVariantsQuery(
    product.id,
    { refetchOnMountOrArgChange: true }
  );
  const defaultVariant = variantsData?.variants?.[0];

  // 2. GỌI API LẤY GIÁ DỰA TRÊN VARIANT ĐẦU TIÊN (Chỉ gọi khi đã có defaultVariant.id)
  const { data: priceData, isLoading: isPriceLoading } = useGetPriceDetailByVariantIdQuery(
    defaultVariant?.id ?? skipToken,
    { refetchOnMountOrArgChange: true }
  );

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ!');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!defaultVariant || !priceData) {
      toast.info('Sản phẩm chưa sẵn sàng hoặc cần chọn cấu hình chi tiết!');
      router.push(ROUTES.PRODUCT_DETAIL(product.slug));
      return;
    }

    try {
      // Chỗ này mình lấy luôn id từ priceData vừa fetch được, không cần gọi hàm Lazy nữa
      const priceDetailId = priceData.id.replace(/"/g, '').trim();

      const payload = {
        itemId: defaultVariant.id,
        inStockProductPriceDetailId: priceDetailId,
        quantity: 1,
      };

      await addToCartMutate(payload).unwrap();
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error: any) {
      handleApiError(error);
      if (error.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  };

  const productUrl = ROUTES.PRODUCT_DETAIL(product.slug);

  // Format hiển thị tiền VNĐ (Lấy từ unitPrice của API price)
  const formattedPrice = priceData?.unitPrice
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        priceData.unitPrice
      )
    : 'Đang cập nhật';

  // Biến check xem có đang load dữ liệu giá không
  const isFetchingData = isVariantsLoading || isPriceLoading;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      {/* BADGE ĐỘ KHÓ */}
      <div className="absolute top-3 left-3 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-800 uppercase shadow-sm backdrop-blur-md">
        {product.difficultLevel}
      </div>

      {/* KHỐI 1: ẢNH SẢN PHẨM */}
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
            <span className="text-sm font-medium text-slate-400">Chưa có ảnh</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
      </Link>

      {/* KHỐI 2: NỘI DUNG SẢN PHẨM */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={productUrl}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-tight font-semibold text-slate-800 transition-colors group-hover:text-[#e51636]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-3 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1">
            <Puzzle className="h-3.5 w-3.5 text-slate-400" />
            <span>{product.totalPieceCount} mảnh</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1">
            <Timer className="h-3.5 w-3.5 text-slate-400" />
            <span>{product.estimatedBuildTime} phút</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* KHỐI 3: GIÁ TIỀN & NÚT ADD TO CART */}
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase">Giá chỉ từ</span>

            {/* HIENTHI GIÁ HOẶC HIỆU ỨNG SKELETON NẾU ĐANG LOAD */}
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
            title="Thêm vào giỏ"
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
