'use client';

import { useState, useMemo, useEffect } from 'react'; // Bổ sung useEffect
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Loader2,
  Package,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  Star,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import { skipToken } from '@reduxjs/toolkit/query';

import type { ProductVariantDto } from '@/types';
// Import thêm hook gọi Variants giống hệt bên ProductCard
import {
  useGetProductBySlugQuery,
  useGetProductVariantsQuery,
} from '@/lib/api/endpoints/productApi';
import { ROUTES } from '@/constants';
import { useAddToCartMutation } from '@/lib/api/endpoints/cartApi';
import { useGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';
import { handleApiError } from '@/lib/utils/error-handle';
import ProductVariants from '@/components/custom/ProductVariants';
import FeedbackList from '@/components/custom/FeedbackList';
import { useAppSelector } from '@/stores/hooks';
import { selectIsAuthenticated } from '@/stores/slices/authSlice';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params.slug;

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: product, isLoading: isProductLoading, isError } = useGetProductBySlugQuery(slug);
  const [addToCartMutate, { isLoading: isAdding }] = useAddToCartMutation();

  // State
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);

  // 1. GỌI API LẤY LIST VARIANTS (Sẽ lấy từ Cache cực nhanh)
  const { data: variantsData } = useGetProductVariantsQuery(product?.id ?? skipToken);

  // 2. TỰ ĐỘNG CHỌN VARIANT ĐẦU TIÊN KHI LOAD XONG
  useEffect(() => {
    // Nếu chưa có variant nào được chọn VÀ đã load được list variants
    if (!selectedVariant && variantsData?.variants && variantsData.variants.length > 0) {
      setSelectedVariant(variantsData.variants[0]);
    }
  }, [variantsData, selectedVariant]);

  // 3. LOGIC LẤY GIÁ TỰ ĐỘNG (Dựa vào variant đang được chọn)
  const { data: priceData, isLoading: isPriceLoading } = useGetPriceDetailByVariantIdQuery(
    selectedVariant?.id ?? skipToken
  );

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'decrease' && quantity > 1) setQuantity((q) => q - 1);
    if (type === 'increase') setQuantity((q) => q + 1);
  };

  const handleAddToCart = async (showToast = true) => {
    if (!isAuthenticated) {
      toast.info('Please log in to add products to cart!');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }

    if (!product || !selectedVariant) {
      toast.warning('Please select a product configuration before purchasing!');
      return false;
    }

    if (!priceData) {
      toast.error('Price is updating, please try again shortly!');
      return false;
    }

    try {
      const priceDetailId = priceData.id.replace(/"/g, '').trim();

      const payload = {
        itemId: selectedVariant.id,
        inStockProductPriceDetailId: priceDetailId,
        quantity: Number(quantity),
      };

      await addToCartMutate(payload).unwrap();
      if (showToast) {
        toast.success('Added to cart successfully!');
      }
      return true;
    } catch (error: any) {
      handleApiError(error);
      if (error.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
      return false;
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false);
    if (success) {
      router.push(ROUTES.CHECKOUT);
    }
  };

  const images = useMemo(() => {
    if (!product?.previewAsset) {
      return product?.thumbnailUrl ? [product.thumbnailUrl] : [];
    }

    const asset = product.previewAsset;

    // ✅ case 1: đã là array
    if (Array.isArray(asset)) return asset;

    // ✅ case 2: là object -> convert
    if (typeof asset === 'object') {
      return Object.values(asset);
    }

    // ✅ case 3: là string JSON
    if (typeof asset === 'string') {
      try {
        const parsed = JSON.parse(asset);
        if (Array.isArray(parsed)) return parsed;
      } catch {}

      // ✅ string url thường
      if (asset.startsWith('http')) return [asset];
    }

    return product.thumbnailUrl ? [product.thumbnailUrl] : [];
  }, [product]);

  const formattedPrice = priceData?.unitPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(
        priceData.unitPrice
      )
    : '';

  // ... (Phần hiển thị Loading / Error giữ nguyên như cũ)
  if (isProductLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#e51636]" />
        <p className="animate-pulse font-medium text-slate-500">Loading product information...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-slate-100 p-6">
          <Package className="h-16 w-16 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Product Not Found</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 rounded-full bg-[#052a5b] px-6 py-2.5 font-semibold text-white transition-all hover:bg-[#052a5b]/90 hover:shadow-lg hover:shadow-[#052a5b]/30"
        >
          <ChevronLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-[#e51636]">
          Home
        </Link>
        <span>/</span>
        <Link href={ROUTES.PRODUCTS} className="transition-colors hover:text-[#e51636]">
          Products
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-slate-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        {/* TRÁI: ẢNH SP (Giữ nguyên) */}
        <div className="flex flex-col gap-4 lg:col-span-6 xl:col-span-5">
          {/* ... code phần ảnh giữ nguyên như bản trước ... */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                No image available
              </div>
            )}
            <div className="absolute top-4 left-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold tracking-wider text-slate-800 uppercase shadow-sm backdrop-blur-md">
              Level: <span className="text-[#e51636]">{product.difficultLevel}</span>
            </div>
          </div>

          {images.length > 1 && (
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-[#e51636] opacity-100 shadow-md'
                      : 'border-transparent bg-white opacity-60 shadow-sm hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PHẢI: CHI TIẾT */}
        <div className="flex flex-col lg:col-span-6 xl:col-span-7">
          {/* BEST SELLER Badge */}
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block rounded-full bg-[#052a5b] px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-md">
              Best Seller
            </span>
          </div>

          {/* Product Title */}
          <h1 className="mb-3 text-3xl leading-tight font-extrabold text-slate-900 md:text-4xl">
            {product.name}
          </h1>

          {/* Rating & Info Bar */}
          <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase">PDF Instruction</span>
            <span className="text-xs font-semibold text-slate-500">
              SKU: <span className="font-bold text-slate-900">{product.code}</span>
            </span>
          </div>

          {/* Price Section */}
          <div className="mb-6 pt-4">
            {isPriceLoading || (!selectedVariant && !isError) ? (
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200"></div>
                <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200"></div>
              </div>
            ) : selectedVariant && priceData ? (
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black tracking-tight text-[#e51636]">
                  {formattedPrice}
                </span>
                {priceData.unitPrice && (
                  <>
                    <span className="text-muted-foreground mr-3 text-lg line-through">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(priceData.unitPrice * 1.3)}{' '}
                      {/* Giả sử giá gốc cao hơn 30% để tạo hiệu ứng giảm giá */}
                    </span>
                    <span className="inline-block rounded-full bg-[#e51636] px-3 py-1 text-xs font-bold text-white">
                      -27%
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-lg font-medium text-slate-500">
                Product has no configuration
              </span>
            )}
            <p className="mt-2 text-xs font-medium text-slate-600">
              ◎ Final price includes all applicable taxes and fees
            </p>
            {priceData?.priceName && (
              <span className="mt-2 inline-block text-sm font-medium text-emerald-600">
                Tag: {priceData.priceName}
              </span>
            )}
          </div>

          {/* Variant Selection */}
          <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <ProductVariants
              productId={product.id}
              selectedVariantId={selectedVariant?.id}
              onVariantSelect={setSelectedVariant}
            />
          </div>

          {/* Quantity & Action Buttons */}
          <div className="mb-6 flex flex-col gap-4 border-t border-slate-200 pt-6">
            {/* Quantity Selector */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex h-12 w-36 items-center justify-between rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className="flex h-full w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    className="flex h-full w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Two CTA Buttons Side By Side */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                onClick={() => handleAddToCart(true)}
                disabled={isAdding || isPriceLoading || !priceData}
                className="group relative flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#052a5b] px-8 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#052a5b]/90 hover:shadow-xl disabled:pointer-events-none disabled:opacity-70"
              >
                {isAdding ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                disabled={isAdding || isPriceLoading || !priceData}
                onClick={handleBuyNow}
                className="group relative flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#e51636] px-8 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#e51636]/90 hover:shadow-xl disabled:pointer-events-none disabled:opacity-70"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* More Payment Options */}
            <div className="flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                <span className="tracking-wide uppercase">Online Payment</span>
                <span className="rounded-full bg-[#052a5b]/10 px-2 py-1 text-[#052a5b]">VNPAY</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">
                  MOMO (coming soon)
                </span>
              </div>
            </div>
          </div>

          {/* Add to Compare */}
          <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-6">
            <Scale className="h-4 w-4 text-slate-500" />
            <button className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#e51636]">
              Add to Compare
            </button>
          </div>

          {/* Product Specs Grid */}
          {(product.totalPieceCount || product.difficultLevel || product.estimatedBuildTime) && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Product Information</h3>
              <div className="grid grid-cols-3 gap-4">
                {product.totalPieceCount && (
                  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#052a5b]/10">
                      <span className="text-lg font-bold text-[#052a5b]">#</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Pieces</span>
                    <span className="text-xl font-black text-slate-900">
                      {product.totalPieceCount}
                    </span>
                  </div>
                )}

                {product.difficultLevel && (
                  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#e51636]/10">
                      <span className="text-lg font-bold text-[#e51636]">⚡</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Difficulty</span>
                    <span className="text-xl font-black text-slate-900">
                      {product.difficultLevel}
                    </span>
                  </div>
                )}

                {product.estimatedBuildTime && (
                  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#052a5b]/10">
                      <span className="text-lg font-bold text-[#052a5b]">⏱</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Build Time</span>
                    <span className="text-xl font-black text-slate-900">
                      {product.estimatedBuildTime}
                      <span className="text-xs">p</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Description */}
          {product.description && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Product Description</h3>
              <p className="leading-relaxed whitespace-pre-wrap text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Feedbacks & Reviews Section */}
      {product.id && (
        <div className="mt-12">
          <FeedbackList productId={product.id} />
        </div>
      )}
    </div>
  );
}
