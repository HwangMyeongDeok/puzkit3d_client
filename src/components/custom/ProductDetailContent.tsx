'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  ChevronRight,
  Package,
  FileText,
  Info,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import type { InstockProduct, PartnerProduct, InstockProductVariantWithDetails } from '@/types';
import { isProductInStock, getDefaultVariant } from '@/lib/utils/product.utils';
import {
  getReviewsByProductId,
  getAverageRating,
  getRatingDistribution,
} from '@/lib/reviewMockData';
import { getRelatedProducts } from '@/lib/mockData';
import { getRelatedPartnerProducts } from '@/lib/partnerMockData';
import { formatPrice, formatNumber } from '@/lib/utils';
import { useAddToCartMutation } from '@/lib/api/endpoints/cartApi';
import { ROUTES } from '@/constants';
import ProductTabs from '@/components/custom/ProductTabs';
import ReviewSection from '@/components/custom/ReviewSection';
import RelatedProducts from '@/components/custom/RelatedProducts';
import { Button } from '@/components/ui/button';

interface ProductDetailContentProps {
  instockProduct: InstockProduct | null;
  partnerProduct: PartnerProduct | null;
}

export default function ProductDetailContent({
  instockProduct,
  partnerProduct,
}: ProductDetailContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isPartner = !instockProduct && !!partnerProduct;
  const product = instockProduct || partnerProduct;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<InstockProductVariantWithDetails | null>(
    instockProduct ? getDefaultVariant(instockProduct) : null
  );

  const [addToCartMutate] = useAddToCartMutation();

  if (!product) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Package className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          href={ROUTES.SHOP}
          className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const displayPrice = isPartner
    ? partnerProduct!.referencePrice
    : (selectedVariant?.priceDetail.unitPrice ?? 0);

  const variantStock = selectedVariant?.inventory.totalQuantity ?? 0;

  const productReviews = getReviewsByProductId(product.id);
  const { average: avgRating, count: reviewCount } = getAverageRating(product.id);
  const ratingDistribution = getRatingDistribution(product.id);

  const relatedInstock = !isPartner ? getRelatedProducts(product.slug, 4) : [];
  const relatedPartner = isPartner ? getRelatedPartnerProducts(product.slug, 4) : [];

  const handleAddToCart = async (showToast = true) => {
    if (isPartner) {
      toast.info('Partner product: Please submit a quote request for staff assistance.');
      return false;
    }

    if (!selectedVariant) return false;

    try {
      await addToCartMutate({
        // 1. Thêm itemId (Thường là ID của sản phẩm)
        itemId: product.id,

        // 2. Truyền ID của variant/price detail (S hoa như nãy sếp sửa)
        inStockProductPriceDetailId: selectedVariant.priceDetail.id,

        // 3. Số lượng
        quantity,
      }).unwrap();

      if (showToast) {
        toast.success(`Added ${quantity} item(s) to cart`);
      }
      return true;
    } catch (error) {
      console.error('Cart Error:', error);
      toast.error('An error occurred while adding to cart');
      return false;
    }
  };
  const handleBuyNow = () => {
    startTransition(async () => {
      const success = await handleAddToCart(false);
      if (success) router.push(ROUTES.CHECKOUT);
    });
  };

  const brandOrPartner = isPartner ? partnerProduct!.partner.name : instockProduct!.topic.name;

  return (
    <div className="container-custom py-8 pb-32 lg:py-12 lg:pb-12">
      {/* Breadcrumbs */}
      <nav className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm">
        <Link href={ROUTES.HOME} className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={isPartner ? ROUTES.BRANDS : ROUTES.SHOP}
          className="hover:text-foreground transition-colors"
        >
          {isPartner ? 'Brands' : 'Shop'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: Images */}
        <div className="flex flex-col gap-4">
          <div className="border-border bg-muted relative aspect-square overflow-hidden rounded-2xl border">
            <Image
              src={product.previewAsset[selectedImage] || product.thumbnailUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            {isPartner && (
              <span className="bg-warning text-warning-foreground absolute top-4 left-4 rounded-lg px-3 py-1 text-sm font-bold shadow-sm">
                Partner Product
              </span>
            )}
          </div>

          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {product.previewAsset.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-brand ring-brand/30 ring-2'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-5">
          <span className="text-brand text-xs font-bold tracking-widest uppercase">
            {brandOrPartner}
          </span>
          <h1 className="text-2xl leading-tight font-bold md:text-3xl">{product.name}</h1>

          <div className="border-border flex flex-wrap items-center gap-4 border-b pb-5 text-sm">
            <div className="flex items-center gap-1">
              <Star className="fill-warning text-warning h-4 w-4" />
              <span className="font-semibold">{product.rating}</span>
            </div>
            {!isPartner && instockProduct && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">
                  {formatNumber(instockProduct.soldCount)} Sold
                </span>
                <span className="text-muted-foreground">|</span>
                <span
                  className={`font-semibold ${variantStock > 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {variantStock > 0 ? `${variantStock} in stock` : 'Out of stock'}
                </span>
              </>
            )}
          </div>

          <div className="bg-secondary/60 rounded-xl px-5 py-4">
            <div className="flex items-baseline gap-3">
              {isPartner && (
                <span className="text-muted-foreground text-sm font-medium">Reference Price:</span>
              )}
              <span className="text-accent text-3xl font-extrabold">
                {formatPrice(displayPrice)}
              </span>
            </div>
            {isPartner && (
              <div className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  Final price will be confirmed by staff based on exchange rate and actual shipping
                  costs
                </span>
              </div>
            )}
          </div>

          {/* Variant Selector */}
          {!isPartner && instockProduct && instockProduct.variants.length > 1 && (
            <div className="flex flex-col gap-3">
              <span className="text-foreground text-sm font-semibold">Variant:</span>
              <div className="flex flex-wrap gap-2">
                {instockProduct.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`cursor-pointer rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    {v.color}
                    <span className="text-muted-foreground ml-2 text-xs font-normal">
                      {formatPrice(v.priceDetail.unitPrice)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t pt-5">
            <div className="flex items-center gap-3">
              <span className="text-foreground text-sm font-semibold">Quantity:</span>
              <div className="border-border bg-card flex items-center rounded-lg border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="hover:bg-secondary flex h-9 w-9 items-center justify-center transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="border-border flex h-9 w-12 items-center justify-center border-x text-sm font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="hover:bg-secondary flex h-9 w-9 items-center justify-center transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden gap-3 lg:flex">
              {isPartner ? (
                <>
                  <Button
                    className="bg-warning hover:bg-warning/90 h-12 flex-1 gap-2 rounded-xl font-bold"
                    onClick={() => handleAddToCart()}
                  >
                    <FileText className="h-4 w-4" /> Request Quote
                  </Button>
                  <Button
                    variant="outline"
                    className="border-warning text-warning h-12 flex-1 font-bold"
                    onClick={() => router.push(ROUTES.CART)}
                  >
                    <ShoppingCart className="h-4 w-4" /> View Cart
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-brand text-brand hover:bg-brand/5 h-12 flex-1 gap-2 rounded-xl font-bold"
                    disabled={variantStock <= 0 || isPending}
                    onClick={() => handleAddToCart()}
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </Button>
                  <Button
                    className="bg-accent hover:bg-accent/90 h-12 flex-1 gap-2 rounded-xl font-bold"
                    disabled={variantStock <= 0 || isPending}
                    onClick={handleBuyNow}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}{' '}
                    Buy Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs, Reviews, Related */}
      <div className="mt-16 space-y-16">
        <ProductTabs
          description={product.description}
          specs={{
            topicName: !isPartner ? instockProduct?.topic.name : undefined,
            partnerName: isPartner ? partnerProduct?.partner.name : undefined,
            difficultLevel: !isPartner ? instockProduct?.difficultLevel : undefined,
            materialName: !isPartner ? instockProduct?.material.name : undefined,
            totalPieceCount: !isPartner ? instockProduct?.totalPieceCount : undefined,
            assembledDimensions: selectedVariant
              ? {
                  length: selectedVariant.assembledLengthMm,
                  width: selectedVariant.assembledWidthMm,
                  height: selectedVariant.assembledHeightMm,
                }
              : undefined,
          }}
          isPartner={isPartner}
        />
        <ReviewSection
          reviews={productReviews}
          averageRating={avgRating}
          totalCount={reviewCount}
          distribution={ratingDistribution}
        />
        <RelatedProducts instockProducts={relatedInstock} partnerProducts={relatedPartner} />
      </div>

      {/* STICKY MOBILE ACTION BAR */}
      <div className="border-border bg-card/80 pb-safe fixed inset-x-0 bottom-0 z-50 border-t p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex min-w-[100px] flex-col">
            <span className="text-accent text-lg leading-none font-bold">
              {formatPrice(displayPrice)}
            </span>
            <span className="text-muted-foreground mt-1 text-[10px]">Express delivery 2h</span>
          </div>
          {isPartner ? (
            <Button
              className="bg-warning h-11 flex-1 rounded-xl font-bold"
              onClick={() => handleAddToCart()}
            >
              Submit Quote Request
            </Button>
          ) : (
            <Button
              className="bg-accent h-11 flex-1 rounded-xl font-bold"
              disabled={variantStock <= 0 || isPending}
              onClick={handleBuyNow}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy Now'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
