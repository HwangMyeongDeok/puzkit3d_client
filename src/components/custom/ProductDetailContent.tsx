'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

import type { MockProduct } from '@/lib/mockData';
import { getRelatedProducts } from '@/lib/mockData';
import type { PartnerProduct } from '@/lib/partnerMockData';
import { getRelatedPartnerProducts } from '@/lib/partnerMockData';
import {
  getReviewsByProductId,
  getAverageRating,
  getRatingDistribution,
} from '@/lib/reviewMockData';
import { formatPrice, formatNumber } from '@/lib/utils';
import { useAppDispatch } from '@/stores';
import { addToCart } from '@/stores/slices/cartSlice';
import { ROUTES } from '@/constants';
import ProductTabs from '@/components/custom/ProductTabs';
import ReviewSection from '@/components/custom/ReviewSection';
import RelatedProducts from '@/components/custom/RelatedProducts';

interface ProductDetailContentProps {
  instockProduct: MockProduct | null;
  partnerProduct: PartnerProduct | null;
}

export default function ProductDetailContent({
  instockProduct,
  partnerProduct,
}: ProductDetailContentProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isPartner = !instockProduct && !!partnerProduct;
  const product = instockProduct || partnerProduct;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Package className="text-muted-foreground/40 mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <p className="text-muted-foreground mb-6">
          Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href={ROUTES.PRODUCTS}
          className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Quay lại Shop
        </Link>
      </div>
    );
  }

  const displayPrice = isPartner ? partnerProduct!.estimatedPrice : instockProduct!.price;
  const originalPrice = !isPartner ? instockProduct!.originalPrice : 0;
  const hasDiscount = !isPartner && originalPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const productReviews = getReviewsByProductId(product.id);
  const { average: avgRating, count: reviewCount } = getAverageRating(product.id);
  const ratingDistribution = getRatingDistribution(product.id);

  const relatedInstock = !isPartner ? getRelatedProducts(product.slug, 4) : [];
  const relatedPartner = isPartner ? getRelatedPartnerProducts(product.slug, 4) : [];

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        image: product.images[0] || product.image,
        price: displayPrice,
        quantity,
        maxQuantity: isPartner ? 5 : 10,
        itemType: isPartner ? 'partner' : 'instock',
      })
    );

    if (isPartner) {
      toast.success(`Đã thêm "${product.name}" vào yêu cầu báo giá`);
    } else {
      toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng`);
    }
  };

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        image: product.images[0] || product.image,
        price: displayPrice,
        quantity,
        maxQuantity: isPartner ? 5 : 10,
        itemType: isPartner ? 'partner' : 'instock',
      })
    );
    router.push(ROUTES.CART);
  };

  return (
    <div className="container-custom py-8 lg:py-12">
      <nav className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm">
        <Link href={ROUTES.HOME} className="hover:text-foreground transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={isPartner ? ROUTES.BRANDS : ROUTES.PRODUCTS}
          className="hover:text-foreground transition-colors"
        >
          {isPartner ? 'Brands' : 'Shop'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          <div className="border-border bg-muted relative aspect-square overflow-hidden rounded-2xl border">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            {isPartner && (
              <span className="bg-warning text-warning-foreground absolute top-4 left-4 rounded-lg px-3 py-1 text-sm font-bold">
                Hàng đối tác
              </span>
            )}
            {!isPartner && hasDiscount && (
              <span className="bg-accent text-accent-foreground absolute top-4 left-4 rounded-lg px-3 py-1 text-sm font-bold">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {product.images.map((img, idx) => (
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

        <div className="flex flex-col gap-5">
          <span className="text-brand text-xs font-bold tracking-widest uppercase">
            {product.brand}
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
                  {formatNumber(instockProduct.soldCount)} Đã bán
                </span>
                <span className="text-muted-foreground">|</span>
                <span
                  className={`font-semibold ${instockProduct.inStock ? 'text-success' : 'text-destructive'}`}
                >
                  {instockProduct.inStock ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </>
            )}
            {isPartner && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="bg-warning/10 text-warning rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  Pre-order
                </span>
              </>
            )}
          </div>

          <div className="bg-secondary/60 rounded-xl px-5 py-4">
            <div className="flex items-baseline gap-3">
              {isPartner && (
                <span className="text-muted-foreground text-sm font-medium">Giá dự kiến:</span>
              )}
              <span className="text-accent text-3xl font-extrabold">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-muted-foreground text-lg line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="bg-accent/15 text-accent rounded-md px-2 py-0.5 text-xs font-bold">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>
            {isPartner && (
              <div className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  Giá cuối cùng sẽ được Staff xác nhận dựa trên tỷ giá và phí vận chuyển thực tế
                </span>
              </div>
            )}
          </div>

          {!isPartner && instockProduct && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-foreground font-semibold">Độ khó:</span>
              <span className="bg-brand/10 text-brand rounded-full px-3 py-1 text-xs font-bold capitalize">
                {instockProduct.difficulty}
              </span>
            </div>
          )}

          {isPartner && partnerProduct && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-foreground font-semibold">Phong cách:</span>
              <span className="bg-warning/10 text-warning rounded-full px-3 py-1 text-xs font-bold">
                {partnerProduct.style}
              </span>
            </div>
          )}

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="border-border flex flex-col gap-4 border-t pt-5">
            <div className="flex items-center gap-3">
              <span className="text-foreground text-sm font-semibold">Số lượng:</span>
              <div className="border-border flex items-center rounded-lg border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-foreground/60 hover:bg-secondary flex h-9 w-9 cursor-pointer items-center justify-center transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="border-border text-foreground flex h-9 w-12 items-center justify-center border-x text-sm font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-foreground/60 hover:bg-secondary flex h-9 w-9 cursor-pointer items-center justify-center transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isPartner ? (
              <div className="flex gap-3">
                <button
                  className="bg-warning text-warning-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  onClick={handleAddToCart}
                >
                  <FileText className="h-4 w-4" />
                  Yêu cầu báo giá
                </button>
                <button
                  className="border-warning text-warning hover:bg-warning/5 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 bg-transparent px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98]"
                  onClick={handleBuyNow}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Thêm & xem giỏ
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  className="border-brand text-brand hover:bg-brand/5 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 bg-transparent px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!instockProduct?.inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Thêm vào giỏ
                </button>
                <button
                  className="bg-accent text-accent-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!instockProduct?.inStock}
                  onClick={() => {
                    handleAddToCart();
                    router.push(ROUTES.CHECKOUT);
                  }}
                >
                  <Zap className="h-4 w-4" />
                  Mua ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ProductTabs
          longDescription={product.longDescription}
          specs={{
            brand: product.brand,
            difficulty: !isPartner && instockProduct ? instockProduct.difficulty : undefined,
            style: isPartner && partnerProduct ? partnerProduct.style : undefined,
          }}
          isPartner={isPartner}
        />
      </div>

      <div className="mt-12">
        <ReviewSection
          reviews={productReviews}
          averageRating={avgRating}
          totalCount={reviewCount}
          distribution={ratingDistribution}
        />
      </div>

      <div className="mt-12">
        <RelatedProducts instockProducts={relatedInstock} partnerProducts={relatedPartner} />
      </div>
    </div>
  );
}
