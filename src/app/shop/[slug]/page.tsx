'use client';

import { useState, useMemo } from 'react'; // Thêm useMemo để xử lý ảnh mượt hơn
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ProductVariantDto } from '@/types';
import Image from 'next/image';
import { Loader2, Package, ChevronRight, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { useGetProductBySlugQuery } from '@/lib/api/endpoints/productApi';
import { ROUTES } from '@/constants';
import { useAddToCartMutation } from '@/lib/api/endpoints/cartApi';
import { useLazyGetPriceDetailByVariantIdQuery } from '@/lib/api/endpoints/priceApi';
import { handleApiError } from '@/lib/utils/error-handle';
import ProductVariants from '@/components/custom/ProductVariants';
import { useAppSelector } from '@/stores/hooks';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  // 1. Lấy dữ liệu
  const { data: product, isLoading: isProductLoading, isError } = useGetProductBySlugQuery(slug);
  const { isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const [addToCartMutate, { isLoading: isAdding }] = useAddToCartMutation();
  const [triggerGetPrice] = useLazyGetPriceDetailByVariantIdQuery();

  // 2. State
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);

  // 3. Hàm xử lý Add to cart
  const handleAddToCart = async () => {
    if (!product || !selectedVariant) {
      toast.info('Vui lòng chọn biến thể!');
      return;
    }

    try {
      const priceResult = await triggerGetPrice(selectedVariant.id).unwrap();

      // Xử lý ID sạch sẽ (Xóa dấu ngoặc kép)
      let priceDetailId =
        typeof priceResult === 'object' && priceResult !== null
          ? (priceResult as any).id
          : String(priceResult);

      priceDetailId = priceDetailId.replace(/"/g, '').trim();

      const payload = {
        itemId: selectedVariant.id, // THE FIX: This is the product variant ID
        inStockProductPriceDetailId: priceDetailId,
        quantity: Number(quantity),
      };

      console.log('--- SENDING PAYLOAD TO ADD TO CART ---', payload);

      await addToCartMutate(payload).unwrap();

      toast.success('Đã thêm vào giỏ hàng thành công!');
    } catch (error: any) {
      console.error('--- LỖI ADD TO CART (FULL OBJECT) ---', JSON.stringify(error, null, 2));
      handleApiError(error);
      if (error.status === 401) router.push(ROUTES.LOGIN);
    }
  };

  // 4. Xử lý logic ảnh (Dùng useMemo để an toàn, chỉ chạy khi có product)
  const images = useMemo(() => {
    if (!product) return [];
    if (product.previewAsset) {
      try {
        const parsed = JSON.parse(product.previewAsset);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        if (product.previewAsset.startsWith('http')) return [product.previewAsset];
      }
    }
    return product.thumbnailUrl ? [product.thumbnailUrl] : [];
  }, [product]);

  // 5. Check Loading/Error (PHẢI ĐỂ TRÊN PHẦN RENDER CHÍNH)
  if (isProductLoading || isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#e51636]" />
        <p className="mt-4 text-slate-500">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20">
        <Package className="h-16 w-16 text-slate-200" />
        <h1 className="mt-4 text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <Link href={ROUTES.PRODUCTS} className="mt-4 text-[#052a5b] hover:underline">
          Quay lại Shop
        </Link>
      </div>
    );
  }

  // 6. Render chính (Chỉ chạy khi đã có product)
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ảnh sản phẩm */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-slate-50">
            {images[selectedImage] && (
              <Image src={images[selectedImage]} alt={product.name} fill className="object-cover" />
            )}
          </div>
          {/* List ảnh nhỏ */}
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${selectedImage === idx ? 'border-[#e51636]' : 'border-transparent'}`}
              >
                <Image src={img} alt="thumb" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>

          {/* Chỗ này sếp có thể thêm giá, mô tả... */}
          <div className="border-t pt-6">
            <ProductVariants productId={product.id} onVariantSelect={setSelectedVariant} />
          </div>

          <div className="flex flex-col gap-4 border-t pt-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Số lượng:</span>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 rounded-lg border px-3 py-2"
                min="1"
              />
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#e51636] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
