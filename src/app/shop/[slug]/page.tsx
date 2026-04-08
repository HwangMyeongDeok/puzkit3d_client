'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, ShoppingCart, Minus, Plus, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { skipToken } from '@reduxjs/toolkit/query';

import type { ProductVariantDto } from '@/types';
import {
  useGetProductBySlugQuery,
  useGetProductVariantsQuery,
} from '@/lib/api/endpoints/productApi';
import { ROUTES } from '@/constants';
import { useAddToCartMutation } from '@/lib/api/endpoints/cartApi';
import { useGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';

import { handleErrorToast } from '@/lib/utils/error-handler';
import ProductVariants from '@/components/custom/ProductVariants';
import { useAppSelector } from '@/stores/hooks';
import { selectIsAuthenticated } from '@/stores/slices/authSlice';

import ProductImageGallery from '@/components/productDetail/ProductImageGallery';
import ProductSpecifications from '@/components/productDetail/ProductSpecifications';

import { useAppDispatch } from '@/stores/hooks';
import { setSelectedItems } from '@/stores/slices/checkoutSlice';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params.slug;

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: product, isLoading: isProductLoading, isError } = useGetProductBySlugQuery(slug);
  const [addToCartMutate, { isLoading: isAdding }] = useAddToCartMutation();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);

  const { data: variantsData } = useGetProductVariantsQuery(product?.id ?? skipToken);

  useEffect(() => {
    if (!selectedVariant && variantsData?.variants && variantsData.variants.length > 0) {
      setSelectedVariant(variantsData.variants[0]);
    }
  }, [variantsData, selectedVariant]);

  const { data: priceData, isLoading: isPriceLoading } = useGetPriceDetailByVariantIdQuery(
    selectedVariant?.id ?? skipToken
  );

  const { currentPriceObj, standardPriceObj, isOnSale, discountPercent } = useMemo(() => {
    if (!priceData)
      return { currentPriceObj: null, standardPriceObj: null, isOnSale: false, discountPercent: 0 };

    const prices: any[] = Array.isArray(priceData) ? priceData : [priceData];
    if (prices.length === 0)
      return { currentPriceObj: null, standardPriceObj: null, isOnSale: false, discountPercent: 0 };

    const standard = prices.find((p) => p.priceName?.toLowerCase() === 'standard');
    const current = prices.reduce((min, p) => (p.unitPrice < min.unitPrice ? p : min), prices[0]);
    const onSale = standard && current && current.unitPrice < standard.unitPrice;

    const percent = onSale
      ? Math.round(((standard.unitPrice - current.unitPrice) / standard.unitPrice) * 100)
      : 0;

    return {
      currentPriceObj: current,
      standardPriceObj: standard,
      isOnSale: onSale,
      discountPercent: percent,
    };
  }, [priceData]);

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'decrease' && quantity > 1) setQuantity((q) => q - 1);
    if (type === 'increase') setQuantity((q) => q + 1);
  };

  const dispatch = useAppDispatch();
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
    if (!currentPriceObj) {
      toast.error('Price is updating, please try again shortly!');
      return false;
    }
    try {
      const priceDetailId = currentPriceObj.id.replace(/"/g, '').trim();

      const response = await addToCartMutate({
        itemId: selectedVariant.id,
        inStockProductPriceDetailId: priceDetailId,
        quantity: Number(quantity),
      }).unwrap();

      if (showToast) toast.success('Added to cart successfully!');
      return true;
    } catch (error: any) {
      handleErrorToast(error);
      if (error.status === 401) router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
  };

  const handleBuyNow = async () => {
    const isSuccess = await handleAddToCart(false);

    if (isSuccess) {
      router.push(`/cart?buyNowVariant=${selectedVariant?.id}`);
    }
  };

  const images = useMemo(() => {
    if (!product?.previewAsset) return product?.thumbnailUrl ? [product.thumbnailUrl] : [];
    const asset = product.previewAsset;
    if (Array.isArray(asset)) return asset;
    if (typeof asset === 'object') return Object.values(asset);
    if (typeof asset === 'string') {
      try {
        const parsed = JSON.parse(asset);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      if (asset.startsWith('http')) return [asset];
    }
    return product.thumbnailUrl ? [product.thumbnailUrl] : [];
  }, [product]);

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
          className="mt-4 flex items-center gap-2 rounded-full bg-[#052a5b] px-6 py-2.5 font-semibold text-white transition-all hover:bg-[#052a5b]/90"
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
        <Link href={ROUTES.SHOP} className="transition-colors hover:text-[#e51636]">
          Shop
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-slate-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        {/* TRÁI */}
        <div className="flex flex-col gap-4 lg:col-span-6 xl:col-span-5">
          <ProductImageGallery
            images={images}
            productName={product.name}
            difficultLevel={product.difficultLevel}
            thumbnailUrl={product.thumbnailUrl}
          />

          {product.description && (
            <div className="mt-8 flex flex-col">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                <span className="h-6 w-1 rounded-full bg-[#e51636]"></span>
                Description
              </h3>
              <div className="prose prose-slate max-w-none rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
                <p className="leading-relaxed whitespace-pre-wrap text-slate-600">
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PHẢI */}
        <div className="flex flex-col lg:col-span-6 xl:col-span-7">
          <h1 className="mb-3 text-3xl leading-tight font-extrabold text-slate-900 md:text-4xl">
            {product.name}
          </h1>

          {product.code && (
            <div className="mb-4 border-b border-slate-200 pb-4">
              <span className="text-sm font-medium text-slate-500">
                SKU: <span className="font-bold text-slate-900">{product.code}</span>
              </span>
            </div>
          )}

          <div className="mb-6 pt-2">
            {isPriceLoading || (!selectedVariant && !isError) ? (
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200"></div>
                <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200"></div>
              </div>
            ) : selectedVariant && currentPriceObj ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-[#e51636]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      currentPriceObj.unitPrice
                    )}
                  </span>
                  {isOnSale && standardPriceObj && (
                    <>
                      <span className="mb-1 text-lg font-medium text-slate-400 line-through">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(standardPriceObj.unitPrice)}
                      </span>
                      <span className="mb-1 inline-block rounded-md bg-[#e51636] px-2 py-0.5 text-xs font-bold text-white">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                {isOnSale &&
                  currentPriceObj.priceName &&
                  currentPriceObj.priceName.toLowerCase() !== 'standard' && (
                    <span className="mt-1 inline-block text-sm font-semibold tracking-wider text-emerald-600 uppercase">
                      Tag: {currentPriceObj.priceName}
                    </span>
                  )}
              </div>
            ) : (
              <span className="text-lg font-medium text-slate-500">
                Product has no configuration or pricing
              </span>
            )}
            <p className="mt-3 text-xs font-medium text-slate-500">
              ◎ Final price includes all applicable taxes and fees
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <ProductVariants
              productId={product.id}
              selectedVariantId={selectedVariant?.id}
              onVariantSelect={setSelectedVariant}
            />
          </div>

          <div className="mb-6 flex flex-col gap-4 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex h-12 w-36 items-center justify-between rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className="flex h-full w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    className="flex h-full w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                onClick={() => handleAddToCart(true)}
                disabled={isAdding || isPriceLoading || !currentPriceObj}
                className="group relative flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#052a5b] px-8 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#052a5b]/90 disabled:pointer-events-none disabled:opacity-70"
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
                disabled={isAdding || isPriceLoading || !currentPriceObj}
                onClick={handleBuyNow}
                className="group relative flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e51636] px-8 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#e51636]/90 disabled:pointer-events-none disabled:opacity-70"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-8 border-t border-slate-200 pt-8">
            <ProductSpecifications product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
