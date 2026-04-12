'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, ShoppingCart, Minus, Plus, ChevronLeft, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';

import { ROUTES } from '@/constants';
import { formatPrice } from '@/lib/utils';
import PartnerProductCard from '@/components/custom/PartnerProductCard';
import ProductImageGallery from '@/components/productDetail/ProductImageGallery';

import { useGetPartnerBySlugQuery } from '@/lib/api/endpoints/partnerApi';
import {
  useGetPartnerProductBySlugQuery,
  useGetPartnerProductsQuery,
} from '@/lib/api/endpoints/partnerProductApi';
import { useAddItemToPartnerCartMutation } from '@/lib/api/endpoints/partnerCartApi';

export default function PartnerProductDetailPage() {
  const params = useParams<{ partnerSlug: string; productSlug: string }>();
  const router = useRouter();
  const partnerSlug = params.partnerSlug;
  const productSlug = params.productSlug;

  const {
    data: partner,
    isLoading: isPartnerLoading,
    isError: isPartnerError,
  } = useGetPartnerBySlugQuery(partnerSlug);

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useGetPartnerProductBySlugQuery(productSlug);

  const {
    data: relatedProductsResponse,
    isLoading: isRelatedLoading,
  } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: true,
  });

  const [addItemToPartnerCart, { isLoading: isAddingToCart }] =
    useAddItemToPartnerCartMutation();

  const [quantity, setQuantity] = useState(1);

  const isInvalidPair = !!partner && !!product && partner.id !== product.partnerId;

  const images = useMemo(() => {
    if (!product) return [];

    let previewImages: string[] = [];
    let previewAssets: string[] = [];

    if (Array.isArray(product.previewImages)) {
      previewImages = product.previewImages;
    } else if (typeof product.previewImages === 'string') {
      try {
        const parsed = JSON.parse(product.previewImages);
        if (Array.isArray(parsed)) previewImages = parsed;
      } catch {}
    }

    if (Array.isArray(product.previewAssets)) {
      previewAssets = product.previewAssets;
    } else if (typeof product.previewAssets === 'string') {
      try {
        const parsed = JSON.parse(product.previewAssets);
        if (Array.isArray(parsed)) previewAssets = parsed;
      } catch {}
    }

    return [product.thumbnailUrl, ...previewImages, ...previewAssets].filter(
      (url): url is string => Boolean(url && String(url).trim())
    );
  }, [product]);

  const partnerProducts = useMemo(() => {
    const items = relatedProductsResponse?.items ?? [];
    if (!partner?.id) return [];
    return items.filter((item) => item.partnerId === partner.id);
  }, [relatedProductsResponse?.items, partner?.id]);

  const relatedProducts = useMemo(() => {
    return partnerProducts.filter((item) => item.id !== product?.id).slice(0, 4);
  }, [partnerProducts, product?.id]);

  async function handleAddToCart() {
    if (!product) return;

    try {
      await addItemToPartnerCart({
        itemId: product.id,
        quantity,
      }).unwrap();

      toast.success(`Added "${product.name}" to cart`);
    } catch {
      toast.error('Failed to add partner product to cart');
    }
  }

  async function handleRequestNow() {
  if (!product) return;

  try {
    await addItemToPartnerCart({
      itemId: product.id,
      quantity: 1,
    }).unwrap();

    toast.success(`"${product.name}" was added to cart`);
    router.push(`${ROUTES.CART}?tab=partner`);
  } catch {
    toast.error('Failed to add partner product to cart');
  }
}

  if (isPartnerLoading || isProductLoading || isRelatedLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#e51636]" />
        <p className="animate-pulse font-medium text-slate-500">Loading product information...</p>
      </div>
    );
  }

  if (isPartnerError || isProductError || !partner || !product || isInvalidPair) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-slate-100 p-6">
          <Package className="h-16 w-16 text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Partner Product Not Found</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 rounded-full bg-[#052a5b] px-6 py-2.5 font-semibold text-white transition-all hover:bg-[#052a5b]/90"
        >
          <ChevronLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  const estimatedPriceText =
    product.referencePrice != null ? formatPrice(product.referencePrice) : 'Contact for pricing';

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link href={ROUTES.HOME} className="transition-colors hover:text-[#e51636]">
          Home
        </Link>
        <span>/</span>
        <Link href={ROUTES.BRANDS} className="transition-colors hover:text-[#e51636]">
          Brands
        </Link>
        <span>/</span>
        <Link
          href={ROUTES.PARTNER_BRAND_DETAIL(partner.slug)}
          className="transition-colors hover:text-[#e51636]"
        >
          {partner.name}
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-slate-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col gap-4 lg:col-span-6 xl:col-span-5">
          <ProductImageGallery
            images={images}
            productName={product.name}
            thumbnailUrl={product.thumbnailUrl}
          />

          {product.description && (
            <div className="mt-8 flex flex-col">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                <span className="h-6 w-1 rounded-full bg-[#e51636]"></span>
                Description
              </h3>

              <div className="prose prose-slate max-w-none rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:col-span-6 xl:col-span-7">
          <h1 className="mb-3 text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
            {product.name}
          </h1>

          <div className="mb-4 border-b border-slate-200 pb-4">
            <span className="text-sm font-medium text-slate-500">
              Partner: <span className="font-bold text-slate-900">{partner.name}</span>
            </span>
          </div>

          <div className="mb-6 pt-2">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Reference price
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-[#e51636]">
                    {estimatedPriceText}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Info className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black tracking-tight text-amber-900">
                      Reference price only
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      This is an estimated reference price only. Final pricing may change after
                      quotation, shipping fee, and import fee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Quantity:</span>

                <div className="flex h-12 w-36 items-center justify-between rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-full w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>

                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="flex h-full w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="group relative flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#052a5b] px-8 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#052a5b]/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {isAddingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRequestNow}
                disabled={isAddingToCart}
                className="group relative flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e51636] px-8 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#e51636]/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {isAddingToCart ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span>Request Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">
              Other products from the shop
            </h2>
          </div>

          <Link
            href={ROUTES.PARTNER_BRAND_DETAIL(partner.slug)}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            View all
          </Link>
        </div>

        {relatedProducts.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
            No related partner products.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <PartnerProductCard
                key={item.id}
                product={item}
                partnerName={partner.name}
                partnerSlug={partner.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}