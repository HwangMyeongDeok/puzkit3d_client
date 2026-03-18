'use client';

import { useState } from 'react';
import { Loader2, Check, Ruler } from 'lucide-react';

import type { ProductVariantDto } from '@/types';
import { useGetProductVariantsQuery } from '@/lib/api/endpoints/productApi';

interface ProductVariantsProps {
  productId: string;
  onVariantSelect?: (variant: ProductVariantDto | null) => void;
}

export default function ProductVariants({ productId, onVariantSelect }: ProductVariantsProps) {
  const { data, isLoading, isError } = useGetProductVariantsQuery(productId, {
    skip: !productId,
  });

  // API trả về { variants: [...] }
  const variants = data?.variants ?? [];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="text-brand h-5 w-5 animate-spin" />
        <span className="text-muted-foreground text-sm">Đang tải biến thể...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive py-4 text-sm">Không thể tải biến thể. Vui lòng thử lại.</p>
    );
  }

  if (variants.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">Sản phẩm này chưa có biến thể nào.</p>;
  }

  const activeVariants = variants.filter((v) => v.isActive);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-foreground text-sm font-semibold">
        Chọn phiên bản ({activeVariants.length})
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {activeVariants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;

          return (
            <button
              key={variant.id}
              onClick={() => {
                setSelectedVariant(variant);
                onVariantSelect?.(variant);
              }}
              className={`relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-brand bg-brand/5 ring-brand/20 ring-2'
                  : 'border-border hover:border-brand/40 cursor-pointer'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <span className="bg-brand text-brand-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full">
                  <Check className="h-3 w-3" />
                </span>
              )}

              {/* SKU */}
              <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                SKU: {variant.sku}
              </span>

              {/* Color */}
              <div className="flex items-center gap-2">
                <span className="bg-brand/10 text-brand rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {variant.color}
                </span>
              </div>

              {/* Dimensions */}
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Ruler className="h-3 w-3" />
                <span>
                  {variant.assembledLengthMm} × {variant.assembledWidthMm} ×{' '}
                  {variant.assembledHeightMm} mm
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      {selectedVariant && (
        <div className="bg-brand/5 border-brand/20 rounded-xl border px-4 py-3">
          <p className="text-foreground text-sm font-semibold">Đã chọn: {selectedVariant.sku}</p>
          <p className="text-muted-foreground text-xs">
            Màu: {selectedVariant.color} · Kích thước: {selectedVariant.assembledLengthMm} ×{' '}
            {selectedVariant.assembledWidthMm} × {selectedVariant.assembledHeightMm} mm
          </p>
        </div>
      )}
    </div>
  );
}
