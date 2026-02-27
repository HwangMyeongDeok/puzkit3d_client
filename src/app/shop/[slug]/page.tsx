'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Minus, Plus, ShoppingCart, Zap, ChevronRight, Package } from 'lucide-react';
import { toast } from 'sonner';

import { getProductBySlug } from '@/lib/mockData';
import { formatPrice, formatNumber } from '@/lib/utils';
import { useAppDispatch } from '@/stores';
import { addToCart } from '@/stores/slices/cartSlice';
import { ROUTES } from '@/constants';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

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

  const hasDiscount = product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        maxQuantity: 10,
      })
    );
    toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        maxQuantity: 10,
      })
    );
    router.push(ROUTES.CHECKOUT);
  };

  return (
    <div className="container-custom py-8 lg:py-12">
      <nav className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm">
        <Link href={ROUTES.HOME} className="hover:text-foreground transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={ROUTES.PRODUCTS} className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-4">
          <div className="border-border bg-muted relative overflow-hidden rounded-2xl border">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
            {hasDiscount && (
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
                className={`h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-brand ring-brand/30 ring-2'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  className="h-full w-full object-cover"
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
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{formatNumber(product.soldCount)} Đã bán</span>
            <span className="text-muted-foreground">|</span>
            <span
              className={`font-semibold ${product.inStock ? 'text-success' : 'text-destructive'}`}
            >
              {product.inStock ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>

          <div className="bg-secondary/60 rounded-xl px-5 py-4">
            <div className="flex items-baseline gap-3">
              <span className="text-accent text-3xl font-extrabold">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-muted-foreground text-lg line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-accent/15 text-accent rounded-md px-2 py-0.5 text-xs font-bold">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-foreground font-semibold">Độ khó:</span>
            <span className="bg-brand/10 text-brand rounded-full px-3 py-1 text-xs font-bold capitalize">
              {product.difficulty}
            </span>
          </div>

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

            <div className="flex gap-3">
              <button
                className="border-brand text-brand hover:bg-brand/5 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 bg-transparent px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Thêm vào giỏ
              </button>
              <button
                className="bg-accent text-accent-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!product.inStock}
                onClick={handleBuyNow}
              >
                <Zap className="h-4 w-4" />
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
